LOCK TABLES `modw_supremm`.`application` WRITE, `modw_supremm`.`job` AS j WRITE, `modw_supremm`.`executable` AS e WRITE
//
INSERT INTO `modw_supremm`.`application` (id, name, license_type, application_fosid, url) VALUES 
	(226,'MOM6','permissive',4,'https:\/\/www.gfdl.noaa.gov/mom-ocean-model/'),
	(227,'ROMS','permissive',4,'https:\/\/www.myroms.org/'),
	(228,'NEXMD','permissive',2,'https:\/\/github.com/lanl/NEXMD'),
	(229,'Libra','permissive',23,'https:\/\/quantum-dynamics-hub.github.io/libra/index.html'),
	(230,'DFTB+','permissive',23,'https:\/\/dftbplus.org'),
	(231,'CDO','permissive',36,'https:\/\/code.mpimet.mpg.de/projects/cdo')
//
UPDATE `modw_supremm`.`job` j, `modw_supremm`.`executable` e SET j.application_id = 228, e.application_id = 228
    WHERE j.executable_id = e.id AND e.`binary` = 'nexmd.exe' AND e.`application_id` = 0
//
UPDATE `modw_supremm`.`job` j, `modw_supremm`.`executable` e SET j.application_id = 229, e.application_id = 229
    WHERE j.executable_id = e.id AND e.`binary` = 'libra' AND e.`application_id` = 0
//
UPDATE `modw_supremm`.`job` j, `modw_supremm`.`executable` e SET j.application_id = 230, e.application_id = 230
    WHERE j.executable_id = e.id AND e.`binary` = 'dftbp' AND e.`application_id` = 0
//
UPDATE `modw_supremm`.`job` j, `modw_supremm`.`executable` e SET j.application_id = 230, e.application_id = 230
    WHERE j.executable_id = e.id AND e.`binary` = 'dftbplus' AND e.`application_id` = 0
//
UPDATE `modw_supremm`.`job` j, `modw_supremm`.`executable` e SET j.application_id = 231, e.application_id = 231
    WHERE j.executable_id = e.id AND e.`binary` = 'cdo' AND e.`application_id` = 0
//
UNLOCK TABLES
//
