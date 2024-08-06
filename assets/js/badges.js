
function displayCategoryBadges() {
    // This is pretty dirty honestly... But I can't see a better way for the moment to display all categorie's badges
    // while also showing the pretty name, while also directly using the query params which must be lists of strings
    // (categories slugs)
    const variableNames = ["cantons", "genres", "platforms", "stores", "states"];
    const data = [];

    variableNames.forEach(variableName => {
        const items = currentParams[variableName];
        items.forEach(item => {
            data.push({
                value: item,
                key_name: globalData.aggregates[`games_per_${variableName.slice(0, -1)}`][item].key_name,
                variable_name: variableName
            });
        });
    });

    let container = d3.select('#category-badges');

    let enteringBadges = container.selectAll('span')
        .data(data, d => d.value)
        .enter()
        .append('span')
        .attr('class', 'badge')
        .html(d => d.key_name)
        .style("cursor", "pointer")
        .style("opacity", 0)
        .on("click", badgeClick)

    enteringBadges.transition()
        .duration(200)
        .style("opacity", 1)

    let exitingBadges = container.selectAll('span')
        .data(data, d => d.value)
        .exit();

    exitingBadges.transition()
        .duration(200)
        .style("opacity", 0)
        .remove();
}

function badgeClick(event, d) {
    //console.log(d.data.category)
    // Remove this category from filters
    currentParams[d.variable_name] = currentParams[d.variable_name].filter(x => x !== d.value);
    //categoryParams[d.variable_name] = categoryParams[d.variable_name].filter(x => x.data.category !== d.value);
    updateData().then(updateViz);
}