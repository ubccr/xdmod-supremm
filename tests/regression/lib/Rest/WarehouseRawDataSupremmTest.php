<?php

namespace RegressionTests\Rest;

use IntegrationTests\BaseTest;
use RegressionTests\TestHarness\RegressionTestHelper;

/**
 * Test for regressions in getting raw data from the warehouse.
 */
class WarehouseRawDataSupremmTest extends BaseTest
{
    /**
     * @var RegressionTestHelper
     */
    private static $helper;

    /**
     * Create the helper and authenticate.
     */
    public static function setUpBeforeClass(): void
    {
        self::$helper = new RegressionTestHelper();
    }

    /**
     * Test getting raw data from the warehouse.
     *
     * @group warehouseRawData
     * @dataProvider getRawDataProvider
     */
    public function testGetRawData($testName, $input)
    {
        $this->assertTrue(self::$helper->checkRawData($testName, $input));
    }

    public function getRawDataProvider()
    {
        $realmParams = [
            'supremm' => [
                'base' => [
                    'start_date' => '2016-12-30',
                    'end_date' => '2017-01-01',
                    'realm' => 'SUPREMM'
                ],
                'fields_and_filters' => [
                    'fields' => 'local_job_id,Resource,PI Group,Exit Status',
                    'filters[application]' => '12,33',
                    'filters[fieldofscience]' => '49'
                ]
            ]
        ];
        return RegressionTestHelper::getRawDataTestParams($realmParams);
    }
}
