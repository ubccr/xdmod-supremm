<?php

namespace IntegrationTests\REST\SupremmDataflow;

class QualityTest extends \PHPUnit_Framework_TestCase
{

    protected static $helpers = array();

    public static function setUpBeforeClass()
    {
        foreach (array('pub', 'mgr', 'usr') as $user) {
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

    public function qualityParams()
    {
        $inputs = array();

        // test user access
        $inputs[] = array('pub', array('start' => '2022-05-01', 'end' => '2022-05-08', 'type' => 'gpu'), 401);
        $inputs[] = array('usr', array('start' => '2022-05-01', 'end' => '2022-05-08', 'type' => 'gpu'), 403);
        $inputs[] = array('mgr', array('start' => '2022-05-01', 'end' => '2022-05-08', 'type' => 'gpu'), 200);

        // test dates
        $inputs[] = array('mgr', array('start' => '2022-05-01', 'end' => '2022-05-08', 'type' => 'gpu'), 200);
        $inputs[] = array('mgr', array('start' => '5/1/2022', 'end' => '5/8/2022', 'type' => 'gpu'), 400);
        $inputs[] = array('mgr', array('start' => '5/1/2022', 'end' => '2022-05-08', 'type' => 'gpu'), 400);
        $inputs[] = array('mgr', array('start' =>'2022-05-01', 'end' => '5/8/2022', 'type' => 'gpu'), 400);

        // test types
        foreach (array('gpu', 'hardware', 'cpu', 'script', 'realms') as $type) {
                $inputs[] = array('mgr', array('start' => '2022-05-01', 'end' => '2022-05-08', 'type' => $type), 200);
        }

        foreach (array('', 'ahhhhhh') as $type) {
                $inputs[] = array('mgr', array('start' => '2022-05-01', 'end' => '2022-05-08', 'type' => $type), 400);
        }

        return $inputs;
     }

     /**
     * @dataProvider qualityParams
     */
    public function testQuality($usr, $params, $expected)
    {
        $response = self::$helpers[$usr]->get("rest/supremm_dataflow/quality", $params);
        $this->assertEquals($expected, $response[1]['http_code']);
    }
} // class QualityTest
