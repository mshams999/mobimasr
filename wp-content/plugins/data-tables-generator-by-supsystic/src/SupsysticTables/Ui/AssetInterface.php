<?php


interface SupsysticTables_Ui_AssetInterface
{
    /**
     * Register current asset in the WordPress hook system.
     */
    public function register();

    /**
     * Returns asset hook.
     * @return string
     */
    public function getHookName();

    /**
     * Loads the asset.
     */
    public function load();
}