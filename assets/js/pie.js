// Set up dimensions and radius
const pieWidth =  document.querySelector("#pie").offsetWidth;
const pieHeight = pieWidth;
const donutWidth = 85;
const radius = (pieWidth-(pieWidth/6))/2;

// Setting this to radius makes for REALLY clean transitions.
// But other values also give interesting results.
const sliceEnterDistance = radius;

const pieTooltip = d3.select("#pie").append("div")
    .attr("class", "data-tooltip")
    .style("opacity", 0);

const pie = d3.pie()
    .padAngle(0.005)
    .value(d => d.value)
    .sort(alphabeticalCompare);

const arc = d3.arc()
    .innerRadius(radius - donutWidth)
    .outerRadius(radius);

// Create SVG element
const pieSvg = d3.select("#pie")
    // Make svg responsive
    // see https://stackoverflow.com/q/16265123
    .append("div")
    // Container class to make it responsive.
    .classed("svg-container", true) 
    .append("svg")
    // Responsive SVG needs these 2 attributes and no width and height attr.
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox","0 0 " + pieWidth + " " + pieHeight)
    // Class to make it responsive.
    .classed("svg-content-responsive", true)
    .append("g")
    .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);


    // .append("svg")
    // .attr("width", pieWidth)
    // .attr("height", pieHeight)
    // .append("g")


function bakePie(ingredients) {
    // Convert data to an array of objects
    const dataArray = Object.entries(ingredients).map(([category, data]) => ({ category, value: data.num_games, key_name: data.key_name }));

    // This is dirty but will clean it up later, probably !
    const globalDataArray = Object.entries(globalData.games_per_genre).map(([category, data]) => ({ category, value: data.num_games, key_name: data.key_name })).sort(alphabeticalCompare);
    const colorRange = [...Array(Object.keys(globalData.games_per_genre).length)].map((_, i) => `hsl(${i * (360 / Object.keys(globalData.games_per_genre).length)}, 60%, 50%)`)

    // Generate colors dynamically
    const color = d3.scaleOrdinal()
        .domain(globalDataArray.map(d => d.category))
        .range(colorRange);

    // Select existing arcs and update their attributes with transition
    const updatingArcs = pieSvg.selectAll('path')
        .data(pie(dataArray), d => d.data.category)

    updatingArcs.transition().duration(500)
        .attr('d', arc)
        .attr("transform", "translate(0,0) scale(1)");

    // Handle entering arcs
    const enteringArcs = pieSvg.selectAll("path")
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
    const exitingArcs = pieSvg.selectAll("path")
        .data(pie(dataArray), d => d.data.category)
        .exit()

    exitingArcs.transition().duration(250)
        .attr('opacity', 0)
        .attr("transform", initialTransform)
        .remove();
}


function onPieMouseOver(event, d) {
    d3.select(this).transition()
        .duration(200)
        .attr('opacity', '.75');

    // Make tooltip appear on hover
    pieTooltip.transition()
        .duration(50)
        .style("opacity", 1);

    const centroid = arc.centroid(d);

    // Update tooltip and move it to the centroid
    pieTooltip.html(d.data.key_name + " " + d.data.value)
        .style("left", (centroid[0] + document.querySelector("#pie").offsetWidth / 2 - pieTooltip.node().offsetWidth/2) + "px")
        .style("top", (centroid[1] + document.querySelector("#pie").offsetHeight / 2 - pieTooltip.node().offsetHeight/2) + "px");
}

function onPieMouseOut(event, d) {
    d3.select(this).transition()
        .duration(200)
        .attr('opacity', 1);

    pieTooltip.transition()
        .duration(50)
        .style("opacity", 0);
}

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

function initialTransform(d){
    const middleAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
    const translateX = Math.sin(middleAngle) * sliceEnterDistance;
    const translateY = -Math.cos(middleAngle) * sliceEnterDistance;

    return `translate(${translateX},${translateY}) scale(0)`;
}