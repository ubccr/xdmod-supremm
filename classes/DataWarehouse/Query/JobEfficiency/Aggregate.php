<?php
namespace DataWarehouse\Query\JobEfficiency;

class Aggregate extends \DataWarehouse\Query\Query
{
    public function __construct(
        $aggregation_unit_name,
        $start_date,
        $end_date,
        $group_by,
        $stat = 'job_count',
        array $parameters = array()
    ) {

        parent::__construct(
            'JobEfficiency',
            'modw_aggregates',
            'jobefficiency',
            array('job_count', 'core_time'),
            $aggregation_unit_name,
            $start_date,
            $end_date,
            $group_by,
            $stat,
            $parameters
        );
    }
}
