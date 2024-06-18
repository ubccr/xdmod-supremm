<?php

namespace IntegrationTests\REST;

use IntegrationTests\BaseTest;
use IntegrationTests\TestHarness\XdmodTestHelper;

class SupremmDataflowControllerProviderTest extends BaseTest
{

    protected static $helper;

    public static function setUpBeforeClass(): void
    {
        self::$helper = new XdmodTestHelper();
    }

    /**
     * @dataProvider provideGetDbstats
     */
    public function testGetDbstats($id, $role, $input, $output)
    {
        parent::authenticateRequestAndValidateJson(
            self::$helper,
            $role,
            $input,
            $output
        );
    }

    public function provideGetDbstats()
    {
        $validInput = [
            'path' => 'rest/supremm_dataflow/dbstats',
            'method' => 'get',
            'params' => [],
            'data' => null
        ];
        // Run some standard endpoint tests.
        return parent::provideRestEndpointTests(
            $validInput,
            [
                'authentication' => true,
                'authorization' => 'mgr',
                'int_params' => ['resource_id'],
                'string_params' => ['db_id']
            ]
        );
    }

    /**
     * @dataProvider provideGetQuality
     */
    public function testGetQuality($id, $role, $input, $output)
    {
        parent::authenticateRequestAndValidateJson(
            self::$helper,
            $role,
            $input,
            $output
        );
    }

    public function provideGetQuality()
    {
        $validInput = [
            'path' => 'rest/supremm_dataflow/quality',
            'method' => 'get',
            'params' => [],
            'data' => null
        ];
        // Run some standard endpoint tests.
        $tests = parent::provideRestEndpointTests(
            $validInput,
            [
                'authentication' => true,
                'authorization' => 'mgr',
                'string_params' => ['start', 'end', 'type']
            ]
        );
        // Test bad request parameters.
        foreach (['start', 'end'] as $date) {
            $tests[] = [
                'invalid_' . $date . '_date',
                'mgr',
                parent::mergeParams(
                    $validInput,
                    'params',
                    [$date => '5/1/2022']
                ),
                parent::validateBadRequestResponse(
                    'Please provide dates in YYYY-MM-DD format.'
                )
            ];
        }
        array_push(
            $tests,
            [
                'invalid_date_range',
                'mgr',
                parent::mergeParams(
                    $validInput,
                    'params',
                    [
                        'start' => '2023-01-01',
                        'end' => '2023-01-01'
                    ]
                ),
                parent::validateBadRequestResponse('Invalid date range.')
            ],
            [
                'invalid_type',
                'mgr',
                parent::mergeParams(
                    $validInput,
                    'params',
                    [
                        'start' => '2022-05-01',
                        'end' => '2022-05-08',
                        'type' => 'foo'
                    ]
                ),
                parent::validateBadRequestResponse(
                    (
                        'Unsupported information type. Valid types are: gpu,'
                        . ' hardware, cpu, script, or realms.'
                    )
                )
            ]
        );
        // Test successful requests.
        foreach (['gpu', 'hardware', 'cpu', 'script', 'realms'] as $type) {
            foreach ([
                [
                    'start' => '2022-05-01',
                    'end' => '2022-05-08'
                ],
                [
                    'start' => '9999-01-01',
                    'end' => '9999-01-02'
                ]
            ] as $dates) {
                $params = $dates;
                $params['type'] = $type;
                $tests[] = [
                    'success_' . $type,
                    'mgr',
                    parent::mergeParams(
                        $validInput,
                        'params',
                        $params
                    ),
                    parent::validateSuccessResponse(
                        function ($body, $assertMessage) use ($type) {
                            $this->assertSame($type, $body['type']);
                            $this->assertIsArray($body['result']);
                        }
                    )
                ];
            }
        }
        return $tests;
    }
}
