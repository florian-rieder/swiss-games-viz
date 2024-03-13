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
gdf = gpd.read_file('cantons/K4kant20220101gf_ch2007Poly.shp')
lakes = gpd.read_file('hydro/k4seenyyyymmdd11_ch2007Poly.shp')

# Simplify the geometry
tolerance = 200
gdf['geometry'] = gdf['geometry'].simplify(tolerance)

# Reproject to WGS84 (EPSG:4326)
gdf_wgs84 = gdf.to_crs("EPSG:4326")
lakes_wgs84 = lakes.to_crs("EPSG:4326")

# Merge Appenzell Innerrhoden and Appenzell Ausserrhoden
regions_to_merge = gdf_wgs84[gdf_wgs84['id'].isin([15, 16])]

# Combine the geometries of the selected regions into a single geometry
merged_geometry = regions_to_merge.unary_union

# Create a new GeoDataFrame with the merged geometry
merged_region = gpd.GeoDataFrame(geometry=[merged_geometry])

# Set the name and id of the merged region
merged_region['name'] = 'Appenzell'
merged_region['id'] = 15

# Drop the original regions from the GeoDataFrame
gdf_wgs84 = gdf_wgs84.drop(gdf_wgs84[gdf_wgs84['id'].isin([15, 16])].index)

# Append the merged region to the GeoDataFrame
gdf_wgs84 = pd.concat([gdf_wgs84, merged_region], ignore_index=True)


# Save as GeoJSON
gdf_wgs84.to_file('cantons.geojson', driver='GeoJSON')
lakes_wgs84.to_file('lakes.geojson', driver='GeoJSON')