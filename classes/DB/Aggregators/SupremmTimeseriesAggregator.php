<?php
/*
 * Generic data driven aggregator. 
 * 
 * @author: Amin Ghadersohi 4/18/2014
 *
 */
class SupremmTimeseriesAggregator extends Aggregator
{
    public $_fields;
    public $_tablename;

    /**
     * @see Aggregator->$realmName
     */
    protected $realmName = 'SUPREMM';

    private $_time_period;
    private $_genjoblist;
    function __construct($time_period)
    {
        $this->_time_period = $time_period;

        $this->_genjoblist = $time_period == 'day' ? TRUE : FALSE;
        
        if ($time_period != 'day' && $time_period != 'week' && $time_period != 'month' && $time_period != 'quarter' && $time_period != 'year') {
            throw new Exception("Time period {$this->_time_period} is invalid.");
        }

        $this->_fields = array(
            new TableColumn("{$this->_time_period}_id", 'int(11)', ":period_id", true, false, "The id related to modw.{$this->_time_period}s"),
            new TableColumn('year', 'smallint unsigned', ':year', true, false, "The year of the {$this->_time_period}"),
            new TableColumn("{$this->_time_period}", 'smallint', ":period", true, false, "The {$this->_time_period} of the year") 
        );
        if ($time_period == 'year') {
            unset($this->_fields[2]); 
        }

        $mdata = file_get_contents(CONFIG_DIR.'/aggregation_meta/modw_aggregates.supremmfact_aggregation_meta.json');
        if( $mdata === FALSE ) {
            throw new \Exception("Aggregation metadata file missing. Did you run the etl process?");
        }

        $agg_meta = json_decode($mdata);

        if( $agg_meta === null || !isset($agg_meta->name) ) {
            throw new \Exception("Unable to parse contents of aggregation metadata file. Did you run the etl process?");
        }
		
		$this->_tablename = $agg_meta->name."_by_{$this->_time_period}";
		foreach($agg_meta->columns as $am)
		{
			$this->_fields[] =  new TableColumn($am->name, $am->sqlType, $am->sql, $am->dimension, false, str_replace("'","", $am->comments));
		}
    }

    private function getDateIds($modwdb, $dest_schema, $start_date, $end_date)
    {
        $query = "SELECT DISTINCT
                      p.id,
                      p.`year` as year_id,
                      p.`{$this->_time_period}`,
                      p.{$this->_time_period}_start,
                      p.{$this->_time_period}_end,
                      p.{$this->_time_period}_start_ts,
                      p.{$this->_time_period}_end_ts,
                      p.hours,
                      p.seconds
                  FROM {$this->_time_period}s p,
                      (SELECT  
                          jf.submit_time_ts, jf.end_time_ts 
                      FROM
                          modw_supremm.jobstatus js,
                          modw_supremm.job jf
                      WHERE
                          jf._id = js.job_id
                          AND js.aggregated_{$this->_time_period} = 0) jf
                  WHERE
                      jf.end_time_ts between p.{$this->_time_period}_start_ts and p.{$this->_time_period}_end_ts or
                      p.{$this->_time_period}_end_ts between jf.submit_time_ts and jf.end_time_ts
                  ORDER BY 2 DESC, 3 DESC";

        return $modwdb->query( $query );
    }
    
    function execute($modwdb, $dest_schema, $start_date, $end_date, $append = true, $infinidb = false)
    {
		//todo: write lock file and deelte at end
        $this->_logger->info(  get_class($this) . ".execute(start_date: $start_date, end_date: $end_date, append: $append)");
        $startDateResult = $modwdb->query("select min(id) as id from {$this->_time_period}s 
								where timestamp('$start_date') 
										between 
											 	{$this->_time_period}_start 
									 		and {$this->_time_period}_end");
        $start_date_id   = 1;
        if (count($startDateResult) > 0) {
            $start_date_id = $startDateResult[0]['id'];
            if (!isset($start_date_id)) {
                $startDateResult = $modwdb->query("select case when '$start_date' < min({$this->_time_period}_start) then 1 else 999999999 end as id  from {$this->_time_period}s");
                
                if (count($startDateResult) > 0) {
                    $start_date_id = $startDateResult[0]['id'];
                }
            }
        }
        
        $endDateResult = $modwdb->query("select max(id) as id from {$this->_time_period}s 
								where timestamp('$end_date') 
										between 
											 	{$this->_time_period}_start 
									 		and {$this->_time_period}_end");
        $end_date_id   = -1;
        if (count($endDateResult) > 0) {
            $end_date_id = $endDateResult[0]['id'];
            if (!isset($end_date_id)) {
                $endDateResult = $modwdb->query("select case when '$end_date' < min({$this->_time_period}_start) then 0 else 999999999 end as id  from {$this->_time_period}s");
                if (count($endDateResult) > 0) {
                    $end_date_id = $endDateResult[0]['id'];
                }
            }
        }
        $this->_logger->info( "start_{$this->_time_period}_id: $start_date_id, end_{$this->_time_period}_id: $end_date_id" );
        
        if ($append == true) {
            
            $altertable_statement = "alter table {$dest_schema}.{$this->_tablename}";
            foreach ($this->_fields as $field) {
                $altertable_statement .= " change {$field->getName()} {$field->getName()} {$field->getType()} " . ($field->isInGroupBy() ? "NOT NULL" : "NULL") . " COMMENT '" . ($field->isInGroupBy() ? "DIMENSION" : "FACT") . ": {$field->getComment()}', ";
            }
            $altertable_statement = trim($altertable_statement, ", ");
            
            $modwdb->handle()->prepare($altertable_statement)->execute();
            
        } else {
            $createtable_statement = "create table if not exists {$dest_schema}." . $this->_tablename . " ( id int NOT NULL PRIMARY KEY AUTO_INCREMENT, ";

            foreach ($this->_fields as $field) {
				if(!$field->isInGroupBy()) continue;
                $createtable_statement .= " {$field->getName()} {$field->getType()} " . ($field->isInGroupBy() ? "NOT NULL" : "NULL") . " COMMENT '" . ($field->isInGroupBy() ? "DIMENSION" : "FACT") . ": {$field->getComment()}', ";
            }
			foreach ($this->_fields as $field) {
				if($field->isInGroupBy()) continue;
                $createtable_statement .= " {$field->getName()} {$field->getType()} " . ($field->isInGroupBy() ? "NOT NULL" : "NULL") . " COMMENT '" . ($field->isInGroupBy() ? "DIMENSION" : "FACT") . ": {$field->getComment()}', ";
            }
            $createtable_statement = trim($createtable_statement, ", ");
            
            $createtable_statement .= ") engine = " . ($infinidb ? 'infinidb' : 'myisam') . " COMMENT='Jobfacts aggregated by {$this->_time_period}.';";

            $createjoblisttable_statement = sprintf("CREATE TABLE IF NOT EXISTS %s.%s_joblist ( agg_id int NOT NULL, jobid int NOT NULL, KEY `index1` (`agg_id`,`jobid`) )",
                $dest_schema , $this->_tablename, $dest_schema , $this->_tablename);
            
            $modwdb->handle()->prepare("DROP TABLE IF EXISTS {$dest_schema}." . $this->_tablename . "_joblist")->execute();
            $modwdb->handle()->prepare("drop table if exists {$dest_schema}." . $this->_tablename)->execute();
            $modwdb->handle()->prepare($createtable_statement)->execute();
            if( $this->_genjoblist) {
                $modwdb->handle()->prepare($createjoblisttable_statement)->execute();
            }
            
            if ($infinidb !== true) {
                $index_fieldnames = array();
                foreach ($this->_fields as $field) {
                    if ($field->isInGroupBy()) {
                        $index_fieldnames[] = $field->getName();
                        $modwdb->handle()->prepare("create index index_{$this->_tablename}_{$field->getName()} using 
														hash on {$dest_schema}.{$this->_tablename} (" . $field->getName() . ")")->execute();
                    }
                }
            }
        }
        if ($infinidb !== true) {
            
            $groupby_fields = array();
            $metric_fields = array();
            
            foreach ($this->_fields as $field) {
                if ($field->isInGroupBy()) {
                    $groupby_fields[] = $field;
                } else {
                    $metric_fields[] = $field;
                }
            }
            
            
            $insert_statement = "insert LOW_PRIORITY into {$dest_schema}." . $this->_tablename . " ( ";
            
            
            foreach ($groupby_fields as $field) {
                $insert_statement .= "{$field->getName()}, ";
            }
            foreach ($metric_fields as $field) {
                $insert_statement .= "{$field->getName()}, ";
            }
            $insert_statement = trim($insert_statement, ", ");
            $insert_statement .= "  ) values (";
            
            foreach ($groupby_fields as $field) {
                $insert_statement .= ":{$field->getName()}, ";
            }
            foreach ($metric_fields as $field) {
                $insert_statement .= ":{$field->getName()}, ";
            }
            $insert_statement = trim($insert_statement, ", ");
            $insert_statement .= "  )";
            //echo $insert_statement;
            
            
            $select_statement = "
						select SQL_NO_CACHE distinct
						";
            foreach ($groupby_fields as $field) {
                $select_statement .= "{$field->getFormula()} as {$field->getName()}, ";
            }
            foreach ($metric_fields as $field) {
                $select_statement .= "{$field->getFormula()} as {$field->getName()}, ";
            }
            $select_statement = trim($select_statement, ", "); //use index (index_jobfact_time_ts)
            
            //(start_time_ts between :{$this->_time_period}_start_ts and :{$this->_time_period}_end_ts) or
            //(:{$this->_time_period}_start_ts between start_time_ts and end_time_ts) or
            if($this->_genjoblist) {
                $select_statement .= ", GROUP_CONCAT( j._id ) as jobidlist";
            }
            $select_statement .= " 
						from modw_supremm.job j
						where 	
							  (end_time_ts between :period_start_ts and :period_end_ts) or
							  (:period_end_ts between start_time_ts and end_time_ts) 
						group by ";
            foreach ($groupby_fields as $field) {
                $select_statement .= "{$field->getName()}, ";
            }
            $select_statement = trim($select_statement, ", ");
            
          
            
            $prepared_insert_statement = $modwdb->handle()->prepare($insert_statement);
            
            $dates_query = "select distinct 
									id, 
									`year`, 
									`{$this->_time_period}`, 
									{$this->_time_period}_start, 
									{$this->_time_period}_end,
									{$this->_time_period}_start_ts, 
									{$this->_time_period}_end_ts,
									hours,
									seconds
								 from {$this->_time_period}s 
								 where id >= $start_date_id
								  and id <=$end_date_id 
								 order by `year` desc, `{$this->_time_period}` desc";
            
            $dates_results = $this->getDateIds($modwdb, $dest_schema, $start_date, $end_date);
            
            foreach ($dates_results as $date_result) {
                $period_id = $date_result['id'];
                
                $period_start    = $date_result["{$this->_time_period}_start"];
                $period_end      = $date_result["{$this->_time_period}_end"];
                $period_start_ts = $date_result["{$this->_time_period}_start_ts"];
                $period_end_ts   = $date_result["{$this->_time_period}_end_ts"];
                $year            = $date_result['year_id'];
                $time_period     = $date_result["{$this->_time_period}"];
                $period_hours    = $date_result["hours"];
                $period_seconds  = $date_result["seconds"];
                $this->_logger->debug(  json_encode($date_result) );
				
				$select_params = array(
					"period_start_ts" => $period_start_ts,
                    "period_end_ts" => $period_end_ts,
                    "period_id" => $period_id,
                    //":{$this->_time_period}_hours" => $period_hours,
                    //"{$this->_time_period}_start" => $period_start, 
                    //"{$this->_time_period}_end" => $period_end,
                    
                    'year' => $year,
                  	"period" => $time_period,
                    //'hours' => $period_hours, 
                    'seconds' => $period_seconds
                );
				          
				/*{      
					$this->dumpQuery(sys_get_temp_dir() . '/select.sql',$select_statement,$select_params);
				}*/
				$statement = $modwdb->handle()->prepare($select_statement);
                $statement->execute($select_params);
                if ($append) {
                    if( $this->_genjoblist ) {
                        $sql = "
                            DELETE {$dest_schema}.{$this->_tablename}_joblist
                            FROM {$dest_schema}.{$this->_tablename}_joblist,
                                {$dest_schema}.{$this->_tablename} AS ag
                            WHERE ag.{$this->_time_period}_id = $period_id
                                AND ag.id = {$dest_schema}.{$this->_tablename}_joblist.agg_id
                        ";
                        $this->_logger->debug($sql);
                        $modwdb->handle()->prepare($sql)->execute();
                    }

                    $modwdb->handle()->prepare("delete from  {$dest_schema}.{$this->_tablename}  
													where {$this->_time_period}_id = $period_id
													")->execute();
                }
                while ($row = $statement->fetch(PDO::FETCH_ASSOC, PDO::FETCH_ORI_NEXT)) {

                    if( $this->_genjoblist ) {
                        $joblist = $row['jobidlist'];
                        unset($row['jobidlist']);
                    }

                    $modwdb->handle()->beginTransaction();
                    $prepared_insert_statement->execute($row);
                    $id = $modwdb->handle()->lastInsertId();
                    $modwdb->handle()->commit();

                    if( $this->_genjoblist ) {
			if( strlen( $joblist ) > 100 ) {
				foreach( explode(",", $joblist) as $jobid ) {
					$prepared_jobidinsert = $modwdb->handle()->prepare("INSERT INTO {$dest_schema}.{$this->_tablename}_joblist (agg_id, jobid) VALUES ( :id, :jobid )");
					$prepared_jobidinsert->execute( array( "id" => $id, "jobid" => $jobid ) );
				}
			} else {
				$values = array();
				$data = array();
				foreach( explode(",", $joblist) as $jobid ) {
					$values[] = "(?,?)";
					$data[] = $id;
					$data[] = $jobid;
				}

				$prepared_jobidinsert = $modwdb->handle()->prepare("INSERT INTO {$dest_schema}.{$this->_tablename}_joblist (agg_id, jobid) VALUES " . implode( $values, ",") );
				$prepared_jobidinsert->execute($data);
			}
                    }
                }
                
            }
        }
        $this->_logger->debug('Optimizing table');
		$modwdb->handle()->prepare("optimize table {$dest_schema}.{$this->_tablename}  ")->execute();

        $modwdb->handle()->prepare("UPDATE modw_supremm.jobstatus SET aggregated_{$this->_time_period} = 1 WHERE 1")->execute();

        if( $this->_time_period == "year" ) {
            // Clean up entries that have been aggregated in all time periods
            // Only bother to do this for year aggregation because 
            $modwdb->handle()->prepare("DELETE FROM modw_supremm.jobstatus WHERE aggregated_day = 1 AND aggregated_month = 1 AND aggregated_quarter = 1 AND aggregated_year = 1")->execute();
        }
    }
}

?>
