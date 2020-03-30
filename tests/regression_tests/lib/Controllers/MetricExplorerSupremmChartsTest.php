<?php

namespace RegressionTests\Controllers;

use TestHarness\Utilities;

class MetricExplorerSupremmChartsTest extends \RegressionTests\Controllers\MetricExplorerChartsTest
{
    public function filterTestsProvider()
    {
        $data_file = realpath(__DIR__ . '/../../../artifacts/regression/chartFilterTests.json');
        if (file_exists($data_file)) {
            $inputs = json_decode(file_get_contents($data_file), true);
        } else {
            // Generate test permutations. The expected values for the data points are not set.
            // this causes the test function to record the values and they are then written
            // to a file in the tearDownAfterClass function.
            $baseConfig = array(
                array('realm' => 'SUPREMM', 'metric' => 'wall_time', 'date' => '2016-12-29')
            );

            $inputs = $this->generateFilterTests($baseConfig);
        }

        $helper = new \TestHarness\XdmodTestHelper();
        $helper->authenticate('cd');

        $enabledRealms = Utilities::getRealmsToTest();

        $output = array();
        foreach ($inputs as $test)
        {
            if (in_array(strtolower($test['settings']['realm']), $enabledRealms)) {
                $output[] = array($helper, $test['settings'], $test['expected']);
            }
        }

        return $output;
    }
}
