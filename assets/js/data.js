
API_ENDPOINT = "https://api.swissgames.garden/search/games";
NUM_HITS_PER_PAGE = 24;

canton2id = {
    "z_rich": 1,
    "biel": 2, // Biel is a town in Berne canton... Idk why it's there
    "bern": 2,
    "luzern": 3,
    "uri": 4,
    "schwyz": 5,
    "obwalden": 6,
    "nidwalden": 7,
    "glarus": 8,
    "zug": 9,
    "fribourg": 10,
    "solothurn": 11,
    "basel-stadt": 12,
    "basel-landschaft": 13,
    "schaffhausen": 14,
    "appenzell": 15, // appenzell regroups innerrhoden and ausserrhoden, with id 15. id 16 is ignored.
    "st_gallen": 17,
    "graub_nden": 18,
    "aargau": 19,
    "thurgau": 20,
    "ticino": 21,
    "vaud": 22,
    "valais": 23,
    "neuch_tel": 24,
    "geneva": 25,
    "jura": 26,
    "foreign": 99// "foreign" can also happen
}

function id2canton(cantonId) {
    for (const [canton, id] of Object.entries(canton2id)) {
        if (id === cantonId) {
            return canton;
        }
    }
    return null; // Return null if no matching canton id is found
}


// Number of games per canton
// aargau: 465
// appenzell: 217
// "basel-landschaft": 93
// "basel-stadt": 248
// bern: 682
// biel: 155
// foreign: 341
// fribourg: 992
// geneva: 1612
// luzern: 496
// neuch_tel: 248
// schaffhausen: 93
// solothurn: 31
// st_gallen: 155
// thurgau: 62
// ticino: 341
// valais: 155
// vaud: 3782
// z_rich: 7347
// zug: 31

/// Grab global aggregate data for:
/// - Number of games per canton
/// - Number of games per genre
/// - Number of games per platform
/// - Number of games per store
/// - Number of games per state (canceled, development, prototype, released)

async function getGlobalAggregateData() {
    let aggregate = {};

    // Grab any page, whose results contains global aggregates (number of games per canton, genre, platform, store, state)
    json = await fetch(`${API_ENDPOINT}?page=0`)
        .then((response) => response.json())
        .catch((error) => console.log(error));

    // Grab common aggregate data object
    const rawAggs = json["aggregations"]["aggs_all"];

    // List of property slugs for which aggregate data exist
    const slugs = ["cantons", "genres", "platforms", "stores", "states", "locations"];

    for (const slug of slugs) {
        // Make the slug singular (cantons -> canton). More natural when accessing properties later.
        const singular_slug = slug.slice(0, -1);
        // Initialize nested object (prevents error when trying to access it later)
        aggregate[`games_per_${singular_slug}`] = {};

        // Grab the aggregate data for this property (slug)
        const aggregateData = rawAggs[`all_filtered_${slug}`][`all_nested_${slug}`][`${slug}_name_keyword`]["buckets"];

        for (const obj of aggregateData) {
            const key = obj["key"];
            const numGames = obj["doc_count"];
            
            // Set the total number of games for that property
            aggregate[`games_per_${singular_slug}`][key] = numGames
        }
    }

    // Do a little differently for release years, since the data structure is different
    const yearsAgg = rawAggs["all_filtered_release_years_histogram"]["all_nested_release_years"]["releases_over_time"]["buckets"];
    // Initialize nested object (prevents error when trying to access it)
    aggregate[`games_per_year`] = {};

    for (const obj of yearsAgg) {
        const year = obj["key_as_string"];
        const numGames = obj["doc_count"];

        aggregate["games_per_year"][year] = numGames;
    }

    return aggregate;
}

// async function getCantonGamesList(cantonSlug) {
//     let promises = []

//     // Grab n pages, and extract all the games
//     // Or: Grab pages one by one, until we get empty hits
//     // hits["total"] gives us exactly how many games are in that canton in total !!!!
//     // We can use this to figure out how many pages to get
//     // We know the API sends 24 results per page.
//     // So we need to iterate ceil(total/24)
//     let numPagesToGet = 1;

//     fetch(`${API_ENDPOINT}?cantons[]=${cantonSlug}&page=${i}`)
//         .then(response => response.json())
//         .catch(e => console.log(e))
//         .then(json => {

//         })
//     for (i = 0; i < numPagesToGet; i++){

//     }


// }

async function getData() {
    let games = [];
    let cantons = {};
    let promises = [];

    // Grab all the data. Since there aren't more specific API endpoints
    // There's about 31 pages of data
    for (i = 0; i < 32; i++) {

        promise = fetch(`${API_ENDPOINT}?page=${i}`)
            .then((response) => response.json())
            .catch((error) => console.log(error));

        promises.push(promise);
    }

    // Wait for all requests to be completed
    await Promise.all(promises).then((jsons) => {

        // Get total of games per canton
        const cantonsAggregate = jsons[0]["aggregations"]["aggs_all"]["all_filtered_cantons"]["all_nested_cantons"]["cantons_name_keyword"]["buckets"];

        for (obj of cantonsAggregate) {
            const cantonSlug = obj["key"];
            const numGames = obj["doc_count"];

            if (cantonSlug in cantons) {
                continue;
            } else {
                // Set the total number of games for that canton
                cantons[cantonSlug] = numGames
            }
        }

        for (json of jsons) {
            //console.log(json);

            const hits = json["hits"]["hits"];

            if (hits.length == 0) {
                //console.log('EMPTY');
                return;
            }

            for (hit of hits) {
                games.push(hit["_source"]);
            }
        }
    });

    return { games, cantons };
}

function storeLocalData(key, data) {
    // Put the object into storage
    localStorage.setItem(key, JSON.stringify(data));
}
function retrieveLocalData(key) {
    return JSON.parse(localStorage.getItem(key));
}

async function getCachedData() {
    if (localStorage.getItem("games") === null) {
        data = await getData();

        storeLocalData("games", data.games);
        storeLocalData("cantons", data.cantons);
    } else {
        games = retrieveLocalData("games");
        cantons = retrieveLocalData("cantons");

        data = { games, cantons };
    }

    return data;
}


//getCantonAggregateData().then(d => console.log(d))
