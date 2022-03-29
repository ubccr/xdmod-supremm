<?php

namespace DataWarehouse\Query\SUPREMM;

use Configuration\XdmodConfiguration;

class SupremmDbInterface {
    private $etl_version = null;
    private $resource_rmap = null;

    private $mongoDriver;

    public function __construct() {
        $sconf = XdmodConfiguration::assocArrayFactory('supremmconfig.json', CONFIG_DIR);
        $this->etl_version = $sconf['etlversion'];

        $resourcesConf = XdmodConfiguration::assocArrayFactory(
            'supremm_resources.json',
            CONFIG_DIR
        );
        $resources = $resourcesConf['resources'];

        foreach($resources as $sresource) {

            if (isset($sresource['enabled'])) {
                if ($sresource['enabled'] === false) {
                    continue;
                }
            }

            $dbsection = 'jobsummarydb';
            if(isset($sresource['db'])) {
                $dbsection = $sresource['db'];
            }
            $sresource['database'] = \xd_utilities\getConfigurationSection($dbsection);

            if (!isset($sresource['collection']) ) {
                $sresource['collection'] = 'resource_' . $sresource['resource_id'];
            }

            $this->resource_rmap[$sresource['resource_id']] = $sresource;
        }

        if (class_exists('\MongoClient')) {
            $this->mongoDriver = 'mongo';
        } elseif (class_exists('\MongoDB\Client')) {
            $this->mongoDriver = 'mongodb';
        }
    }

    /**
     * Update the etl ingest version number for all documents in mongo for a
     * resource.
     */
    public function updateEtlVersion($resource_id, $new_etl_version) {
        $resourceConfig = $this->getResourceConfig($resource_id);
        $resconf = $resourceConfig;

        if( $resconf === null) {
            return null;
        }

        $collection = $this->getCollection($resconf['handle'], $resconf['collection']);

        $result = $this->update($collection,
            array('processed.' . $this->getEtlUid() . '.version' => $this->etl_version),
            array('$set' => array('processed.' . $this->getEtlUid() . '.version' => $new_etl_version)),
            array('multiple' => true, 'socketTimeoutMS' => -1, 'wTimeoutMS' => -1)
        );

        return $result;
    }

    /** get the list of configured resources
     * @return array list of resource ids of the configured resources
     */
    public function getResources() {
        return array_keys($this->resource_rmap);
    }

    public function getResourceConfig($resource_id) {

        if( ! array_key_exists($resource_id, $this->resource_rmap) ) {
            return null;
        }

        $resconf = $this->resource_rmap[$resource_id];

        if( !isset($resconf['handle']) ) {
            $this->getMongoConnection($resconf);
        }

        return $resconf;
    }

    private function getMongoConnection(&$resconf) {

        $dbSettings = $resconf['database'];

        if(strtolower($dbSettings['db_engine']) != 'mongodb') {
            throw new \Exception("Unsupported SUPReMM database " . $dbSettings['db_engine']);
        }

        if(isset($dbSettings['uri'])) {
            $mongouri = $dbSettings['uri'];
        } else {
            $mongouri = "mongodb://" . $dbSettings['host'] . ":" . $dbSettings['port'];
        }

        $resconf['handle'] = $this->getDB($mongouri, $dbSettings['db']);

        return $resconf;
    }

    private function formatDataSize($d) {
        if( $d > 1024*1024*1024 ) {
            return sprintf("%.2f GB", $d/(1024*1024*1024) );
        } else if ( $d > 1024*1024 ) {
            return sprintf("%.2f MB", $d/(1024*1024) );
        } else if ( $d > 1024 ) {
            return sprintf("%.2f kB", $d/1024 );
        } else {
            return sprintf("%.2f B", $d );
        }
    }

    public function getsummaryschema($resource_id, $summary_version) {
        $resourceConfig = $this->getResourceConfig($resource_id);
        $resconf = $resourceConfig;

        if( $resconf === null) {
            return null;
        }

        return $resconf['handle']->schema->findOne( array( "_id" => "summary-" . $summary_version ) );
    }

    public function getdbstats($resource_id) {
        $resourceConfig = $this->getResourceConfig($resource_id);
        $resconf = $resourceConfig;

        if( $resconf === null) {
            return null;
        }
        $db = $resconf['handle'];
        $stats = $this->getColumnStats($db, $resconf['collection']);
        $tmp = array();
        $tmp["total"] = $stats["count"];
        $tmp["avgObjSize"] = $this->formatDataSize($stats["avgObjSize"]);
        $tmp["storageSize"] = $this->formatDataSize($stats["storageSize"]);
        $tmp["size"] = $this->formatDataSize($stats["size"]);

        $collection = $this->getCollection($db, $resconf['collection']);

        $processed = $collection->count( array( "processed." . $this->getEtlUid() . ".version" => $this->etl_version ) );
        $tmp["processed"] = $processed;
        $tmp["pending"] = $stats["count"] - $processed;

        $res = array();
        $res['data'] = $tmp;

        return $res;
    }

    private function getEtlUid()
    {
        $pdo = \CCR\DB::factory('database');
        $res = $pdo->query("SELECT uuid FROM modw_supremm.etl_uid WHERE NOW() BETWEEN valid_from AND valid_to ORDER BY valid_from DESC LIMIT 1");
        return $res[0]['uuid'];
    }

    public function getRegex($regex)
    {
        switch ($this->mongoDriver) {
            case 'mongo':
                return new \MongoRegex($regex);
            case 'mongodb':
            default:
                return new \MongoDB\BSON\Regex($regex);
        }
    }

    /**
     * @param $handle
     * @param $collectionName
     * @return mixed
     */
    public function getCollection($handle, $collectionName) {
        switch ($this->mongoDriver) {
            case 'mongo':
                return $handle->selectCollection($collectionName);
            case 'mongodb':
            default:
                return $handle->$collectionName;
        }
    }

    public function update($collection, $filter, $data, $options)
    {
        switch ($this->mongoDriver) {
            case 'mongo':
                return $collection->update(
                    $filter,
                    $data,
                    $options
                );
            case 'mongodb':
            default:
                return $collection->updateOne(
                    $filter,
                    $data,
                    $options
                );
        }
    }

    private function getDB($uri, $dbName)
    {
        switch ($this->mongoDriver) {
            case 'mongo':
                $client = new \MongoClient($uri);
                return $client->selectDB($dbName);
            case 'mongodb':
            default:
                $client = new \MongoDB\Client($uri);
                return $client->$dbName;
        }
    }

    private function getColumnStats($db, $collectionName)
    {
        $command = array('collStats' => $collectionName);

        switch ($this->mongoDriver) {
            case 'mongo':
                return $db->command($command);
            case 'mongodb':
            default:
                $results = $db->command($command);
                return $results->toArray();
        }
    }
}
?>
