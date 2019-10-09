<?php


class SupsysticTables_Settings_Module extends SupsysticTables_Core_BaseModule
{
    /**
     * {@inheritdoc}
     */
    public function onInit()
    {
        parent::onInit();
        $this->registerMenu();
        add_action('admin_enqueue_scripts', array($this, 'registerAssets'));
    }

    public function registerAssets() {
        $modulePath = untrailingslashit(plugin_dir_url(__FILE__));
		$appPath = untrailingslashit(plugin_dir_url(dirname(dirname(dirname(__FILE__)))) . 'app');

        wp_register_script(
            'supsystic-tables-settings-index-js', 
            $modulePath . '/assets/js/settings-index.js', 
            array('supsystic-settings-chosen'), 
            $this->config('plugin_version'), 
            true
        );

        wp_register_style(
            'supsystic-tables-settings-index-css', 
            $modulePath . '/assets/css/settings.css', 
            array(), 
            $this->config('plugin_version')
        );

        wp_register_script(
            'supsystic-settings-chosen',
			$appPath . '/assets/js/plugins/chosen.jquery.min.js',
            array(), 
            $this->config('plugin_version'), 
            true
        );

    }

    public function getTemplatesAliases()
    {
        return array(
            'settings.index' => '@settings/index.twig'
        );
    }

    private function registerMenu()
    {
        $menu = $this->getMenu();
        $plugin_menu = $this->getConfig()->get('plugin_menu');
        $capability = $plugin_menu['capability'];

        $submenu = $menu->createSubmenuItem();
        $submenu->setCapability($capability)
            ->setMenuSlug($menu->getMenuSlug() . '&module=' . $this->getModuleName())
            ->setMenuTitle($this->translate('Settings'))
            ->setPageTitle($this->translate('Settings'))
            ->setModuleName('settings');
		// Avoid conflicts with old vendor version
		if(method_exists($submenu, 'setSortOrder')) {
			$submenu->setSortOrder(40);
		}

		// We do not register menu because we need to change its position later
        $menu->addSubmenuItem('settings', $submenu);
    }

}