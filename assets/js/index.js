let globalData;

// Load initial data from the SwissGamesGarden API
getAggregateData().then((data) => {

    console.log(data);
    globalData = data;

    bakePie(data.games_per_canton);
    drawHistogram(data.games_per_year);

    // Load data  and geodata from file
    Promise.all([
        d3.json('assets/geometry/cantons.geojson'),
        d3.json('assets/geometry/lakes.geojson')
    ]).then(([cantons, lakes]) => {
        drawMap(data, cantons, lakes);
    });
});

function selectCanton(cantonSlug) {
    getAggregateData({ "cantons": cantonSlug }).then((data) => {
        bakePie(data.games_per_genre);
        drawHistogram(data.games_per_year);
    });
}