<?php

require_once dirname(__FILE__) . '/../../../configuration/linker.php';

@session_start();

$user = null;

try {
    $user = \xd_security\getLoggedInUser();
} catch (Exception $e) {
    if (isset($_POST['xdmod_username']) && isset($_POST['xdmod_password'])) {
        $user = XDUser::authenticate($_POST['xdmod_username'], $_POST['xdmod_password']);
        if ($user != null ) {
            // call record login to ensure token data is present in the session.
            $token = \XDSessionManager::recordLogin($user);
        }
    }
}

if (!isset($user) || $user === null) {
    // There is an issue with the account (most likely deleted while the user was logged in, and the user refreshed the entire site)
    session_destroy();
    denyWithMessage('');
    exit;
}

// --------------------------------------

function denyWithMessage($message)
{
    $reject_response = $message;
    include 'splash.php';
    exit;
}
