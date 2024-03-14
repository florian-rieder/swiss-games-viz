// Set up dimensions and radius
const pieWidth = 400;
const pieHeight = 400;
const donutWidth = 75;
const radius = Math.min(pieWidth, pieHeight) / 2;

const pieTooltip = d3.select("#pie").append("div")
    .attr("class", "data-tooltip")
    .style("opacity", 0);

// Generate pie chart
let pie = d3.pie()
    .padAngle(0.03)
    .value(d => d.value);

let piePath = d3.arc()
    .innerRadius(radius - donutWidth)
    .outerRadius(radius);

function bakePie(ingredients) {
    // Convert data to an array of objects
    const dataArray = Object.entries(ingredients).map(([category, value]) => ({ category, value }));
    const colorRange = [...Array(Object.keys(ingredients).length)].map((_, i) => `hsl(${i * (360 / Object.keys(ingredients).length)}, 70%, 50%)`)


    // Generate colors dynamically
    const color = d3.scaleOrdinal()
        .domain(dataArray.map(d => d.category))
        .range(colorRange);

    // Remove previous pie if there is one
    d3.select("#pie > svg").remove();

    // Create SVG element
    const pieSvg = d3.select("#pie")
        .append("svg")
        .attr("width", pieWidth)
        .attr("height", pieHeight)
        .append("g")
        .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);

    let arc = pieSvg.selectAll("arc")
        .data(pie(dataArray))
        .enter()
        .append("g");

    arc.append("path")
        .attr("d", piePath)
        .attr("fill", d => color(d.data.category))
        // .attr("stroke", "white")
        // .attr("stroke-width", 2)
        .on("mouseover", onPieMouseOver)
        .on("mouseout", onPieMouseOut)

}


function onPieMouseOver(event, d) {
    d3.select(this).transition()
        .duration(200)
        .attr('opacity', '.75');

    // Make tooltip appear on hover
    pieTooltip.transition()
        .duration(50)
        .style("opacity", 1);

    const centroid = piePath.centroid(d);

    // Update tooltip and move it to the centroid
    pieTooltip.html(d.data.category + " " + d.data.value)
        .style("left", (centroid[0] + pieWidth / 2) + "px")
        .style("top", (centroid[1] + pieHeight / 2) + "px");
}

function onPieMouseOut(event, d) {
    d3.select(this).transition()
        .duration('200')
        .attr('opacity', '1');

    pieTooltip.transition()
        .duration('50')
        .style("opacity", 0);
}