<?php

namespace DataWarehouse\Query\SUPREMM;

use Configuration\XdmodConfiguration;

class SupremmDbInterface {
    private $etl_version = null;
    private $resource_rmap = null;

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

        $collection = $resconf['handle']->$resconf['collection'];

        $result = $collection->updateOne(
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

        $client = new \MongoDB\Client($mongouri);
        $dbName = $dbSettings['db'];
        $db = $client->$dbName;
        $resconf['handle'] = $db;

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
        $stats = $db->command( array("collStats" => $resconf['collection'] ) );
        $data = $stats->toArray();
        $tmp = array();
        $tmp["total"] = $stats["count"];
        $tmp["avgObjSize"] = $this->formatDataSize($data["avgObjSize"]);
        $tmp["storageSize"] = $this->formatDataSize($data["storageSize"]);
        $tmp["size"] = $this->formatDataSize($data["size"]);

        $collectionName = $resconf['collection'];
        $collection = $db->$collectionName;

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
}
?>
