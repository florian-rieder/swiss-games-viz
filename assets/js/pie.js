// Set up dimensions and radius
const pieWidth = 400;
const pieHeight = 400;
const donutWidth = 75;
const radius = 350 / 2;
// Setting this to radius makes for REALLY clean transitions.
// But other values also give interesting results.
const sliceEnterDistance = radius;


const pieIds = ["pie-genres", "pie-stores", "pie-platforms"];

for (let id of pieIds) {
    // Create SVG element
    d3.select(`#${id}`)
        .append("svg")
        .attr("width", pieWidth)
        .attr("height", pieHeight)
        .append("g")
        .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);

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

const arc = d3.arc()
    .innerRadius(radius - donutWidth)
    .outerRadius(radius);



function bakePie(id, ingredients) {
    // Convert data to an array of objects
    const dataArray = Object.entries(ingredients).map(([category, data]) => ({ category, value: data.num_games, key_name: data.key_name }));

    // This is dirty but will clean it up later, probably !
    const globalDataArray = Object.entries(globalData.games_per_genre).map(([category, data]) => ({ category, value: data.num_games, key_name: data.key_name })).sort(alphabeticalCompare);
    const colorRange = [...Array(Object.keys(globalData.games_per_genre).length)].map((_, i) => `hsl(${i * (360 / Object.keys(globalData.games_per_genre).length)}, 60%, 50%)`)

    const svg = d3.select(`#${id} svg g`);

    // Generate colors dynamically
    const color = d3.scaleOrdinal()
        .domain(globalDataArray.map(d => d.category))
        .range(colorRange);

    // Select existing arcs and update their attributes with transition
    const updatingArcs = svg.selectAll('path')
        .data(pie(dataArray), d => d.data.category)

    updatingArcs.transition().duration(500)
        .attr('d', arc)
        .attr("transform", "translate(0,0) scale(1)");

    // Handle entering arcs
    const enteringArcs = svg.selectAll("path")
        .data(pie(dataArray), d => d.data.category)
        .enter()
        .append('path')
        .on("mouseover", onPieMouseOver)
        .on("mouseout", onPieMouseOut)
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
    const pieTooltip = d3.select(`#${pieId} .data-tooltip`)

    // Make tooltip appear on hover
    pieTooltip.transition()
        .duration(50)
        .style("opacity", 1);

    const centroid = arc.centroid(d);

    // Update tooltip and move it to the centroid
    pieTooltip.html(d.data.key_name + " " + d.data.value)
        .style("left", (centroid[0] + pieWidth / 2) + "px")
        .style("top", (centroid[1] + pieHeight / 2) + "px");
}

function onPieMouseOut(event, d) {
    d3.select(this).transition()
        .duration(200)
        .attr('opacity', 1);

    const pieId = event.target.parentElement.parentElement.parentElement.id;
    const pieTooltip = d3.select(`#${pieId} .data-tooltip`);

    pieTooltip.transition()
        .duration(50)
        .style("opacity", 0);
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
    const middleAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
    const translateX = Math.sin(middleAngle) * sliceEnterDistance;
    const translateY = -Math.cos(middleAngle) * sliceEnterDistance;

    return `translate(${translateX},${translateY}) scale(0)`;
}