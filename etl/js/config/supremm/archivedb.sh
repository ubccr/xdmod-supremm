#!/bin/sh

# Create an archive of the modw_supremm database without job data.

schema="modw_supremm"
dynamic_tables="job job_errors"
static_tables="application application_hint catastrophe_buckets cpibuckets cpu_user_cv_buckets log2scale_buckets logscalebytes_buckets percentages_buckets shared"

ignorelist=""
for t in $dynamic_tables $static_tables
do
    ignorelist="$ignorelist --ignore-table $schema.$t "
done

mysqldump --no-data --databases $schema $ignorelist
mysqldump $schema $static_tables
