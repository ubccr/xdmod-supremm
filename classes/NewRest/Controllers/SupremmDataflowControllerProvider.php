<?php

namespace NewRest\Controllers;

use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Silex\ControllerCollection;
use \Symfony\Component\HttpFoundation\JsonResponse;

use XDUser;
use \CCR\DB;

require_once("Log.php");

class SupremmDataflowControllerProvider extends BaseControllerProvider
{
    /**
     * This function is responsible for the setting up of any routes that this
     * ControllerProvider is going to be managing. It *must* be overridden by
     * a child class.
     *
     * @param Application $app
     * @param ControllerCollection $controller
     * @return null
     */
    public function setupRoutes(Application $app, ControllerCollection $controller)
    {
        $root = $this->prefix;
        $base = get_class($this);

        // QUERY ROUTES
        $controller
            ->get("$root/resources", "$base::getResources");

        $controller
            ->get("$root/dbstats", "$base::getDbstats");

    } // function setupRoutes

    /**
     * Retrieve list of all available Supremm resources.
     *
     * @param Request $request
     * @param Application $app
     * @return JsonResponse
     */
    public function getResources(Request $request, Application $app)
    {
        $action = __FUNCTION__;
        $payload = array(
            'success' => false,
            'action' => $action,
        );

        $user = $this->authorize($request, array(ROLE_ID_MANAGER));

        $pdo = DB::factory('database');
        $query = "SELECT r.code as name, jj.resource_id as id FROM modw.resourcefact r, (SELECT DISTINCT j.resource_id as resource_id FROM modw_supremm.job j) jj WHERE jj.resource_id = r.id";
        $data = $pdo->query($query);

        $payload['data'] = $data;
        $payload['success'] = true;

        return $app->json($payload);
    } // function getResources

    /**
     * Retrieve dbstats describing specified supremm resource and db.
     *
     * @param Request $request
     * @param Application $app
     * @return JsonResponse
     */
    public function getDbstats(Request $request, Application $app)
    {
        $resourceid = $this->getIntParam($request, 'resource_id');
        $dbid = $this->getStringParam($request, 'db_id');

        $action = __FUNCTION__;
        $payload = array(
            'success' => false,
            'action' => $action,
            'message' => 'success'
        );

        $user = $this->authorize($request, array(ROLE_ID_MANAGER));
        $data = $this->queryDbstats($dbid, $resourceid);

        if (isset($data)) {
            $payload['data'] = $data;
            $payload['success'] = true;
        } else {
            throw new NotFoundHttpException("There was no result found for the given database ($dbid) and resource ($resourceid)");
        }

        return $app->json($payload);
    } // function getDbstats

    /**
     * Query supremm database for most recent data flow information.
     *
     * @param string $dbid
     * @param int $resourceid
     * @return array of data flow information
     */
    private function queryDbstats($dbid, $resourceid)
    {
        if ($dbid === null || $resourceid === null) {
            throw new BadRequestHttpException("Null db id or resource id was supplied");
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
                        "approx_size" => $this->formatDataSize($res3[0]['ave_rowsize'] * $res[0]['count'])
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

                $result = array(
                    "resource_id" => $resourceid,
                    "data" => array(
                        "last_job" => $this->time2str($res[0]['recent']),
                        "last_job_tm" => gmdate('c', $res[0]['recent']),
                        "total" => $res[0]['count'],
                        "approx_size" => $this->formatDataSize($approx_storage)
                    )
                );

                return $result;
                break;

            case "aggregates":
                $pdo = DB::factory('database');
                $query = "SELECT d.day_end_ts as recent FROM modw.days d WHERE d.id = (SELECT max(day_id) FROM modw_aggregates.supremmfact_by_day WHERE resource_id = :id)";
                $res = $pdo->query($query, array("id" => $resourceid));

                $sizequery = "SELECT (SELECT count(*) FROM modw_aggregates.supremmfact_by_day) as totalrows, (SELECT count(*) FROM modw_aggregates.supremmfact_by_day WHERE resource_id = :id) as resrows, (SELECT SUM(data_length + index_length) FROM information_schema.TABLES WHERE table_schema = 'modw_aggregates' AND table_name in ('supremmfact_by_day_joblist', 'supremmfact_by_day', 'supremmfact_by_month', 'supremmfact_by_quarter', 'supremmfact_by_year'))  as datasize";
                $sizeres = $pdo->query($sizequery, array("id" => $resourceid));

                $result = array(
                    "resource_id" => $resourceid,
                    "data" => array(
                        "last_day" => $this->time2str($res[0]['recent']),
                        "last_day_tm" => gmdate('c', $res[0]['recent']),
                        "approx_size" => $this->formatDataSize($sizeres[0]['resrows'] * $sizeres[0]['datasize'] / $sizeres[0]['totalrows'])
                    )
                );

                return $result;
                break;

            default:
                throw new NotFoundHttpException("There was no result found for the given database ($dbid)");
                break;
        }
        return null;
    } // function queryDbstats

    /**
     * Format and label timestamp appropriately for report output (minutes, hours, weeks, or months).
     *
     * @param timestamp $ts
     * @return mixed
     */
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
    } // function time2str()

    /**
     * Format and label data sizes appropriately for report output (as GB, MB, kB, or B).
     *
     * @param numeric $d
     * @return mixed
     */
    private function formatDataSize($d)
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
    } // function formatDataSize
} // class SupremmDataflowControllerProvider
