ALTER TABLE job ADD `max_memory` double DEFAULT NULL COMMENT 'Maximum ratio of memory used to total memory available for the compute node with the highest peak memory usage' AFTER `ib_rx_bytes`;
ALTER TABLE job_errors ADD `max_memory` int DEFAULT NULL COMMENT 'ERROR CODE' AFTER `ib_rx_bytes`;
UPDATE job_errors SET max_memory = 8 WHERE max_memory IS NULL;
