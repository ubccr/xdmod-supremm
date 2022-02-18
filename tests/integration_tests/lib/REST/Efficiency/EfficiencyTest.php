<?php

namespace IntegrationTests\REST\Efficiency;

class EfficiencyTest extends \PHPUnit_Framework_TestCase
{
    const ENDPOINT = 'rest/v1/efficiency/';

    protected static $helpers = array();

    public static function setUpBeforeClass()
    {
        foreach (array('pub', 'cd', 'usr') as $user) {
            self::$helpers[$user] = new \TestHarness\XdmodTestHelper();
            if ($user != 'pub') {
                self::$helpers[$user]->authenticate($user);
            }
        }
    }

    public static function tearDownAfterClass()
    {
        foreach (self::$helpers as $helper) {
            $helper->logout();
        }
    }

    /***
     * Returns an array of analytics that are currently available for vieweing in the efficiency tab.
     * Needs modification if analytics are changed, added, or removed.
     */
    private static function getAnalytics() {
        return array(
            "CPU Usage",
            "GPU Usage",
            "Homogeneity",
            "Memory Usage",
            "Short Job Count",
            "Wall Time Accuracy"
        );
    }

    /***
     * This test intentionally checks the current analytics available for the efficiency tab.
     * If more analytics are added/modified, this test must be updated.
     */
    public function testAnalytics()
    {
        $response = self::$helpers['cd']->get(self::ENDPOINT . 'analytics');

        $this->assertEquals(200, $response[1]['http_code']);

        $this->assertArrayHasKey('success', $response[0]);
        $this->assertTrue($response[0]['success']);

        $analytics = array();
        foreach ($response[0]['data'] as $analyticType){
            $analytic = $analyticType['analytics'];
            foreach($analytic as $key => $value){
                $analytics[] = $value['analytic'];
            }
        }

        sort($analytics);

        $this->assertEquals(self::getAnalytics(), $analytics);
        $this->xdmodhelper->logout();
    }

    /***
     * Generate valid parameters for checking the scatter plot endpoint for CPU Usage data.
     */
    protected function getScatterPlotDataParameters($configOverrides = array())
    {
        $config = array(
            'realm' => 'SUPREMM',
            'group_by' => 'person',
            'statistics' => array('avg_percent_cpu_idle', 'wall_time'),
            'aggregation_unit' => 'day',
            'start_date' => '2016-12-01',
            'end_date' => '2017-01-01',
            'order_by' => array(
                'field' => 'avg_percent_cpu_idle',
                'dirn' => 'asc'
            )
        );

        $config = array_merge($config, $configOverrides);

        return array(
            'start' => 0,
            'limit' => 10,
            'config' => json_encode($config)
        );
    }

    public function scatterPlotDataAccessUsers()
    {
        $params = $this->getScatterPlotDataParameters();
        $inputs = array();

        $inputs[] = array('cd', $params, 4, 0);
        $inputs[] = array('usr', $params, 1, 4);

        return $inputs;
    }

    /**
     * @dataProvider scatterPlotDataAccessUsers
     */
    public function testCPUUsageScatterPlotEndpoint($usr, $params, $result_count, $hidden_data_count)
    {
        $response = self::$helpers[$usr]->get(self::ENDPOINT . 'scatterPlot/CPU%20Usage', $params);

        $this->assertEquals(200, $response[1]['http_code']);
        $this->assertArrayHasKey('success', $response[0]);
        $this->assertTrue($response[0]['success']);

        $this->assertCount($result_count, $response[0]['results'][0]['results']);
        $this->assertCount($hidden_data_count, $response[0]['results'][0]['hiddenData']);
    }

    public function testCPUUsageScatterPlotEndpointWithFilter()
    {
        $params = $this->getScatterPlotDataParameters(array('filters' => array('queue' => array("chapti"))));
        $response = self::$helpers['cd']->get(self::ENDPOINT . 'scatterPlot/CPU%20Usage', $params);

        $this->assertEquals(200, $response[1]['http_code']);
        $this->assertArrayHasKey('success', $response[0]);
        $this->assertTrue($response[0]['success']);

        $this->assertCount(3, $response[0]['results'][0]['results']);
        $this->assertCount(0, $response[0]['results'][0]['hiddenData']);
    }

    public function testCPUUsageScatterPlotEndpointPub()
    {
        $params = $this->getScatterPlotDataParameters();
        $response = self::$helpers['pub']->get(self::ENDPOINT . 'scatterPlot/CPU%20Usage', $params);

        $this->assertEquals(401, $response[1]['http_code']);
        $this->assertArrayHasKey('success', $response[0]);
        $this->assertFalse($response[0]['success']);
    }

    public function scatterPlotDataMalformedRequest()
    {
        $inputs = array();

        $inputs[] = array('cd', array('start' => 0, 'limit' => 10));
        $inputs[] = array('cd', array('start' => 0, 'limit' => 10, 'config' => ''));
        $inputs[] = array('cd', array('start' => 0, 'limit' => 10, 'config' => '{"realm": "SUPREMM"}'));
        $inputs[] = array('cd', array('start' => 0, 'limit' => 10, 'config' => 'not json data'));
        $inputs[] = array('cd', array('start' => 'smart', 'limit' => 'asdf', 'config' => '{"realm": "SUPREMM"}'));

        return $inputs;
    }

    /**
     * @dataProvider scatterPlotDataMalformedRequest
     */
    public function testCPUUsageScatterPlotEndpointMalformedRequest($usr, $params)
    {
        $response = self::$helpers[$usr]->get(self::ENDPOINT . 'scatterPlot/CPU%20Usage', $params);
        $this->assertEquals(400, $response[1]['http_code']);
        $this->assertFalse($response[0]['success']);
    }

    /***
     * Generate valid parameters for checking the drilldown endpoint for CPU Usage for Whimbrel user.
     */
    protected function getDrillDownDataParameters($paramsOverrides = array())
    {
        $params = array (
            'show_title' => 'y',
            'title' => 'Test CPU Usage',
            'timeseries' => false,
            'aggregation_unit' => 'day',
            'start_date' => '2012-02-10',
            'end_date' => '2022-02-10',
            'global_filters' => array(
                'data' => array(
                    array(
                        'dimension_id' => 'person',
                        'id' => 'person=114',
                        'realms' => array('SUPREMM'),
                        'value_id' =>  '114',
                        'value_name' =>  'Whimbrel',
                        'checked' => true
                    )
                ),
                'total' => 1
            ),
            'show_filters' => true,
            'show_warnings' => true,
            'show_remainder' => false,
            'start' => '0',
            'limit' => '200',
            'timeframe_label' => 'User Defined',
            'operation' => 'get_data',
            'data_series' => array(
                array(
                    'id' => 0.41070416068466,
                    'metric' => 'wall_time',
                    'category' => 'SUPREMM',
                    'realm' => 'SUPREMM',
                    'group_by' => 'cpuuser',
                    'x_axis' => true,
                    'log_scale' => false,
                    'has_std_err' => false,
                    'std_err' => false,
                    'value_labels' => false,
                    'display_type' => 'column',
                    'line_type' => 'Solid',
                    'line_width' => 2,
                    'combine_type' => 'side',
                    'sort_type' => 'none',
                    'filters' => array (
                        'data' => array (),
                        'total' => 0,
                    ),
                    'ignore_global' => false,
                    'long_legend' => false,
                    'trend_line' => false,
                    'color' => 'auto',
                    'shadow' => false,
                    'visibility' => null,
                    'z_index' => 0,
                    'enabled' => true,
                )
            ),
            'swap_xy' => 'false',
            'share_y_axis' => 'false',
            'hide_tooltip' => 'false',
            'show_guide_lines' => true,
            'scale' => '1',
            'format' => 'hc_jsonstore',
            'legend_type' => 'off',
            'controller_module' => 'metric_explorer'
        );
        
        $params = array_merge($params, $paramsOverrides);

        $params['global_filters'] = urlencode(json_encode($params['global_filters']));
        $params['data_series'] = urlencode(json_encode($params['data_series']));

        return $params;
    }

    public function drilldownDataUsers()
    {
        $params = $this->getDrillDownDataParameters();
        $inputs = array();

        $inputs[] = array('cd', $params, 4);
        $inputs[] = array('usr', $params, 4);

        return $inputs;
    }
  
    /**
     * @dataProvider drilldownDataUsers
     */
    public function testCPUUsageDrilldownPlot($usr, $params, $seriesCount)
    {
        $response = self::$helpers[$usr]->get(self::ENDPOINT . 'histogram/cpuuser', $params);
        $this->assertEquals(200, $response[1]['http_code']);
    
        $this->assertArrayHasKey('success', $response[0]);
        $this->assertTrue($response[0]['success']);

        $this->assertCount($seriesCount, $response[0]['data'][0]['series'][0]['data']);
    }

    public function testCPUUsageDrilldownPlotWithFilter()
    {
        $params = $this->getDrillDownDataParameters(array(
            'global_filters' => array(
                'data' => array(
                    array(
                        'dimension_id' => 'person',
                        'id' => 'person=114',
                        'realms' => array('SUPREMM'),
                        'value_id' =>  '114',
                        'value_name' =>  'Whimbrel',
                        'checked' => true
                    ),
                    array(
                        'dimension_id' => 'queue',
                        'id' => 'queue=chapti',
                        'realms' => array('SUPREMM'),
                        'value_id' =>  'chapti',
                        'value_name' =>  'chapti',
                        'checked' => true
                    )
                ),
                'total' => 2)
            )
        );

        $response = self::$helpers['cd']->get(self::ENDPOINT . 'histogram/cpuuser', $params);

        $this->assertEquals(200, $response[1]['http_code']);
        $this->assertArrayHasKey('success', $response[0]);
        $this->assertTrue($response[0]['success']);

        $this->assertCount(4, $response[0]['data'][0]['series'][0]['data']);
    }

    public function drilldownDataMalformedRequest()
    {
        $inputs = array();

        $inputs[] = array('cd', array(''));

        return $inputs;
    }

    /**
     * @dataProvider drilldownDataMalformedRequest
     */
    public function testCPUUsageDrillownEndpointMalformedRequest($usr, $params)
    {
        $response = self::$helpers['cd']->get(self::ENDPOINT . 'histogram/cpuuser', $params);
        $this->assertEquals(400, $response[1]['http_code']);
 
        $resdata = $response[0];
        $this->assertArrayHasKey('success', $resdata);
        $this->assertEquals(false, $resdata['success']);
    }
}
