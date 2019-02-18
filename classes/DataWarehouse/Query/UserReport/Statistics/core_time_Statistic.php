<?php
namespace DataWarehouse\Query\UserReport\Statistics;

class core_time_Statistic extends \DataWarehouse\Query\UserReport\Statistic
{
    public function __construct($query_instance = null)
    {
        parent::__construct('COALESCE(SUM(jf.cpu_time) / 3600.0, 0)', 'core_time', 'CPU Hours: Total', 'CPU Hour', 0);
    }

    public function getInfo()
    {
        return 'The total core time, in hours.<br/><i>Core Time:</i> defined as the time between start and end time of execution for a particular job times the number of allocated cores.';
    }
}
