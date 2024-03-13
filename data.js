
API_ENDPOINT = "https://api.swissgames.garden/search/games";

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

        for (json of jsons) {
            //console.log(json);

            const cantonsAggregate = json["aggregations"]["aggs_all"]["all_filtered_cantons"]["all_nested_cantons"]["cantons_name_keyword"]["buckets"];

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
