
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
    // Grab all the data recursively ??
    await fetch("https://api.swissgames.garden/search/games?page=0")
        .then((response) => response.json())
        .catch((error) => console.log(error))
        .then((json) => {
            console.log(json);

            for (hit of json["hits"]["hits"]) {
                games.push(hit["_source"])
            }
        });

    console.log(games)
}

getData();