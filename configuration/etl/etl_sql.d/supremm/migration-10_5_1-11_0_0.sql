LOCK TABLES `modw_supremm`.`application` AS a READ, `modw_supremm`.`job` AS j WRITE, `modw_supremm`.`executable` AS e WRITE
//
UPDATE `modw_supremm`.`job` j, `modw_supremm`.`executable` e, `modw_supremm`.`application` a
SET j.application_id = a.id, e.application_id = a.id WHERE j.executable_id = e.id AND e.`application_id` = 0
   AND e.`binary` = 'nexmd.exe' AND a.name = 'NEXMD'
//
UPDATE `modw_supremm`.`job` j, `modw_supremm`.`executable` e, `modw_supremm`.`application` a
SET j.application_id = a.id, e.application_id = a.id WHERE j.executable_id = e.id AND e.`application_id` = 0
   AND e.`binary` = 'libra' AND a.name = 'Libra'
//
UPDATE `modw_supremm`.`job` j, `modw_supremm`.`executable` e, `modw_supremm`.`application` a
SET j.application_id = a.id, e.application_id = a.id WHERE j.executable_id = e.id AND e.`application_id` = 0
   AND e.`binary` = 'dftbp' AND a.name = 'DFTB+'
//
UPDATE `modw_supremm`.`job` j, `modw_supremm`.`executable` e, `modw_supremm`.`application` a
SET j.application_id = a.id, e.application_id = a.id WHERE j.executable_id = e.id AND e.`application_id` = 0
   AND e.`binary` = 'dftbplus' AND a.name = 'DFTB+'
//
UPDATE `modw_supremm`.`job` j, `modw_supremm`.`executable` e, `modw_supremm`.`application` a
SET j.application_id = a.id, e.application_id = a.id WHERE j.executable_id = e.id AND e.`application_id` = 0
   AND e.`binary` = 'cdo' AND a.name = 'CDO'
//
UNLOCK TABLES
//
