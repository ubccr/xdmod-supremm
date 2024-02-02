<?php

namespace UnitTests\DataWarehouse\Query\SUPREMM;

use PHPUnit\Framework\TestCase;
use UnitTests\TestHelpers\mock\JobMetadataWorkaround;
use UnitTests\TestHelpers\TestHelper;

class JobMetadataTest extends TestCase
{
    const TEST_ARTIFACT_PATH = "../artifacts/xdmod-test-artifacts/xdmod-supremm/summaries/";

    /**
     * @dataProvider arrayMergeTestdata
     */
    public function testArrayMerge($left, $right, $expected)
    {
        $jobmd = new JobMetadataWorkaround();

        $arrayMergeFn = TestHelper::unlockMethod($jobmd, 'arrayMergeRecursiveWildcard');
        $result = $arrayMergeFn->invoke($jobmd, $left, $right);

        $this->assertEquals($expected, $result);
    }

    public function arrayMergeTestdata()
    {
        $output = array();

        $left = array(
            "one" => array("data" => 1),
            "two" => array("data" => 2),
            "three" => array("data" => 3)
        );

        $right = array(
            "one" => array("doc" => 1),
            "two" => array("doc" => 2),
            "three" => array("doc" => 3)
        );

        $expected = array(
            "one" => array("data" => 1, "doc" => 1),
            "two" => array("data" => 2, "doc" => 2),
            "three" => array("data" => 3, "doc" => 3)
        );

        $output[] = array($left, $right, $expected);

        $left = array(
            "metric" => array(
                "device1" => array("data" => 1),
                "device2" => array("data" => 2)
            )
        );

        $right = array(
            "metric" => array(
                "*" => array("doc" => 1)
            )
        );

        $expected = array(
            "metric" => array(
                "device1" => array("data" => 1, "doc" => 1),
                "device2" => array("data" => 2, "doc" => 1)
            )
        );

        $output[] = array($left, $right, $expected);

        $left = json_decode(file_get_contents(self::TEST_ARTIFACT_PATH . '4824787-1451650405-gpu.json'), true);

        $schema = json_decode(file_get_contents(self::TEST_ARTIFACT_PATH . 'summary-1.0.7-gpu.json'), true);
        $right = $schema['definitions'];
        $expected = $left;

        $output[] = array($left, $right, $expected);

        return $output;

    }
}
