<?php

namespace Rest\Controllers;

use DataWarehouse\Query\Exceptions\AccessDeniedException;

use Models\Services\Acls;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Silex\ControllerCollection;
use \Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

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
        *   path="/groupedData"
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
        $controller->get("$root/groupedData", "$base::getMultiStatisticData");
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

        foreach ($efficiencyAnalytics as &$analyticType) {
            foreach ($analyticType['analytics'] as &$analytic) {
                if (is_array($analytic['documentation'])){
                    $analytic['documentation'] = implode(' ', $analytic['documentation']);
                }

                if (is_array($analytic['statisticDescription'])){
                    $analytic['statisticDescription'] = implode(' ', $analytic['statisticDescription']);
                }

                if (array_key_exists('histogramHelpText', $analytic['histogram'])){
                    if (is_array($analytic['histogram']['histogramHelpText'])) {
                        $analytic['histogram']['histogramHelpText'] = implode(' ', $analytic['histogram']['histogramHelpText']);
                    }
                }
            }
        }

        return $app->json(array(
            'success' => true,
            'total' => count($efficiencyAnalytics),
            'data' => array_values($efficiencyAnalytics)
        ));
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
                    $chartData[] = ['y' => 0, 'drilldown' => array('id' => $bucket['id'], 'label' => $bucket['label'])];
                }
            }

            switch($dimension){
                case 'cpuuser':
                case 'gpu_usage_bucketid':
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
                case 'max_mem':
                    foreach ($chartData as &$dataPoint) {
                        if ($dataPoint['drilldown']['id'] == 1 || $dataPoint['drilldown']['id'] == 10) {
                            $dataPoint['color'] = '#FF0000';
                        } elseif ($dataPoint['drilldown']['id'] == 0) {
                            $dataPoint['color'] = 'gray';
                        } else {
                            $dataPoint['color'] = "#50B432";
                        }
                    }

                    array_multisort(array_map(function ($element) {
                        return $element['drilldown']['id'];
                    }, $chartData), SORT_ASC, $chartData);

                    //Move NA bucket to end of array
                    $key = array_search('gray', array_column($chartData, 'color'));
                    if ($key === 0) {
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
     * Retrieve scatter plot data
     *
     * @param Request $request
     * @param Application $app
     * @return JsonResponse
     */
    public function getMultiStatisticData(Request $request, Application $app)
    {
        $user = $this->authorize($request);

        $json_config = $this->getStringParam($request, 'config', true);

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

        $query = new \DataWarehouse\Query\AggregateQuery(
            $config->realm,
            $config->aggregation_unit,
            $config->start_date,
            $config->end_date,
            $config->group_by
        );

        $group_id = $config->group_by . '_id';
        $group_name = $config->group_by . '_name';

        $output = array(
            'count' => 0,
            'max' => array(),
            'anon_data' => array(
                $group_id => array(),
                $group_name => array()
            ),
            'data' => array(
                $group_id => array(),
                $group_name => array()
            )
        );

        foreach ($config->statistics as $stat) {
            $query->addStat($stat);
            $output['anon_data'][$stat] = array();
            $output['data'][$stat] = array();
            $output['max'][$stat] = 0;
        }

        if (property_exists($config, 'filters')) {
            $query->setRoleParameters($config->filters);
        }

        if (!property_exists($config->order_by, 'field') || !property_exists($config->order_by, 'dirn')) {
            throw new BadRequestException('Malformed config property order_by');
        }

        $dirn = $config->order_by->dirn === 'asc' ? 'ASC' : 'DESC';

        $query->addOrderBy($config->order_by->field, $dirn);

        // always add the group by order field to guarantee that the priv data and non-priv data
        // order is the same - this similfies the join algorithm since you can step though both
        // at the same time.
        $query->addOrderBy($config-group_by, 'ASC');

        $dataset = new \DataWarehouse\Data\SimpleDataset($query);
        $results = $dataset->getResults();

        // Now get priv query
        $privResults = null;
        $allRoles = $user->getAllRoles();
        $roles = $query->setMultipleRoleParameters($allRoles, $user);
        if (count($roles) > 0 ) {
            $privDataset = new \DataWarehouse\Data\SimpleDataset($query);
            $privResults = $privDataset->getResults();
        }

        $privIdx = 0;
        foreach ($results as $val) {
            $destination = 'anon_data';
            if ($privResults === null || $privResults[$privIdx][$group_id] == $val[$group_id]) {
                $privIdx += 1;
                $destination = 'data';
            }

            foreach($config->statistics as $stat) {
                $output[$destination][$stat][] = $val[$stat];
                $output['max'][$stat] = max($output['max'][$stat], $val[$stat]);
            }
            $output[$destination][$group_id][] = $val[$group_id];
            $output[$destination][$group_name][] = $val[$group_name];
            $output['count'] += 1;
        }

        sleep(0.5);
        return $app->json(
            array(
                'results' => [$output],
                'total' => 1,
                'success' => true
            )
        );
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
            $dimensionValue['label'] = $dimensionValue['short_name'];
        }

        // Return the found dimension values.
        return $dimensionValuesData;
    }
}
