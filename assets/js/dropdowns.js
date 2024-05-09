
function fillDropdowns(data) {

    dropdownData = {
        'stores': data.aggregates.games_per_store,
        'platforms': data.aggregates.games_per_platform,
        'cantons': data.aggregates.games_per_canton,
        'genres': data.aggregates.games_per_genre,
        'states': data.aggregates.games_per_state,
    }

    for (const [variable, data] of Object.entries(dropdownData)) {
        d3.select(`#${variable}Dropdown > .modal-content`)
            .selectAll('div')
            .data(Object.entries(data), ([key, _value]) => key)
            .enter()
            .append('div')
            .attr('class', 'dropdown-category-container')
            .html(([key, value]) => `
            <input type="checkbox" onclick="clickDropdownCheckbox('${variable}', '${key}')">
            <span>${value.key_name}</span>
            <span>${value.num_games}</span>
            `)
      }
}

function updateDropdowns() {
    // TODO
}

function clickDropdownCheckbox(variable, key) {

    if (currentParams[variable] && currentParams[variable].includes(key)) {
        // If key is already in currentParams[variable], remove it
        currentParams[variable] = currentParams[variable].filter(item => item !== key);
    } else {
        // If key is not in currentParams[variable], add it
        if (!currentParams[variable]) {
            currentParams[variable] = []; // Initialize array if it doesn't exist
        }
        currentParams[variable].push(key);
    }

    updateData().then(updateViz);
}

function toggleDropdown(dropdownId) {
    let dropdownMenu = document.getElementById(dropdownId);
    let allDropdowns = document.querySelectorAll('.dropdown-menu');
    // Close all dropdowns
    allDropdowns.forEach(function (dropdown) {
        if (dropdown.id !== dropdownId && !dropdown.classList.contains('hidden')) {
            dropdown.classList.add('hidden');
        }
    });
    // Open this dropDown
    dropdownMenu.classList.toggle("hidden");
}

// Close dropdowns if the user clicks anywhere outside of them
window.onclick = function (event) {
    // If the click was on a dropdown toggle, don't do anything
    if (event.target.matches('.dropdown-toggle')) return;

    // If the click was on an element inside a dropdown menu, don't do anything
    // see https://stackoverflow.com/a/56803429/10914628
    if (event.target.closest('.dropdown-menu')) return

    // Otherwise, close any open dropdown
    let dropdowns = document.getElementsByClassName("dropdown-menu");
    for (let i = 0; i < dropdowns.length; i++) {
        let openDropdown = dropdowns[i];
        if (!openDropdown.classList.contains('hidden')) {
            openDropdown.classList.add('hidden');
        }
    }
}
