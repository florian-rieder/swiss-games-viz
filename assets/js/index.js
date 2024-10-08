const DEBUG = false;

let globalData, currentData;
let firstYear, lastYear;
let cantons, lakes;
let originalFirstYear, originalLastYear;

let currentParams = {
    page: null,
    cantons: [],
    platforms: [],
    stores: [],
    genres: [],
    states: [],
    locations: [],
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

    fillDropdowns(data);

    // Set min and max years based on min and max in the global data
    [firstYear, lastYear] = d3.extent(Object.keys(data.aggregates.games_per_year).map(key => parseInt(key)));
    currentParams.release_year_start = firstYear;
    currentParams.release_year_end = lastYear;
    originalFirstYear = firstYear;
    originalLastYear = lastYear;

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

    // Load geodata from file
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

function selectCanton(cantonSlugs) {
    // Empty list of selected cantons if cantonSlugs is null
    if (cantonSlugs == null) {
        currentParams.cantons = [];
        updateData().then(updateViz);
        return;
    }

    // Otherwise, cantonsSlugs is an array containing canton slugs we
    // will add to the current query parameters
    cantonSlugs.forEach(slug => {
        if (currentParams.cantons.includes(slug)) return;

        currentParams.cantons.push(slug);
    });

    updateData().then(updateViz);
}

// Refresh currentData based on currentParams
async function updateData() {
    // Reset to the start of the list (in case other parameters changed which change how many games are returned)
    currentParams.page = 0;
    let data;
    // Refresh current data based on the currently selected query parameters
    try {
        data = await getCachedData(currentParams);
        document.getElementById("error-message").classList.add("hidden");

        currentData = data;
    } catch (e) {
        console.log('Error occurred', e);
        document.getElementById("error-message").classList.remove("hidden");

        // Reset games list
        currentData.hits.total = 0;
        currentData.hits.games = [];
    }
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

    if (currentParams.cantons.length > 0 ||
        currentParams.stores.length > 0 ||
        currentParams.states.length > 0 ||
        currentParams.genres.length > 0 ||
        //currentParams.locations.length > 0 ||
        currentParams.platforms.length > 0 ||
        (currentParams.release_year_end != null && currentParams.release_year_end != originalLastYear) ||
        (currentParams.release_year_start != null && currentParams.release_year_start != originalFirstYear)
    ) {
        resetBtn.classList.remove('hidden');
    } else {
        resetBtn.classList.add('hidden');
    }

    // Update canton title
    let cantonsKeyNames = Object.entries(globalData.aggregates.games_per_canton)
        .filter(([k, v]) => currentParams.cantons.includes(k))
        .map(([k, v]) => v.key_name)
        .join(', ');
    
    if (cantonsKeyNames == "") {
        cantonsKeyNames = "Suisse";
    }

    // Set the title to the name of the canton(s)
    document.querySelector("#canton-selection-title").innerHTML = cantonsKeyNames;

    // Update visualizations with new data
    updateDropdowns();
    updatePies();
    drawHistogram(currentData.aggregates.games_per_year);
    drawMap(currentData.aggregates.games_per_canton, cantons, lakes);
    listGames(currentData.hits.games);
    displayCategoryBadges();
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
        cantons: [],
        platforms: [],
        stores: [],
        genres: [],
        states: [],
        locations: [],
        release_year_start: null,
        release_year_end: null
    }

    // refresh data with reset query parameters
    updateData().then(updateViz);

    submitBtn.classList.add("hidden");
    resetBtn.classList.add("hidden");
});

function onInputsChanged() {
    if (((currentParams.release_year_start != null && sliderStart.value != currentParams.release_year_start) || currentParams.release_year_start == null)
        || ((currentParams.release_year_end != null && sliderEnd.value != currentParams.release_year_end) || currentParams.release_year_end == null)) {
        submitBtn.classList.remove("hidden");
    } else {
        submitBtn.classList.add("hidden");
    }
}

loadMoreGamesBtn.addEventListener("click", e => {
    loadMoreGames().then(updateViz);
});
