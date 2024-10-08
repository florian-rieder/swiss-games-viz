/// SLIDER
// Slider adapted from: https://codepen.io/alexpg96/pen/xxrBgbP

let sliderStart = document.getElementById("slider-1");
let sliderEnd = document.getElementById("slider-2");
let displayStart = document.getElementById("range1");
let displayEnd = document.getElementById("range2");
let sliderMinGap = 0;
let sliderTrack = document.querySelector(".slider-track");

// Add event listeners to sliders
sliderStart.addEventListener('input', function () {
    slideOne();
    updateHistogram(currentHistogramData);
});

sliderEnd.addEventListener('input', function () {
    slideTwo();
    updateHistogram(currentHistogramData);
});

function slideOne() {
    if (parseInt(sliderEnd.value) - parseInt(sliderStart.value) <= sliderMinGap) {
        sliderStart.value = parseInt(sliderEnd.value) - sliderMinGap;
    }
    displayStart.textContent = sliderStart.value;
    fillColor();

    onInputsChanged();
}

function slideTwo() {
    if (parseInt(sliderEnd.value) - parseInt(sliderStart.value) <= sliderMinGap) {
        sliderEnd.value = parseInt(sliderStart.value) + sliderMinGap;
    }
    displayEnd.textContent = sliderEnd.value;
    fillColor();

    onInputsChanged();
}

function fillColor() {
    percent1 = ((sliderStart.value - sliderStart.min) / (sliderStart.max - sliderStart.min)) * 100;
    percent2 = ((sliderEnd.value - sliderEnd.min) / (sliderEnd.max - sliderEnd.min)) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , rgb(239, 85, 48) ${percent1}% , rgb(239, 85, 48) ${percent2}%, #dadae5 ${percent2}%)`;
}


/// HISTOGRAM

let histogramWidth = document.querySelector("#histogram").offsetWidth;
const histogramHeight = 150;

const histogramTooltip = d3.select("#histogram").append("div")
    .attr("class", "data-tooltip")
    .style("opacity", 0);

let currentHistogramData;

d3.select("#histogram")
    .append("svg")
    .attr("width", histogramWidth)
    .attr("height", histogramHeight);

function drawHistogram(data) {
    //const extent = d3.extent(Object.keys(data).map(key => parseInt(key)))

    currentHistogramData = data;
    sliderStart.value = currentParams.release_year_start || sliderStart.min;
    sliderEnd.value = currentParams.release_year_end || sliderStart.max;
    slideOne();
    slideTwo();

    updateHistogram(data);
}

function updateHistogram(data) {
    // Create the actual data used by the histogram, by getting all years
    // between start and end, replacing missing values with zeros.
    const start = parseInt(sliderStart.value);
    const end = parseInt(sliderEnd.value);
    const filteredData = {};
    for (let i = start; i <= end; i++) {
        filteredData[i] = data[i] || 0;
    }

    histogramWidth = document.querySelector("#histogram").offsetWidth;

    d3.select("#histogram > svg")
        .attr("width", histogramWidth)
        .attr("height", histogramHeight);

    drawBars(filteredData);
}

function drawBars(data) {
    const svg = d3.select("#histogram > svg");

    const x = d3.scaleBand()
        .domain(Object.keys(data))
        .range([0, histogramWidth])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(Object.values(data))])
        .range([histogramHeight, 0])

    // Select existing bars and update their attributes with transition
    svg.selectAll("rect")
        .data(Object.entries(data), d => d)
        .transition()
        .duration(500)
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(0) - y(d[1]))
        .attr("width", x.bandwidth());

    // Handle entering bars
    const enterBars = svg.selectAll("rect")
        .data(Object.entries(data), d => d)
        .enter().append("rect")
        .attr("x", d => x(d[0]))
        .attr("width", x.bandwidth())
        .attr("y", histogramHeight)
        .attr("height", 0)
        .attr("fill", "rgb(239, 85, 48)")
        .on("mouseover", onBarMouseOver)
        .on("mouseout", onBarMouseOut);

    // Transition entering bars to their correct height
    enterBars.transition()
        .duration(500)
        .attr("y", d => y(d[1]))
        .attr("height", d => y(0) - y(d[1]));

    // Handle exiting bars
    svg.selectAll("rect")
        .data(Object.entries(data), d => d)
        .exit()
        .transition()
        .duration(200)
        .attr("y", histogramHeight) // Move exiting bars to the bottom
        .attr("height", 0) // Set height to 0
        .remove();
}

function onBarMouseOver(e, d) {
    d3.select(this).transition()
        .duration(200)
        .attr('opacity', '.75');

    // Make histogramTooltip appear on hover
    histogramTooltip.transition()
        .duration(50)
        .style("opacity", 1);

    histogramTooltip.html(d[0] + " <strong>" + d[1] + "</strong>")

    const tooltipWidth = histogramTooltip.node().offsetWidth;
    const tooltipHeight = histogramTooltip.node().offsetHeight;
    const histogramWidth = document.querySelector("#histogram").offsetWidth;

    // Set position of the tooltip around the center of the hovered bar
    let left = this.x.baseVal.value + this.width.baseVal.value / 2 - tooltipWidth / 2;
    let top = e.target.parentElement.height.baseVal.value / 2 - tooltipHeight / 2;

    // Prevent tooltip from overflowing
    // Overflows on the left
    if (left < 0) {
        left = 0;
    }
    // Overflows on the right
    else if (left + tooltipWidth > histogramWidth) {
        left = histogramWidth - tooltipWidth;
    }

    histogramTooltip.style("left", left + "px")
        .style("top", top + "px");
}

function onBarMouseOut(e, d) {
    d3.select(this).transition()
        .duration('200')
        .attr('opacity', '1');

    histogramTooltip.transition()
        .duration('50')
        .style("opacity", 0);
}
