<?php
namespace DataWarehouse\Query\SUPREMM;

/* 
* @author Amin Ghadersohi
* @date 2013-Feb-07
*
*/
class Aggregate extends \DataWarehouse\Query\Query
{
	
    public function __construct(
        $aggregation_unit_name,
        $start_date,
        $end_date,
        $group_by,
        $stat = 'job_count',
        array $parameters = array()
    )
	{

        parent::__construct(
            'SUPREMM', 'modw_aggregates', 'supremmfact',
            array('started_job_count', 'running_job_count'),
            $aggregation_unit_name,
            $start_date,
            $end_date,
            $group_by,
            $stat,
            $parameters
        );
	}
}
?>
