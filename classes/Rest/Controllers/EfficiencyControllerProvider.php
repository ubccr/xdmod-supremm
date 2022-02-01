<?php

namespace Rest\Controllers;

use DataWarehouse\Query\Exceptions\AccessDeniedException;
use DataWarehouse\Query\Exceptions\BadRequestException;

use Models\Services\Acls;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Silex\ControllerCollection;
use \Symfony\Component\HttpFoundation\JsonResponse;

use DataWarehouse\Access\MetricExplorer;

use Exception;

class EfficiencyControllerProvider extends BaseControllerProvider
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
        /**
        * @OA\Get(
        *   path="/analytics",
        *   summary="analytic list",
        *   @OA\Response(
        *     response=200,
        *     description="Returns a json object of analytics to be displayed in the efficiency tab."
        *   ),
        *   @OA\Response(
        *     response="default",
        *     description="An error occurred while retrieving analytics."
        *   )
        * )
        */
        $controller->get("$root/analytics", "$base::getAnalytics");
        /**
        * @OA\Get(
        *   path="/scatterPlot/{analytic}",
        *   summary="scatter plot data",
        *   @OA\Response(
        *     response=200,
        *     description="Returns a json object of data that populates the scatter plots for the efficiency tab."
        *   ),
        *   @OA\Response(
        *     response="default",
        *     description="An error occurred while retrieving data."
        *   )
        * )
        */
        $controller->get("$root/scatterPlot/{analytic}", "$base::getScatterPlotData");
         /**
        * @OA\Get(
        *   path="/histogram/{dimension}",
        *   summary="histogram data",
        *   @OA\Response(
        *     response=200,
        *     description="Returns a json object of histogram chart that displays drill down information from a specific analytic scatter plot."
        *   ),
        *   @OA\Response(
        *     response="default",
        *     description="An error occurred while retrieving chart data."
        *   )
        * )
        */
        $controller->get("$root/histogram/{dimension}", "$base::getHistogramData");
    }

     /**
     * Retrieve efficiency analytics
     *
     * @param Application $app
     * @return JsonResponse
     */
    public function getAnalytics(Application $app)
    {
        $efficiencyAnalytics = \Configuration\XdmodConfiguration::assocArrayFactory(
            'efficiency_analytics.json',
            CONFIG_DIR,
            null
        );

        return $app->json(array(
            'success' => true,
            'total' => count($efficiencyAnalytics),
            'data' => array_values($efficiencyAnalytics)
        ));
    }

    /**
     * Retrieve scatter plot data
     *
     * @param Request $request
     * @param Application $app
     * @return JsonResponse
     */
    public function getScatterPlotData(Request $request, Application $app, $analytic)
    {
        //Datasets array to be returned - includes user data dataset and restricted data dataset.
        $datasets = array();
        $user = $this->authorize($request);

        $json_config = $this->getStringParam($request, 'config', true);
        $start = $this->getIntParam($request, 'start', true);
        $limit = $this->getIntParam($request, 'limit', true);

        $config = json_decode($json_config);

        if ($config === null) {
            throw new BadRequestException('syntax error in config parameter');
        }

        $mandatory = array('realm', 'group_by', 'statistics', 'aggregation_unit', 'start_date', 'end_date', 'order_by');
        foreach ($mandatory as $required_property) {
            if (!property_exists($config, $required_property)) {
                throw new BadRequestException('Missing mandatory config property ' . $required_property);
            }
        }

        $permittedStats = Acls::getPermittedStatistics($user, $config->realm, $config->group_by);
        $forbiddenStats = array_diff($config->statistics, $permittedStats);

        if (!empty($forbiddenStats)) {
            throw new AccessDeniedException('access denied to ' . json_encode($forbiddenStats));
        }

        if ($analytic !== 'Short Job Count') {
            $query = new \DataWarehouse\Query\AggregateQuery(
                $config->realm,
                $config->aggregation_unit,
                $config->start_date,
                $config->end_date,
                $config->group_by
            );

            $allRoles = $user->getAllRoles();
            $roles = $query->setMultipleRoleParameters($allRoles, $user);

            foreach ($config->statistics as $stat) {
                $query->addStat($stat);
            }

            if (property_exists($config, 'filters')) {
                $query->setRoleParameters($config->filters);
            }

            if (!property_exists($config->order_by, 'field') || !property_exists($config->order_by, 'dirn')) {
                throw new BadRequestException('Malformed config property order_by');
            }
            $dirn = $config->order_by->dirn === 'asc' ? 'ASC' : 'DESC';

            $query->addOrderBy($config->order_by->field, $dirn);

            $dataset = new \DataWarehouse\Data\SimpleDataset($query);
            $results = $dataset->getResults($limit, $start);
            foreach ($results as $key => &$val) {
                $val['name'] = $val[$config->group_by . '_name'];
                $val['id'] = $val[$config->group_by . '_id'];
                $val['short_name'] = $val[$config->group_by . '_short_name'];
                $val['order_id'] = $val[$config->group_by . '_order_id'];
                unset($val[$config->group_by . '_id']);
                unset($val[$config->group_by . '_name']);
                unset($val[$config->group_by . '_short_name']);
                unset($val[$config->group_by . '_order_id']);

                if ($val[$config->statistics[0]] == null || $val[$config->statistics[1]] == null){
                    unset($results[$key]);
                }
            }

            $results = array_values($results);
            //Dataset that shows detailed information that the user has access to
            $datasets['results'] = $results;
            $datasets['hiddenData'] = array();
            /*
                If user is restricted from viewing data, get dataset that has all points without name attached
                Runs the same query as above without role restrictions and returns data without name
            */
            if (count($roles) > 0) {
                $query = new \DataWarehouse\Query\AggregateQuery(
                    $config->realm,
                    $config->aggregation_unit,
                    $config->start_date,
                    $config->end_date,
                    $config->group_by
                );

                foreach ($config->statistics as $stat) {
                    $query->addStat($stat);
                }

                if (property_exists($config, 'filters')) {
                    $query->setRoleParameters($config->filters);
                }

                if (!property_exists($config->order_by, 'field') || !property_exists($config->order_by, 'dirn')) {
                    throw new BadRequestException('Malformed config property order_by');
                }
                $dirn = $config->order_by->dirn === 'asc' ? 'ASC' : 'DESC';

                $query->addOrderBy($config->order_by->field, $dirn);

                $dataset = new \DataWarehouse\Data\SimpleDataset($query);
                $data = $dataset->getResults($limit, $start);

                foreach ($data as $key => &$val) {
                    $val['id'] = $val[$config->group_by . '_id'];
                    $val['order_id'] = $val[$config->group_by . '_order_id'];
                    unset($val[$config->group_by . '_id']);
                    unset($val[$config->group_by . '_name']);
                    unset($val[$config->group_by . '_short_name']);
                    unset($val[$config->group_by . '_order_id']);

                    if ($val[$config->statistics[0]] == null || $val[$config->statistics[1]] == null){
                        unset($data[$key]);
                    }
                }

                $data = array_values($data);

                //Dataset that shows only data points and no identifying information
                $datasets['hiddenData'] = $data;
            }

            return $app->json(
                array(
                    'results' => [$datasets],
                    'total' => $dataset->getTotalPossibleCount(),
                    'success' => true
                )
            );
        } else {
            $query = new \DataWarehouse\Query\AggregateQuery(
                $config->realm,
                $config->aggregation_unit,
                $config->start_date,
                $config->end_date,
                $config->group_by
            );

            $allRoles = $user->getAllRoles();
            $roles = $query->setMultipleRoleParameters($allRoles, $user);

            $query->addStat($config->statistics[0]);

            if (property_exists($config, 'filters')) {
                $query->setRoleParameters($config->filters);
            }

            if (!property_exists($config->order_by, 'field') || !property_exists($config->order_by, 'dirn')) {
                throw new BadRequestException('Malformed config property order_by');
            }

            $dirn = $config->order_by->dirn === 'asc' ? 'ASC' : 'DESC';
            $query->addOrderBy($config->order_by->field, $dirn);

            $usageStatDataSet = new \DataWarehouse\Data\SimpleDataset($query);
            $usageResults = $usageStatDataSet->getResults($limit, $start);

            if (property_exists($config, 'mandatory_filters')) {
                $query->setRoleParameters($config->mandatory_filters);
            }

            $efficiencyStatDataset = new \DataWarehouse\Data\SimpleDataset($query);
            $efficiencyResults = $efficiencyStatDataset->getResults($limit, $start);

            foreach($efficiencyResults as &$val){
                $val['short_job_count'] = $val['job_count'];
                $val['name'] = $val[$config->group_by . '_name'];
                $val['id'] = $val[$config->group_by . '_id'];
                $val['short_name'] = $val[$config->group_by . '_short_name'];
                $val['order_id'] = $val[$config->group_by . '_order_id'];
                unset($val['job_count']);
                unset($val[$config->group_by . '_id']);
                unset($val[$config->group_by . '_name']);
                unset($val[$config->group_by . '_short_name']);
                unset($val[$config->group_by . '_order_id']);

                foreach($usageResults as $val2){
                    if($val2[$config->group_by . '_id'] == $val['id']){
                        $val['job_count'] = $val2['job_count'];
                    }
                }
            }

            //Dataset that shows detailed information that the user has access to
            $datasets['results'] = $efficiencyResults;
            $datasets['hiddenData'] = array();

            /*
                If user is restricted from viewing data, get dataset that has all points without name attached
                Runs the same query as above without role restrictions and returns data without name
            */
            if (count($roles) > 0) {
                $query = new \DataWarehouse\Query\AggregateQuery(
                    $config->realm,
                    $config->aggregation_unit,
                    $config->start_date,
                    $config->end_date,
                    $config->group_by
                );

                $query->addStat($config->statistics[0]);

                if (property_exists($config, 'filters')) {
                    $query->setRoleParameters($config->filters);
                }

                if (!property_exists($config->order_by, 'field') || !property_exists($config->order_by, 'dirn')) {
                    throw new BadRequestException('Malformed config property order_by');
                }

                $dirn = $config->order_by->dirn === 'asc' ? 'ASC' : 'DESC';
                $query->addOrderBy($config->order_by->field, $dirn);

                $usageStatDataSet = new \DataWarehouse\Data\SimpleDataset($query);
                $usageData = $usageStatDataSet->getResults($limit, $start);

                if (property_exists($config, 'mandatory_filters')) {
                    $query->setRoleParameters($config->mandatory_filters);
                }

                $efficiencyStatDataset = new \DataWarehouse\Data\SimpleDataset($query);
                $efficiencyData = $efficiencyStatDataset->getResults($limit, $start);

                foreach($efficiencyData as &$val){
                    $val['short_job_count'] = $val['job_count'];
                    $val['id'] = $val[$config->group_by . '_id'];
                    $val['order_id'] = $val[$config->group_by . '_order_id'];
                    unset($val['job_count']);
                    unset($val[$config->group_by . '_id']);
                    unset($val[$config->group_by . '_name']);
                    unset($val[$config->group_by . '_short_name']);
                    unset($val[$config->group_by . '_order_id']);

                    foreach($usageData as $val2){
                        if($val2[$config->group_by . '_id'] == $val['id']){
                            $val['job_count'] = $val2['job_count'];
                        }
                    }
                }

                $datasets['hiddenData'] = $efficiencyData;
            }

            return $app->json(
                array(
                    'results' => [$datasets],
                    'total' => $efficiencyStatDataset->getTotalPossibleCount(),
                    'success' => true
                )
            );
        }
    }

    /**
     * Get histogram chart object
     *
     * @param Request $request
     * @param Application $app
     * @param $dimension
     * @return JsonResponse
     */
    public function getHistogramData(Request $request, Application $app, $dimension)
    {
        $user = $this->getUserFromRequest($request);

        $params = $request->query->all();

        $metricExplorer = new MetricExplorer($params);

        $meResponse = $metricExplorer->get_data($user);
        $chartData = array();
        $results = json_decode($meResponse['results'], true);

        if (isset($results['data'][0]['series'][0])) {
            $chartData = $results['data'][0]['series'][0]['data'];
            $buckets = $this->getDimensionValues($request, $dimension);
            $drillDowns = array_column($chartData, 'drilldown');

            foreach ($buckets as $bucket) {
                if (array_search($bucket['id'], array_column($drillDowns, 'id'), true) === false) {
                    $chartData[] = ['y' => 0, 'drilldown' => array('id' => $bucket['id'], 'label' => $bucket['name'])];
                }
            }

            switch($dimension){
                case 'cpuuser':
                case 'gpu_usage_bucketid':
                case 'max_mem':
                case 'wall_time_accuracy_bucketid':
                    foreach ($chartData as &$dataPoint) {
                        if ($dataPoint['drilldown']['id'] == 1 || $dataPoint['drilldown']['id'] == 2 || $dataPoint['drilldown']['id'] == 3) {
                            $dataPoint['color'] = '#FF0000';
                        } elseif ($dataPoint['drilldown']['id'] == 4 || $dataPoint['drilldown']['id'] == 5) {
                            $dataPoint['color'] = '#FFB336';
                        } elseif ($dataPoint['drilldown']['id'] == 6 || $dataPoint['drilldown']['id'] == 7 || $dataPoint['drilldown']['id'] == 8) {
                            $dataPoint['color'] = '#DDDF00';
                        } elseif ($dataPoint['drilldown']['id'] == 9 || $dataPoint['drilldown']['id'] == 10) {
                            $dataPoint['color'] = '#50B432';
                        } else {
                            $dataPoint['color'] = "gray";
                        }
                    }

                    array_multisort(array_map(function ($element) {
                        return $element['drilldown']['id'];
                    }, $chartData), SORT_ASC, $chartData);

                    //Move NA bucket to end of array
                    $key = array_search('gray', array_column($chartData, 'color'));
                    if( $key === 0 ){
                        $naBucket = array_shift($chartData);
                        array_push($chartData, $naBucket);
                    }

                    $results['data'][0]['series'][0]['data'] = $chartData;
                    break;
                case 'homogeneity_bucket_id':
                    foreach ($chartData as &$dataPoint) {
                        if ($dataPoint['drilldown']['id'] == 1 || $dataPoint['drilldown']['id'] == 2) {
                            $dataPoint['color'] = '#FF0000';
                        } elseif ($dataPoint['drilldown']['id'] == 3 || $dataPoint['drilldown']['id'] == 4) {
                            $dataPoint['color'] = '#FFB336';
                        } elseif ($dataPoint['drilldown']['id'] == 5 || $dataPoint['drilldown']['id'] == 6) {
                            $dataPoint['color'] = '#DDDF00';
                        } elseif ($dataPoint['drilldown']['id'] == 7 || $dataPoint['drilldown']['id'] == 8) {
                            $dataPoint['color'] = '#50B432';
                        } else {
                            $dataPoint['color'] = "gray";
                        }
                    }

                    array_multisort(array_map(function ($element) {
                        return $element['drilldown']['id'];
                    }, $chartData), SORT_ASC, $chartData);

                    $results['data'][0]['series'][0]['data'] = $chartData;
                    break;
                case 'jobwalltime':
                    foreach ($chartData as &$dataPoint) {
                        if ($dataPoint['drilldown']['id'] == 0 || $dataPoint['drilldown']['id'] == 1) {
                            $dataPoint['color'] = '#FF0000';
                        }
                    }

                    array_multisort(array_map(function ($element) {
                        return $element['drilldown']['id'];
                    }, $chartData), SORT_ASC, $chartData);

                    $results['data'][0]['series'][0]['data'] = $chartData;
                    break;
                default:
                    $results['data'][0]['series'][0]['data'] = $chartData;
                    break;
            }
        }

        return $app->json(array(
            'success' => true,
            'message' => "",
            "data" => array($results['data'][0]),
            "totalCount" => 1
        ));
    }

    /**
     * Get dimensions values to be used to show all buckets on histogram
     *
     * @param Request $request
     * @param $dimension
     * @return JsonResponse
     */
    private function getDimensionValues(Request $request, $dimension)
    {
        $user = $this->authorize($request);

        //Get parameters from the request.
        $offset = $this->getIntParam($request, 'offset', false, 0);
        $limit = $this->getIntParam($request, 'limit');
        $searchText = $this->getStringParam($request, 'search_text');

        $realmParameter = $this->getStringParam($request, 'realm');
        $realms = null;
        if ($realmParameter !== null) {
            $realms = preg_split('/,\s*/', trim($realmParameter), null, PREG_SPLIT_NO_EMPTY);
        }

        $showAllDimensionValues = true;

        // Get the dimension values.
        $dimensionValues = MetricExplorer::getDimensionValues(
            $user,
            $dimension,
            $realms,
            $offset,
            $limit,
            $searchText,
            null,
            true,
            $showAllDimensionValues
        );

        // Change the name key for each dimension value to "long_name".
        $dimensionValuesData = $dimensionValues['data'];
        foreach ($dimensionValuesData as &$dimensionValue) {
            $dimensionValue['long_name'] = html_entity_decode($dimensionValue['name']);
            $dimensionValue['name'] = $dimensionValue['long_name'];
            $dimensionValue['short_name'] = html_entity_decode($dimensionValue['short_name']);
        }

        // Return the found dimension values.
        return $dimensionValuesData;
    }
}
