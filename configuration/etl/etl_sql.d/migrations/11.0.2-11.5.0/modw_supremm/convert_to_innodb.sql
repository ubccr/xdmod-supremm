-- These tables cannot be locked for writing while converting to InnoDB as it
-- will cause a deadlock and the migration process will time out.

ALTER TABLE `modw_supremm`.`application` ENGINE=InnoDB;
ALTER TABLE `modw_supremm`.`application_fos` ENGINE=InnoDB;
ALTER TABLE `modw_supremm`.`cpibuckets` ENGINE=InnoDB;
ALTER TABLE `modw_supremm`.`cwd` ENGINE=InnoDB;
ALTER TABLE `modw_supremm`.`datasource` ENGINE=InnoDB;
ALTER TABLE `modw_supremm`.`executable` ENGINE=InnoDB;
ALTER TABLE `modw_supremm`.`exit_status` ENGINE=InnoDB;
ALTER TABLE `modw_supremm`.`granted_pe` ENGINE=InnoDB;
ALTER TABLE `modw_supremm`.`host` ENGINE=InnoDB;
ALTER TABLE `modw_supremm`.`job` ENGINE=InnoDB;
ALTER TABLE `modw_supremm`.`job_errors` ENGINE=InnoDB;
ALTER TABLE `modw_supremm`.`job_name` ENGINE=InnoDB;
ALTER TABLE `modw_supremm`.`job_peers` ENGINE=InnoDB;
