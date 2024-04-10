
const API_ENDPOINT = "https://api.swissgames.garden/search/games";
const NUM_HITS_PER_PAGE = 24;

// Should we not cache data ? Used for debugging
const NO_CACHE = false;

// Get pretty state name from key name
const states = {
    "released": "Released",
    "development": "In development",
    "prototype": "Prototype",
    "canceled": "Canceled"
};

// Get pretty store name from key name
const stores = {
    "facebook": "Facebook",
    "amazon": "Amazon",
    "oculus": "Oculus",
    "epic": "Epic",
    "gog": "GOG.com",
    "microsoft_store": "Microsoft Store",
    "playstation": "Playstation",
    "xbox": "Xbox",
    "nintendo": "Nintendo",
    "custom": "Custom",
    "itchio": "itch.io",
    "google_play_store": "Google Play Store",
    "steam": "Steam",
    "apple_store": "Apple Store"
}

// Get id from canton API slug
const canton2id = {
    "z_rich": 1,
    "bern": 2,
    "biel": 2, // Biel is a town in Berne canton... Idk why it's there
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

/// Get the corresponding canton slug for an id. Returns a list of slugs in weird cases.
function id2canton(cantonId) {
    for (const [canton, id] of Object.entries(canton2id)) {
        if (cantonId === 2) {
            // Since Biel is not actually a canton, but a city in the canton
            // of Bern, we need to add this special clause
            return ["bern", "biel"];
        } else if (cantonId === id) {
            return canton;
        }
    }
    return null; // Return null if no matching canton id is found
}

/// Grab aggregate data for:
/// - Number of games per canton (only in global)
/// - Number of games per genre
/// - Number of games per platform
/// - Number of games per store
/// - Number of games per state (canceled, development, prototype, released)
/// If we want the data for a specific canton, call the function with the
/// slug of the canton
/// TODO: get full names of key values
async function getData(options = null) {

    const url = buildQueryUrl(options)

    // List of property slugs for which aggregate data exist
    let slugs = ["cantons", "genres", "platforms", "stores", "states", "locations"];

    if (options != null && "cantons" in Object.keys(options)) {
        // Remove games per cantons property, as it doesn't make sense for a single canton
        slugs = slugs.filter(e => e !== 'cantons');
    }

    // Grab any page, whose results contains global aggregates
    // (number of games per canton, genre, platform, store, state)
    json = await fetch(url)
        .then((response) => response.json())
        .catch((error) => console.log(error));

    const aggregates = extractAggregates(json, slugs);

    const hits = extractHits(json);
    
    return {aggregates, hits};
}

function extractHits(json) {
    //console.log(json);
    const hits = {
        "total": json.hits.total.value,
        "games": []
    };

    console.log(json)

    for (let hit of json.hits.hits) {
        const game = hit._source;

        hits.games.push(game);
    }

    return hits;
}

function extractAggregates(json, slugs) {
    let aggregate = {};

    // Grab common aggregate data object
    const rawAggregates = json["aggregations"]["aggs_all"];

    for (const slug of slugs) {
        // Make the slug singular (cantons -> canton). More natural when accessing properties later.
        const singular_slug = slug.slice(0, -1);
        // Initialize nested object (prevents error when trying to access it later)
        aggregate[`games_per_${singular_slug}`] = {};

        // Grab the aggregate data for this property (slug)
        const aggregateData = rawAggregates[`all_filtered_${slug}`][`all_nested_${slug}`][`${slug}_name_keyword`]["buckets"];

        for (const obj of aggregateData) {
            const key = obj["key"];
            const numGames = obj["doc_count"];

            // Grab the full display name of the key (e.g. shoot-em-up => Shoot-em-Up)
            const keyName = getKeyDisplayName(obj, key, slug);

            // Don't remember properties where the number of games is 0
            if (numGames == 0) continue;

            // Set the total number of games for that property
            aggregate[`games_per_${singular_slug}`][key] = {
                num_games: numGames,
                key_name: keyName
            }
        }
    }

    // Do a little differently for release years, since the data structure is different
    const yearsAgg = rawAggregates["all_filtered_release_years_histogram"]["all_nested_release_years"]["releases_over_time"]["buckets"];
    // Initialize nested object (prevents error when trying to access it)
    aggregate[`games_per_year`] = {};

    for (const obj of yearsAgg) {
        const year = obj["key_as_string"];
        const numGames = obj["doc_count"];

        aggregate["games_per_year"][year] = numGames;
    }

    return aggregate;
}

function getKeyDisplayName(obj, key, slug) {
    let keyFullName;
    if (!(`${slug}_facet_data` in obj)) {
        //console.warn(`Missing facet data for ${slug}`);
        // and no pretty key name for states and stores...
        // We have to do it ourselves.
        if (slug === "stores") {
            return stores[key];
        }
        else if (slug === "states") {
            return states[key];
        }
    }

    const keyFullNameHits = obj[`${slug}_facet_data`]["hits"]["hits"];

    // Grab the full name of the key if it exists.
    // (Doesn't exist, for instance, for "3d")
    if (keyFullNameHits.length > 0) {
        // "platform_name" for platforms
        if (slug === "platforms") {
            return keyFullNameHits[0]["_source"]["platform_name"];
        }
        
        // just "name" for the general case (genres, cantons, locations)
        else {
            return keyFullNameHits[0]["_source"]["name"];
        }
    }
    // If we really have nothing, just use the system key name
    else {
        return key;
    }
}

function buildQueryUrl(options = null) {
    const queryBracketRules = {
        page: "",
        cantons: "[]",
        platforms: "[]",
        stores: "[]",
        genres: "[]",
        states: "[]",
        locations: "[]",
        release_year_start: { fieldname: "release_year_range", brackets: "[start]" },
        release_year_end: { fieldname: "release_year_range", brackets: "[end]" }
    }

    // Make sure we at least have the mandatory page parameter
    if (options == null) {
        options = {
            page: 0
        }
    }

    if (!("page" in options) || options.page == null) {
        options["page"] = 0;
    }

    let url = API_ENDPOINT + "?";

    let queryParams = [];

    for ([field, value] of Object.entries(options)) {
        const rule = queryBracketRules[field];
        let brackets = "";

        // Override field names for release year start and end
        if (typeof rule === 'object' &&
            !Array.isArray(rule) &&
            rule !== null) {
            field = rule.fieldname;
            brackets = rule.brackets;
        } else {
            brackets = rule;
        }

        // Generate query parameters

        // If the user provided a list of values:
        if (Array.isArray(value)) {
            for (item of value) {
                queryParams.push(`${field}${brackets}=${item}`)
            }
        }
        // If the user provided a single value:
        else if (value != null) {
            queryParams.push(`${field}${brackets}=${value}`)
        }
    }

    url += queryParams.join("&");

    return url;
}

async function getCachedData(options = null) {
    // We use the session storage to cache the results of requests to the
    // API, in order to minimize network load.
    const queryUrl = buildQueryUrl(options);
    const cachedData = sessionStorage.getItem(queryUrl)

    if (cachedData === null || NO_CACHE) {
        // Get new data from the API
        const data = await getData(options);
        sessionStorage.setItem(queryUrl, JSON.stringify(data));
        return data;
    } else {
        // Get data from the cache
        console.debug("Got cached data for " + queryUrl);
        return JSON.parse(sessionStorage.getItem(queryUrl));
    }
}

//console.log(buildQueryUrl({ cantons: ["fribourg", "geneva"], genres: "platformer", release_year_start: "2004" }));
//getAggregateData("fribourg").then(d => console.log(d))
