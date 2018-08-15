<?php

namespace DataWarehouse\Query\SUPREMM;

function comparenodeid($a, $b)
{
    if ($a['nodeid'] == $b['nodeid']) {
        return 0;
    }
    return $a['nodeid'] < $b['nodeid'] ? -1 : 1;
}

function comparecpuid($a, $b)
{
    if ($a['cpuid'] == $b['cpuid']) {
        return 0;
    }
    return $a['cpuid'] < $b['cpuid'] ? -1 : 1;
}

class JobMetadata
{
    private $supremmDbInterface = null;

    public function __construct()
    {

        $this->supremmDbInterface = new \DataWarehouse\Query\SUPREMM\SupremmDbInterface();
    }

    public function getJobMetadata($user, $jobid)
    {

        // TODO This implementation performs multiple queries to generate the list of
        // data available for a job. This information is known at job ingest time and
        // should be stored in a table so that this code can be a simple database lookup
        $job = $this->lookupJob($user, $jobid);
        if ($job == null) {
            return array();
        }

        $available_data = array( \DataWarehouse\Query\RawQueryTypes::ACCOUNTING => true );

        $scriptquery = new \DataWarehouse\Query\SUPREMM\JobDataset(
            array(new \DataWarehouse\Query\Model\Parameter("_id", "=", $jobid)),
            "jobscript"
        );

        if ($scriptquery->getCount() > 0) {
            $available_data[\DataWarehouse\Query\RawQueryTypes::BATCH_SCRIPT] = true;
        }

        if ($job['cpu_user'] !== null) {
            $available_data[\DataWarehouse\Query\RawQueryTypes::NORMALIZED_METRICS] = true;
        }

        if ($job['shared'] == 1) {
            $available_data[\DataWarehouse\Query\RawQueryTypes::PEERS] = true;
        }

        // Always report that analytics are present; the data endpoint will
        // report the error reason for any that are missing.
        $available_data[\DataWarehouse\Query\RawQueryTypes::ANALYTICS] = true;

        $summary = $this->getjobdata($job['resource_id'], $job['local_job_id'], $job['end_time_ts']);

        if ($summary !== null) {
            if (isset($summary['cpu'])) {
                $available_data[\DataWarehouse\Query\RawQueryTypes::DETAILED_METRICS] = true;
            }
            if (isset($summary['lariat']) || isset($summary['procDump'])) {
                $available_data[\DataWarehouse\Query\RawQueryTypes::EXECUTABLE] = true;
            }

            $timeseries = $this->getrawdata($job['resource_id'], $job['local_job_id'], $job['end_time_ts'], "cpuuser");

            if ($timeseries !== null) {
                $available_data[\DataWarehouse\Query\RawQueryTypes::TIMESERIES_METRICS] = true;
            }
        }

        return $available_data;
    }

    /**
     * Merge two arrays but allow a wildcard key in the second array
     * to match all keys at the same level in the first array.
     *
     * @param array &$array1 The first array
     * @param array &$array2 The second array, which may have wildcard keys
     *
     * @return array The merged array
     */
    private function arrayMergeRecursiveWildcard(array $array1, array $array2)
    {
        $merged = $array1;

        foreach ($array2 as $key => $value) {
            if (is_array($value) && array_key_exists('*', $value)) {
                if (isset($merged[$key]) && is_array($merged[$key])) {
                    foreach ($merged[$key] as $mkey => $mvalue) {
                        if ($mkey === "error") {
                            break;
                        }
                        $merged[$key][$mkey] = $this->arrayMergeRecursiveWildcard($mvalue, $value['*']);
                    }
                }
            } elseif (is_array($value) && isset($merged[$key]) && is_array($merged[$key])) {
                $merged[$key] = $this->arrayMergeRecursiveWildcard($merged[$key], $value);
            } else {
                $merged[$key] = $value;
            }
        }
        return $merged;
    }

    public function getJobSummary($user, $jobid)
    {
        $job = $this->lookupJob($user, $jobid);
        if ($job == null) {
            return array();
        }
        $jobdata = $this->getjobdata($job['resource_id'], $job['local_job_id'], $job['end_time_ts']);
        $jversion = isset($jobdata['summary_version']) ? $jobdata['summary_version'] : $jobdata['summarization']['version'];

        $schema = $this->getsummaryschema($job['resource_id'], $jversion);
        if ($schema !== null) {
            return $this->arrayMergeRecursiveWildcard($jobdata, $schema['definitions']);
        } else {
            return $jobdata;
        }
    }

    private function redactLariat($user, $lariatdata)
    {
        if ($user->getUserType() == DEMO_USER_TYPE) {
            $username = $lariatdata['user'];
            foreach ($lariatdata as &$datum) {
                if (is_string($datum) && false !== strpos($datum, $username)) {
                    $datum = "&lt;REDACTED&gt;";
                }
            }
            return $lariatdata;
        } else {
            return $lariatdata;
        }
    }

    public function getJobExecutableInfo($user, $jobid)
    {
        $job = $this->lookupJob($user, $jobid);
        if ($job == null) {
            return null;
        }
        $jobdata = $this->getjobdata($job['resource_id'], $job['local_job_id'], $job['end_time_ts']);
        if (isset($jobdata['lariat'])) {
            return $this->redactLariat($user, $jobdata['lariat']);
        } elseif (isset($jobdata['procDump'])) {
            return $jobdata['procDump'];
        }
        return array();
    }

    public function getJobTimeseriesMetaData($user, $jobid)
    {

        // TODO The next three functions just parse the data from the db in order to work
        // out what data is available.  I suspect it is easier to generate this at job summary
        // time and store it for quick retreival (see also TODO above).

        $job = $this->lookupJob($user, $jobid);
        if ($job == null) {
            return array();
        }
        $timeseries = $this->gettimeseries($job['resource_id'], $job['local_job_id'], $job['end_time_ts']);

        $result = array();

        if ($timeseries['version'] == 4) {
            foreach ($timeseries['schema']['metrics'] as $metricname => $metricdesc) {
                if (isset($timeseries[$metricname]) && !isset($timeseries[$metricname]['error'])) {
                    $result[] = array( "tsid" => $metricname, "text" => $metricdesc['description'], "leaf" => false );
                }
            }
        } else {
            if (isset($timeseries['nodebased'])) {
                foreach ($timeseries['nodebased'] as $name => $data) {
                    $hasData = false;
                    foreach ($data as $devname => $devdata) {
                        if (!isset($devdata['error']) && count($devdata) > 0) {
                            $hasData = true;
                        }
                    }
                    if ($hasData) {
                        $result[] = array( "tsid" => $name, "text" => $timeseries['schema']['metrics'][$name]['description'], "leaf" => false );
                    }
                }
            }
        }
        return $result;
    }

    public function getJobTimeseriesMetricMeta($user, $jobid, $metric)
    {

        $job = $this->lookupJob($user, $jobid);
        if ($job == null) {
            return array();
        }
        $timeseries = $this->gettimeseries($job['resource_id'], $job['local_job_id'], $job['end_time_ts']);

        $result = array();

        if ($timeseries['version'] == 4) {
            if (isset($timeseries[$metric])) {
                foreach ($timeseries[$metric]['hosts'] as $nodeidx => $nodedata) {
                    if (isset($nodedata['dev'])) {
                        $leaf = false;
                    } else {
                        $leaf = true;
                    }
                    $result[] = array( "nodeid" => $nodeidx, "text" => $timeseries['hosts'][$nodeidx], "leaf" => $leaf);
                }
            }
            usort($result, '\DataWarehouse\Query\SUPREMM\comparenodeid');
        } else {
            if (isset($timeseries['nodebased']) && isset($timeseries['nodebased'][$metric])) {
                foreach ($timeseries['nodebased'][$metric] as $nodeidx => $nodedata) {
                    if (!isset($nodedata['error']) && count($nodedata) > 0) {
                        $leaf = true;
                        if (isset($timeseries['devicebased'][$metric]) && isset($timeseries['devicebased'][$metric][$nodeidx])) {
                            $leaf = false;
                        }
                        $result[] = array( "nodeid" => $nodeidx, "text" => $timeseries['hosts'][$nodeidx], "leaf" => $leaf);
                    }
                }
                usort($result, '\DataWarehouse\Query\SUPREMM\comparenodeid');
            }
        }
        return $result;
    }

    public function getJobTimeseriesMetricNodeMeta($user, $jobid, $metric, $nodeid)
    {

        $job = $this->lookupJob($user, $jobid);
        if ($job == null) {
            return array();
        }
        $timeseries = $this->gettimeseries($job['resource_id'], $job['local_job_id'], $job['end_time_ts']);

        $result = array();

        if ($timeseries['version'] == 4) {
            if (isset($timeseries[$metric]['hosts'][$nodeid]["dev"])) {
                foreach ($timeseries[$metric]['hosts'][$nodeid]["dev"] as $cpuidx => $cpudata) {
                    $result[] = array("cpuid" => $cpuidx, "text" => $timeseries[$metric]['hosts'][$nodeid]["names"][$cpuidx], "leaf" => true);
                }
            }
            usort($result, '\DataWarehouse\Query\SUPREMM\comparecpuid');
        } else {
            if (isset($timeseries['devicebased']) &&
            isset($timeseries['devicebased'][$metric]) &&
            isset($timeseries['devicebased'][$metric][$nodeid]) ) {
                foreach ($timeseries['devicebased'][$metric][$nodeid] as $cpuname => $cpudata) {
                    if (!isset($cpudata['error']) && count($cpudata) > 0) {
                        $cpuidx = substr($cpuname, 3);
                        $result[] = array("cpuid" => $cpuidx, "text" => $cpuname, "leaf" => true);
                    }
                }
                usort($result, '\DataWarehouse\Query\SUPREMM\comparecpuid');
            }
        }
        return $result;
    }

    public function getJobTimeseriesData($user, $jobid, $tsid, $nodeid, $cpuid)
    {

        $job = $this->lookupJob($user, $jobid);
        if ($job == null) {
            return array();
        }

        $filter = array( "error" => 1, "hosts" => 1, "times" => 1, "nodebased.$tsid" => 1, "devicebased.$tsid" => 1, "$tsid" => 1, 'version' => 1 );

        $doc = $this->gettimeseries($job['resource_id'], $job['local_job_id'], $job['end_time_ts'], $filter);

        if ($doc === null) {
            return array();
        }

        $jt = new \DataWarehouse\Query\SUPREMM\JobTimeseries($doc);
        $timeseries =  $jt->get($tsid, $nodeid, $cpuid);

        $timeseries['schema']['timezone'] = $job['timezone'];
        $timeseries['schema']['source'] = $job['resource'] . ' ' . $job['local_job_id'];

        return $timeseries;
    }

    /*
     * Get the local_job_id, end_time, etc for the given job entry in the
     * database. This information is used to lookup the job summary/timeseries
     * data in the document store. (But see the to-do note below).
     */
    private function lookupJob($user, $jobid)
    {
        $params = array(new \DataWarehouse\Query\Model\Parameter("_id", "=", $jobid));

        $query = new \DataWarehouse\Query\SUPREMM\JobDataset($params, "internal");
        $query->setMultipleRoleParameters($user->getAllRoles(), $user);
        $stmt = $query->getRawStatement();

        $job = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        if (count($job) != 1) {
            return null;
        }
        return $job[0];
    }

    private function getsummaryschema($resource_id, $summary_version)
    {

        $resconf =& $this->supremmDbInterface->getResourceConfig($resource_id);

        if ($resconf === null) {
            return null;
        }

        return $resconf['handle']->schema->findOne(array( "_id" => "summary-" . $summary_version ));
    }

    private function gettimeseries($resource_id, $jobid, $end_time_ts, $filter = null)
    {
 
        $resconf =& $this->supremmDbInterface->getResourceConfig($resource_id);

        if ($resconf === null) {
            return null;
        }

        $collection = $resconf['handle']->selectCollection('timeseries-'.$resconf['collection']);
        $query = array( "_id" => new \MongoRegex("/^$jobid-.*$end_time_ts/") );

        if ($filter === null) {
            $doc = $collection->findOne($query);
        } else {
            $doc = $collection->findOne($query, $filter);
        }
        if ($doc == null) {
            return null;
        }
        $schema = $resconf['handle']->schema->findOne(array( "_id" => "timeseries-" . $doc['version'] ));

        $doc['schema'] = $schema;

        return $doc;
    }

    private function getrawdata($resource_id, $jobid, $end_time_ts, $metric, $nodeidx = null)
    {

        $filter = array( "error" => 1, "hosts" => 1, "times" => 1, "nodebased.$metric" => 1, "$metric" => 1, 'version' => 1 );

        $doc = $this->gettimeseries($resource_id, $jobid, $end_time_ts, $filter);

        if ($doc === null) {
            return null;
        }

        $jt = new \DataWarehouse\Query\SUPREMM\JobTimeseries($doc);

        return $jt->get($metric, $nodeidx, null);
    }

    private function getjobdata($resource_id, $jobid, $end_time_ts)
    {

        $resconf =& $this->supremmDbInterface->getResourceConfig($resource_id);

        if ($resconf === null) {
            return null;
        }

        $collection = $resconf['handle']->selectCollection($resconf['collection']);

        $query = array( "_id" => new \MongoRegex("/^$jobid-.*$end_time_ts/") );

        $res = $collection->findOne($query);

        if ($res !== null) {
            ksort($res);
        }
        return $res;
    }
}
