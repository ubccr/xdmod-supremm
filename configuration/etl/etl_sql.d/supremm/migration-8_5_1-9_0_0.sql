LOCK TABLES `modw_supremm`.`application` WRITE, `modw_supremm`.`job` AS j WRITE, `modw_supremm`.`executable` AS e READ;

UPDATE `modw_supremm`.`application` SET license_type = 'permissive', url = 'https://pegasus.isi.edu' WHERE id = 34;

UPDATE `modw_supremm`.`job` j, `modw_supremm`.`executable` e SET j.application_id = 34 WHERE j.executable_id = e.id AND e.`binary` like 'pegasus%';

UNLOCK TABLES;
