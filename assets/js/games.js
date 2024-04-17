const EXCERPT_MAX_LENGTH = 150;

function listGames(data) {
    // Select the existing <li> elements
    const listItems = d3.select("#games-list")
        .selectAll('li')
        .data(data, d => d.id);

    // Append new elements
    listItems.enter()
        .append("div")
        .attr("class", "game-card pure-u-1 pure-u-md-1-3 pure-u-lg-1-5")
        .html(d => {
            //console.log(d)

            // let excerpt = "No description";
            // if (d.desc != null) {
            //     if (d.desc.length > EXCERPT_MAX_LENGTH) {
            //         excerpt = d.desc.substring(0, EXCERPT_MAX_LENGTH);
            //         excerpt = excerpt.substring(0, excerpt.lastIndexOf(' '));
            //         excerpt += '...';
            //     } else {
            //         excerpt = d.desc;
            //     }
            // }

            // Cover image
            let cover = "";
            if (d.medias.length > 0) {
                cover = `<img src="${d.medias[0].href}">`;
            } else {
                cover = '<img src="/assets/images/cover-placeholder.svg">';
            }

            let credits = [];
            // If there are no studios listed
            if (d.studios == undefined || d.studios.length == 0) {
                for (const p of d.people) {
                    const person = p.fullname;
                    credits.push(person);
                }
            } else {
                for (const s of d.studios) {
                    const studio = s.name;
                    credits.push(studio);
                }
            }

            credits = credits.join(", ");
            


            return `
            <div class="game-cover">
                <a href="https://swissgames.garden${d.path}" target="_blank">
                ${cover}
                </a>
            </div>
            <div class="game-content">
                <span class="game-credits truncate">${credits}</span>
                <h2 class="game-title">${d.title}</h2>
                <span class="game-release-year">${d.releases_years[0].year}</span>
                <div>
                    <a href="https://swissgames.garden${d.path}" target="_blank">
                        <button class="game-link">More</button>
                    </a>
                </div>
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
