<?php

namespace IntegrationTests\Controllers;

class UserInterfaceControllerTest extends \PHPUnit_Framework_TestCase
{
    /**
     * Check that the SUPREMM realm shows in the usage tab
     * catalog and the JobEfficiency realm does not.
     */
    public function testGetMenus()
    {
        $helper = new \TestHarness\XdmodTestHelper();
        $helper->authenticate('cd');

        $params = array(
            'operation' => 'get_menus',
            'node' => 'category_',
            'public_user' => false,
            'query_group' => 'tg_usage'
        );

        $response = $helper->post('/controllers/user_interface.php', null, $params);

        $this->assertEquals('application/json', $response[1]['content_type']);
        $this->assertEquals(200, $response[1]['http_code']);

        $data = $response[0];

        $realms = array();
        foreach ($data as $menuitem) {
            if (isset($menuitem['realm'])) {
                if (!isset($realms[$menuitem['realm']])) {
                    $realms[$menuitem['realm']] = 0;
                }
                $realms[$menuitem['realm']] += 1;
            }
        }

        $this->assertArrayHasKey('SUPREMM', $realms);
        $this->assertArrayNotHasKey('JobEfficiency', $realms);

        // The count represents the number of group bys in the realm
        $this->assertTrue($realms['SUPREMM'] > 29);
    }
}
