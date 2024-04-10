function listGames(data) {
    // Select the existing <li> elements
    const listItems = d3.select("ul#games-list")
        .selectAll('li')
        .data(data);

    // Update existing elements
    listItems.html(d => d.title);

    // Append new elements
    listItems.enter()
        .append("li")
        .html(d => d.title);

    // Remove any extra elements
    listItems.exit()
        .remove();
}
