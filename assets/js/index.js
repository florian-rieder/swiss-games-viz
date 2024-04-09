let globalData, currentData;
let firstYear, lastYear;
let cantons, lakes;

let currentParams = {
    page: null,
    cantons: null,
    platforms: null,
    stores: null,
    genres: null,
    states: null,
    locations: null,
    release_year_start: null,
    release_year_end: null
}


const submitBtn = document.getElementById("submit");
const resetBtn = document.getElementById("reset");
const buttons = document.getElementById("buttons");

window.onresize = () => {
    // Responsive histogram on resize
    updateHistogram(currentData.games_per_year);
    updateMap(currentData.games_per_canton);
    updatePies();
}

// Load initial data from the SwissGamesGarden API
getCachedData(currentParams).then((data) => {
    globalData = data;
    currentData = data;

    // Set min and max years based on min and max in the global data
    [firstYear, lastYear] = d3.extent(Object.keys(data.games_per_year).map(key => parseInt(key)));
    currentParams.release_year_start = firstYear;
    currentParams.release_year_end = lastYear;
    sliderStart.value = firstYear;
    sliderStart.min = firstYear;
    sliderStart.max = lastYear;
    sliderEnd.value = lastYear;
    sliderEnd.min = firstYear;
    sliderEnd.max = lastYear;
    slideOne();
    slideTwo();

    // Show visualisations
    updatePies();
    drawHistogram(data.games_per_year);

    // Load data  and geodata from file
    Promise.all([
        d3.json('assets/geometry/cantons.geojson'),
        d3.json('assets/geometry/lakes.geojson')
    ]).then(([cantonsData, lakesData]) => {
        // Save geometries to variables
        cantons = cantonsData;
        lakes = lakesData;
        // Draw map
        drawMap(data.games_per_canton, cantons, lakes);
    });
});

function selectCanton(cantonSlug) {
    if (cantonSlug != currentParams.cantons) {
        currentParams.cantons = cantonSlug
    } else {
        // Prevent requesting the same data directly
        return;
    }

    updateDataViz()
}

function updateDataViz() {
    // Get data based on the currently selected query parameters
    getCachedData(currentParams).then((data) => {
        currentData = data;

        // Update visualizations with new data
        updatePies();
        updateHistogram(data.games_per_year);
        drawMap(data.games_per_canton, cantons, lakes);
    });
}

submitBtn.addEventListener("click", e => {
    currentParams.release_year_start = sliderStart.value;
    currentParams.release_year_end = sliderEnd.value;

    submitBtn.classList.add("hidden");
    resetBtn.classList.remove("hidden");

    // Refresh data with new query parameters
    updateDataViz();
});

resetBtn.addEventListener("click", e => {
    // Reset parameters
    currentParams = {
        page: null,
        cantons: null,
        platforms: null,
        stores: null,
        genres: null,
        states: null,
        locations: null,
        release_year_start: null,
        release_year_end: null
    }

    // refresh data with reset query parameters
    updateDataViz();

    submitBtn.classList.add("hidden");
    resetBtn.classList.add("hidden");
});

function onInputsChanged() {
    if ((currentParams.release_year_start != null && sliderStart.value != currentParams.release_year_start)
        || (currentParams.release_year_end != null && sliderEnd.value != currentParams.release_year_end)) {
        submitBtn.classList.remove("hidden");
        resetBtn.classList.remove("hidden");
    } else {
        submitBtn.classList.add("hidden");
        resetBtn.classList.add("hidden");
    }
}
