<?php

namespace DataWarehouse\Query\SUPREMM;

class JobTimeseriesTest extends \PHPUnit_Framework_TestCase
{
    const TEST_ARTIFACT_PATH = "../../vendor/ubccr/xdmod-test-artifacts/xdmod-supremm/summaries/";

    /**
     * @dataProvider validDataProvider
     */
    public function testGetMainData($inputdoc) {

        $timeseries = new \DataWarehouse\Query\SUPREMM\JobTimeseries($inputdoc);

        $cpuuser = $timeseries->get('cpuuser', null, null);

        $this->assertArrayHasKey('schema', $cpuuser);
        $this->assertArrayHasKey('series', $cpuuser);
        
    }

    /**
     * @dataProvider validDataProvider
     */
    public function testGetNodeData($inputdoc) {

        $timeseries = new \DataWarehouse\Query\SUPREMM\JobTimeseries($inputdoc);

        $cpuuser = $timeseries->get('cpuuser', 0, null);

        $this->assertArrayHasKey('schema', $cpuuser);
        $this->assertArrayHasKey('series', $cpuuser);
        
    }

    /**
     * @dataProvider missingDataProvider
     */
    public function testProcessMissing($inputdoc) {

        $timeseries = new \DataWarehouse\Query\SUPREMM\JobTimeseries($inputdoc);

        $cpuuser = $timeseries->get('cpuuser', null, null);

        $this->assertNull($cpuuser);
    }

    private function getDataFiles($datafiles) {
        $schemafile = "timeseries-4.json";

        $schema = json_decode(file_get_contents(self::TEST_ARTIFACT_PATH . $schemafile), true);

        $output = array();

        foreach($datafiles as $datafile) {
            $data = json_decode(file_get_contents(self::TEST_ARTIFACT_PATH . $datafile), true);
            $data['schema'] = $schema;

            $output[] = array($data);
        }

        return $output;
    }

    /*
     * A data provider for valid data
     */
    public function validDataProvider() {
        return $this->getDataFiles(
            array(
                "4454065-1441406017.json",
                "1000000-1371867036.json"
            )
        );
    }

    /*
     * A data provider for data with missing metrics
     */
    public function missingDataProvider() {
        return $this->getDataFiles(
            array(
                "4229255-1438628743.json"
            )
        );
    }
}
