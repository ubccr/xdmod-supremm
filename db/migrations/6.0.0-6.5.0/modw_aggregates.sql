USE modw_aggregates;

ALTER TABLE `supremmfact_by_day` ADD COLUMN `max_mem_bucketid` int(11) NOT NULL COMMENT 'DIMENSION: Maximum ratio of memory used to total memory available for the compute node with the highest peak memory usage' AFTER `jobtime_id`;
UPDATE `supremmfact_by_day` SET `max_mem_bucketid` = 0 WHERE 1;
ALTER TABLE `supremmfact_by_day` ADD KEY `index_supremmfact_by_day_max_mem_bucketid` (`max_mem_bucketid`) USING HASH;

ALTER TABLE `supremmfact_by_month` ADD COLUMN `max_mem_bucketid` int(11) NOT NULL COMMENT 'DIMENSION: Maximum ratio of memory used to total memory available for the compute node with the highest peak memory usage' AFTER `jobtime_id`;
UPDATE `supremmfact_by_month` SET `max_mem_bucketid` = 0 WHERE 1;
ALTER TABLE `supremmfact_by_month` ADD KEY `index_supremmfact_by_month_max_mem_bucketid` (`max_mem_bucketid`) USING HASH;

ALTER TABLE `supremmfact_by_quarter` ADD COLUMN `max_mem_bucketid` int(11) NOT NULL COMMENT 'DIMENSION: Maximum ratio of memory used to total memory available for the compute node with the highest peak memory usage' AFTER `jobtime_id`;
UPDATE `supremmfact_by_quarter` SET `max_mem_bucketid` = 0 WHERE 1;
ALTER TABLE `supremmfact_by_quarter` ADD  KEY `index_supremmfact_by_quarter_max_mem_bucketid` (`max_mem_bucketid`) USING HASH;

ALTER TABLE `supremmfact_by_year` ADD COLUMN `max_mem_bucketid` int(11) NOT NULL COMMENT 'DIMENSION: Maximum ratio of memory used to total memory available for the compute node with the highest peak memory usage' AFTER `jobtime_id`;
UPDATE `supremmfact_by_year` SET `max_mem_bucketid` = 0 WHERE 1;
ALTER TABLE `supremmfact_by_year` ADD KEY `index_supremmfact_by_year_max_mem_bucketid` (`max_mem_bucketid`) USING HASH;

