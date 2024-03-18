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

function drawMap(data, cantons, lakes) {
    // merge data to geodata
    for (const featureIdx in cantons.features) {
        const slug = id2canton(cantons.features[featureIdx].properties.id)
        let numGames = 0
        if (slug in data.games_per_canton) {
            numGames = data.games_per_canton[slug].num_games;
        }
        cantons.features[featureIdx].properties.num_games = numGames;
    }

    // Define a geographical projection
    const projection = d3.geoMercator()
        // The geographical center of Switzerland is around 46.8°, 8.2°
        .center([8.226692, 46.80121])
        .translate([width / 2, height / 2])
        // Fit the map to the svg
        .fitExtent([[mapMargin, mapMargin], [width - mapMargin, height - mapMargin]], cantons);

    // Prepare a path object and apply the projection to it.
    path = d3.geoPath()
        .projection(projection);

    // Color scale
    values = Object.entries(data.games_per_canton).map(([slug, data]) => (data.num_games))
    const range = d3.extent(values);
    const zeroColor = "#262626";
    const colorRange = ["rgb(36, 0, 0)", "rgb(224, 31, 31)"];
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
        .data(cantons.features)
        .enter()
        .append("path")
        .attr("fill", (d) => {
            const numGames = d.properties.num_games;
            // Use black for cantons with 0 games
            if (numGames === 0) {
                return zeroColor;
            }
            // Use the color scale to map data values to colors
            return colorScale(numGames);
        })
        // Pointer on clickable cantons
        .style("cursor", d => d.properties.num_games > 0 ? "pointer" : "inherit")
        // Hover effect on cantons
        .on('mouseover', onCantonMouseOver)
        .on('mouseout', onCantonMouseOut)
        .on('click', onCantonClick)
        .attr("d", d3.geoPath().projection(projection))
        .style("stroke", "white")
}

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
        .duration('200')
        .attr('opacity', '1');

    tooltip.transition()
        .duration('50')
        .style("opacity", 0);
}

function onCantonClick(event, d) {
    if (d.properties.num_games == 0) return;

    document.querySelector(".details > h2").innerHTML = d.properties.name
    selectCanton(id2canton(d.properties.id));
}