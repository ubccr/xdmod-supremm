USE `modw_supremm`;

ALTER TABLE `modw_supremm`.`job`
    ADD COLUMN IF NOT EXISTS `eligible_wait_time` int(11) DEFAULT NULL COMMENT 'The amount of time between the job becoming eligible to run and job start. NULL if the job\'s eligible time is not known.' AFTER `eligible_time_ts`;

ALTER TABLE `modw_supremm`.`job_errors`
    ADD COLUMN IF NOT EXISTS `eligible_wait_time` int(11) DEFAULT NULL COMMENT 'ERROR CODE' AFTER `eligible_time_ts`;

-- Backfill using the same rules as the Jobs realm eligible_waitduration: jobs with an
-- unknown or invalid eligible time are left NULL. Updated rows get a new last_modified
-- value, so the next aggregate_supremm.sh run re-aggregates the affected periods.
UPDATE `modw_supremm`.`job`
SET `eligible_wait_time` =
    CASE
        WHEN `eligible_time_ts` IS NULL OR `eligible_time_ts` > `start_time_ts` OR `eligible_time_ts` <= 0
            THEN NULL
        ELSE `start_time_ts` - `eligible_time_ts`
    END;
