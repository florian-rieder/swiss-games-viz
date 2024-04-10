function listGames(data) {
    // Select the existing <li> elements
    const listItems = d3.select("ul#games-list")
        .selectAll('li')
        .data(data, d => d.id);

    // Update existing elements
    listItems.html(d => d.title);

    // Append new elements
    listItems.enter()
        .append("li")
        .html(d => d.title)
        .style("opacity", 0)
        .transition()
        .duration(250)
        .style("opacity", 1);

    // Remove any extra elements
    listItems.exit()
        .transition()
        .duration(250)
        .style("opacity", 0)
        .remove();
}
