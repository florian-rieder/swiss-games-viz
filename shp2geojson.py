"""
Convert shapefile into GeoJSON and convert the coordinate system from
LV95 (Swiss national coordinate system) to WGS84 (global coordinate
system).
"""

import geopandas as gpd

# Read the shapefile
gdf = gpd.read_file('shapefiles/cantons/K4kant20220101gf_ch2007Poly.shp')

# Simplify the geometry
tolerance = 200
gdf['geometry'] = gdf['geometry'].simplify(tolerance)

# Reproject to WGS84 (EPSG:4326)
gdf_wgs84 = gdf.to_crs("EPSG:4326")

# Save as GeoJSON
gdf_wgs84.to_file('shapefiles/output.geojson', driver='GeoJSON')