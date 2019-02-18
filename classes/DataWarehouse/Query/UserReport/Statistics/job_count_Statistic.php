<?php
namespace DataWarehouse\Query\UserReport\Statistics;

class job_count_Statistic extends \DataWarehouse\Query\UserReport\Statistic
{
    public function __construct($query_instance = null)
    {
        parent::__construct('COALESCE(SUM(jf.job_count), 0)', 'job_count', 'Number of Jobs Ended', 'Number of Jobs', 0);
    }

    public function getInfo()
    {
        return 'The total number of jobs that ended within the selected duration.<br/><i>Job: </i>A scheduled process for a computer resource in a batch processing environment.';
    }
}
