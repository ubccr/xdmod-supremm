<?php

namespace IntegrationTests\Controllers;

class MetricExplorerControllerTest extends \PHPUnit_Framework_TestCase
{
    /**
     * Check that the SUPREMM realm shows in the metric explorer
     * catalog and the JobEfficiency realm does not.
     */
    public function testGetDwDescripter()
    {
        $helper = new \TestHarness\XdmodTestHelper();
        $helper->authenticate('cd');

        $response = $helper->post('/controllers/metric_explorer.php', null, array('operation' => 'get_dw_descripter'));

        $this->assertEquals('application/json', $response[1]['content_type']);
        $this->assertEquals(200, $response[1]['http_code']);

        $dwdata = $response[0];

        $this->assertArrayHasKey('SUPREMM', $dwdata['data']['0']['realms']);
        $this->assertArrayNotHasKey('JobEfficiency', $dwdata['data']['0']['realms']);
    }
}
