<?php

namespace Rest\Controllers;

use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use DataWarehouse\Query\Exceptions\BadRequestException;
use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Silex\ControllerCollection;
use \Symfony\Component\HttpFoundation\JsonResponse;

use XDUser;
use \CCR\DB;

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

	$controller
            ->get("$root/quality", "$base::getQuality");

    } // function setupRoutes

    /**
     * Retrieve list of all configured SUPReMM realm resources. A resource will be
     * included in the list even if it has no data present.
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

        $s = new \DataWarehouse\Query\SUPREMM\SupremmDbInterface();
        $resources = $s->getResources();

        $pdo = DB::factory('database');
        $query = "SELECT r.code as name, r.id as id FROM modw.resourcefact r WHERE r.id IN (" . implode(',', array_fill(0, count($resources), '?')) . ')';
        $data = $pdo->query($query, $resources);

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

    public function getQuality(Request $request, Application $app) 
    {
        $user = $this->authorize($request, array('mgr'));

        $start = $this->getStringParam($request, 'start');
        $end = $this->getStringParam($request, 'end');
        $type = $this->getStringParam($request, 'type');

        $ymd = "/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/"; // regex for yyyy-mm-dd
        if (!(preg_match($ymd, $start) && preg_match($ymd, $end))) {
                throw new BadRequestException("Please provide dates in YYYY-MM-DD format.");
        }

        if ($start >= $end) {
            throw new BadRequestException("Invalid date range.");
        }

        $params = array(':start' => $start, ':end' => $end);

        $payload = array(
                'success' => true
                );
        $reslist = $this->getreslist($start);

        switch ($type) {

            case "gpu":
                $querystr = $this->gpuqueuequery();
                $payload['result'] = $this->runquery($querystr, $params);
                return $app->json($payload);
                break;

            case "hardware":
                $querystr = $this->getjobsquery('supremm', 'sf.cpibucket_id != 1' , $reslist);
                $payload['result'] = $this->runquery($querystr, $params);
                return $app->json($payload);
                break;

            case "cpu":
                $querystr = $this->getjobsquery('supremm', true, $reslist);
                $payload['result'] = $this->runquery($querystr, $params);
                return $app->json($payload);
                break;

            case "script":
                $querystr = $this->getjobscriptquery();
                $payload['result'] = $this->runquery($querystr, $params);
                return $app->json($payload);
                break;

            case "realms":
                $querystr = $this->getjobsquery('job', false, $reslist);
                $payload['result'] = $this->runquery($querystr, $params);
                return $app->json($payload);
                break;

            default:
                throw new BadRequestException("Unsupported information type. Valid types are: gpu, hardware, cpu, script, or realms.");
                break;
        }
        
        return null;

    } // function getQuality

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

            case 'nodearchives':
                return $this->queryArchiveMetadata($resourceid);
                break;

            case 'accountfact':
                return $this->queryJobTasks($resourceid);
                break;

            default:
                throw new NotFoundHttpException("There was no result found for the given database ($dbid)");
                break;
        }
        return null;
    } // function queryDbstats

    /**
     * query archive metadata tables and return statistics about them.
     * @param resourceid the resource id to return data for.
     * @return array
     */
    private function queryArchiveMetadata($resourceid)
    {
        $pdo = DB::factory('database');

        try {
            $query = 'SELECT COUNT(*) AS node_archives, COUNT(DISTINCT host_id) AS nodes FROM modw_supremm.archives_nodelevel nl, `modw`.`hosts` h WHERE nl.host_id = h.id AND h.resource_id = :id';
            $nodedata = $pdo->query($query, array("id" => $resourceid));
            $query = 'SELECT COUNT(*) AS job_archives, COUNT(DISTINCT local_job_id_raw) AS jobs FROM modw_supremm.archives_joblevel jl, `modw`.`hosts` h WHERE jl.host_id = h.id AND h.resource_id = :id';
            $jobdata = $pdo->query($query, array("id" => $resourceid));

            $data = array(
                'schema version' => 2,
                'node level archives' => $nodedata[0]['node_archives'],
                'node count' => $nodedata[0]['nodes'],
                'job level archives' => $jobdata[0]['job_archives'],
                'distinct jobs' => $jobdata[0]['jobs']
            );
        }
        catch (\PDOException $exc) {
            try {
                $query = 'SELECT COUNT(*) AS node_archives, COUNT(DISTINCT hostid) AS nodes FROM modw_supremm.archive a, `modw`.`hosts` h WHERE a.hostid = h.id AND h.resource_id = :id AND a.jobid IS NULL';
                $nodedata = $pdo->query($query, array("id" => $resourceid));
                $query = 'SELECT COUNT(*) AS job_archives, COUNT(DISTINCT jobid) AS jobs FROM modw_supremm.archive a, `modw`.`hosts` h WHERE a.hostid = h.id AND h.resource_id = :id AND a.jobid IS NOT NULL';
                $jobdata = $pdo->query($query, array("id" => $resourceid));

                $data = array(
                    'schema version' => 1,
                    'node level archives' => $nodedata[0]['node_archives'],
                    'node count' => $nodedata[0]['nodes'],
                    'job level archives' => $jobdata[0]['job_archives'],
                    'distinct jobs' => $jobdata[0]['jobs']
                );
            }
            catch (\PDOException $exc) {
                $data = array('error' => $exc->getCode());
            }
        }

        return array(
            "resource_id" => $resourceid,
            "data" => $data
        );
    }

    /**
     * query modw job_tasks table and return statistics on jobs for a given resource
     * @param resourceid the resource id to return data for.
     * @return array
     */
    private function queryJobTasks($resourceid)
    {
        $pdo = DB::factory('database');
        $query = 'SELECT count(*) as count, min(end_time_ts) as earliest, max(end_time_ts) as recent FROM `modw`.`job_tasks` WHERE resource_id = :id';

        try {
            $res = $pdo->query($query, array('id' => $resourceid));
            $data = array(
                'total jobs' => $res[0]['count'],
                'earliest job' => $this->time2str($res[0]['earliest']),
                'earliest job time' => gmdate('c', $res[0]['earliest']),
                'most recent job' => $this->time2str($res[0]['recent']),
                'recent job time' => gmdate('c', $res[0]['recent']),
            );
        } catch (\PDOException $exc) {
            $data = array('error' => $exc->getCode());
        }

        return array(
            "resource_id" => $resourceid,
            "data" => $data
        );
    }

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

    private function gpuqueuequery()
    {
        return "
        SELECT
            DATE(d.day_start) AS day,
            rf.code as resource,
            ROUND(SUM(CASE sf.gpu0_nv_utilization_bucketid
            WHEN 0 THEN 0
            ELSE sf.node_time
            END) / SUM(sf.node_time) * 100.0) AS percent
        FROM
            modw_aggregates.supremmfact_by_day sf,
            modw.days d,
            modw.resourcefact rf
        WHERE
            sf.queue_id IN ('viz' , 'gpu', 'wjzheng')
            AND sf.day_id = d.id
            AND rf.id = sf.resource_id
            AND d.day_start >= :start
            AND d.day_start <= :end
        GROUP BY 1, 2
        ORDER BY 1, 2
        ";
    } // function gpuqueuequery

    private function getjobscriptquery()
    {
        return "
        SELECT
            DATE(FROM_UNIXTIME(jt.end_time_ts)) as day,
            rf.code as resource,
            COALESCE(ROUND(SUM(CASE WHEN js.tg_job_id IS NULL THEN 0 ELSE 1 END) / SUM(1) * 100.0), 'N/A') as percent
        FROM
            modw.job_tasks jt
            JOIN modw.resourcefact rf ON rf.id = jt.resource_id
            LEFT JOIN modw_supremm.job_scripts js ON jt.job_id = js.tg_job_id
        WHERE
            jt.end_time_ts >= UNIX_TIMESTAMP(:start) AND
            jt.end_time_ts <= UNIX_TIMESTAMP(:end)
            AND jt.local_job_array_index = -1
        GROUP BY 1,2 ORDER BY 1,2;
        ";
    } // function getjobscriptquery

    private function getjobsquery($reftable, $cpudatarestriction, $reslist)
    {
        if (is_string($cpudatarestriction)) {
                $extraWhere = "AND " . $cpudatarestriction;
        } else if ($cpudatarestriction === true) {
                $extraWhere = "AND sf.cpu_user_bucketid != 0";
        } else {
                $extraWhere = "";
        }
        if ($reftable === 'supremm') {
                $jobCountColumn = 'job_count';
                $resIdColumn = 'resource_id';
                $jobBucketColumn = 'jobtime_id';
        } else {
                $jobCountColumn = 'ended_job_count';
                $resIdColumn = 'task_resource_id';
                $jobBucketColumn = 'job_time_bucket_id';
        }
        return "
        SELECT
            alljobs.day,
            alljobs.resource,
            COALESCE(ROUND(100.0 * COALESCE(withcpu.jobs_ended_with_cpudata, 0.0) / alljobs.jobs_ended,0), 'N/A') as percent,
            alljobs.jobs_ended,
            COALESCE(withcpu.jobs_ended_with_cpudata, 0)
        FROM
            (SELECT
                resdays.day,
                resdays.resource,
                SUM(sf.$jobCountColumn) AS jobs_ended
            FROM
                (SELECT
                DATE(d.day_start) AS day,
                d.id AS day_id,
                rf.code AS resource,
                rf.id AS resource_id
                FROM
                    modw.resourcefact rf, modw.days d
                WHERE
                    rf.id IN ($reslist)
                    AND COALESCE(rf.end_date, '9998-12-31') > DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
                    AND d.day_start >= :start
                    AND d.day_start <= :end) AS resdays
        LEFT JOIN
            modw_aggregates.{$reftable}fact_by_day sf ON resdays.day_id = sf.day_id
            AND resdays.resource_id = sf.$resIdColumn
            AND sf.$jobBucketColumn > 1
        GROUP BY 1 , 2
        ) AS alljobs
        LEFT JOIN
        (SELECT
            resdays.day,
            resdays.resource,
            SUM(sf.job_count) AS jobs_ended_with_cpudata
        FROM
            (SELECT
                DATE(d.day_start) AS day,
                d.id AS day_id,
                rf.code AS resource,
                rf.id AS resource_id
            FROM
                modw.resourcefact rf, modw.days d
            WHERE
                rf.id IN ($reslist)
                AND COALESCE(rf.end_date, '9998-12-31') > DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
                AND d.day_start >= :start
                AND d.day_start <= :end) AS resdays
            LEFT JOIN
                modw_aggregates.supremmfact_by_day sf ON resdays.day_id = sf.day_id
                AND resdays.resource_id = sf.resource_id
                AND sf.jobtime_id > 1
            $extraWhere
        GROUP BY 1 , 2) AS withcpu ON withcpu.day = alljobs.day
        AND withcpu.resource = alljobs.resource
        ORDER BY 2, 1";
    } // function getjobsquery

    private function runquery($querystr, $params)
    {
        $db = DB::factory('datawarehouse');

        $stmt = $db->prepare($querystr, array(\PDO::ATTR_CURSOR => \PDO::CURSOR_FWDONLY));
        $stmt->execute($params);

        $tabular = array();
        $alldays = array();
        $allresources = array();

        while ($result = $stmt->fetch()) {
                if (!isset($tabular[$result['resource']])) {
                    $tabular[$result['resource']] = array();
                }
                $tabular[$result['resource']][$result['day']] = $result['percent'];
                $alldays[$result['day']] = 1;
                $allresources[$result['resource']] = 1;
        }

        return $tabular;

    } // function runquery

    private function getreslist($start)
    {
        $config = \Configuration\XdmodConfiguration::assocArrayFactory('supremm_resources.json', CONFIG_DIR);

        $resids = array();
        foreach ($config['resources'] as $sresource) {
                $resids[] = $sresource['resource_id'];
        }

        $db = DB::factory('datawarehouse');
        $query = "SELECT resource_id FROM modw.resourcespecs WHERE COALESCE(end_date_ts, '2038-01-01') >= :start AND resource_id IN (" . join(",", $resids) . ")";

        $stmt = $db->prepare($query, array(\PDO::ATTR_CURSOR => \PDO::CURSOR_FWDONLY));
        $stmt->execute(array(':start' => $start));

        $resources = $stmt->fetchAll(\PDO::FETCH_COLUMN, 0);

        return join(",", $resources);
    } // function getreslist

} // class SupremmDataflowControllerProvider
