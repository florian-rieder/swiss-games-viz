
API_ENDPOINT = "https://api.swissgames.garden/search/games"

function getData() {
    // Grab all the data recursively ??
    fetch("https://api.swissgames.garden/search/games?page=0")
        .then((response) => response.json())
        .then((json) => console.log(json));

}

//getData();