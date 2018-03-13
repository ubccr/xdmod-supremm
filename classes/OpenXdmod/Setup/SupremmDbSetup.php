<?php
/**
 * @author Jeffrey T. Palmer <jtpalmer@buffalo.edu>
 */

namespace OpenXdmod\Setup;

use CCR\DB\MySQLHelper;

/**
 * SUPReMM setup.
 */
class SupremmDbSetup extends DatabaseSetupItem
{

    /**
     * @inheritdoc
     */
    public function handle()
    {
        $settings = $this->loadIniConfig('portal_settings');

        $this->console->displaySectionHeader('SUPReMM Setup');

        $this->console->displayMessage(<<<"EOT"
SUPReMM integration with Open XDMoD requires two additional databases
that are separate from the SUPReMM packages.  The databases must be
named modw_etl and modw_supremm.  They reuse the existing database
credentials from your Open XDMoD instance.
EOT
        );
        $this->console->displayBlankLine();

        $this->console->displayMessage(<<<"EOT"
Please provide the password for the administrative account that will be
used to create the databases.
EOT
        );
        $this->console->displayBlankLine();

        $adminUsername = $this->console->prompt(
            'DB Admin Username:',
            'root'
        );

        $adminPassword = $this->console->silentPrompt(
            'DB Admin Password:'
        );

        try {

            // The SUPReMM databases reuse configuration sections from
            // the primary portal_settings.ini file.  Currently, the
            // modw_etl database uses the credentials from the "logger"
            // section.  Likewise, modw_supremm use the credentials from
            // the "datawarehouse" section.
            $sectionForDatabase = array(
                'modw_etl'     => 'logger',
                'modw_supremm' => 'datawarehouse',
            );

            foreach ($sectionForDatabase as $database => $section) {
                $dbSettings = array(
                    'db_host' => $settings[$section . '_host'],
                    'db_port' => $settings[$section . '_port'],
                    'db_user' => $settings[$section . '_user'],
                    'db_pass' => $settings[$section . '_pass'],
                );

                $this->createDatabases(
                    $adminUsername,
                    $adminPassword,
                    $dbSettings,
                    array($database)
                );
            }
        } catch (Exception $e) {
            $this->console->displayBlankLine();
            $this->console->displayMessage('Failed to create databases:');
            $this->console->displayBlankLine();
            $this->console->displayMessage($e->getMessage());
            $this->console->displayBlankLine();
            $this->console->displayMessage($e->getTraceAsString());
            $this->console->displayBlankLine();
            $this->console->displayMessage('Settings file not saved!');
            $this->console->displayBlankLine();
            $this->console->prompt('Press ENTER to continue.');
            return;
        }

        $this->nodeNpmSetup();
        $this->mongoSetup();

        $aclConfig = new AclConfig($this->console);
        $aclConfig->handle();
    }

    /**
     * run the npm setup commands
     */
    private function nodeNpmSetup()
    {
        $this->console->displayBlankLine();

        $this->console->displayMessage(<<<"EOT"
SUPReMM integration with Open XDMoD uses Node.js for the ETL process.
You need to install the prerequisite packages that are not bundled with
Open XDMoD before you can ingest data from SUPReMM.
EOT
            );

        $this->console->displayBlankLine();

        $installNodePackages = $this->console->prompt(
            'Install Node.js packages using npm?',
            'y',
            array('y', 'n')
        );

        $etlPath = DATA_DIR . '/etl/js';

        if ($installNodePackages === 'y') {
            $this->executeCommand("cd $etlPath && npm install");
        } else {
            $this->console->displayMessage(<<<"EOT"
You will need to install the Node.js packages manually using npm.  e.g.:

    # cd $etlPath
    # npm install
EOT
            );
            $this->console->displayBlankLine();
            $this->console->prompt('Press ENTER to continue.');
        }
    }

    /**
     * Obtain the mongodb settings from the user and save to the config
     * file.
     */
    private function mongoSetup()
    {
        $settings = $this->loadIniConfig('portal_settings', 'supremm');
        $needSave = False;

        $section = 'jobsummarydb';
        $defaults = array(
            'db_engine' => 'MongoDB',
            'uri' => 'mongodb://localhost:27017/supremm',
            'db' => 'supremm'
        );
        $prompts = array(
            'MongoDB uri (of the form mongodb://HOSTNAME:PORT/DBNAME)' => 'uri',
            'database name' => 'db'
        );

        foreach($defaults as $key => $value) {
            if(!isset($settings[$section.'_'.$key])) {
                $settings[$section.'_'.$key] = $value;
                $needSave = True;
            }
        }

        $this->console->displayBlankLine();
        $this->console->displayMessage('Settings for the job summary document database');

        foreach($prompts as $message => $key) {
            $response = $this->console->prompt($message, $settings[$section.'_'.$key]);
            if($response != $settings[$section.'_'.$key]) {
                $settings[$section.'_'.$key] = $response;
                $needSave = True;
            }
        }

        if($needSave) {
            $this->saveIniConfig($settings, 'portal_settings', 'supremm');
        } else {
            $this->console->displayBlankLine();
            $this->console->displayMessage('No changes made to job summary database settings.');
            $this->console->displayBlankLine();
            $this->console->prompt('Press ENTER to continue');
        }
    }
}
