<?php
/**
 * @author Joseph P. White <jpwhite4@buffalo.edu>
 */

namespace OpenXdmod\Setup;

/**
 * SUPReMM Resources setup sub-step for editing resource settings.
 */
class SupremmEditResourceSetup extends SetupItem
{
    /**
     * Resource configuration settings
     * @var array
     */
    private $resourceConf;

    /**
     * function to call with the updated settings
     */
    private $callback;

    /**
     * @inheritdoc
     */
    public function __construct(Console $console, array $resourceConf, $callback)
    {
        parent::__construct($console);

        $this->resourceConf = $resourceConf;
        $this->callback = $callback;
    }

    /**
     * @inheritdoc
     */
    public function handle()
    {
        $this->console->displaySectionHeader("Editing SUPReMM realm settings for resource {$this->resourceConf['resource']} ({$this->resourceConf['resource_id']})");

        $this->resourceConf['enabled'] = $this->console->promptBool('Enabled', $this->resourceConf['enabled']);

        if($this->resourceConf['enabled']) {

            $this->resourceConf['datasetmap'] = $this->console->prompt('Dataset mapping', $this->resourceConf['datasetmap']);

            $this->resourceConf['hardware']['gpfs'] = $this->console->prompt('GPFS mount point (leave empty if no GPFS)', $this->resourceConf['hardware']['gpfs']);
        }

        call_user_func($this->callback, $this->resourceConf);
        return;
    }
}
