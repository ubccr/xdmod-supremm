@author: Amin Ghadersohi
@date: 2/4/2014

Note 1: Please keep all supremm related functionality limited to this folder. (supremm)

File List:
dataset_maps - mappings for input data sources (stampede, lonestar, and rush) pcp/tacc stats data 
output_db - mysql workbench file for creating the mysql output schema for supremm etl (supremm.mwb)
		  - data for application and application_hint tables (modw_supremm-application-data.sql)
test - test artifacts for resource_map component testing.
validators - the schema for the dataset mappings dataset_maps/(lonestar|stampede|rush).js and main etl schema (etl.schema.js)