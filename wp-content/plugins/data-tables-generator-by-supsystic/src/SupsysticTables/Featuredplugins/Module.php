<?php


class SupsysticTables_Featuredplugins_Module extends SupsysticTables_Core_BaseModule
{

    /**
     * {@inheritdoc}
     */
    public function onInit()
    {
		parent::onInit();
        $this->registerMenu();
    }

    /**
     * Loads the assets required by the module
     */
    public function afterUiLoaded(SupsysticTables_Ui_Module $ui)
    {
		parent::afterUiLoaded($ui);
		
		if($this->getEnvironment()->isModule('featuredplugins')) {
			$hook = 'admin_enqueue_scripts';
			$ui->add(
				$ui->createStyle('supsystic-tables-bootstrap-simple-css')->setHookName(
					$hook
				)->setModuleSource($this, 'css/bootstrap-simple.css')
			);
			$ui->add(
				$ui->createStyle('supsystic-tables-featured-plugins-css')->setHookName(
					$hook
				)->setModuleSource($this, 'css/admin.featured-plugins.css')
			);
		}
    }

    public function registerMenu()
    {
        $menu = $this->getMenu();
        $plugin_menu = $this->getConfig()->get('plugin_menu');
        $capability = $plugin_menu['capability'];
        $submenu = $menu->createSubmenuItem();

        $submenu->setCapability($capability)
            ->setMenuSlug($menu->getMenuSlug(). '&module=featuredplugins')
            ->setMenuTitle($this->translate('Featured Plugins'))
            ->setPageTitle($this->translate('Featured Plugins'))
            ->setModuleName('featuredplugins');
		// Avoid conflicts with old vendor version
		if(method_exists($submenu, 'setSortOrder')) {
			$submenu->setSortOrder(99);
		}

        $menu->addSubmenuItem('featuredplugins', $submenu);
    }
} 