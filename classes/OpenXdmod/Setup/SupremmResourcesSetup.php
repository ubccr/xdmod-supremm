<?php
/**
 * @author Joseph P. White <jpwhite4@buffalo.edu>
 */

namespace OpenXdmod\Setup;

/**
 * Resources setup.
 */
class SupremmResourcesSetup extends SubMenuSetupItem
{

    /**
     * Resources menu.
     *
     * @var Menu
     */
    protected $menu;

    /**
     * Resource config.
     *
     * @var array
     */
    protected $resources;

    /**
     * true if setup should quit.
     *
     * @var bool
     */
    protected $quit;

    /**
     * @inheritdoc
     */
    public function handle()
    {
        $this->quit = false;

        if($this->populateResources() === false) {
            return;
        }

        $items = array();
        foreach($this->getResources() as $resource){

            $items[] = new MenuItem(
                $resource['resource_id'],
                'Edit resource ' . $resource['resource'],
                new SupremmEditResourceSetup($this->console, $resource, array($this, 'updateResource'))
            );

        }
        $items[] = new MenuItem('s', 'Save (and return to main menu)', new SubMenuSaveSetup($this->console, $this));
        $items[] = new MenuItem('q', 'Quit without saving', new SubMenuQuitSetup($this->console, $this));

        $this->menu = new Menu($items, $this->console, 'Resource configuration for SUPReMM realm');

        while (!$this->quit) {
            $this->menu->display();
        }
    }

    /**
     * read the existing resource configuation from the config
     * directory and the resourcefact table.
     */
    private function populateResources()
    {
        $path = $this->getJsonConfigFilePath('supremm_resources');
        if( file_exists($path) ) {
            $jsonresources = $this->loadJsonFile($path);
            if(isset($jsonresources) && isset($jsonresources['resources'])) {
                $this->addResources($jsonresources['resources']);
            }
            // else Ignore corrupt json file since it will be overwritten anyway.
        }

        try {
            $db = \CCR\DB::factory('datawarehouse');
            $existingresources = $db->query('SELECT id AS resource_id, code AS resource FROM resourcefact');
            $this->addResources($existingresources);
        }
        catch(\Exception $exp) {
            $this->console->displayMessage(<<<"EOF"
Error retrieving resource information from the datawarehouse. Make sure that
Open XDMoD has been configured and shredding and ingest steps have
been run before configuring SUPRReMM module.

Aborting SUPReMM resources setup!

EOF
            );
            $this->console->prompt('Press ENTER to continue.');

            return false;
        }
        return true;
    }

    /**
     * return the default settings for a resource
     */
    private function defaultSettings($id)
    {
        return array(
            'resource_id' => $id,
            'resource' => '',
            'enabled' => false,
            'datasetmap' => 'pcp',
            'hardware' => array(
                'gpfs' => ''
            )
        );
    }

    /**
     * helper sort function that ensures that the resource settings array
     * keys are ordered identically to the order used in the defaultSettings()
     *
     * This just makes the resultant json file more readable.
     *
     */
    public function resourceSorter($left, $right)
    {
        $priority = array_keys($this->defaultSettings(0));

        if(in_array($left, $priority)) {
            if(in_array($right, $priority)) {
                $lIndex = array_search($left, $priority);
                $rIndex = array_search($right, $priority);

                if($lIndex < $rIndex) {
                    return -1;
                }
                if( $lIndex > $rIndex) {
                    return 1;
                }
                return 0;
            }
            return -1;
        }
        if(in_array($right, $priority)) {
            return 1;
        }
        return strncasecmp($left, $right);
    }

    /**
     * add to the list of resources. The resources are stored internally as
     * an associative array indexed on the resource_id. Successive calls
     * to this function will update existing records using the php array_merge()
     * semantics.
     */
    private function addResources(array $resourceList)
    {
        foreach($resourceList as $resource)
        {
            if(!isset($resource['resource_id']) )
            {
                // ignore corrupt record
                continue;
            }

            $id = intval($resource['resource_id']);

            // Ensure resource_id is an int type and not a string
            $resource['resource_id'] = $id;

            if(!isset($this->resources[$id]))
            {
                $this->resources[$id] = $this->defaultSettings($id);
            }
            $this->resources[$id] = array_merge($this->resources[$id], $resource);
            uksort($this->resources[$id], array($this, 'resourceSorter'));
        }
        ksort($this->resources);
    }

    /**
     * Return the current list of resources.
     *
     * @return array
     */
    public function getResources()
    {
        return array_values($this->resources);
    }

    /**
     * Quit this setup step at the next opportunity.
     */
    public function quit()
    {
        $this->quit = true;
    }

    /**
     * Update the settings for a resource.
     *
     * @param array $resource
     */
    public function updateResource(array $resource)
    {
        $this->resources[$resource['resource_id']] = $resource;
    }

    /**
     * Save the current list of resources.
     */
    public function save()
    {
        $this->saveJsonConfig(array('resources' => $this->getResources()), 'supremm_resources');
    }
}
