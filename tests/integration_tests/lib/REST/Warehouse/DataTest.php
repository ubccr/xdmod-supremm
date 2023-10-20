<?php

namespace IntegrationTests\REST\Warehouse;

use IntegrationTests\TestHarness\XdmodTestHelper;

class DataTest extends \PHPUnit_Framework_TestCase
{
    protected static $xdmodhelper;

    const ENDPOINT = 'rest/v0.1/warehouse/';

    public static function setUpBeforeClass()
    {
        self::$xdmodhelper = new XdmodTestHelper();
        self::$xdmodhelper->authenticate('cd');
    }

    public static function tearDownAfterClass()
    {
        self::$xdmodhelper->logout();
    }

    public function testRealms() {

        $response = self::$xdmodhelper->get(self::ENDPOINT . 'realms', array());

        $this->assertEquals(200, $response[1]['http_code']);

        $data = $response[0];
        $this->assertTrue($data['success']);

        $this->assertContains('SUPREMM', $data['results']);
        $this->assertContains('JobEfficiency', $data['results']);
    }

    public function testAggregateData() {

        $params = array(
            'start' => 0,
            'limit' => 10,
            'config' => json_encode(array(
                'realm' => 'JobEfficiency',
                'group_by' => 'person',
                'statistics' => array('core_time_bad', 'bad_core_ratio'),
                'aggregation_unit' => 'day',
                'start_date' => '2016-12-01',
                'end_date' => '2017-01-01',
                'order_by' => array('field' => 'core_time_bad', 'dirn' => 'desc')
            ))
        );
        $response = self::$xdmodhelper->get(self::ENDPOINT . 'aggregatedata', $params);

        $this->assertEquals(200, $response[1]['http_code']);

        $data = $response[0];
        $this->assertArrayHasKey('success', $data);
        $this->assertArrayHasKey('results', $data);
        $this->assertArrayHasKey('total', $data);

        $this->assertTrue($data['success']);
        $this->assertEquals(min($data['total'], $params['limit']), count($data['results']));
    }
}
