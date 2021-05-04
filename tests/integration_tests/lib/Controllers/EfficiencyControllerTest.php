<?php

namespace IntegrationTests\Controllers;

class EfficiencyControllerTest extends \PHPUnit_Framework_TestCase
{
    /**
     * Check that the efficiency tab shows when supremm module is installed.
     */
    public function testGetEfficiencyTab()
    {
        $helper = new \TestHarness\XdmodTestHelper();
        $helper->authenticate('cd');

        $response = $helper->post('/controllers/user_interface.php', null, array('operation' => 'get_tabs', 'public_user' => 'false'));

        $this->assertEquals('application/json', $response[1]['content_type']);
        $this->assertEquals(200, $response[1]['http_code']);

        $dwdata = $response[0];

        $this->assertContains('efficiency', $dwdata['data'][0]['tabs']);
    }
}
