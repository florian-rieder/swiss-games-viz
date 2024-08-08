# Swiss Games Viz'

This project is a dashboard visualisation of data about Swiss games, obtained from [Swiss Games Garden](https://swissgames.garden), made for the course "Data visualisation" given by Isaac Pante at the University of Lausanne (UNIL, SLI).

This visualisation allows for a greater understanding of the types of games made in Switzerland chronologically, geographically, thematically, as well as technically. It adds to the functionality of the Swiss Games Garden website, by allowing the visualisation and exploration of the data in a much more intuitive and interactive fashion.

[Link to the dashboard](https://florian-rieder.github.io/swiss-games-viz/)

<img alt="Preview" src="https://github.com/user-attachments/assets/4f064537-1121-46cc-abc7-8956fdd1ed51" style="width: 100%;">

## Features
The dashboard allows users to explore and interact with data using various query parameters, selectable through dropdown menus or by directly interacting with the visualizations. Available parameters include "Cantons," "Genres," "Stores," "Platforms," and "States."

Changes to query parameters can be submitted using a "Submit" button, which appears only if there are unsaved changes. This button is particularly relevant when using the histogram's slider, as most other selections automatically update the data. This prevents unnecessary data reloads, optimizing performance when adjusting the time range.

A "Reset" button allows users to clear all selected parameters, returning the page to its initial state.

The currently selected categories are displayed as badges below the visualizations and above the list of games, making it easy to track applied filters.

### Choropleth map
<img width="501" alt="Choropleth map of the number of videogames produced per canton in Switzerland" src="https://github.com/user-attachments/assets/19d1aa59-6af5-4b98-b165-0f71709913e3" style="width: 100%">

A choropleth map visually represents the geographical distribution of game production across Swiss cantons. It highlights the number of games produced per canton based on the current parameters. Users can click on a canton to select or deselect it, with hover functionality providing the canton name and the number of games produced.

### Histogram of release years
<img width="501" alt="histogram" src="https://github.com/user-attachments/assets/b84b468d-6d06-491e-b14d-cc13596e0cde">

The histogram displays the frequency of game production over time, allowing users to observe trends in the release years of Swiss games. A double slider enables users to adjust the time range for more focused exploration.

### Donut charts
<img width="251" alt="donut" src="https://github.com/user-attachments/assets/be59d90f-e5d8-43c1-878b-2d569cf2c272">

Donut charts are used to show the proportion of categories for the "Genres", "Stores", "Platforms", and "States" variables for games which meet the selected parameters.
Users can click on slices to add or remove categories from their selection, with hover details providing category names and the number of associated games.

### Dropdowns
<img width="593" alt="Dropdown" src="https://github.com/user-attachments/assets/9ef24a8e-2830-4b63-b8e6-7e69fff3f844">

The dropdown menus provide a straightforward way to filter the data. Users can select multiple categories to refine their search. Each dropdown contains a list of checkboxes to select categories, and the number of games associated with each category is displayed to the right.


### List of selected games
![List of games](https://github.com/user-attachments/assets/a5403d78-ba04-4365-82bf-5b51801fc65e)

The list of games, displayed in a paginated format at the bottom of the dashboard, mirrors the style of the Swiss Games Garden homepage. Each tile includes the game's title, authors, release year, platforms, and genres (as space allows). Clicking a tile opens the game's data sheet on the Swiss Games Garden website.

## Data
### Sources
- Geographical Data: The interactive map of Switzerland is based on geographical data obtained from the [Swiss Federal Statistical Office](https://www.bfs.admin.ch/bfs/en/home/statistics/regional-statistics/base-maps/cartographic-bases.assetdetail.21245514.html). This data provides the foundational map layers necessary for the visualization.
- Game Data: Information about Swiss games is sourced directly from the [Swiss Games Garden](https://swissgames.garden/) API and is fetched in real-time as users interact with the dashboard.

### Geodata encoding
When starting with shapefiles, which are commonly used to share and distribute geographical data, we need an extra step before being able to use them in the d3.js visualisation. d3.js uses geojson data to display maps, so we need to first convert the shapefiles into geojson.

The conversion process was complex due to the coordinate system used by the Swiss Federal Statistical Office's shapefiles (LV95, the Swiss national coordinate system). These coordinates had to be recoded to WGS84 (the global coordinate system) in order to be understood by d3.js.
After trying out different online and local converters and failing to obtain the desired result, I opted to create a custom conversion script in Python, using the `pandas` and `geopandas` libraries.

## Installation
Setting up the development environment for this static website is straightforward. It can be done using Visual Studio Code or its open-source alternative, [VSCodium](https://vscodium.com/) with the [Live Server (Five Server)](https://open-vsx.org/extension/glenn2223/live-sass) plugin.
Other options can also be used as long as the files are served from a local server.
A useful tool for compiling the SCSS when using VSCodium is the [Live Sass Compiler](https://open-vsx.org/extension/glenn2223/live-sass) plugin.

## Libraries
The visualization leverages `d3.js` for data-driven document rendering. The geodata encoding script uses Python 3.12 and the `pandas` and `geopands` libraries for data manipulation and conversion.