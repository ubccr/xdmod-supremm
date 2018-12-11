USE modw_supremm;

TRUNCATE modw_supremm.`cwd`;
TRUNCATE modw_supremm.`executable`;
TRUNCATE modw_supremm.`exit_status`;
TRUNCATE modw_supremm.`host`;
TRUNCATE modw_supremm.`granted_pe`;

DROP TABLE IF EXISTS modw_supremm.`job`;
DROP TABLE IF EXISTS modw_supremm.`job_errors`;

TRUNCATE modw_supremm.`jobhost`;
TRUNCATE modw_supremm.`job_name`;
TRUNCATE modw_supremm.`job_peers`;

DROP TABLE IF EXISTS modw_supremm.`pkgt`;
DROP TABLE IF EXISTS modw_supremm.`sizet`;

USE modw_aggregates;

DROP TABLE IF EXISTS modw_aggregates.`supremmfact_by_day`;
DROP TABLE IF EXISTS modw_aggregates.`supremmfact_by_day_joblist`;
DROP TABLE IF EXISTS modw_aggregates.`supremmfact_by_month`;
DROP TABLE IF EXISTS modw_aggregates.`supremmfact_by_quarter`;
DROP TABLE IF EXISTS modw_aggregates.`supremmfact_by_year`;
