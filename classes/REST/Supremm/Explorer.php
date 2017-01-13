<?php

namespace Supremm;

use \Exception;
use \CCR\DB;

require_once("Log.php");


function formatDataSize($d)
{
    if ($d > 1024 * 1024 * 1024) {
        return sprintf("%.2f GB", $d / (1024 * 1024 * 1024));
    } elseif ($d > 1024 * 1024) {
        return sprintf("%.2f MB", $d / (1024 * 1024));
    } elseif ($d > 1024) {
        return sprintf("%.2f kB", $d / 1024);
    } else {
        return sprintf("%.2f B", $d);
    }
}


class Explorer extends \aRestAction
{
    protected $logger = null;


    // --------------------------------------------------------------------------------
    // @see aRestAction::__call()
    // --------------------------------------------------------------------------------

    public function __call($target, $arguments)
    {
        // Verify that the target method exists and call it.

        $method = $target . ucfirst($this->_operation);

        if (!method_exists($this, $method)) {
            if ($this->_operation == 'Help') {
                // The help method for this action does not exist, so attempt to generate a response
                // using that action's Documentation() method

                $documentationMethod = $target . 'Documentation';

                if (!method_exists($this, $documentationMethod)) {
                    throw new Exception("Help cannot be found for action '$target'");
                }

                return $this->$documentationMethod()->getRESTResponse();
            } else {
                throw new Exception("Unknown action '$target' in category '" . strtolower(__CLASS__) . "'");
            }
        }  // if ( ! method_exists($this, $method) )

        return $this->$method($arguments);
    } // __call()

    // --------------------------------------------------------------------------------

    public function __construct($request)
    {
        parent::__construct($request);

        // Initialize the logger

        $params = $this->_parseRestArguments("");
        $verbose = (isset($params['debug']) && $params['debug']);
        $maxLogLevel = ($verbose ? PEAR_LOG_DEBUG : PEAR_LOG_INFO);
        $logConf = array('mode' => 0644);
        $logfile = LOG_DIR . "/" . \xd_utilities\getConfiguration('datawarehouse', 'rest_logfile');
        $this->logger = \Log::factory('file', $logfile, 'Supremm', $logConf, $maxLogLevel);
    }  // __construct

    // --------------------------------------------------------------------------------
    // @see aRestAction::factory()
    // --------------------------------------------------------------------------------

    public static function factory($request)
    {
        return new Explorer($request);
    }

    private function resourcesAction()
    {
        $user = $this->_authenticateUser();
        if ($user->getUserType() != \XDUser::INTERNAL_USER) {
            throw new \Exception("Access denied", 401);
        }

        $pdo = DB::factory('database');
        $query = "SELECT r.code as name, jj.resource_id as id FROM modw.resourcefact r, (SELECT DISTINCT j.resource_id as resource_id FROM modw_supremm.job j) jj WHERE jj.resource_id = r.id";
        $res = $pdo->query($query);
        return array("data" => $res);
    }

    private function resourcesDocumentation()
    {
        $doc = new \RestDocumentation();
        $doc->setDescription("Retrieve the list of resources in the SUPReMM realm.");
        $doc->setAuthenticationRequirement(true);
        $doc->addReturnElement("resources", "An array enumerating the available resources in the datawarehouse.");
        return $doc;
    }

    private function dbstatsAction()
    {
        $user = $this->_authenticateUser();
        if ($user->getUserType() != \XDUser::INTERNAL_USER) {
            throw new \Exception("Access denied", 401);
        }

        $params = $this->_parseRestArguments();
        $dbid = isset($params['db_id']) ? $params['db_id'] : null;
        $resourceid = isset($params['resource_id']) ? $params['resource_id'] : null;

        if ($dbid === null || $resourceid === null) {
            throw new \DataWarehouse\Query\Exceptions\BadRequestException();
        }

        switch ($dbid) {
            case "summarydb":
                $s = new \DataWarehouse\Query\SUPREMM\SupremmDbInterface();
                return $s->getdbstats($resourceid);
                break;
            case "accountdb":
                $pdo = DB::factory('database');
                $query = "SELECT count(*) as count, max(end_time_ts) as recent FROM ts_analysis.accountfact WHERE resource_id = :id";
                $res = $pdo->query($query, array("id" => $resourceid));
                $query2 = "SELECT count(*) as count FROM ts_analysis.accountfact WHERE resource_id = :id AND process_version > 0";
                $res2 = $pdo->query($query2, array("id" => $resourceid));
                $query3 = "SELECT (data_length + index_length) / table_rows as ave_rowsize FROM information_schema.tables WHERE table_schema = 'ts_analysis' and table_name = 'accountfact'";
                $res3 = $pdo->query($query3);

                $result = array(
                    "resource_id" => $resourceid,
                    "data" => array(
                        "last_job" => $this->time2str($res[0]['recent']),
                        "last_job_tm" => gmdate('c', $res[0]['recent']),
                        "total" => $res[0]['count'],
                        "processed" => $res2[0]['count'],
                        "pending" => $res[0]['count'] - $res2[0]['count'],
                        "approx_size" => formatDataSize($res3[0]['ave_rowsize'] * $res[0]['count'])
                    )
                );
                return $result;
                break;
            case "jobfact":
                $pdo = DB::factory('database');
                $query = "SELECT count(*) as count, max(end_time_ts) as recent FROM modw_supremm.job WHERE resource_id = :id";
                $res = $pdo->query($query, array("id" => $resourceid));

                $query2 = "SELECT SUM(data_length + index_length) total_storage FROM information_schema.TABLES WHERE table_schema = 'modw_supremm'";
                $res1 = $pdo->query($query2);

                $query3 = "SELECT count(*) as count FROM modw_supremm.job";
                $res2 = $pdo->query($query3);

                $approx_storage = $res1[0]['total_storage'] * 1.0 * $res[0]['count'] / $res2[0]['count'];

                $result = array("resource_id" => $resourceid, "data" => array(
                    "last_job" => $this->time2str($res[0]['recent']),
                    "last_job_tm" => gmdate('c', $res[0]['recent']),
                    "total" => $res[0]['count'],
                    "approx_size" => formatDataSize($approx_storage)
                ));
                return $result;
                break;
            case "aggregates":
                $pdo = DB::factory('database');
                $query = "SELECT d.day_end_ts as recent FROM modw.days d WHERE d.id = (SELECT max(day_id) FROM modw_aggregates.supremmfact_by_day WHERE resource_id = :id)";
                $res = $pdo->query($query, array("id" => $resourceid));

                $sizequery = "SELECT (SELECT count(*) FROM modw_aggregates.supremmfact_by_day) as totalrows, (SELECT count(*) FROM modw_aggregates.supremmfact_by_day WHERE resource_id = :id) as resrows, (SELECT SUM(data_length + index_length) FROM information_schema.TABLES WHERE table_schema = 'modw_aggregates' AND table_name in ('supremmfact_by_day_joblist', 'supremmfact_by_day', 'supremmfact_by_month', 'supremmfact_by_quarter', 'supremmfact_by_year'))  as datasize";
                $sizeres = $pdo->query($sizequery, array("id" => $resourceid));

                $result = array("resource_id" => $resourceid, "data" => array(
                    "last_day" => $this->time2str($res[0]['recent']),
                    "last_day_tm" => gmdate('c', $res[0]['recent']),
                    "approx_size" => formatDataSize($sizeres[0]['resrows'] * $sizeres[0]['datasize'] / $sizeres[0]['totalrows'])
                ));
                return $result;
                break;
        }
        return null;
    }

    // TODO - move this function and all of the sql query stuff to a dedicated class.
    private function time2str($ts)
    {
        $diff = time() - $ts;
        if ($diff == 0) {
            return 'now';
        } elseif ($diff > 0) {
            $day_diff = floor($diff / 86400);
            if ($day_diff == 0) {
                if ($diff < 60) {
                    return 'just now';
                }
                if ($diff < 120) {
                    return '1 minute ago';
                }
                if ($diff < 3600) {
                    return floor($diff / 60) . ' minutes ago';
                }
                if ($diff < 7200) {
                    return '1 hour ago';
                }
                if ($diff < 86400) {
                    return floor($diff / 3600) . ' hours ago';
                }
            }
            if ($day_diff == 1) {
                return floor($diff / 3600) . ' hours ago';
            }
            if ($day_diff < 7) {
                return $day_diff . ' days ago';
            }
            if ($day_diff < 31) {
                return ceil($day_diff / 7) . ' weeks ago';
            }
            if ($day_diff < 60) {
                return 'last month';
            }
            return date('F Y', $ts);
        } else {
            $diff = abs($diff);
            $day_diff = floor($diff / 86400);
            if ($day_diff == 0) {
                if ($diff < 120) {
                    return 'in a minute';
                }
                if ($diff < 3600) {
                    return 'in ' . floor($diff / 60) . ' minutes';
                }
                if ($diff < 7200) {
                    return 'in an hour';
                }
                if ($diff < 86400) {
                    return 'in ' . floor($diff / 3600) . ' hours';
                }
            }
            if ($day_diff == 1) {
                return 'Tomorrow';
            }
            if ($day_diff < 4) {
                return date('l', $ts);
            }
            if ($day_diff < 7 + (7 - date('w'))) {
                return 'next week';
            }
            if (ceil($day_diff / 7) < 4) {
                return 'in ' . ceil($day_diff / 7) . ' weeks';
            }
            if (date('n', $ts) == date('n') + 1) {
                return 'next month';
            }
            return date('F Y', $ts);
        }
    }

    private function dbstatsDocumentation()
    {
        $doc = new \RestDocumentation();
        $doc->setDescription("Retrieve statistics for a database in the SUPReMM data processing workflow.");
        $doc->setAuthenticationRequirement(false);
        $doc->addArgument("resource_id", "A valid resource id.", true);
        $doc->addArgument("db_id", "A valid database identifier.", true);
        $doc->addReturnElement("data", "An array with the record statistics.");
        $doc->addReturnElement("resource_id", "The resource_id that was requested.");
        return $doc;
    }
}  // class Explorer
