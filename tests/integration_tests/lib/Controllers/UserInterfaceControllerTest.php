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
        $TEST_ARTIFACT_PATH = "../artifacts/integration/expected/";
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
        $realmGroupBys = array();
        foreach ($data as $menuitem) {
            if (isset($menuitem['realm'])) {
                if (!isset($realms[$menuitem['realm']])) {
                    $realms[$menuitem['realm']] = 0;
                }
                $realms[$menuitem['realm']] += 1;
                if ($menuitem['realm'] == 'SUPREMM'){
                    $groupByName = 'group_by_' . $menuitem['realm']  . '_' . $menuitem['group_by'];
                    $gbParams = array(
                        'operation' => 'get_menus',
                        'node' => $groupByName,
                        'group_by' => $menuitem['group_by'],
                        'public_user' => false,
                        'query_group' => 'tg_usage',
                        'category' => $menuitem['realm']
                    );
                    $gbResponse = $helper->post('/controllers/user_interface.php', null, $gbParams);
                    $realmGroupBys[$groupByName] = $gbResponse[0];
                }
            }
        }
        if (getenv('GENERATE_ARTIFACTS') === '1') {
            file_put_contents($TEST_ARTIFACT_PATH . 'ui-getmenus-SUPREMM.json', json_encode($realmGroupBys, JSON_PRETTY_PRINT));
            $this->markTestSkipped('Generated test artifacts.');
        }
        $expected = json_decode(file_get_contents(realpath($TEST_ARTIFACT_PATH . 'ui-getmenus-SUPREMM.json')), true);
        $this->assertEquals($expected,$realmGroupBys);

        $this->assertArrayHasKey('SUPREMM', $realms);
        $this->assertArrayNotHasKey('JobEfficiency', $realms);

        // The count represents the number of group bys in the realm
        $this->assertTrue($realms['SUPREMM'] > 29);
    }
}
