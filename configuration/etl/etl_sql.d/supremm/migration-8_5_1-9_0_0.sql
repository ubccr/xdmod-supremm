USE modw_supremm;

LOCK TABLES application WRITE, job AS j WRITE, executable AS e READ;

UPDATE application SET license_type = 'permissive', url = 'https://pegasus.isi.edu' WHERE id = 34;

UPDATE job j, executable e SET j.application_id = 34 WHERE j.executable_id = e.id AND e.`binary` like 'pegasus%';

UNLOCK TABLES;
