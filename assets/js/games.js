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
            console.log(d)

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

            let credits = [];
            // If there are no studios listed
            if (d.studios == undefined || d.studios.length == 0) {
                for (let p of d.people) {
                    let person = `<a href="https://swissgames.garden${p.path}" target="_blank">${p.fullname}</a>`
                    credits.push(person);
                }
            } else {
                for (let s of d.studios) {
                    let studio = `<a href="https://swissgames.garden${s.path}" target="_blank">${s.name}</a>`
                    credits.push(studio);
                }
            }

            credits = credits.join(", ");
            


            return `
            <div class="game-content">
                <h3>${credits}</h3>
                <h2>${d.title}</h2>
                <p>${d.releases_years[0].year}</p>
                <p>${excerpt}</p>
                <a href="https://swissgames.garden${d.path}" target="_blank"><button class="game-link">More</button></a>
            </div>
            <div class="game-cover">
                <a href="https://swissgames.garden${d.path}" target="_blank">
                ${cover}
                </a>
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
