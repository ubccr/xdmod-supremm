#!/usr/bin/env php
<?php

require_once '/usr/share/xdmod/configuration/linker.php';

$data = parse_ini_file('/etc/xdmod/portal_settings.ini', true);
$settings = array();
foreach ($data['database'] as $key => $value) {
    $settings['db_' . $key] = $value;
}

# Create Databases

$databases = array(
    'modw_etl',
    'modw_supremm'
);

\OpenXdmod\Shared\DatabaseHelper::createDatabases(
    'root',
    '',
    $settings,
    $databases
);
