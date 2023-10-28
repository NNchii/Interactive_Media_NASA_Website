function fetchAndDisplayNEOArt() {
    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];

    fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${lastWeek}&end_date=${today}&api_key=vOmpLQznTbpKpZHZTl6eCpbc6Nfj9EvCUvKf8p6V`)
        .then(response => response.json())
        .then(data => displayNEOArt(data))
        .catch(error => console.error("Error fetching NEO data:", error));
}

function displayNEOArt(data) {
    const container = d3.select("#neoArt");
    const svg = container.append("svg")
        .attr("width", 1200)  // Doubled from 800
        .attr("height", 1200); // Doubled from 800

    // Draw Earth at the center
    svg.append("circle")
        .attr("cx", 600)  // Centered for new dimensions
        .attr("cy", 600)  // Centered for new dimensions
        .attr("r", 60)    // Doubled from 30
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
        const x = 600 + distance / 50000 * Math.cos(angle * Math.PI / 180);
        const y = 600 + distance / 50000 * Math.sin(angle * Math.PI / 180);
        
        svg.append("line")
            .attr("x1", 600)
            .attr("y1", 600)
            .attr("x2", x)
            .attr("y2", y)
            .attr("stroke", "red")
            .attr("stroke-width", 2);

        svg.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size / 10)  
            .attr("fill", "green");
    });
}

// Call the function to execute
fetchAndDisplayNEOArt();
