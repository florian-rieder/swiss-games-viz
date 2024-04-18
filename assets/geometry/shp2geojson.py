"""
Preprocess spatial data
Convert shapefiles into GeoJSON and convert the coordinate system from
LV95 (Swiss national coordinate system) to WGS84 (global coordinate
system). Simplify the geometry: we don't need a lot of detail.
Merge Appenzell Innerrhoden and Appenzell Ausserrhoden, since they are merged
in the API data.
"""
import pandas as pd
import geopandas as gpd


# Read the shapefile
cantons = gpd.read_file('cantons/K4kant20220101gf_ch2007Poly.shp')
lakes = gpd.read_file('hydro/k4seenyyyymmdd11_ch2007Poly.shp')

# Simplify the geometry
tolerance = 300
cantons['geometry'] = cantons['geometry'].simplify(tolerance)
lakes['geometry'] = lakes['geometry'].simplify(tolerance)

# Reproject to WGS84 (EPSG:4326)
cantons_wgs84 = cantons.to_crs("EPSG:4326")
lakes_wgs84 = lakes.to_crs("EPSG:4326")


# Merge Appenzell Innerrhoden and Appenzell Ausserrhoden
regions_to_merge = cantons_wgs84[cantons_wgs84['id'].isin([15, 16])]

# Combine the geometries of the selected regions into a single geometry
merged_geometry = regions_to_merge.unary_union

# Create a new GeoDataFrame with the merged geometry
merged_region = gpd.GeoDataFrame(geometry=[merged_geometry])

# Set the name and id of the merged region
merged_region['name'] = 'Appenzell'
merged_region['id'] = 15

# Drop the original regions from the GeoDataFrame
cantons_wgs84 = cantons_wgs84.drop(cantons_wgs84[cantons_wgs84['id'].isin([15, 16])].index)

# Append the merged region to the GeoDataFrame
cantons_wgs84 = pd.concat([cantons_wgs84, merged_region])


# Save as GeoJSON
cantons_wgs84.to_file('cantons.geojson', driver='GeoJSON')
lakes_wgs84.to_file('lakes.geojson', driver='GeoJSON')