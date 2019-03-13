<?php
namespace DataWarehouse\Query\JobEfficiency;

/*
* @author Amin Ghadersohi
* @date 2013-Feb-07
*
*/
class Statistic extends \DataWarehouse\Query\Statistic
{
   
    public function getWeightStatName()
    {
        return 'running_job_count';
    }
}
