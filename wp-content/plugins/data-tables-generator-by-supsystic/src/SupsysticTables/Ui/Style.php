<?php

class SupsysticTables_Ui_Style extends SupsysticTables_Ui_Asset
{
    /**
     * @var string
     */
    protected $media;

    /**
     * Constructor
     */
    public function __construct()
    {
        parent::__construct();

        $this->hookName = 'wp_enqueue_scripts';
        $this->media = 'all';
    }

    /**
     * Adds asset to the global WordPress assets queue.
     */
    public function enqueue()
    {
//        wp_enqueue_style(
//            $this->handle,
//            $this->source,
//            $this->dependencies,
//            $this->version,
//            $this->media
//        );

        wp_register_style(
            $this->handle,
            $this->source,
            $this->dependencies,
            $this->version,
            $this->media
        );

        if ($this->hookName === 'admin_enqueue_scripts') {
            $this->load();
        }
    }

    /**
     * Returns Media.
     * @return string
     */
    public function getMedia()
    {
        return $this->media;
    }

    /**
     * Sets Media.
     * @param string $media
     * @return $this
     */
    public function setMedia($media)
    {
        $this->media = (string)$media;

        return $this;
    }

    /**
     * Loads the asset.
     */
    public function load()
    {
        wp_enqueue_style($this->handle);
        $this->loaded = true;
    }
}