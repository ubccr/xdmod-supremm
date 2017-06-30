<?php

namespace IntegrationTests\REST\Warehouse;

class JobViewerTest extends \PHPUnit_Framework_TestCase
{
    public function setUp()
    {
        $xdmodConfig = array( "decodetextasjson" => true );
        $this->xdmodhelper = new \TestHarness\XdmodTestHelper($xdmodConfig);

        $this->endpoint = 'rest/v0.1/warehouse/';

        $this->exportTypes = array(
            array('image/png', 'image/png', 'image/png'),
            array('image/svg', 'image/svg+xml', 'text/plain'),
            array('text/csv',  'text/csv', 'text/plain'),
        );
    }

    /**
     * Note that this test intentionally hardcodes the available dimensions so
     * that we can confirm that the dimensions are all present and correct for
     * fresh installs and for upgrades. Needless to say, the expected results
     * must be updated when the SUPReMM schema changes.
     */
    public function testDimensions()
    {
        $this->xdmodhelper->authenticate("cd");
        $queryparams = array(
            'realm' => 'SUPREMM'
        );
        $response = $this->xdmodhelper->get($this->endpoint . 'dimensions', $queryparams);

        $this->assertEquals(200, $response[1]['http_code']);

        $resdata = $response[0];

        $this->assertArrayHasKey('success', $resdata);
        $this->assertEquals(true, $resdata['success']);

        $dimids = array();
        foreach ($resdata['results'] as $dimension) {
            $dimids[] = $dimension['id'];
        }

        $expectedDimensions = <<<EOF
[
    "application",
    "catastrophe_bucket_id",
    "cpi",
    "cpucv",
    "cpuuser",
    "datasource",
    "nsfdirectorate",
    "parentscience",
    "exit_status",
    "netdrv_gpfs_rx_bucket_id",
    "grant_type",
    "granted_pe",
    "ibrxbyterate_bucket_id",
    "netdrv_isilon_rx_bucket_id",
    "jobsize",
    "jobwalltime",
    "nodecount",
    "netdrv_panasas_rx_bucket_id",
    "max_mem",
    "pi",
    "fieldofscience",
    "pi_institution",
    "queue",
    "resource",
    "provider",
    "shared",
    "username",
    "person",
    "institution"
]
EOF;
        $this->assertEquals(json_decode($expectedDimensions, true), $dimids);

        $this->xdmodhelper->logout();
    }


    public function testResourceEndPoint()
    {
        $this->xdmodhelper->authenticate("cd");

        $queryparams = array(
            'realm' => 'SUPREMM'
        );

        $response = $this->xdmodhelper->get($this->endpoint . 'dimensions/resource', $queryparams);

        $this->assertEquals(200, $response[1]['http_code']);

        $resdata = $response[0];

        $this->assertArrayHasKey('success', $resdata);
        $this->assertEquals(true, $resdata['success']);

        foreach($resdata['results'] as $resource)
        {
            $this->assertArrayHasKey('id', $resource);
            $this->assertArrayHasKey('name', $resource);
            $this->assertArrayHasKey('short_name', $resource);
            $this->assertArrayHasKey('long_name', $resource);
        }

        $this->xdmodhelper->logout();
    }

    public function testResourceNoAuth()
    {
        $queryparams = array(
            'realm' => 'SUPREMM'
        );
        $response = $this->xdmodhelper->get($this->endpoint . 'dimensions/resource', $queryparams);

        $this->assertEquals(401, $response[1]['http_code']);
    }

    private function validateSingleJobSearch($searchparams)
    {
        $this->xdmodhelper->authenticate("cd");
        $result = $this->xdmodhelper->get($this->endpoint . 'search/jobs', $searchparams);

        $this->assertArrayHasKey('success', $result[0]);
        $this->assertEquals($result[0]['success'], true);
        $this->assertArrayHasKey('results', $result[0]);
        $this->assertCount(1, $result[0]['results']);

        $jobdata = $result[0]['results'][0];

        $this->assertArrayHasKey('dtype', $jobdata);
        $this->assertArrayHasKey($jobdata['dtype'], $jobdata);

        $this->xdmodhelper->logout();

        return $jobdata;
    }

    public function testBasicJobSearch() {
        $queryparams = array(
            'realm' => 'SUPREMM',
            'params' => json_encode(
                array(
                    'resource_id' => 5,
                    'local_job_id' => 6117153
                )
            )
        );
        $this->validateSingleJobSearch($queryparams);
    }

    public function testBasicJobSearchNoAuth() {
        $searchparams = array(
            'realm' => 'SUPREMM',
            'params' => json_encode(
                array(
                    'resource_id' => 5,
                    'local_job_id' => 6117153
                )
            )
        );

        foreach (array('usr', 'pi') as $unpriv) {
            $this->xdmodhelper->authenticate($unpriv);
            $response = $this->xdmodhelper->get($this->endpoint . 'search/jobs', $searchparams);
            $this->assertEquals(403, $response[1]['http_code']);
            $this->assertArrayHasKey('success', $response[0]);
            $this->assertEquals(false, $response[0]['success']);
            $this->xdmodhelper->logout();
        }
    }

    public function testInvalidJobSearch() {

        $this->xdmodhelper->authenticate("cd");
        $result = $this->xdmodhelper->get($this->endpoint . 'search/jobs', array() );

        $this->assertArrayHasKey('success', $result[0]);
        $this->assertEquals($result[0]['success'], false);
        $this->assertEquals($result[1]['http_code'], 400);

        $this->xdmodhelper->logout();
    }

    public function testInvalidJobSearchJson() {

        $searchparams = array(
            "realm" => "SUPREMM",
            "params" => "this is not json data"
        );

        $this->xdmodhelper->authenticate("cd");
        $result = $this->xdmodhelper->get($this->endpoint . 'search/jobs', $searchparams);

        $this->assertArrayHasKey('success', $result[0]);
        $this->assertEquals($result[0]['success'], false);
        $this->assertEquals($result[1]['http_code'], 400);

        $this->xdmodhelper->logout();
    }

    public function testInvalidJobSearchMissingParams() {
 
        $searchparams = array(
            "realm" => "SUPREMM",
            "params" => json_encode(array("resource_id" => "2801"))
        );

        $this->xdmodhelper->authenticate("cd");
        $result = $this->xdmodhelper->get($this->endpoint . 'search/jobs', $searchparams);

        $this->assertArrayHasKey('success', $result[0]);
        $this->assertEquals($result[0]['success'], false);
        $this->assertEquals($result[1]['http_code'], 400);

        $this->xdmodhelper->logout();
    }

    public function testAdvancedSearchInvalid() {
        $searchparams = array(
            "start_date" => "2015-01-01",
            "end_date" => "2015-01-01",
            "realm" => "SUPREMM",
            "params" => json_encode(
                array( "non existent dimension 1" => array(0),
                "another invalid dimension" => array(1) )
            ),
            "limit" => 10,
            "start" => 0
        );

        $this->xdmodhelper->authenticate("cd");
        $result = $this->xdmodhelper->get($this->endpoint . 'search/jobs', $searchparams);
        $this->assertEquals($result[0]['success'], false);
        $this->assertEquals($result[1]['http_code'], 400);

        $this->xdmodhelper->logout();
    }
}
