<?php
namespace DataWarehouse\Query\JobEfficiency\Statistics;

/*
* @author Amin Ghadersohi
* @date 2014-May-13
*
*/

class job_count_bad_Statistic extends \DataWarehouse\Query\JobEfficiency\Statistic
{
    public function __construct($query_instance = null)
    {
        parent::__construct(
            'SUM(CASE WHEN jf.job_category_id = 2 THEN job_count ELSE 0 END)',
            'job_count_bad',
            'Number of Inefficient Jobs Ended',
            'Number of Jobs',
            0
        );
    }

    public function getInfo()
    {
        return 'The total number of jobs that ended within the selected duration.<br/><i>Job: </i>A scheduled process for a computer resource in a batch processing environment.';
    }
}
