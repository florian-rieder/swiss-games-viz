const EXCERPT_MAX_LENGTH = 150;

function listGames(data) {
    // Select the existing <li> elements
    const listItems = d3.select("ul#games-list")
        .selectAll('li')
        .data(data, d => d.id);

    // Append new elements
    listItems.enter()
        .append("li")
        .html(d => {
            let excerpt = "No description";
            if (d.desc != null) {
                if (d.desc.length > EXCERPT_MAX_LENGTH) {
                    excerpt = d.desc.substring(0, EXCERPT_MAX_LENGTH);
                    excerpt = excerpt.substring(0, excerpt.lastIndexOf(' '));
                    excerpt += '...';
                } else {
                    excerpt = d.desc;
                }
            }

            // Cover image
            let cover = "";
            if (d.medias.length > 0) {
                cover = `<img src="${d.medias[0].href}">`
            }

            console.log(d.medias)

            return `
            <div class="game-content">
                <h2>${d.title}</h2>
                <p>${excerpt}</p>
            </div>
            <div class="game-cover">
                ${cover}
            </div>
            `
        })
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
