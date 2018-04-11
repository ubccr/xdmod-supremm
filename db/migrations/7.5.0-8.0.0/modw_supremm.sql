
USE `modw_supremm`;

DROP TRIGGER IF EXISTS `modw_supremm`.`jobafterinsert`;
DROP TRIGGER IF EXISTS `modw_supremm`.`jobafterupdate`;
DROP TRIGGER IF EXISTS `modw_supremm`.`jobbeforedel`;

DROP TABLE IF EXISTS `modw_supremm`.`jobstatus`;

ALTER TABLE `modw_supremm`.`job` 
    ADD `last_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `_version`;

USE `modw_etl`;

INSERT INTO `log`
    (etlProfileName, start_ts, end_ts, min_index, max_index, details)
VALUES (
    "modw_supremm.job",
    UNIX_TIMESTAMP(now()),
    UNIX_TIMESTAMP(now()),
    0,
    (SELECT UNIX_TIMESTAMP(MAX(last_modified)) FROM `modw_supremm`.`job`),
    "{reason: \"7.5.0 - 8.0.0 migration\"}"
);

