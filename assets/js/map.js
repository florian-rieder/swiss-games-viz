const width = window.innerWidth,
    height = window.innerHeight,
    mapMargin = 20;

const svg = d3.select('#map').append('svg')
    .attr('width', width)
    .attr('height', height);

const tooltip = d3.select("#map").append("div")
    .attr("class", "data-tooltip")
    .style("opacity", 0);

let path = null;

// Load data from the SwissGamesGarden API and geodata from file
Promise.all([
    getAggregateData(),
    d3.json('assets/geometry/cantons.geojson'),
    d3.json('assets/geometry/lakes.geojson')
]).then((datas) => {
    let data = datas[0];
    let geodata = datas[1];
    let lakes = datas[2];

    console.log(data);

    // merge data to geodata
    for (const featureIdx in geodata.features) {
        const gamesPerCanton = data.games_per_canton[id2canton(geodata.features[featureIdx].properties.id)];
        geodata.features[featureIdx]["properties"]["num_games"] = gamesPerCanton || 0;
    }

    // Define a geographical projection
    const projection = d3.geoMercator()
    // The geographical center of Switzerland is around 46.8°, 8.2°
    .center([8.226692, 46.80121])
    .translate([width / 2, height / 2])
    // Fit the map to the svg
    .fitExtent([[mapMargin, mapMargin], [width-mapMargin, height-mapMargin]], geodata);

    // Prepare a path object and apply the projection to it.
    path = d3.geoPath()
        .projection(projection);

    // Color scale
    const values = Object.values(data.games_per_canton);
    const range = d3.extent(values);
    const zeroColor = "#262626";
    const colorRange = ["#1c0709", "#f53347"];
    const waterColor = "#949494";
    
    // Define color scale with domain based on min and max values
    // Other options:
    // linear: .scaleLinear()
    // logarithmic: .scaleLog()
    // power: .scalePow().exponent(exponent)
    const colorScale = d3.scalePow().exponent(0.75)
        .domain(range)
        .range(colorRange);
    
    svg.append("g")
        .selectAll("path")
        .data(lakes.features)
        .enter()
        .append("path")
        .attr("fill", d => waterColor)
        .attr("d", d3.geoPath().projection(projection));

    svg.append("g")
        .selectAll("path")
        .data(geodata.features)
        .enter()
        .append("path")
        .attr("fill", (d) => {
            const numGames = d.properties.num_games;
            // Use black for cantons with 0 games
            if(numGames === 0){
                return zeroColor;
            }
            // Use the color scale to map data values to colors
            return colorScale(numGames);
        })
        // Hover effect on cantons
        .on('mouseover', onCantonMouseOver)
        .on('mouseout', onCantonMouseOut)
        .on('click', onCantonClick)
        .attr("d", d3.geoPath().projection(projection))
        .style("stroke", "#fff")
});

function onCantonMouseOver(event, d) {
    d3.select(this).transition()
        .duration(200)
        .attr('opacity', '.75');

    // Make tooltip appear on hover
    tooltip.transition()
        .duration(50)
        .style("opacity", 1);

    numGames = d.properties.num_games;
    if (numGames == null) {
        numGames = 0;
    }

    // Calculate the centroid of the canton geometry
    const centroid = path.centroid(d);

    // Update tooltip and move it to the centroid of the canton
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

function onCantonClick(event, d) {
    console.log(d.properties);
}