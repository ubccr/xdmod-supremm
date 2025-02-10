<?php

namespace RegressionTests\Controllers;

use RegressionTests\Controllers\MetricExplorerChartsTest;

class MetricExplorerSupremmChartsTest extends MetricExplorerChartsTest
{
    protected static function getFilterTestBaseConfig()
    {
        return [
            [
                'realm' => 'SUPREMM',
                'metric' => 'wall_time',
                'date' => '2016-12-29'
            ]
        ];
    }
}
