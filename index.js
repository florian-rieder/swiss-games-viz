const width = window.innerWidth,
    height = window.innerHeight;

let svg = d3.select('#map').append('svg')
    .attr('width', width)
    .attr('height', height);

let tooltip = d3.select("body").append("div")
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

// Load the features from the GeoJSON.
d3.json('shapefiles/output.geojson').then(function (features) {

    //console.log(features);

    svg.append("g")
        .selectAll("path")
        .data(features.features)
        .enter()
        .append("path")
        .attr("fill", "#69b3a2")
        // Hover effect on cantons
        .on('mouseover', onCantonMouseOver)
        .on('mouseout', onCantonMouseOut)
        .attr("d", d3.geoPath().projection(projection))
        .style("stroke", "#fff");

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

    // Update tooltip and move it to the mouse position
    tooltip.html(d.properties.name)
        .style("left", (centroid[0] - tooltip.node().offsetWidth/2) + "px")
        .style("top", (centroid[1] - tooltip.node().offsetHeight/2) + "px");
}

function onCantonMouseOut(event, d) {
    d3.select(this).transition()
        .duration('50')
        .attr('opacity', '1');

    tooltip.transition()
        .duration('50')
        .style("opacity", 0);
}