let globalData;
let firstYear, lastYear;
let currentStartYear, currentEndYear;

// Load initial data from the SwissGamesGarden API
getAggregateData().then((data) => {

    console.log(data);
    globalData = data;

    // Set min and max years based on min and max in the data
    [firstYear, lastYear] = d3.extent(Object.keys(data.games_per_year).map(key => parseInt(key)));
    currentStartYear = firstYear;
    currentEndYear = lastYear;
    sliderStart.value = firstYear;
    sliderStart.min = firstYear;
    sliderStart.max = lastYear;
    sliderEnd.value = lastYear;
    sliderEnd.min = firstYear;
    sliderEnd.max = lastYear;
    slideOne();
    slideTwo();

    // Show visualisations
    bakePie(data.games_per_genre);
    drawHistogram(data.games_per_year);

    // Load data  and geodata from file
    Promise.all([
        d3.json('assets/geometry/cantons.geojson'),
        d3.json('assets/geometry/lakes.geojson')
    ]).then(([cantons, lakes]) => {
        // Draw map
        drawMap(data, cantons, lakes);
    });
});

function selectCanton(cantonSlug) {
    getAggregateData({ "cantons": cantonSlug }).then((data) => {
        bakePie(data.games_per_genre);
        drawHistogram(data.games_per_year);
    });
}

sliderSubmit.addEventListener("click", e => {
    currentStartYear = sliderStart.value;
    currentEndYear = sliderEnd.value;
    sliderSubmit.classList.add("hidden");

    // TODO: refresh data with new query parameters
});