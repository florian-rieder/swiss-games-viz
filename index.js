// We specify the dimensions for the map container. We use the same
// width and height as specified in the CSS above.
const width = 900,
    height = 600;

// We create a SVG element in the map container and give it some
// dimensions.
let svg = d3.select('#map').append('svg')
    .attr('width', width)
    .attr('height', height);

// We define a geographical projection
// and set the initial zoom to show the features.
let projection = d3.geoMercator()
    // The approximate scale factor was found through try and error
    .scale(10000)
    // The geographical center of Switzerland is around 46.8°, 8.2°
    .center([8.226692, 46.80121])
    // Translate: Translate it to fit the container
    .translate([width / 2, height / 2]);

// We prepare a path object and apply the projection to it.
let path = d3.geoPath()
    .projection(projection);

// Load the features from the GeoJSON.
d3.json('shapefiles/output.geojson').then(function(features) {

    console.log(features); // Check if data is loaded correctly

    svg.append("g")
        .selectAll("path")
        .data(features.features)
        .enter()
        .append("path")
        .attr("fill", "#69b3a2")
        .attr("d", d3.geoPath().projection(projection))
        .style("stroke", "#fff");

});
