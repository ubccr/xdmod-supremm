<?php
namespace DataWarehouse\Query\JobEfficiency\Statistics;

/*
* @author Amin Ghadersohi
* @date 2014-May-13
*
*/

class core_time_bad_Statistic extends \DataWarehouse\Query\JobEfficiency\Statistic
{
    public function __construct($query_instance = null)
    {
        parent::__construct(
            'SUM(CASE WHEN jf.job_category_id = 2 THEN jf.cpu_time ELSE 0 END) / 3600.0',
            'core_time_bad',
            'CPU Hours Inefficient: Total',
            'CPU Hour',
            0
        );
    }

    public function getInfo()
    {
        return 'The total core time, in hours.<br/><i>Core Time:</i> defined as the time between start and end time of execution for a particular job times the number of allocated cores.';
    }
}
