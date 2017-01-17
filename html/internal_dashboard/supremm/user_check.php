<?php

   require_once dirname(__FILE__).'/../../../configuration/linker.php';
   
   @session_start();

   $user = null;

try {
    $user = \xd_security\getLoggedInUser();
} catch (Exception $e) {
    if (isset($_POST['xdmod_username']) && isset($_POST['xdmod_password'])) {
        $user = XDUser::authenticate($_POST['xdmod_username'], $_POST['xdmod_password']);
        if ($user != null) {
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
   
    $referer = isset($_POST['direct_to']) ? $_POST['direct_to'] : $_SERVER['SCRIPT_NAME'];
    $reject_response = $message;
   
    include 'splash.php';
    exit;
}
   
if (isset($_POST['direct_to'])) {
    error_log("POST direct to is " . $_POST['direct_to']);
    header("Location: ".$_POST['direct_to']);
    exit;
}
