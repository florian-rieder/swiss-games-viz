// Set up dimensions and radius
let pieWidth = 100;
let pieHeight = 100;
let donutWidth = pieWidth * 0.25;
let radius = pieWidth / 2;
// Setting this to radius makes for REALLY clean transitions.
// But other values also give interesting results.
let sliceEnterDistance = radius;

const pieIds = ["pie-genres", "pie-stores", "pie-platforms", "pie-states"];
const categoryParams = {
    "genres": [],
    "platforms": [],
    "stores": [],
    "states": []
}

updatePiesSize();

function updatePiesSize() {
    // Set up dimensions and radius
    const parent = document.querySelector(`#${pieIds[0]}`).parentElement.parentElement;
    let width = parent.offsetWidth;
    let height = parent.offsetHeight;

    if (width > height) {
        pieWidth = height;
        pieHeight = height;
    } else {
        pieWidth = width;
        pieHeight = width;
    }

    donutWidth = pieWidth / 4;
    radius = pieWidth / 2;
    sliceEnterDistance = radius;
}


for (let id of pieIds) {
    // Create SVG element
    d3.select(`#${id}`)
        .append("svg")
        .append("g")

    // Add a tooltip to the pie
    d3.select(`#${id}`)
        .append("div")
        .attr("class", "data-tooltip")
        .style("opacity", 0);
}

const pie = d3.pie()
    .padAngle(0.005)
    .value(d => d.value)
    .sort(alphabeticalCompare);

let arc = d3.arc()
    .innerRadius(radius - donutWidth)
    .outerRadius(radius);

const pieColors = {}

function updatePies() {
    updatePiesSize();

    for (let id of pieIds) {
        d3.select(`#${id} svg`)
            .attr("width", pieWidth)
            .attr("height", pieHeight);

        d3.select(`#${id} svg g`)
            .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);

    }

    arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);

    bakePie("pie-genres", currentData.aggregates.games_per_genre, "genres");
    bakePie("pie-stores", currentData.aggregates.games_per_store, "stores");
    bakePie("pie-platforms", currentData.aggregates.games_per_platform, "platforms");
    bakePie("pie-states", currentData.aggregates.games_per_state, "states");
}

function bakePie(id, data, slug) {
    // Convert data to an array of objects
    const dataArray = Object.entries(data).map(([category, data]) => ({ category, value: data.num_games, key_name: data.key_name, variable_name: slug }));

    let color;
    // We need to set the colors once and for all on the first call to this function.
    if (id in pieColors) {
        color = pieColors[id];
    } else {
        colorRange = [...Array(Object.keys(data).length)].map((_, i) => `hsl(${i * (360 / Object.keys(data).length)}, 60%, 50%)`)

        color = d3.scaleOrdinal()
            .domain(dataArray.sort(alphabeticalCompare).map(d => d.category))
            .range(colorRange);

        pieColors[id] = color;
    }

    const svg = d3.select(`#${id} svg g`);

    // Select existing arcs and update their attributes with transition
    const updatingArcs = svg.selectAll('path')
        .data(pie(dataArray), d => d.data.category)

    updatingArcs.transition().duration(500)
        .attr('d', arc)
        .attr("transform", "translate(0,0) scale(1)")
        .attr("opacity", d => {
            const variable = d.data.variable_name;
            const category = d.data.category;
            let opacity;
            if (categoryParams[variable].filter(x => x.data.category === category).length > 0) {
                // Is contained in currentParams[variable]
                opacity = 0.6;
            } else {
                // Is not contained
                opacity = 1;
            }
            return opacity;
        });

    // Handle entering arcs
    const enteringArcs = svg.selectAll("path")
        .data(pie(dataArray), d => d.data.category)
        .enter()
        .append('path')
        .on("mouseover", onPieMouseOver)
        .on("mouseout", onPieMouseOut)
        .on("click", onPieClick)
        // Set initial transition states
        .attr("opacity", 0)
        .attr("transform", initialTransform);

    enteringArcs.transition().delay(250).duration(250)
        .attr('fill', d => color(d.data.category))
        .attr("d", arc)
        .attr("opacity", 1)
        .attr("transform", "translate(0,0) scale(1)")

    // Handle exiting arcs
    const exitingArcs = svg.selectAll("path")
        .data(pie(dataArray), d => d.data.category)
        .exit()

    exitingArcs.transition().duration(250)
        .attr('opacity', 0)
        .attr("transform", initialTransform)
        .remove();
}


function onPieMouseOver(event, d) {
    // Lower opacity of slice
    d3.select(this).transition()
        .duration(200)
        .attr('opacity', '.75');

    // Dirty, but it works
    const pieId = event.target.parentElement.parentElement.parentElement.id;
    const pieTooltip = d3.select(`#${pieId} .data-tooltip`);

    // Make tooltip appear on hover
    pieTooltip.transition()
        .duration(50)
        .style("opacity", 1);

    // Fill tooltip data
    pieTooltip.html(d.data.key_name + " <strong>" + d.data.value + "</strong>");

    // Tooltip placement
    const centroid = arc.centroid(d);
    const tooltipWidth = pieTooltip.node().offsetWidth;
    const tooltipHeight = pieTooltip.node().offsetHeight;

    // Set position of the tooltip around the center of the hovered arc
    let left = centroid[0] + pieWidth / 2 - tooltipWidth / 2;
    let top = centroid[1] + pieHeight / 2 - tooltipHeight / 2;

    // Prevent tooltip from overflowing
    // Overflows on the left
    if (left < 0) {
        left = 0;
    }
    // Overflows on the right
    else if (left + tooltipWidth > pieWidth) {
        left = pieWidth - tooltipWidth;
    }
    // Overflows at the top
    if (top < 0) {
        top = 0;
    }
    // Overflows at the bottom
    else if (top + tooltipHeight > pieHeight) {
        top = pieHeight - tooltipHeight;
    }

    // Update tooltip and move it to the new position
    pieTooltip.style("left", left + "px")
        .style("top", top + "px");
}

function onPieMouseOut(event, d) {

    const pieId = event.target.parentElement.parentElement.parentElement.id;
    const variable = pieId.slice(4);
    const category = d.data.category;

    // Define the opacity based on if this category is in the filters
    d3.select(this).transition()
        .duration(200)
        .attr("opacity", currentParams[variable].indexOf(category) > -1 ? 0.6 : 1)

    const pieTooltip = d3.select(`#${pieId} .data-tooltip`);

    pieTooltip.transition()
        .duration(50)
        .style("opacity", 0);
}

function onPieClick(event, d) {
    // get the slug of the variable from the id of the container.
    // For example: "genres" or "platforms"
    const variable = d.data.variable_name;
    const category = d.data.category;
    let opacity;

    // Check if this category is already in the current parameters
    if (categoryParams[variable].filter(x => x.data.category === category).length > 0) {
        // Is contained in currentParams[variable]
        opacity = 1;
        // Remove the category from the current parameters
        categoryParams[variable] = categoryParams[variable].filter(x => x.data.category !== category);
        currentParams[variable] = currentParams[variable].filter(x => x !== category);
    } else {
        // Is not contained
        opacity = 0.6;
        // Add the category to the current parameters
        categoryParams[variable].push(d);
        currentParams[variable].push(d.data.category);
    }

    d3.select(this).transition()
        .duration(200)
        .attr("opacity", opacity)

    updateData().then(updateViz)
}

function displayCategoryBadges() {
    const data = [categoryParams.genres, categoryParams.platforms, categoryParams.stores, categoryParams.states].flat()

    let container = d3.select('#category-badges');

    let enteringBadges = container.selectAll('span')
        .data(data, d => d.data.category)
        .enter()
        .append('span')
        .attr('class', 'badge')
        .html(d => d.data.key_name)
        .style("cursor", "pointer")
        .style("opacity", 0)
        .on("click", badgeClick)

    enteringBadges.transition()
        .duration(200)
        .style("opacity", 1)

    let exitingBadges = container.selectAll('span')
        .data(data, d => d.data.category)
        .exit();

    exitingBadges.transition()
        .duration(200)
        .style("opacity", 0)
        .remove();
}

function badgeClick(event, d) {
    console.log(d.data.category)
    // Remove this category from filters
    currentParams[d.data.variable_name] = currentParams[d.data.variable_name].filter(x => x !== d.data.category);
    categoryParams[d.data.variable_name] = categoryParams[d.data.variable_name].filter(x => x.data.category !== d.data.category);
    updateData().then(updateViz);
}

// Alphabetical compare function, used to sort keys alphabetically in the pies
function alphabeticalCompare(a, b) {
    // Alphabetical sort
    if (a.category < b.category) {
        return -1;
    }
    if (a.category > b.category) {
        return 1;
    }
    return 0;
}

function initialTransform(d) {
    // Angle that defines the center of a slice of the pie
    const middleAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
    // Slide the slice outwards
    const translateX = Math.sin(middleAngle) * sliceEnterDistance;
    const translateY = -Math.cos(middleAngle) * sliceEnterDistance;

    return `translate(${translateX},${translateY}) scale(0)`;
}
