-- These tables cannot be locked for writing while converting to InnoDB as it
-- will cause a deadlock and the migration process will time out.

ALTER TABLE `modw_aggregates`.`supremmfact_by_day` ENGINE=InnoDB;
ALTER TABLE `modw_aggregates`.`supremmfact_by_month` ENGINE=InnoDB;
ALTER TABLE `modw_aggregates`.`supremmfact_by_quarter` ENGINE=InnoDB;
ALTER TABLE `modw_aggregates`.`supremmfact_by_year` ENGINE=InnoDB;
