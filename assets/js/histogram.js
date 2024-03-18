/// SLIDER
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
let sliderSubmit = document.getElementById("submit-slider");

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
    if (parseInt(sliderEnd.value) - parseInt(sliderStart.value) <= minGap) {
        sliderStart.value = parseInt(sliderEnd.value) - minGap;
    }
    displayStart.textContent = sliderStart.value;
    fillColor();

    if (sliderStart.value != currentStartYear || sliderEnd.value != currentEndYear) {
        sliderSubmit.classList.remove("hidden");
    } else {
        sliderSubmit.classList.add("hidden");
    }
}

function slideTwo() {
    if (parseInt(sliderEnd.value) - parseInt(sliderStart.value) <= minGap) {
        sliderEnd.value = parseInt(sliderStart.value) + minGap;
    }
    displayEnd.textContent = sliderEnd.value;
    fillColor();

    if (sliderStart.value != currentStartYear || sliderEnd.value != currentEndYear) {
        sliderSubmit.classList.remove("hidden");
    } else {
        sliderSubmit.classList.add("hidden");
    }
}

function fillColor() {
    percent1 = ((sliderStart.value - sliderStart.min) / (sliderStart.max - sliderStart.min)) * 100;
    percent2 = ((sliderEnd.value - sliderEnd.min) / (sliderEnd.max - sliderEnd.min)) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , rgb(239, 85, 48) ${percent1}% , rgb(239, 85, 48) ${percent2}%, #dadae5 ${percent2}%)`;
}


/// HISTOGRAM

const histogramWidth = document.querySelector("#histogram").offsetWidth;
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
    const extent = d3.extent(Object.keys(data).map(key => parseInt(key)))

    currentHistogramData = data;

    sliderStart.value = extent[0];
    sliderEnd.value = extent[1];
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
