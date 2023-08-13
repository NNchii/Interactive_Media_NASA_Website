// Function to adjust the background based on scroll position
function adjustBackground() {
    const scrollPercentage = window.pageYOffset / window.innerHeight;
    const newBackgroundColor = `rgba(0, 4, 40, ${scrollPercentage})`; // This will transition from deep space blue to black based on scroll

    document.body.style.backgroundColor = newBackgroundColor;
}

// Add event listener to window for scroll event
window.addEventListener('scroll', adjustBackground);

document.addEventListener('DOMContentLoaded', function() {
    const readMoreLinks = document.querySelectorAll('.read-more');

    readMoreLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const content = this.previousElementSibling;
            if (content.style.display === "none" || content.style.display === "") {
                content.style.display = "block";
                this.textContent = "Read Less";
            } else {
                content.style.display = "none";
                this.textContent = "Read More";
            }
        });
    });
});

// Fetching NASA data and populating the slideshow
fetch('https://images-api.nasa.gov/search?q=earth')
    .then(response => response.json())
    .then(data => {
        displayNasaData(data);
    })
    .catch(error => {
        console.error("There was an error fetching the NASA data:", error);
    });

let slideIndex = 1;

function displayNasaData(data) {
    const container = document.querySelector('.slideshow-container');
    const dotsContainer = document.querySelector('div[style="text-align:center"]');

    data.collection.items.forEach((item, index) => {
        // Check if the item has the links property and it's not empty
        if (!item.links || !item.links.length) {
            return; // Skip this item and move to the next one
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
}


function currentSlide(n) {
    // Adjust the slideIndex based on the clicked dot
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

    // Wrap around if slideIndex goes out of bounds
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
