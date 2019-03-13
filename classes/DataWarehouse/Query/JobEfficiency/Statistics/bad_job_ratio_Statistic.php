<?php
namespace DataWarehouse\Query\JobEfficiency\Statistics;

/*
* @author Amin Ghadersohi
* @date 2014-May-13
*
*/

class bad_job_ratio_Statistic extends \DataWarehouse\Query\JobEfficiency\Statistic
{
    public function __construct($query_instance = null)
    {
        parent::__construct(
            '100.0 * COALESCE(SUM(CASE WHEN jf.job_category_id = 2 THEN job_count ELSE 0 END) / SUM(jf.job_count), 0)',
            'bad_job_ratio',
            'Percent of Jobs Ended Bad',
            '%',
            4
        );
    }

    public function getInfo()
    {
        return 'The total number of jobs that ended within the selected duration.<br/><i>Job: </i>A scheduled process for a computer resource in a batch processing environment.';
    }
}
