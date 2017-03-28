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

    public function testResourceEndPoint()
    {
        $this->xdmodhelper->authenticate("po");

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
    }

    public function testResourceNoAuth()
    {
    }

    private function validateSingleJobSearch($searchparams)
    {
        $this->xdmodhelper->authenticate("po");
        $result = $this->xdmodhelper->get($this->endpoint . 'search/jobs', $searchparams);

        $this->assertArrayHasKey('success', $result[0]);
        $this->assertEquals($result[0]['success'], true);
        $this->assertArrayHasKey('results', $result[0]);
        $this->assertCount(1, $result[0]['results']);

        $jobdata = $result[0]['results'][0];

        $this->assertArrayHasKey('dtype', $jobdata);
        $this->assertArrayHasKey($jobdata['dtype'], $jobdata);

        return $jobdata;
    }

    public function testInvalidJobSearch() {

        $this->xdmodhelper->authenticate("po");
        $result = $this->xdmodhelper->get($this->endpoint . 'search/jobs', array() );

        $this->assertArrayHasKey('success', $result[0]);
        $this->assertEquals($result[0]['success'], false);
        $this->assertEquals($result[1]['http_code'], 400);
    }

    public function testInvalidJobSearchJson() {

        $searchparams = array(
            "realm" => "SUPREMM",
            "params" => "this is not json data"
        );

        $this->xdmodhelper->authenticate("po");
        $result = $this->xdmodhelper->get($this->endpoint . 'search/jobs', $searchparams);

        $this->assertArrayHasKey('success', $result[0]);
        $this->assertEquals($result[0]['success'], false);
        $this->assertEquals($result[1]['http_code'], 400);
    }

    public function testInvalidJobSearchMissingParams() {
 
        $searchparams = array(
            "realm" => "SUPREMM",
            "params" => json_encode(array("resource_id" => "2801"))
        );

        $this->xdmodhelper->authenticate("po");
        $result = $this->xdmodhelper->get($this->endpoint . 'search/jobs', $searchparams);

        $this->assertArrayHasKey('success', $result[0]);
        $this->assertEquals($result[0]['success'], false);
        $this->assertEquals($result[1]['http_code'], 400);
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

        $this->xdmodhelper->authenticate("po");
        $result = $this->xdmodhelper->get($this->endpoint . 'search/jobs', $searchparams);
        $this->assertEquals($result[0]['success'], false);
        $this->assertEquals($result[1]['http_code'], 400);
    }
}
