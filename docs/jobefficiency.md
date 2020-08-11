
The Job Efficiency Dashboard shows job information broken down by the categorized
efficiency. The categorization algorithm is implemented in SQL and runs during the
data aggregation step. The algorithm may be customized by editing the definition
file
```
/etc/xdmod/etl/etl_macros.d/jobefficiency/job_categorization.sql
```

If the definition file is modified then any new jobs categorized using the updated
algorithm. It does not automatically re-categorize existing jobs.

The contents of the file must be valid SQL fragment. The SQL itself is used in a
`SELECT` statement. An example of the default algorithm is shown below:
```sql
-- ----------------------------------------------------------------------------
-- Classify a job based on the performance statistics
-- ----------------------------------------------------------------------------
CASE
    WHEN cpu_user IS NULL THEN
        -1
    WHEN cpu_user < 0.1 AND COALESCE(max_memory, 1.0) < 0.5 THEN
        2
    ELSE
        1
END
```
The output must be one of three values:
- `-1` if the algorithm is unable to categorize the job
- `1` to mark the job as efficient
- `2` to mark the job as inefficient

The SQL query can use any value from the job performance fact table `modw_suprem`.`job`
The documentation for each column in the table is provided in the `COMMENT` field
in the table definition. The comment field can be viewed using the following
statement in the `mysql` command line client:
```mysql
SHOW FULL COLUMNS FROM `modw_supremm`.`job`;
```
Not all performance metrics will be present for all jobs. If a column in the
database is nullable then a null value is used to indicate that the corresponding
metric was not present.

# Examples

The example below shows how to categorize jobs solely based on the CPU User metric.
The example will mark jobs with CPU User less than 20% as inefficient.

```sql
-- ----------------------------------------------------------------------------
-- Categorize jobs based only on the value of CPU User with a threshold
-- of 20% (i.e. a ratio of 0.2)
-- ----------------------------------------------------------------------------
CASE
    WHEN cpu_user IS NULL THEN
        -1
    WHEN cpu_user < 0.2 THEN
        2
    ELSE
        1
END
```

The example below shows how to use different criteria based on the partition
on which the job ran. The partition of the job is stored in the `queue_id` column.
If the job ran on a partition with a name that starts with 'gpu' then the job's efficiency
is determined based on the GPU usage. Otherwise the CPU usage is used. In both cases
a 10% (ratio of 0.1) threshold is used.
```sql
CASE
    WHEN
        queue_id LIKE 'gpu%'
    THEN
        CASE
            WHEN gpu0_nv_utilization IS NULL THEN - 1
            WHEN gpu0_nv_utilization < 0.1 THEN 1
            ELSE 2
        END
    ELSE
        CASE
            WHEN cpu_user IS NULL THEN - 1
            WHEN cpu_user < 0.1 THEN 1
            ELSE 2
        END
END
```
