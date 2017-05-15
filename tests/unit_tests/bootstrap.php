<?php

$dir = __DIR__;

// Autoloader for test classes.
spl_autoload_register(
    function ($className) use ($dir) {
        $classPath
            = $dir
            . '/lib/'
            . str_replace('\\', '/', $className)
            . '.php';

        if (is_readable($classPath)) {
            return require_once $classPath;
        } else {
            return false;
        }
    }
);

// Autoloader for SUPReMM module classes
spl_autoload_register(
    function ($className) use ($dir) {
        $classPath
            = $dir
            . '/../../classes/'
            . str_replace('\\', '/', $className)
            . '.php';

        if (is_readable($classPath)) {
            return require_once $classPath;
        } else {
            return false;
        }
    }
);

// Autoloader for XDMoD test classes
spl_autoload_register(
    function ($className) use ($dir) {
        $classPath
            = __DIR__ . '/../../../xdmod/open_xdmod/modules/xdmod/tests/lib/'
            . str_replace('\\', '/', $className)
            . '.php';

        if (is_readable($classPath)) {
            return require_once $classPath;
        } else {
            return false;
        }
    }
);


// Autoloader for XDMoD classes.
require_once __DIR__ . '/../../../xdmod/configuration/linker.php';
