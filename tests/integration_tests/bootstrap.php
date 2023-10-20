<?php

$dir = __DIR__;

// Autoloader for test classes.
spl_autoload_register(
    function ($className) use ($dir) {
        // Replace the IntegrationTests namespace prefix with the path to the
        // integration tests lib directory.
        $classPath = preg_replace(
            '/IntegrationTests\\\\?/',
            "$dir/lib/",
            $className
        );
        // Replace namespace separators with directory separators.
        $classPath = str_replace('\\', '/', $classPath) . '.php';
        if (is_readable($classPath)) {
            return require_once $classPath;
        }
        // Replace the IntegrationTests namespace prefix with the path to
        // the main integration tests lib directory.
        $classPath = preg_replace(
            '/IntegrationTests\\\\?/',
            "$dir/../../../xdmod/tests/integration/lib/",
            $className
        );
        // Replace namespace separators with directory separators.
        $classPath = str_replace('\\', '/', $classPath) . '.php';
        if (is_readable($classPath)) {
            return require_once $classPath;
        }
        // Autoload the SUPReMM module classes
        $classPath = (
            "$dir/../../classes/"
            . str_replace('\\', '/', $className)
            . '.php'
        );
        if (is_readable($classPath)) {
            return require_once $classPath;
        }
        return false;
    }
);

// Autoloader for XDMoD classes.
require_once __DIR__ . '/../../../xdmod/configuration/linker.php';
