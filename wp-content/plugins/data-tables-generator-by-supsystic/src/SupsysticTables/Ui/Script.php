<?php


class SupsysticTables_Ui_Script extends SupsysticTables_Ui_Asset
{

    /**
     * Constructor
     */
    public function __construct()
    {
        parent::__construct();

        $this->hookName = 'wp_enqueue_scripts';
    }


    /**
     * Adds asset to the global WordPress assets queue.
     */
    public function enqueue()
    {
//        wp_enqueue_script(
//            $this->handle,
//            $this->source,
//            $this->dependencies,
//            $this->version
//        );

        wp_register_script(
            $this->handle,
            $this->source,
            $this->dependencies,
            $this->version
        );

        if ($this->hookName === 'admin_enqueue_scripts') {
            $this->load();
        }
    }

    /**
     * Loads the asset.
     */
    public function load()
    {
        wp_enqueue_script($this->handle);
        $this->loaded = true;
    }
}