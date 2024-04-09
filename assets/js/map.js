const ratio = 1.66 // About the ratio of a map of switzerland
    mapMargin = 20;
let width = document.getElementById("map").offsetWidth,
    height = Math.ceil(width / ratio);

const svg = d3.select('#map').append('svg')
    .attr('width', width)
    .attr('height', height)
    // Add an event listener to the SVG element to detect clicks outside of the map regions
    .on("click", event =>  {
        // Check if the click event target is not within the map regions
        if (!event.target.closest("path")) {
            onOutsideClick();
        }
    })

// function updateWindow(){
//     // x = w.innerWidth || e.clientWidth || g.clientWidth;
//     // y = w.innerHeight|| e.clientHeight|| g.clientHeight;
//     svg.attr("width", 0).attr("height", height);
//     width = document.getElementById("map").offsetWidth,
//     height = Math.ceil(width / ratio);
//     svg.attr("width", width).attr("height", height);
// }
// d3.select(window).on("resize", updateWindow);

const tooltip = d3.select("#map").append("div")
    .attr("class", "data-tooltip")
    .style("opacity", 0);

let path = null;

function drawMap(data, cantons, lakes) {
    // merge data to geodata
    for (const featureIdx in cantons.features) {
        const cantonId = cantons.features[featureIdx].properties.id
        const slug = id2canton(cantonId)
        let numGames = 0

        // This atrocity is all because Biel is classified as a canton,
        // when it is part of the Bern canton !
        if (Array.isArray(slug)) {
            for (var s of slug) {
                if (s in data) {
                    numGames += data[s].num_games;
                }
            }
        } else {
            if (slug in data) {
                numGames = data[slug].num_games;
            }
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
    tooltip.html(d.properties.name + " " + numGames)
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

    // Set the title to the name of the canton
    document.querySelector("#canton-selection-title").innerHTML = d.properties.name

    // Select the canton and refresh viz
    selectCanton(id2canton(d.properties.id));
}

// Function to handle click outside of map regions
function onOutsideClick() {
    // Set the title to "Suisse"
    document.querySelector("#canton-selection-title").innerHTML = "Suisse";

    // Deselect any selected canton and refresh viz
    selectCanton(null);
}