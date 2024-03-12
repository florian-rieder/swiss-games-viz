
API_ENDPOINT = "https://api.swissgames.garden/search/games"

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
    "appenzell": 15, // Ausserrhoden
    "appenzell": 16, // Innerrhoden
    "st_gallen": 17,
    "graub_nden": 18,
    "aargau": 19,
    "thurgau": 20,
    "ticino": 21,
    "vaud": 22,
    "valais": 23,
    "neuch_tel": 24,
    "geneva": 25,
    "jura": 26
    // "foreign" can also happen
}

async function getData() {

    games = [];

    promises = []

    // Grab all the data. Since there aren't more specific API endpoints
    for (i = 0; i < 32; i++) {

        promise = fetch(`https://api.swissgames.garden/search/games?page=${i}`)
            .then((response) => response.json())
            .catch((error) => console.log(error))

        promises.push(promise)
    }

    // Wait for all requests to be completed
    await Promise.all(promises).then((jsons) => {

        for (json of jsons) {

            console.log(json);

            hits = json["hits"]["hits"];

            if (hits.length == 0) {
                console.log('EMPTY');
                return;
            }

            for (hit of hits) {
                games.push(hit["_source"]);
            }
        }
    })


    console.log(games);
    return games;
}

function storeLocalData(key, data){
    // Put the object into storage
    localStorage.setItem(key, JSON.stringify(data));
}
function retrieveLocalData(key){
    return JSON.parse(localStorage.getItem(key));
}

async function getCachedData(){
    if (localStorage.getItem("data") === null) {
        data = await getData();

        storeLocalData("data", data);
    } else {
        data = retrieveLocalData("data");
    }

    return data;
}

getCachedData().then((data) => console.log(data))
