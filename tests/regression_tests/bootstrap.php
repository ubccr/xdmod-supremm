<?php

$dir = __DIR__;

// Autoloader for main framework test classes.
spl_autoload_register(
    function ($className) use ($dir) {
        $classPath
            = $dir
            . '/../../../xdmod/tests/regression/lib/'
            . str_replace('\\', '/', str_replace('RegressionTests\\', '', $className))
            . '.php';

        if (is_readable($classPath)) {
            return require_once $classPath;
        } else {
            return false;
        }
    }
);

// Autoloader for main framework test classes.
spl_autoload_register(
    function ($className) use ($dir) {
        $classPath
            = $dir
            . '/../../../xdmod/tests/integration/lib/'
            . str_replace('\\', '/', $className)
            . '.php';

        if (is_readable($classPath)) {
            return require_once $classPath;
        } else {
            return false;
        }
    }
);
