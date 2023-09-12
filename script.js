
function adjustBackground() {
    const scrollPercentage = window.pageYOffset / window.innerHeight;
    const newBackgroundColor = `rgba(0, 4, 40, ${scrollPercentage})`; 

    document.body.style.backgroundColor = newBackgroundColor;
}

function navigateTo(page) {
    window.location.href = page;
}


window.addEventListener('scroll', adjustBackground);

document.addEventListener('DOMContentLoaded', function() {
    const readMoreLinks = document.querySelectorAll('.read-more');

    readMoreLinks.forEach(link => {
        let savedScrollPosition = 0; 

        link.addEventListener('click', function(event) {
            event.preventDefault();
            const content = this.previousElementSibling;

            if (content.style.display === "none" || content.style.display === "") {
                savedScrollPosition = window.pageYOffset; 
                content.style.display = "block";
                this.textContent = "Read Less";
            } else {
                content.style.display = "none";
                this.textContent = "Read More";
                
                window.scrollTo({
                    top: savedScrollPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Fetch Earth images
    fetch('https://images-api.nasa.gov/search?q=earth')
        .then(response => response.json())
        .then(data => {
            displayNasaData(data);
        })
        .catch(error => {
            console.error("There was an error fetching the NASA Earth data:", error);
        });
});

// Fetch CME Analysis data
const today = new Date().toISOString().split('T')[0];
const lastMonth = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];

fetch(`https://api.nasa.gov/DONKI/CMEAnalysis?startDate=${lastMonth}&endDate=${today}&mostAccurateOnly=true&speed=500&halfAngle=30&catalog=ALL&api_key=vOmpLQznTbpKpZHZTl6eCpbc6Nfj9EvCUvKf8p6V`)
    .then(response => response.json())
    .then(data => displayCMEChart(data))
    .catch(error => console.error("Error fetching CME Analysis data:", error));

fetch(`https://api.nasa.gov/DONKI/FLR?startDate=${lastMonth}&endDate=${today}&api_key=vOmpLQznTbpKpZHZTl6eCpbc6Nfj9EvCUvKf8p6V`)
    .then(response => response.json())
    .then(data => displaySolarFlarePieChart(data))
    .catch(error => console.error("Error fetching Solar Flare data:", error));

    function displayCMEChart(data) {
        const svg = d3.select("#cmeChart");
        const margin = {top: 20, right: 20, bottom: 50, left: 70}; 
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;
        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    
        // Prepare the data
        const parsedData = data.map(d => ({
            time: new Date(d.time21_5),
            longitude: +d.longitude,
            latitude: +d.latitude
        }));
    
        // Create scales
        const x = d3.scaleTime().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);
    
        // Set domains
        x.domain(d3.extent(parsedData, d => d.time));
        y.domain([d3.min(parsedData, d => Math.min(d.longitude, d.latitude)), d3.max(parsedData, d => Math.max(d.longitude, d.latitude))]);
    
        // Create axes
        const xAxis = d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%b %d"));  
        const yAxis = d3.axisLeft(y);
    
        // Add X Axis
        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .attr("class", "axis")
            .call(xAxis);

        // Add Y Axis
        g.append("g")
            .attr("class", "axis")
            .call(yAxis);
    
        // Add line for longitude
        const lineLongitude = d3.line()
            .x(d => x(d.time))
            .y(d => y(d.longitude));
    
        g.append("path")
            .data([parsedData])
            .attr("class", "line line-longitude") 
            .attr("d", lineLongitude)
            .attr("fill", "none");
    
        // Add line for latitude
        const lineLatitude = d3.line()
            .x(d => x(d.time))
            .y(d => y(d.latitude));
    
        g.append("path")
            .data([parsedData])
            .attr("class", "line line-latitude")
            .attr("d", lineLatitude)
            .attr("fill", "none");
    
        // Add X-Axis label
        svg.append("text")
            .attr("transform", `translate(${width / 2 + margin.left},${height + margin.top + 40})`)
            .attr("class", "axis-label") 
            .text("Time");

        // Add Y-Axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", margin.left - 50)
            .attr("x", -(height / 2) - margin.top)
            .attr("dy", "1em")
            .attr("class", "axis-label")
            .text("Longitude and Latitude");

            // Add Legend
        const legendData = [
            { label: 'Longitude', class: 'longitude' },
            { label: 'Latitude', class: 'latitude' }
        ];

        const legendWidth = 20; 
        const legendHeight = 10; 
        const legendItemSpacing = 100;
        const totalLegendWidth = legendData.length * (legendWidth + legendItemSpacing);

        const legend = svg.append("g")
            .attr("transform", `translate(${(width + 2 * margin.left - totalLegendWidth) / 2},${margin.top - 1})`);  // Positioning the legend above the graph

        const legendItem = legend.selectAll(".legendItem")
            .data(legendData)
            .enter().append("g")
            .attr("class", "legendItem")
            .attr("transform", (d, i) => `translate(${i * (legendWidth + legendItemSpacing)},0)`);

        legendItem.append("rect")
            .attr("class", d => d.class) 
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", legendWidth)
            .attr("height", legendHeight);

        legendItem.append("text")
            .attr("class", "legend-text")
            .attr("x", legendWidth + 5)
            .attr("y", legendHeight / 2)
            .attr("dy", "0.35em")
            .text(d => d.label);
        
        // Add circles for longitude data points
        g.selectAll(".dot-longitude")
            .data(parsedData)
            .enter().append("circle")
            .attr("class", "dot-longitude")
            .attr("cx", d => x(d.time))
            .attr("cy", d => y(d.longitude))
            .attr("r", 3);

            // Add circles for latitude data points
        g.selectAll(".dot-latitude")
            .data(parsedData)
            .enter().append("circle")
            .attr("class", "dot-latitude")
            .attr("cx", d => x(d.time))
            .attr("cy", d => y(d.latitude))
            .attr("r", 3);
    }
    
    

    function displaySolarFlarePieChart(data) {
        const flareClasses = {};
    
        data.forEach(flare => {
            const flareClass = flare.classType;
            if (flareClasses[flareClass]) {
                flareClasses[flareClass]++;
            } else {
                flareClasses[flareClass] = 1;
            }
        });
        
    
        const svg = d3.select("#flareChart")
            .append("svg")
            .attr("width", 500) 
            .attr("height", 600); 

        
    
        const width = 400;
        const height = 500;
        const radius = Math.min(width, height) / 2;
    
        const color = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(Object.keys(flareClasses));
    
        const pie = d3.pie()
            .value(d => d[1]);
    
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);
    
        const g = svg.append("g")
            .attr("transform", `translate(${width / 2}, ${(height / 2) + 150})`); 
    
        // Tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    
        // Draw pie chart
        const path = g.selectAll("path")
            .data(pie(Object.entries(flareClasses)))
            .enter().append("path")
            .attr("d", arc)
            .attr("class", "flare-slice") 
            .attr("id", d => "slice-" + d.data[0]) 
            .attr("fill", d => color(d.data[0]))
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Class: ${d.data[0]}<br/>Count: ${d.data[1]}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    
            const legendWidth = 100;
            const itemsPerRow = Math.floor(width / legendWidth); 
            const totalLegendWidth = legendWidth * itemsPerRow;
            const legend = svg.append("g")
                .attr("transform", `translate(${(width - totalLegendWidth) / 2}, 10)`) 
                .selectAll("g")
                .data(Object.keys(flareClasses))
                .enter().append("g")
                .attr("transform", (d, i) => `translate(${(i % itemsPerRow) * legendWidth}, ${Math.floor(i / itemsPerRow) * 20})`);
            
            legend.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 18)
                .attr("height", 18)
                .attr("fill", d => color(d))
                .attr("class", "legend-rect"); 
        
            legend.append("text")
                .attr("x", 24)
                .attr("y", 9)
                .attr("dy", "0.35em")
                .attr("class", "legend-text") 
                .text(d => d);
    }
    

let slideIndex = 1;

function displayNasaData(data) {
    const container = document.querySelector('.slideshow-container');
    const dotsContainer = document.querySelector('div[style="text-align:center"]');

    data.collection.items.forEach((item, index) => {
        
        if (!item.links || !item.links.length) {
            return; 
        }

        const slide = document.createElement('div');
        slide.classList.add('slide');

        const img = document.createElement('img');
        img.src = item.links[0].href;
        slide.appendChild(img);

        const description = document.createElement('div');
        description.classList.add('slide-description');
        description.textContent = item.data[0].description;
        slide.appendChild(description);

        container.appendChild(slide);
    });

    showSlides();
    createCharts();
}

function currentSlide(n) {
   
    slideIndex = (slideIndex + n) % 3;
    if (slideIndex < 1) {
        slideIndex = 3;
    }
    showSlides();
}

function plusSlides(n) {
    const slides = document.getElementsByClassName("slide");
    slideIndex += n;
    if (slideIndex > slides.length) { slideIndex = 1 }
    else if (slideIndex < 1) { slideIndex = slides.length }
    showSlides();
}

function showSlides() {
    const slides = document.getElementsByClassName("slide");
    const dots = document.getElementsByClassName("dot");

   
    if (slideIndex > slides.length) {
        slideIndex = 1;
    } else if (slideIndex < 1) {
        slideIndex = slides.length;
    }

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
}

setInterval(() => {
    plusSlides(1);
}, 10000);

let lastScrollTop = 0;

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const nav = document.querySelector('nav');
    const style = window.getComputedStyle(nav);
    const navHeight = nav.offsetHeight + parseInt(style.getPropertyValue('padding-top')) + parseInt(style.getPropertyValue('padding-bottom'));

    const extraOffset = 10; 

    if (scrollTop > lastScrollTop) {
        nav.style.transform = `translateY(-${navHeight + extraOffset}px)`; 
    } else {
        nav.style.transform = 'translateY(0)';
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
});

// Get the button element
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

// Function to scroll to the top smoothly
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// Add click event to the button
scrollToTopBtn.addEventListener("click", scrollToTop);

// Show or hide the button based on scroll position
window.addEventListener("scroll", function() {
  if (window.pageYOffset > 300) { 
    scrollToTopBtn.style.opacity = "1";
  } else {
    scrollToTopBtn.style.opacity = "0";
  }
});