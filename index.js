const width = window.innerWidth,
    height = window.innerHeight;

let svg = d3.select('#map').append('svg')
    .attr('width', width)
    .attr('height', height);

let tooltip = d3.select("#map").append("div")
    .attr("class", "data-tooltip")
    .style("opacity", 0);

// Define a geographical projection
let projection = d3.geoMercator()
    // Scale factor found through trial and error
    .scale(10000)
    // The geographical center of Switzerland is around 46.8°, 8.2°
    .center([8.226692, 46.80121])
    .translate([width / 2, height / 2]);

// Prepare a path object and apply the projection to it.
let path = d3.geoPath()
    .projection(projection);

// Load data from the SwissGamesGarden API and geodata from file
Promise.all([getCachedData(), d3.json('shapefiles/output.geojson')]).then((datas) => {

    data = datas[0];
    geodata = datas[1];
    console.log(geodata)
    console.log(data.games);
    console.log(data.cantons);
    // merge data to geodata
    for (featureIdx in geodata.features) {
        let dataValue = data.cantons[id2canton(geodata.features[featureIdx]["properties"]["id"])];
        geodata.features[featureIdx]["properties"]["num_games"] = dataValue || 0;
    }

    const values = Object.values(data.cantons);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Define color scale with domain based on min and max values
    const colorScale = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range(['black', 'grey']); // Adjust colors as needed

    svg.append("g")
        .selectAll("path")
        .data(geodata.features)
        .enter()
        .append("path")
        .attr("fill", (d) => {
            const dataValue = d.properties.num_games;
            // Use the color scale to map data values to colors
            return colorScale(dataValue);
        })
        // Hover effect on cantons
        .on('mouseover', onCantonMouseOver)
        .on('mouseout', onCantonMouseOut)
        .attr("d", d3.geoPath().projection(projection))
        .style("stroke", "#fff")
        
});

function onCantonMouseOver(event, d) {
    d3.select(this).transition()
        .duration('50')
        .attr('opacity', '.85');

    // Make tooltip appear on hover
    tooltip.transition()
        .duration(50)
        .style("opacity", 1);

    // Calculate the centroid of the canton geometry
    const centroid = path.centroid(d);

    numGames = d.properties.num_games;
    if (numGames == null) {
        numGames = 0;
    }

    // Update tooltip and move it to the mouse position
    tooltip.html(d.properties.name + " " + numGames)
        .style("left", (centroid[0] - tooltip.node().offsetWidth / 2) + "px")
        .style("top", (centroid[1] - tooltip.node().offsetHeight / 2) + "px");
}

function onCantonMouseOut(event, d) {
    d3.select(this).transition()
        .duration('50')
        .attr('opacity', '1');

    tooltip.transition()
        .duration('50')
        .style("opacity", 0);
}