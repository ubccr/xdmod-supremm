#!/usr/bin/env mysql

USE modw_supremm;

# The executable table has a trigger that runs the application identification on
# row insert or update

UPDATE executable SET id = id WHERE 1;

# The application ids are duplicated in the job table to improve query speed.

UPDATE job j, executable e SET j.application_id = e.application_id WHERE j.executable_id = e.id AND j.application_id != e.application_id;
