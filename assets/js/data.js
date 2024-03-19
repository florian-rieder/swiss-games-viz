
API_ENDPOINT = "https://api.swissgames.garden/search/games";
NUM_HITS_PER_PAGE = 24;

canton2id = {
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
async function getAggregateData(options = null) {
    let aggregate = {};

    const url = buildQueryUrl(options)

    // List of property slugs for which aggregate data exist
    let slugs = ["cantons", "genres", "platforms", "stores", "states", "locations"];

    if (options != null && "cantons" in Object.keys(options)) {
        // Remove games per cantons property, as it doesn't make sense for a single canton
        slugs = slugs.filter(e => e !== 'cantons');
    }

    // Grab any page, whose results contains global aggregates (number of games per canton, genre, platform, store, state)
    json = await fetch(url)
        .then((response) => response.json())
        .catch((error) => console.log(error));

    // Grab common aggregate data object
    const rawAggs = json["aggregations"]["aggs_all"];

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

            // Grab the full display name of the key (e.g. shoot-em-up => Shoot-em-Up)

            let keyFullName;
            if (`${slug}_facet_data` in obj) {
                const keyFullNameHits = obj[`${slug}_facet_data`]["hits"]["hits"]
                // Grab the full name of the key if it exists.
                // (Doesn't exist, for instance, for "3d")
                if (keyFullNameHits.length == 0) {
                    keyFullName = key;
                } else {
                    keyFullName = keyFullNameHits[0]["_source"]["name"];
                }
            }

            // Don't remember properties where the number of games is 0
            if (numGames == 0) continue;

            // Set the total number of games for that property
            aggregate[`games_per_${singular_slug}`][key] = {
                num_games: numGames,
                key_name: keyFullName
            }
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

function buildQueryUrl(options = null) {
    const apiUrlBracketRules = {
        page: "",
        cantons: "[]",
        platforms: "[]",
        stores: "[]",
        genres: "[]",
        states: "[]",
        locations: "[]",
        release_year_start: { fieldname: "release_year_range", brackets: "[start]" },
        realease_year_end: { fieldname: "release_year_range", brackets: "[end]" }
    }

    // Make sure we at least have the mandatory page parameter
    if (options == null) {
        options = {
            page: 0
        }
    }
    if (!("page" in options)) {
        options["page"] = 0;
    }

    let url = API_ENDPOINT + "?";

    let queryParams = [];

    for ([field, value] of Object.entries(options)) {
        const rule = apiUrlBracketRules[field];
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
        else {
            queryParams.push(`${field}${brackets}=${value}`)
        }
    }

    url += queryParams.join("&");

    return url;
}

//console.log(buildQueryUrl({ cantons: ["fribourg", "geneva"], genres: "platformer", release_year_start: "2004" }));
//getAggregateData("fribourg").then(d => console.log(d))
