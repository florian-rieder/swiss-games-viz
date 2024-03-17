// Slider adapted from: https://codepen.io/alexpg96/pen/xxrBgbP
window.onload = function () {
    slideOne();
    slideTwo();
};

let sliderStart = document.getElementById("slider-1");
let sliderEnd = document.getElementById("slider-2");
let displayStart = document.getElementById("range1");
let displayEnd = document.getElementById("range2");
let minGap = 0;
let sliderTrack = document.querySelector(".slider-track");
let sliderMaxValue = document.getElementById("slider-1").max;
let sliderMinValue = document.getElementById("slider-1").min;

function slideOne() {
    if (parseInt(sliderEnd.value) - parseInt(sliderStart.value) <= minGap) {
        sliderStart.value = parseInt(sliderEnd.value) - minGap;
    }
    displayStart.textContent = sliderStart.value;
    fillColor();
}
function slideTwo() {
    if (parseInt(sliderEnd.value) - parseInt(sliderStart.value) <= minGap) {
        sliderEnd.value = parseInt(sliderStart.value) + minGap;
    }
    displayEnd.textContent = sliderEnd.value;
    fillColor();
}
function fillColor() {
    percent1 = ((sliderStart.value - sliderMinValue) / (sliderMaxValue - sliderMinValue)) * 100;
    percent2 = ((sliderEnd.value - sliderMinValue) / (sliderMaxValue - sliderMinValue)) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , rgb(239, 85, 48) ${percent1}% , rgb(239, 85, 48) ${percent2}%, #dadae5 ${percent2}%)`;
}

const histogramTooltip = d3.select("#histogram").append("div")
    .attr("class", "data-tooltip")
    .style("opacity", 0);


function drawHistogram(data) {
    const width = document.querySelector("#histogram").offsetWidth;
    const height = 150;

    const extent = d3.extent(Object.keys(data).map(key => parseInt(key)))

    sliderStart.value = extent[0];
    sliderEnd.value = extent[1];
    slideOne();
    slideTwo();

    const paddedData = {};
    for (let i = extent[0]; i <= extent[1]; i++) {
        paddedData[i] = data[i] || 0;
    }

    d3.select("#histogram > svg").remove();

    const svg = d3.select("#histogram")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleBand()
        .domain(Object.keys(paddedData))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(Object.values(paddedData))])
        .nice()
        .range([height, 0]);

    svg.selectAll("rect")
        .data(Object.entries(paddedData))
        .enter().append("rect")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(0) - y(d[1]))
        .attr("width", x.bandwidth())
        .attr("fill", "rgb(239, 85, 48)")
        .on("mouseover", onBarMouseOver)
        .on("mouseout", onBarMouseOut);
}

function onBarMouseOver(e, d) {
    d3.select(this).transition()
        .duration(200)
        .attr('opacity', '.75');

    // Make histogramTooltip appear on hover
    histogramTooltip.transition()
        .duration(50)
        .style("opacity", 1);

    histogramTooltip.html(d[0] + " " + d[1])
        .style("left", this.x.baseVal.value + this.width.baseVal.value / 2 - histogramTooltip.node().offsetWidth / 2 + "px")
        .style("top", e.target.parentElement.height.baseVal.value / 2 - histogramTooltip.node().offsetHeight / 2 + "px");
}

function onBarMouseOut(e, d) {
    d3.select(this).transition()
        .duration('200')
        .attr('opacity', '1');

    histogramTooltip.transition()
        .duration('50')
        .style("opacity", 0);
}
