<?php
namespace DataWarehouse\Query\JobEfficiency\Statistics;

/*
* @author Amin Ghadersohi
* @date 2014-May-13
*
*/

class bad_core_ratio_Statistic extends \DataWarehouse\Query\JobEfficiency\Statistic
{
    public function __construct($query_instance = null)
    {
        parent::__construct(
            '100.0 * COALESCE(SUM(CASE WHEN jf.job_category_id = 2 THEN jf.cpu_time ELSE 0 END) / SUM(jf.cpu_time), 0)',
            'bad_core_ratio',
            'CPU Hours Bad: Ratio',
            '%',
            4
        );
    }

    public function getInfo()
    {
        return 'The total core time, in hours.<br/><i>Core Time:</i> defined as the time between start and end time of execution for a particular job times the number of allocated cores.';
    }
}
