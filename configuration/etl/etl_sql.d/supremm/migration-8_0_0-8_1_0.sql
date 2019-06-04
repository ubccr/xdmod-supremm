UPDATE
    `modw_supremm`.`jobhost` jh, `modw_supremm`.`job` j
SET
    jh.`end_time_ts` = j.`end_time_ts`
WHERE
    jh.`resource_id` = j.`resource_id`
    AND jh.`local_job_id` = j.`local_job_id`
//
