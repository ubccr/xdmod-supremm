<?php

namespace IntegrationTests\REST\internal_dashboard;

class DashboardSupremmTest extends \PHPUnit_Framework_TestCase
{
    public function __construct()
    {
        $xdmodConfig = array( "decodetextasjson" => true );
        $this->xdmodhelper = new \TestHarness\XdmodTestHelper($xdmodConfig);

        $this->endpoint = 'rest/v0.1/supremm_dataflow/';

        // validate as manager, for dashboard access
        $this->validateAsUser = 'mgr';
    }

    private function invalidSupremmResourceEntries($params)
    {
        // without performing validation: expect to receive a 401;
        // if wrong user authenticated: expect to receive a 403
        $result = $this->xdmodhelper->get($this->endpoint . 'resources', $params);

        // expect success=false
        $this->assertArrayHasKey('success', $result[0]);
        $this->assertEquals($result[0]['success'], false);

        // expect no data returned
        $data = $result[0]['data'];
        $this->assertEquals(sizeof($data), 0);

        return $result;
    }

    private function validateSupremmResourceEntries()
    {
        $this->xdmodhelper->authenticate($this->validateAsUser);

        $result = $this->xdmodhelper->get($this->endpoint . 'resources', null);
        $this->assertEquals(200, $result[1]['http_code']);

        $this->assertArrayHasKey('success', $result[0]);
        $this->assertEquals($result[0]['success'], true);

        $data = $result[0]['data'];

        // result set has at least one element
        $this->assertGreaterThanOrEqual(1, sizeof($data));

        foreach ($data as $item) {
            $this->assertArrayHasKey('id', $item);
            $this->assertArrayHasKey('name', $item);
        }
        return $data;
    }

    // return arbitrary ResourceId
    private function fetchResourceId()
    {
        $result = $this->validateSupremmResourceEntries();

        $resourceid = $result[0]['id'];
        return $resourceid;
    }

    private function invalidSupremmDbstatsEntries($db)
    {
        // without performing validation : expect to receive a 401

        // hardcode the params for resource id
        $params = array(
            'resource_id' => 2791,
            'db_id' => $db
        );
        $result = $this->xdmodhelper->get($this->endpoint . 'dbstats', $params);

        $this->assertArrayHasKey('success', $result[0]);
        $this->assertEquals($result[0]['success'], false);

        // expect 401
        $this->assertEquals(401, $result[1]['http_code']);
    }

    private function invalidParamsSupremmDbstatsEntries()
    {
        // validate properly
        $this->xdmodhelper->authenticate($this->validateAsUser);

        // send null params, expect 400
        $result = $this->xdmodhelper->get($this->endpoint . 'dbstats', null);
        $this->assertEquals(400, $result[1]['http_code']);

        $this->assertArrayHasKey('success', $result[0]);
        $this->assertEquals($result[0]['success'], false);
    }

    private function invalidResParamsNotFoundSupremmDbstatsEntries()
    {
        // validate properly
        $this->xdmodhelper->authenticate($this->validateAsUser);

        // hardcode and send bogus resource_id param
        $params = array(
            'resource_id' => 99999,
            'db_id' => 'summarydb'
        );
        $result = $this->xdmodhelper->get($this->endpoint . 'dbstats', $params);

        // Message will contain "no result found"
        $this->assertContains("no result found for the given database", $result[0]['message']);

        // result has success='false'
        $this->assertArrayHasKey('success', $result[0]);
        $this->assertEquals($result[0]['success'], false);

        // should return a 404
        $this->assertEquals(404, $result[1]['http_code']);
    }

    private function invalidParamsNotFoundSupremmDbstatsEntries()
    {
        // validate properly
        $this->xdmodhelper->authenticate($this->validateAsUser);

        // hardcode and send bogus db_id param
        $params = array(
            'resource_id' => $this->fetchResourceId(),
            'db_id' => 'db_does_not_exist'
        );
        $result = $this->xdmodhelper->get($this->endpoint . 'dbstats', $params);

        // Message will contain "no result found"
        $this->assertContains("no result found for the given database", $result[0]['message']);

        // result has success='false'
        $this->assertArrayHasKey('success', $result[0]);
        $this->assertEquals($result[0]['success'], false);

        // should return a 404
        $this->assertEquals(404, $result[1]['http_code']);
    }

    private function invalidSupremmUserDbstatsEntries($db, $userRole)
    {
        // when validating as wrong user type: expect to receive a 403:
        //
        // First, resource id is fetched using a valid user
        // so that we can check the functionality of Dbstats
        $params = array(
            'resource_id' => $this->fetchResourceId(),
            'db_id' => $db
        );

        // reauthenticate as some (invalid) user role, not a 'mgr' role
        $this->xdmodhelper->authenticate($userRole);
        $result = $this->xdmodhelper->get($this->endpoint . 'dbstats', $params);

        // result has success='false'
        $this->assertArrayHasKey('success', $result[0]);
        $this->assertEquals($result[0]['success'], false);

        // expect 403
        $this->assertEquals(403, $result[1]['http_code']);
    }

    private function validateSupremmDbstatsEntries($db)
    {
        $this->xdmodhelper->authenticate($this->validateAsUser);

        $params = array(
            'resource_id' => $this->fetchResourceId(),
            'db_id' => $db
        );
        $result = $this->xdmodhelper->get($this->endpoint . 'dbstats', $params);
        $this->assertEquals(200, $result[1]['http_code']);

        // result has success='true'
        $this->assertArrayHasKey('success', $result[0]);
        $this->assertEquals($result[0]['success'], true);

        // result set has at least one element
        $this->assertGreaterThanOrEqual(1, sizeof($result[0]['data']));

        $item = $result[0]['data']['data'];
        return $item;
    }

    public function testInvalidUserPOSupremmResourceEntries()
    {
        // with wrong user authenticated: expect to receive a 403
        $user = 'po';
        $this->xdmodhelper->authenticate($user);

        $result = $this->invalidSupremmResourceEntries(null);
        $this->assertEquals(403, $result[1]['http_code']);
    }

    public function testInvalidUserCDSupremmResourceEntries()
    {
        // with wrong user authenticated: expect to receive a 403
        $user = 'cd';
        $this->xdmodhelper->authenticate($user);

        $result = $this->invalidSupremmResourceEntries(null);
        $this->assertEquals(403, $result[1]['http_code']);
    }

    public function testInvalidUserSupremmResourceEntries()
    {
        // with no user authenticated: expect to receive a 401
        $result = $this->invalidSupremmResourceEntries(null);
        $this->assertEquals(401, $result[1]['http_code']);
    }

    public function testResourceNullParam()
    {
        $data = $this->validateSupremmResourceEntries();

        // should return at least one element
        $this->assertGreaterThanOrEqual(1, sizeof($data));
    }

    public function testInvalidUserPOSupremmDbstatsEntries()
    {
        $user = 'po';
        $db = 'summarydb';
        $this->invalidSupremmUserDbstatsEntries($db, $user);
    }

    public function testInvalidUserCDSupremmDbstatsEntries()
    {
        $user = 'cd';
        $db = 'summarydb';
        $this->invalidSupremmUserDbstatsEntries($db, $user);
    }

    public function testInvalidParamsSupremmDbstatsEntries()
    {
        $this->invalidParamsSupremmDbstatsEntries();
    }

    public function testInvalidSupremmDbstatsEntries()
    {
        $supremmDb = 'summarydb';
        $this->invalidSupremmDbstatsEntries($supremmDb);
    }

    public function testInvalidParamsNotFoundSupremmDbstatsEntries()
    {
        $this->invalidParamsNotFoundSupremmDbstatsEntries();
    }

    public function testInvalidResParamsNotFoundSupremmDbstatsEntries()
    {
        $this->invalidResParamsNotFoundSupremmDbstatsEntries();
    }

    // fetch summarydb stats
    public function testFetchDbstatsSummary($db = 'summarydb') {

        $item = $this->validateSupremmDbstatsEntries($db);

        $this->assertArrayHasKey('total', $item);
        $this->assertArrayHasKey('avgObjSize', $item);
        $this->assertArrayHasKey('storageSize', $item);
        $this->assertArrayHasKey('size', $item);
        $this->assertArrayHasKey('processed', $item);
        $this->assertArrayHasKey('pending', $item);
    }

    // fetch accountdb stats
    public function testFetchDbstatsAccount($db = 'accountdb') {

        $item = $this->validateSupremmDbstatsEntries($db);

        $this->assertArrayHasKey('total', $item);
        $this->assertArrayHasKey('approx_size', $item);
        $this->assertArrayHasKey('last_job', $item);
        $this->assertArrayHasKey('last_job_tm', $item);
        $this->assertArrayHasKey('processed', $item);
        $this->assertArrayHasKey('pending', $item);
    }

    // fetch jobfact stats
    public function testFetchDbstatsJobfact($db = 'jobfact') {

        $item = $this->validateSupremmDbstatsEntries($db);

        $this->assertArrayHasKey('total', $item);
        $this->assertArrayHasKey('approx_size', $item);
        $this->assertArrayHasKey('last_job', $item);
        $this->assertArrayHasKey('last_job_tm', $item);
    }

    // fetch aggregates stats
    public function testFetchDbstatsAggregates($db = 'aggregates') {

        $item = $this->validateSupremmDbstatsEntries($db);

        $this->assertArrayHasKey('approx_size', $item);
        $this->assertArrayHasKey('last_day', $item);
        $this->assertArrayHasKey('last_day_tm', $item);
    }
}
