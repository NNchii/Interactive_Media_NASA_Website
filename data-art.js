function fetchAndDisplayNEOArt() {
    // Check if data is in sessionStorage
    let neoArtData = sessionStorage.getItem('neoArtData');

    if (neoArtData) {
        // Parse the stored JSON string to an object
        neoArtData = JSON.parse(neoArtData);
        displayNEOArt(neoArtData);
    } else {
        const today = new Date().toISOString().split('T')[0];
        const lastWeek = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];

        fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${lastWeek}&end_date=${today}&api_key=vOmpLQznTbpKpZHZTl6eCpbc6Nfj9EvCUvKf8p6V`)
            .then(response => response.json())
            .then(data => {
                // Store the fetched data in sessionStorage as a JSON string
                sessionStorage.setItem('neoArtData', JSON.stringify(data));
                displayNEOArt(data);
            })
            .catch(error => console.error("Error fetching NEO data:", error));
    }
}


function displayNEOArt(data) {
    const container = d3.select("#neoArt");
    const svg = container.append("svg")
        .attr("width", 800)  
        .attr("height", 800);

    const earthRadius = 60; // Base Earth radius in SVG units
    const earthDiameterMeters = 12742000; // Earth's diameter in meters
    const scalingFactor = 5000;  // Define scalingFactor here

    // Draw Earth at the center
    svg.append("circle")
        .attr("cx", 400)
        .attr("cy", 400)
        .attr("r", earthRadius)
        .attr("fill", "blue");

    // Draw NEOs
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

        // Calculate NEO radius relative to Earth, but not exceeding Earth's radius
        let neoRadius = (size / earthDiameterMeters) * earthRadius * scalingFactor;  // Apply scaling factor
        neoRadius = Math.max(neoRadius, 1);  // Minimum size set to 5 units

        console.log(`Size in meters: ${size}, Calculated neoRadius: ${neoRadius}`);  // Debugging line

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

    // Lower the lines to be behind the Earth
    svg.selectAll(".neo-line").lower();
}


// Call the function to execute
fetchAndDisplayNEOArt();
