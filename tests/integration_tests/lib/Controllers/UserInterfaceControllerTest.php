<?php

namespace IntegrationTests\Controllers;

class UserInterfaceControllerTest extends \PHPUnit_Framework_TestCase
{
    /**
     * Check that the SUPREMM realm shows in the usage tab
     * catalog and the JobEfficiency realm does not.
     */
    public function testGetMenus()
    {
        $helper = new \TestHarness\XdmodTestHelper();
        $helper->authenticate('cd');

        $params = array(
            'operation' => 'get_menus',
            'node' => 'category_',
            'public_user' => false,
            'query_group' => 'tg_usage'
        );

        $response = $helper->post('/controllers/user_interface.php', null, $params);

        $this->assertEquals('application/json', $response[1]['content_type']);
        $this->assertEquals(200, $response[1]['http_code']);

        $data = $response[0];

        $realms = array();
        $realmGroupBys = array();
        foreach ($data as $menuitem) {
            if (isset($menuitem['realm'])) {
                if (!isset($realms[$menuitem['realm']])) {
                    $realms[$menuitem['realm']] = 0;
                }
                $realms[$menuitem['realm']] += 1;
                if ($menuitem['realm'] == 'SUPREMM'){
                    $groupByName = 'group_by_' . $menuitem['realm']  . '_' . $menuitem['group_by'];
                    $gbParams = array(
                        'operation' => 'get_menus',
                        'node' => $groupByName,
                        'group_by' => $menuitem['group_by'],
                        'public_user' => false,
                        'query_group' => 'tg_usage',
                        'category' => $menuitem['realm']
                    );
                    $gbResponse = $helper->post('/controllers/user_interface.php', null, $gbParams);
                    $realmGroupBys[$groupByName] = $gbResponse[0];
                }
            }
        }
        $expected = self::generateRealmGroupBys();
        $this->assertEquals($expected, $realmGroupBys);

        $this->assertArrayHasKey('SUPREMM', $realms);
        $this->assertArrayNotHasKey('JobEfficiency', $realms);

        // The count represents the number of group bys in the realm
        $this->assertTrue($realms['SUPREMM'] > 29);
    }

    public function generateRealmGroupBys()
    {
        $defaultTypes = array(
            '{"dataset_type":"aggregate","display_type":"bar","combine_type":"stack","limit":10,"offset":0,"log_scale":"n","show_legend":"y","show_trend_line":"n","show_error_bars":"n","show_guide_lines":"y","show_aggregate_labels":"n","show_error_labels":"n","enable_errors":"y","enable_trend_line":"y"}',
            '{"dataset_type":"aggregate","display_type":"datasheet","combine_type":"stack","limit":10,"offset":0,"log_scale":"n","show_legend":"y","show_trend_line":"n","show_error_bars":"n","show_guide_lines":"y","show_aggregate_labels":"n","show_error_labels":"n","enable_errors":"y","enable_trend_line":"y"}',
            '{"dataset_type":"aggregate","display_type":"h_bar","combine_type":"stack","limit":10,"offset":0,"log_scale":"n","show_legend":"y","show_trend_line":"n","show_error_bars":"n","show_guide_lines":"y","show_aggregate_labels":"n","show_error_labels":"n","enable_errors":"y","enable_trend_line":"y"}',
            '{"dataset_type":"aggregate","display_type":"pie","combine_type":"stack","limit":10,"offset":0,"log_scale":"n","show_legend":"y","show_trend_line":"n","show_error_bars":"n","show_guide_lines":"n","show_aggregate_labels":"y","show_error_labels":"n","enable_errors":"n","enable_trend_line":"n"}',
            '{"dataset_type":"timeseries","display_type":"line","combine_type":"stack","limit":10,"offset":0,"log_scale":"n","show_legend":"y","show_trend_line":"n","show_error_bars":"n","show_guide_lines":"y","show_aggregate_labels":"n","show_error_labels":"n","enable_errors":"y","enable_trend_line":"y"}'
        );
        $groupbys = array(
            'none' => array(
            'defaultChartSettings' => '4',
            'label' => 'SUPREMM'
        ),

        'application' => array(
            'defaultChartSettings' => '2',
            'label' => 'Application'
        ),

        'cpi' => array(
            'defaultChartSettings' => '0',
            'label' => 'CPI Value'
        ),

        'cpucv' => array(
            'defaultChartSettings' => '0',
            'label' => 'CPU User CV'
        ),

        'cpuuser' => array(
            'defaultChartSettings' => '0',
            'label' => 'CPU User Value'
        ),

        'catastrophe_bucket_id' => array(
            'defaultChartSettings' => '0',
            'label' => 'Catastrophe Rank'
        ),

        'datasource' => array(
            'defaultChartSettings' => '0',
            'label' => 'Datasource'
        ),

        'nsfdirectorate' => array(
            'defaultChartSettings' => '3',
            'label' => 'Decanal Unit'
        ),

        'parentscience' => array(
            'defaultChartSettings' => '2',
            'label' => 'Department'
        ),

        'exit_status' => array(
            'defaultChartSettings' => '0',
            'label' => 'Exit Status'
        ),

        'gpu0_nv_utilization_bucketid' => array(
            'defaultChartSettings' => '0',
            'label' => 'GPU0 Usage Value'
        ),

        'gpu_usage_bucketid' => array(
            'defaultChartSettings' => '0',
            'label' => 'GPU Active Value'
        ),

        'granted_pe' => array(
            'defaultChartSettings' => '2',
            'label' => 'Granted Processing Element'
        ),

        'ibrxbyterate_bucket_id' => array(
            'defaultChartSettings' => '0',
            'label' => 'InfiniBand Receive rate'
        ),

        'jobsize' => array(
            'defaultChartSettings' => '0',
            'label' => 'Job Size'
        ),

        'jobwalltime' => array(
            'defaultChartSettings' => '0',
            'label' => 'Job Wall Time'
        ),

        'nodecount' => array(
            'defaultChartSettings' => '2',
            'label' => 'Node Count'
        ),

        'pi' => array(
            'defaultChartSettings' => '2',
            'label' => 'PI'
        ),

        'fieldofscience' => array(
            'defaultChartSettings' => '2',
            'label' => 'PI Group'
        ),

        'pi_institution' => array(
            'defaultChartSettings' => '1',
            'label' => 'PI Institution'
        ),

        'max_mem' => array(
            'defaultChartSettings' => '0',
            'label' => 'Peak Memory Usage (%)'
        ),

        'queue' => array(
            'defaultChartSettings' => '2',
            'label' => 'Queue'
        ),

        'resource' => array(
            'defaultChartSettings' => '2',
            'label' => 'Resource'
        ),

        'provider' => array(
            'defaultChartSettings' => '2',
            'label' => 'Service Provider'
        ),

        'shared' => array(
            'defaultChartSettings' => '0',
            'label' => 'Share Mode'
        ),

        'username' => array(
            'defaultChartSettings' => '2',
            'label' => 'System Username'
        ),

        'person' => array(
            'defaultChartSettings' => '2',
            'label' => 'User'
        ),

        'institution' => array(
            'defaultChartSettings' => '1',
            'label' => 'User Institution'
        ),

        'netdrv_gpfs_rx_bucket_id' => array(
            'defaultChartSettings' => '0',
            'label' => 'gpfs bytes received'
        ),

        'netdrv_isilon_rx_bucket_id' => array(
            'defaultChartSettings' => '0',
            'label' => 'isilon bytes received'
        ),

        'netdrv_panasas_rx_bucket_id' => array(
            'defaultChartSettings' => '0',
            'label' => 'panasas bytes received'
        )
        );
        $statistics = array(
            'avg_percent_cpu_idle' => 'Avg CPU %: Idle: weighted by core-hour',
            'avg_percent_cpu_system' => 'Avg CPU %: System: weighted by core-hour',
            'avg_percent_cpu_user' => 'Avg CPU %: User: weighted by core-hour',
            'avg_percent_gpu_active' => 'Avg GPU active: weighted by gpu-hour',
            'avg_percent_gpu0_nv_utilization' => 'Avg GPU0 usage: weighted by node-hour',
            'avg_netdir_home_write' => 'Avg: /home write rate: Per Node weighted by node-hour',
            'avg_netdir_projects_write' => 'Avg: /projects write rate: Per Node weighted by node-hour',
            'avg_netdir_util_write' => 'Avg: /util write rate: Per Node weighted by node-hour',
            'avg_cpiref_per_core' => 'Avg: CPI: Per Core weighted by core-hour',
            'avg_cpldref_per_core' => 'Avg: CPLD: Per Core weighted by core-hour',
            'avg_cpuusercv_per_core' => 'Avg: CPU User CV: weighted by core-hour',
            'avg_cpuuserimb_per_core' => 'Avg: CPU User Imbalance: weighted by core-hour',
            'avg_flops_per_core' => 'Avg: FLOPS: Per Core weighted by core-hour',
            'avg_ib_rx_bytes' => 'Avg: InfiniBand rate: Per Node weighted by node-hour',
            'avg_mem_bw_per_core' => 'Avg: Memory Bandwidth: Per Core weighted by core-hour',
            'avg_memory_per_core' => 'Avg: Memory: Per Core weighted by core-hour',
            'avg_total_memory_per_core' => 'Avg: Total Memory: Per Core weighted by core-hour',
            'avg_block_sda_rd_ios' => 'Avg: block sda read ops rate: Per Node weighted by node-hour',
            'avg_block_sda_rd_bytes' => 'Avg: block sda read rate: Per Node weighted by node-hour',
            'avg_block_sda_wr_ios' => 'Avg: block sda write ops rate: Per Node weighted by node-hour',
            'avg_block_sda_wr_bytes' => 'Avg: block sda write rate: Per Node weighted by node-hour',
            'avg_net_eth0_rx' => 'Avg: eth0 receive rate: Per Node weighted by node-hour',
            'avg_net_eth0_tx' => 'Avg: eth0 transmit rate: Per Node weighted by node-hour',
            'avg_netdrv_gpfs_rx' => 'Avg: gpfs receive rate: Per Node weighted by node-hour',
            'avg_netdrv_gpfs_tx' => 'Avg: gpfs transmit rate: Per Node weighted by node-hour',
            'avg_net_ib0_rx' => 'Avg: ib0 receive rate: Per Node weighted by node-hour',
            'avg_net_ib0_tx' => 'Avg: ib0 transmit rate: Per Node weighted by node-hour',
            'avg_netdrv_isilon_rx' => 'Avg: isilon receive rate: Per Node weighted by node-hour',
            'avg_netdrv_isilon_tx' => 'Avg: isilon transmit rate: Per Node weighted by node-hour',
            'avg_netdrv_panasas_rx' => 'Avg: panasas receive rate: Per Node weighted by node-hour',
            'avg_netdrv_panasas_tx' => 'Avg: panasas transmit rate: Per Node weighted by node-hour',
            'cpu_time_idle' => 'CPU Hours: Idle: Total',
            'cpu_time_system' => 'CPU Hours: System: Total',
            'wall_time' => 'CPU Hours: Total',
            'cpu_time_user' => 'CPU Hours: User: Total',
            'gpu_time_active' => 'GPU Hours Active: Total',
            'gpu_time' => 'GPU Hours: Total',
            'gpu0_nv_utilization' => 'GPU0 Hours: Total',
            'job_count' => 'Number of Jobs Ended',
            'running_job_count' => 'Number of Jobs Running',
            'started_job_count' => 'Number of Jobs Started',
            'submitted_job_count' => 'Number of Jobs Submitted',
            'wait_time_per_job' => 'Wait Hours: Per Job',
            'wait_time' => 'Wait Hours: Total',
            'wall_time_accuracy' => 'Wall Time Accuracy',
            'wall_time_per_job' => 'Wall Hours: Per Job',
            'requested_wall_time_per_job' => 'Wall Hours: Requested: Per Job',
            'requested_wall_time' => 'Wall Hours: Requested: Total'
        );
        $realmGroupBys = array();
        foreach($groupbys as $name => $settings){
            $realmGroupBys['group_by_SUPREMM_'. $name] = array();
            foreach($statistics as $stat => $text){
                $realmGroupBys['group_by_SUPREMM_'. $name][] = array(
                    "text" => $text,
                    "id" => "statistic_SUPREMM_" . $name ."_" . $stat,
                    "statistic" => $stat,
                    "group_by" => $name,
                    "group_by_label" => $settings['label'],
                    "query_group" => "tg_usage",
                    "category" => "SUPREMM",
                    "realm" => "SUPREMM",
                    "defaultChartSettings" => $defaultTypes[$settings['defaultChartSettings']],
                    "chartSettings" => $defaultTypes[$settings['defaultChartSettings']],
                    "node_type" => "statistic",
                    "iconCls" => "chart",
                    "description" => $stat,
                    "leaf" => true,
                    "supportsAggregate" => true
                );
            }
        }
        return $realmGroupBys;
    }
}
