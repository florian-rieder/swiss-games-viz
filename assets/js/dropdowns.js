
function toggleDropdown(dropdownId) {
    var dropdownMenu = document.getElementById(dropdownId);
    var allDropdowns = document.querySelectorAll('.dropdown-menu');
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
    if (!event.target.matches('.dropdown-toggle')) {
        var dropdowns = document.getElementsByClassName("dropdown-menu");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (!openDropdown.classList.contains('hidden')) {
                openDropdown.classList.add('hidden');
            }
        }
    }
}
