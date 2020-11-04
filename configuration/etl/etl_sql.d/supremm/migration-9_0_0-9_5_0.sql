LOCK TABLES `modw_supremm`.`job` AS j WRITE, `modw`.`job_tasks` AS jt READ;

UPDATE
  `modw_supremm`.`job` j, `modw`.`job_tasks` jt
SET
  j.gpus = jt.gpu_count
WHERE
  j.resource_id = jt.resource_id AND (j.local_job_id = jt.local_job_id_raw OR j.local_job_id = jt.local_jobid);

UNLOCK TABLES;
