<?php

namespace DataWarehouse\Query\SUPREMM;

class SupremmDbInterface {
    private $etl_version = null;
    private $resource_rmap = null;

    public function __construct() {
        $config = \Xdmod\Config::factory();

        $sconf = $config['supremmconfig'];
        $this->etl_version = $sconf['etlversion'];

        $resources = $config['supremm_resources']['resources'];

        foreach($resources as $sresource) {

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

        $resconf =& $this->resource_rmap[$resource_id];

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

        $connection = new \MongoClient($mongouri);

        $resconf['handle'] =& $connection->selectDB($dbSettings['db']);

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

        $resconf =& $this->getResourceConfig($resource_id);

        if( $resconf === null) {
            return null;
        }

        return $resconf['handle']->schema->findOne( array( "_id" => "summary-" . $summary_version ) );
    }

    public function getdbstats($resource_id) {

        $resconf =& $this->getResourceConfig($resource_id);

        if( $resconf === null) {
            return null;
        }

        $stats = $resconf['handle']->command( array("collStats" => $resconf['collection'] ) );

        $tmp = array();
        $tmp["total"] = $stats["count"];
        $tmp["avgObjSize"] = $this->formatDataSize($stats["avgObjSize"]);
        $tmp["storageSize"] = $this->formatDataSize($stats["storageSize"]);
        $tmp["size"] = $this->formatDataSize($stats["size"]);

        $collection = $resconf['handle']->selectCollection( $resconf['collection'] );

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
