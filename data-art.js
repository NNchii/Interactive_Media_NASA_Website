window.onload = async function() {
    await loadNEOData();
    await loadSolarFlareData();
};

async function loadNEOData() {
    let neoArtData = sessionStorage.getItem('neoArtData');
    if (!neoArtData) { 
        const today = new Date().toISOString().split('T')[0];
        const lastWeek = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];

        const response = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${lastWeek}&end_date=${today}&api_key=vOmpLQznTbpKpZHZTl6eCpbc6Nfj9EvCUvKf8p6V`);
        const data = await response.json();
        
        sessionStorage.setItem('neoArtData', JSON.stringify(data));

    } else {
        fetchAndDisplayNEOArt(JSON.parse(neoArtData));
    }
}

async function loadSolarFlareData() {
    let cmeData = sessionStorage.getItem('cmeData');
    if (!cmeData) {
        const startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];
        const cmeApiUrl = `https://api.nasa.gov/DONKI/CMEAnalysis?startDate=${startDate}&endDate=${endDate}&mostAccurateOnly=true&speed=500&halfAngle=30&catalog=ALL&api_key=vOmpLQznTbpKpZHZTl6eCpbc6Nfj9EvCUvKf8p6V`;

        try {
            const response = await fetch(cmeApiUrl);
            const data = await response.json();

            sessionStorage.setItem('cmeData', JSON.stringify(data));
            displaySolarFlareArt(data); // Function to visualize the CME data
        } catch (error) {
            console.error('Error fetching CME data:', error);
        }
    } else {
        displaySolarFlareArt(JSON.parse(cmeData)); // Function to visualize the CME data
    }
}

function fetchAndDisplayNEOArt() {
    const neoArtData = JSON.parse(sessionStorage.getItem('neoArtData'));
    displayNEOArt(neoArtData);
}

function displayNEOArt(data) {
    const container = d3.select("#neoArt");
    const svg = container.append("svg")
        .attr("width", 800)  
        .attr("height", 800);

    const earthRadius = 60;
    const earthDiameterMeters = 12742000;
    const scalingFactor = 5000;

    svg.append("circle")
        .attr("cx", 400)
        .attr("cy", 400)
        .attr("r", earthRadius)
        .attr("fill", "blue");

    const nearEarthObjects = data.near_earth_objects;
    let allNEOs = [];
    
    for (const date in nearEarthObjects) {
        allNEOs = allNEOs.concat(nearEarthObjects[date]);
    }

    allNEOs.forEach((d, i) => {
        const distance = d.close_approach_data[0].miss_distance.kilometers;
        const size = d.estimated_diameter.meters.estimated_diameter_max;
        const angle = i * (360 / allNEOs.length);
        const x = 400 + distance / 200000 * Math.cos(angle * Math.PI / 180);
        const y = 400 + distance / 200000 * Math.sin(angle * Math.PI / 180);

        let neoRadius = (size / earthDiameterMeters) * earthRadius * scalingFactor;
        neoRadius = Math.max(neoRadius, 1);

        svg.append("line")
            .attr("class", "neo-line")
            .attr("x1", 400)
            .attr("y1", 400)
            .attr("x2", x)
            .attr("y2", y)
            .attr("stroke-width", 2);

        svg.append("circle")
            .attr("class", "neo-dot")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", neoRadius)
            .attr("fill", "rgba(255, 0, 0, 0.5)");
    });

    svg.selectAll(".neo-line").lower();
}

function displaySolarFlareArt(data) {
    const width = 1500;
    const height = 1500;
    const centerX = width / 2;
    const centerY = height / 2;

    const baseOrbitRadius = 200;
    const orbitSpacing = 20;

    const svg = d3.select('#cmeOrbits').append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const defs = svg.append('defs');


    // For the Sun
    svg.append('circle')
        .attr('class', 'sun')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', 220);

    const solarArtTooltip = d3.select('body').append('div')
        .attr('class', 'SolarArtTooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background', 'white')
        .style('padding', '10px')
        .style('border', '1px solid black')
        .style('border-radius', '5px');

    const sunGradient = defs.append('radialGradient')
        .attr('id', 'sun-gradient')
        .attr('class', 'sun-gradient');
    sunGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', 'yellow');
    sunGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', 'orange');
    
    // Apply gradient to the sun
    svg.select('.sun').attr('fill', 'url(#sun-gradient)');

    data.sort((a, b) => a.speed - b.speed);

    // Create a color scale from red to purple
    const colorScale = d3.scaleLinear()
        .domain([0, 1])
        .range(['red', 'purple'])
        .interpolate(d3.interpolateRgb);

        data.forEach((cme, index) => {
            const orbitRadius = baseOrbitRadius + index * orbitSpacing + (Math.abs(cme.longitude) + Math.abs(cme.latitude)) * 1;
            const color = colorScale(index / data.length);
    
            const orbitPath = svg.append('circle')
            .attr('class', 'orbit')
            .attr('cx', centerX)
            .attr('cy', centerY)
            .attr('r', orbitRadius)
            .attr('stroke', color)
            .attr('stroke-width', 3);
    
        // Updated event handlers
        orbitPath.on('mouseover', (event) => {
            d3.select(this).attr('stroke-width', 5);
            solarArtTooltip.html(`Class: ${cme.type || 'N/A'}<br>Longitude: ${cme.longitude || 'N/A'}<br>Latitude: ${cme.latitude || 'N/A'}<br>Speed: ${cme.speed || 'N/A'} km/s`)
                .style('visibility', 'visible')
                .style('top', (event.pageY - 10) + 'px')
                .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this).attr('stroke-width', 2);
            solarArtTooltip.style('visibility', 'hidden');
        });
    
            const movingCircle = svg.append('circle')
                .attr('cx', centerX)
                .attr('cy', centerY)
                .attr('r', 5)
                .attr('fill', 'orange');
    
            function animateCircle() {
                const speedScalingFactor = 0.1; // Adjust this factor to control animation speed
                const scaledSpeed = cme.speed * speedScalingFactor;
                const orbitDuration = Math.max(20000 / scaledSpeed, 5000); // Ensuring a minimum duration
                
                movingCircle.transition()
                        .duration(orbitDuration)
                        .ease(d3.easeLinear)
                        .attrTween('transform', () => {
                        const angleScale = d3.scaleLinear()
                            .domain([0, 1])
                            .range([0, 2 * Math.PI]);
                        return t => {
                            const angle = angleScale(t);
                            const x = orbitRadius * Math.cos(angle);
                            const y = orbitRadius * Math.sin(angle);
                            return `translate(${x},${y})`;
                        };
                    })
                    .on('end', animateCircle);
            }
    
            animateCircle();
        });
    
        // ... remaining code ...
    }