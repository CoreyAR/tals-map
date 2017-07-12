#!/usr/bin/env python3
import pandas as pd
import json

YEAR_LIST = ['2015', '2016', '2017', '2018', '2019', '2020']

# Prepare data
seniors_by_county = pd.read_csv('/Users/corey/tals/data/tn-seniors-2015-2020-x-county.csv')

with open('/Users/corey/tals/data/tn-counties.json') as data_file:    
    geojson_data = json.load(data_file)
    

# Process data
for county in geojson_data['features']:
    county_name = county['properties']['name']
    county_data = seniors_by_county.loc[seniors_by_county['county'] == county_name]
    county['properties']['density'] = {}
    for year in YEAR_LIST:
        county['properties']['density'][year] = int(county_data[year].values[0])

with open('../static/density_over_time.json', 'w') as json_file:
    json.dump(geojson_data, json_file)
