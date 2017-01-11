<?php
/**
 * @author Jeffrey T. Palmer <jtpalmer@buffalo.edu>
 */

namespace OpenXdmod\Setup;

/**
 * Resources setup.
 */
class SupremmSetup extends SubMenuSetupItem
{

    /**
     * menu.
     *
     * @var Menu
     */
    protected $menu;

    /**
     * True if setup should quit.
     *
     * @var bool
     */
    protected $quit;

    /**
     * @inheritdoc
     */
    public function __construct(Console $console)
    {
        parent::__construct($console);

        $items = array(
            new MenuItem('d', 'Setup database', new SupremmDbSetup($console)),
            new MenuItem('r', 'Configure resources', new SupremmResourcesSetup($console)),
            new MenuItem('q', 'Quit configuration', new SubMenuQuitSetup($console, $this))
        );

        $this->menu = new Menu($items, $this->console, 'SUPReMM module setup');
    }

    /**
     * @inheritdoc
     */
    public function handle()
    {
        $this->quit = false;

        while (!$this->quit) {
            $this->menu->display();
        }
    }

    /**
     * Call to exit the menu on the next cycle.
     */
    public function quit()
    {
        $this->quit = true;
    }

    /**
     * No options to save data for this submenu
     */
    public function save()
    {
    }
}
