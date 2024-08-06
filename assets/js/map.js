const ratio = 1.66 // About the ratio of a map of switzerland
mapMargin = 20;
let mapWidth = document.querySelector("#map-wrapper").offsetWidth;
let mapHeight = document.querySelector("#map-wrapper").offsetHeight;

// Duplicate code. Fix later
// If the map would be too high with the current width
if (mapWidth / ratio > mapHeight) {
    // scale to fit the height
    mapWidth = mapHeight * ratio;
} else {
    mapHeight = mapWidth / ratio;
}

const svg = d3.select('#map').append('svg')
    .attr("width", Math.round(mapWidth))
    .attr("height", Math.round(mapHeight))
    // Add an event listener to the SVG element to detect clicks outside of the map regions
    .on("click", event => {
        // Check if the click event target is not within the map regions
        if (!event.target.closest("path")) {
            onOutsideClick();
        }
    });

const tooltip = d3.select("#map").append("div")
    .attr("class", "data-tooltip")
    .style("opacity", 0);

let path = null;

function updateMap(data) {
    mapWidth = document.querySelector("#map-wrapper").offsetWidth;
    mapHeight = document.querySelector("#map-wrapper").offsetHeight;

    // If the map would be too high with the current width
    if (mapWidth / ratio > mapHeight) {
        // scale to fit the height
        mapWidth = mapHeight * ratio;
    } else {
        mapHeight = mapWidth / ratio;
    }

    // Resize the map
    d3.select("#map svg")
        .attr("width", Math.round(mapWidth))
        .attr("height", Math.round(mapHeight));

    d3.selectAll("#map svg g").remove();

    drawMap(data, cantons, lakes);
}

function drawMap(data, cantons, lakes) {
    // merge data to geodata
    for (const featureIdx in cantons.features) {
        const cantonId = cantons.features[featureIdx].properties.id
        const slug = id2canton(cantonId)
        let numGames = 0

        for (var s of slug) {
            if (s in data) {
                numGames += data[s].num_games;
            }
        }

        cantons.features[featureIdx].properties.num_games = numGames;
    }

    // Define a geographical projection
    const projection = d3.geoMercator()
        // The geographical center of Switzerland is around 46.8°, 8.2°
        .center([8.226692, 46.80121])
        .translate([mapWidth / 2, mapHeight / 2])
        // Fit the map to the svg
        .fitExtent([[mapMargin, mapMargin], [mapWidth - mapMargin, mapHeight - mapMargin]], cantons);

    // Prepare a path object and apply the projection to it.
    path = d3.geoPath()
        .projection(projection);

    // Color scale
    values = Object.entries(data).map(([slug, d]) => (d.num_games))
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

    // Draw lakes
    svg.append("g")
        .selectAll("path")
        .data(lakes.features)
        .enter()
        .append("path")
        .attr("fill", d => waterColor)
        .attr("d", d3.geoPath().projection(projection));

    // Draw cantons
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
    // Transition region to lower opacity
    d3.select(this).transition()
        .duration(200)
        .attr('opacity', '.75');

    // Make tooltip appear
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
    tooltip.html(d.properties.name + " <strong>" + numGames + "</strong>")
        .style("left", (centroid[0] - tooltip.node().offsetWidth / 2) + "px")
        .style("top", (centroid[1] - tooltip.node().offsetHeight / 2) + "px");
}

function onCantonMouseOut(event, d) {
    // Transition region to full opacity
    d3.select(this).transition()
        .duration('200')
        .attr('opacity', '1');

    // Hide tooltip
    tooltip.transition()
        .duration('50')
        .style("opacity", 0);
}

function onCantonClick(event, d) {
    // Don't do anything on greyed out cantons (cantons with no games)
    if (d.properties.num_games == 0) return;

    const slugs = id2canton(d.properties.id);
    const alreadySelected = slugs.filter(s => currentParams.cantons.includes(s));

    // If this canton is already selected, remove it from the params
    if (alreadySelected.length > 0) {

        alreadySelected.forEach(slug => {
            // Go back to global view: remove this slug from the current query parameters
            currentParams.cantons = currentParams.cantons.filter(e => e !== slug);
        })

        if (currentParams.cantons.length == 0) {
            selectCanton(null);
        } else {
            updateData().then(updateViz);
        }
    }
    // Otherwise, add it
    else {
        // Select the canton and refresh viz
        selectCanton(slugs);
    }
}

// Function to handle click outside of map regions
function onOutsideClick() {
    // Set the title to "Suisse"
    document.querySelector("#canton-selection-title").innerHTML = "Suisse";

    // Deselect any selected canton and refresh viz
    selectCanton(null);
}