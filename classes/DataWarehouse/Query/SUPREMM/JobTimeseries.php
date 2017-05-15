<?php
namespace DataWarehouse\Query\SUPREMM;

/*
 * @author Joseph P White <jpwhite4@buffalo.edu>
 *
 * Helper class that knows how to parse the per-job timeseries summary data
 */

class JobTimeseries
{
    public function __construct( $doc ) {
        $this->_doc = $doc;
    }

    public function get($metric, $nodeid, $devid) {
        $version = $this->_doc['version'];

        $ret = null;

        switch($version)
        {
            case 3:
                $ret = $this->getdata_v3($metric, $nodeid, $devid);
                break;
            case 4:
                $ret = $this->getdata($metric, $nodeid, $devid);
                break;
            default:
                error_log("Unsupported timeseries data version \"" . print_r($version, true) . "\"" );
                break;
        }

        if($ret !== null ) {
            if( count($ret['series']) == 0 ) {
                $ret = null;
            }
        }

        $this->setschema($ret, $metric, $nodeid, $devid);

        return $ret;
    }

    private function setschema(&$ret, $metric, $nodeid, $devid)
    {
        if($ret === null) {
            return;
        }

        $ret['schema'] = $this->_doc['schema']['metrics'][$metric];

        if($nodeid !== null) {
            if($devid !== null) {
                $ret['schema']['description'] .= " for " . $ret['series'][0]['name'] . " on host " . $this->_doc['hosts'][$nodeid];
            }
            else {
                $ret['schema']['description'] .= " for host " . $this->_doc['hosts'][$nodeid];
            }
        }

        return;
    }

    private function ziptimes($timearray, $dataarray)
    {
        $outdata = array();
        foreach($timearray as $k => $v)
        {
            if( is_array($dataarray[$k]) ) {
                $outdata[] = array(
                    "x" => $v * 1000.0,
                    "y" => $dataarray[$k][0],
                    "nodeid" => $dataarray[$k][1],
                    "qtip" => $this->_doc['hosts'][$dataarray[$k][1]] );
            } else {
                $outdata[] = array( "x" => $v * 1000.0, "y" => $dataarray[$k] );
            }
        }
        return $outdata;
    }

    private function ziparea($timearray, $minarray, $maxarray)
    {
        $outdata = array();
        foreach($timearray as $k => $v)
        {
            $outdata[] = array( $v * 1000.0, $minarray[$k][0], $maxarray[$k][0] );
        }
        return $outdata;
    }

    private function getdata($metric, $nodeidx, $devid) 
    {
        if( !isset( $this->_doc[$metric] ) ) {
            return null;
        }

        if (isset($this->_doc[$metric]['error'])) {
            return null;
        }

        $ret = array( "series" => array() );

        if( $nodeidx === null )
        {
            // Job overview data (either the envelope or the node-overview

            if( isset( $this->_doc[$metric]['max'] ) )
            {
                // This is the job envelope data
                $ret['series'][] = array( "name" => "Range", "type" => "arearange", "data" => $this->ziparea($this->_doc[$metric]['times'], $this->_doc[$metric]['min'], $this->_doc[$metric]['max'] )  );

                $ret['series'][] = array( "name" => "Maximum", "dtype" => "index", "index" => "nodeid", "data" => $this->ziptimes( $this->_doc[$metric]['times'], $this->_doc[$metric]['max'] ) );
                $ret['series'][] = array( "name" => "Minimum", "dtype" => "index", "index" => "nodeid", "data" => $this->ziptimes( $this->_doc[$metric]['times'], $this->_doc[$metric]['min'] ) );
                $ret['series'][] = array( "name" => "Median",  "dtype" => "index", "index" => "nodeid", "data" => $this->ziptimes( $this->_doc[$metric]['times'], $this->_doc[$metric]['med'] ) );

            }
            else
            {
                foreach( $this->_doc[$metric]['hosts'] as $hostidx => $hostdata ) 
                {
                    $ret['series'][] = array( 
                        "name" => $this->_doc['hosts']["$hostidx"] , 
                        "dtype" => "nodeid", 
                        "nodeid" => $hostidx, 
                        "data" => $this->ziptimes( $this->_doc[$metric]['times'], $this->_doc[$metric]['hosts'][$hostidx]['all'] )
                    );
                }
            }
        }
        else {

            // Node has been specified
            if( !isset($this->_doc[$metric]['hosts'][$nodeidx]) ) {
                return null;
            }

            if( $devid === null ) {
                // Show all the devices or the overview (depending on whether the device data is available

                if(isset($this->_doc[$metric]['hosts'][$nodeidx]['dev']) ) {
                    foreach($this->_doc[$metric]['hosts'][$nodeidx]['dev'] as $devidx => $devdata) 
                    {
                        $ret['series'][] = array( 
                            "name" => $this->_doc[$metric]['hosts'][$nodeidx]['names'][$devidx],
                            "dtype" => "cpuid", 
                            "cpuid" => $devidx, 
                            "data" => $this->ziptimes( $this->_doc[$metric]['times'], $devdata )
                        );
                    }
                }
                else {
                    $ret['series'][] = array( 
                        "name" => $this->_doc['hosts'][$nodeidx] , 
                        "dtype" => "nodeid", 
                        "nodeid" => $nodeidx, 
                        "data" => $this->ziptimes( $this->_doc[$metric]['times'], $this->_doc[$metric]['hosts'][$nodeidx]['all'] ) 
                    );
                }
            }
            else
            {
                // Both node and dev index specified
                if(!isset($this->_doc[$metric]['hosts'][$nodeidx]['dev'][$devid]) ) {
                    return null;
                }

                $ret['series'][] = array(
                    "name" => $this->_doc[$metric]['hosts'][$nodeidx]['names'][$devid],
                    "dtype" => "cpuid",
                    "cpuid" => $devid,
                    "data" => $this->ziptimes( $this->_doc[$metric]['times'], $this->_doc[$metric]['hosts'][$nodeidx]['dev'][$devid])
                );
            }
        }
        return $ret;
    }

    private function getdata_v3($metric, $nodeidx, $cpuidx) 
    {
        if( !isset( $this->_doc['nodebased'][$metric] ) ) {
            return null;
        }

        $ret = array( "series" => array() );

        if( $nodeidx !== null && isset($this->_doc['devicebased'][$metric][$nodeidx]) ) {

            /* Stitch the data together to create an array of time,value pairs for
             * each host */

            foreach( $this->_doc["devicebased"][$metric][$nodeidx] as $devidx => $devdata ) {

                if($cpuidx !== null) {
                    if( $devidx != "cpu$cpuidx" ) {
                        // Skip
                        continue;
                    }
                }
                $devid = substr($devidx, 3);

                $x = array( "name" => $devidx, "dtype" => "cpuid", "cpuid" => $devid, "data" => array() );

                foreach( array_keys( $devdata ) as $key) {
                    $x['data'][] = array( $this->_doc['times'][$nodeidx][$key] * 1000, $devdata[$key] );
                }
                $ret['series'][] = $x;
            }
        }
        else
        {
            /* Stitch the data together to create an array of time,value pairs for
             * each host */

            foreach( $this->_doc['hosts'] as $hostidx => $host ) {

                if($nodeidx !== null) {
                    if($nodeidx != $hostidx) {
                        // Skip
                        continue;
                    }
                }

                $x = array( "name" => $host, "dtype" => "nodeid", "nodeid" => $hostidx, "data" => array() );

                if( isset( $this->_doc['error'][$hostidx]) ) {
                    continue;
                }

                if( isset( $this->_doc['nodebased'][$metric][$hostidx]['error'] ) ) {
                    continue;
                }
                foreach( array_keys( $this->_doc['nodebased'][$metric][$hostidx] ) as $key) {
                    $x['data'][] = array( $this->_doc['times'][$hostidx][$key] * 1000, $this->_doc['nodebased'][$metric][$hostidx][$key] );
                }
                $ret['series'][] = $x;
            }
        }

        return $ret;
    }
}

?>
