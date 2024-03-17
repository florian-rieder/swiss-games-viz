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
    sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , #3264fe ${percent1}% , #3264fe ${percent2}%, #dadae5 ${percent2}%)`;
}


function drawHistogram(data) {
    const width = 800;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };

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
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(Object.values(paddedData))])
        .nice()
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "black")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
        .attr("x", -height / 2)
        .attr("dy", "0.71em")
        .attr("text-anchor", "middle")
        .text("Number of Games");

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.selectAll("rect")
        .data(Object.entries(paddedData))
        .enter().append("rect")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(0) - y(d[1]))
        .attr("width", x.bandwidth())
        .attr("fill", "darkred");
}