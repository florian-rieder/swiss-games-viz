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
const loadMoreGamesBtn = document.getElementById("load-more-games");

window.onresize = () => {
    // Responsive visualizations on resize
    updateHistogram(currentData.aggregates.games_per_year);
    updateMap(currentData.aggregates.games_per_canton);
    updatePies();
}

// Load initial data from the SwissGamesGarden API
getCachedData(currentParams).then((data) => {
    globalData = data;
    currentData = data;

    // Set min and max years based on min and max in the global data
    [firstYear, lastYear] = d3.extent(Object.keys(data.aggregates.games_per_year).map(key => parseInt(key)));
    currentParams.release_year_start = firstYear;
    currentParams.release_year_end = lastYear;

    // Initialize the release years slider
    sliderStart.value = firstYear;
    sliderStart.min = firstYear;
    sliderStart.max = lastYear;
    sliderEnd.value = lastYear;
    sliderEnd.min = firstYear;
    sliderEnd.max = lastYear;
    slideOne();
    slideTwo();

    document.getElementById("num-loaded-games").innerHTML = currentData.hits.games.length;
    document.getElementById("num-total-games").innerHTML = currentData.hits.total;

    // Show visualisations
    updatePies();
    drawHistogram(data.aggregates.games_per_year);
    listGames(data.hits.games);

    // Load data  and geodata from file
    Promise.all([
        d3.json('assets/geometry/cantons.geojson'),
        d3.json('assets/geometry/lakes.geojson')
    ]).then(([cantonsData, lakesData]) => {
        // Save geometries to variables
        cantons = cantonsData;
        lakes = lakesData;
        // Draw map
        drawMap(data.aggregates.games_per_canton, cantons, lakes);
    });
});

function selectCanton(cantonSlug) {
    if (cantonSlug != currentParams.cantons) {
        currentParams.cantons = cantonSlug
    } else {
        // Prevent requesting the same data directly
        return;
    }

    updateData().then(updateViz);
}

// Refresh currentData based on currentParams
async function updateData() {
    // Reset to the start of the list (in case other parameters changed which change how many games are returned)
    currentParams.page = 0;
    // Refresh current data based on the currently selected query parameters
    const data = await getCachedData(currentParams)
    currentData = data;
}

// Once new currentParams have ben set, fetch the new data and refresh the visualizations
function updateViz() {
    // Disable the load more games button if we already have loaded all available games
    if (currentData.hits.total == currentData.hits.games.length) {
        loadMoreGamesBtn.classList.add("hidden");
    } else {
        loadMoreGamesBtn.classList.remove("hidden");
    }

    document.getElementById("num-loaded-games").innerHTML = currentData.hits.games.length;
    document.getElementById("num-total-games").innerHTML = currentData.hits.total;

    // Update visualizations with new data
    updatePies();
    updateHistogram(currentData.aggregates.games_per_year);
    drawMap(currentData.aggregates.games_per_canton, cantons, lakes);
    listGames(currentData.hits.games);
}

submitBtn.addEventListener("click", e => {
    currentParams.release_year_start = sliderStart.value;
    currentParams.release_year_end = sliderEnd.value;

    submitBtn.classList.add("hidden");
    resetBtn.classList.remove("hidden");

    // Refresh data with new query parameters
    updateData().then(updateViz);
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
    updateData().then(updateViz);

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

loadMoreGamesBtn.addEventListener("click", e => {
    loadMoreGames().then(updateViz);
});