<?php


abstract class SupsysticTables_Ui_Asset implements SupsysticTables_Ui_AssetInterface
{
    /**
     * @var string
     */
    protected $hookName;

    /**
     * @var string
     */
    protected $handle;

    /**
     * @var string|null
     */
    protected $source;

    /**
     * @var string[]
     */
    protected $dependencies;

    /**
     * @var string|null
     */
    protected $version;

    /**
     * @var bool
     */
    protected $cachingAllowed;

    /**
     * @var bool
     */
    protected $loaded;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->dependencies = array();
        $this->cachingAllowed = true;
        $this->loaded = false;

        if (defined('WP_DEBUG') && WP_DEBUG) {
            $this->cachingAllowed = false;
            //$this->version = uniqid('_', false);
        }
    }

    public function __toString()
    {
        return $this->getHandle().' @ '.$this->getSource().'?version='.$this->getVersion();
    }

    /**
     * Adds asset to the global WordPress assets queue.
     */
    abstract public function enqueue();

    /**
     * Register current asset in the WordPress hook system.
     *
     * @throws UnexpectedValueException If hookName or handle isn't presented.
     */
    public function register()
    {
        if (!$this->hookName) {
            throw new UnexpectedValueException(
                'Mandatory property "hookName" is empty.'
            );
        }

        if (!$this->handle) {
            throw new UnexpectedValueException(
                'Mandatory property "handle" is empty.'
            );
        }

        add_action($this->hookName, array($this, 'enqueue'));
    }

    /**
     * Returns Handle.
     * @return string
     */
    public function getHandle()
    {
        return $this->handle;
    }

    /**
     * Sets Handle.
     * @param string $handle
     * @return $this
     */
    public function setHandle($handle)
    {
        $this->handle = strtolower((string)$handle);

        return $this;
    }

    /**
     * Returns Source.
     * @return null|string
     */
    public function getSource()
    {
        return $this->source;
    }

    /**
     * Sets Source.
     * @param null|string $source
     * @return $this
     */
    public function setSource($source)
    {
        $this->source = (string)$source;

        return $this;
    }

    /**
     * @param string $externalSource URL to the external resource.
     * @param bool $stripSchema Strip http or https prefix or not.
     * @return $this
     */
    public function setExternalSource($externalSource, $stripSchema = true)
    {
        if ((bool)$stripSchema) {
            $externalSource = preg_replace('#^https?:#', '', $externalSource);
        }

        return $this->setSource($externalSource);
    }

    /**
     * @param string $localSource
     * @return SupsysticTables_Ui_Asset
     */
    public function setLocalSource($localSource)
    {
        $baseUrl = plugin_dir_url(dirname(dirname(dirname(__FILE__))));

        return $this->setSource($baseUrl.'app/assets/'.$localSource);
    }

    /**
     * @param string|Rsc_Mvc_Module $module
     * @param string $moduleSource
     * @return SupsysticTables_Ui_Asset
     */
    public function setModuleSource($module, $moduleSource)
    {
        $baseUrl = plugin_dir_url(dirname(__FILE__));

        if (is_string($module)) {
            $module = $baseUrl . ucfirst($module);
        } elseif ($module instanceof Rsc_Mvc_Module) {
            $module = $module->getLocationUrl();
        } else {
            throw new InvalidArgumentException(
                'First parameter must be module name or the instance of the module.'
            );
        }

        return $this->setSource($module.'/assets/'.$moduleSource);
    }

    /**
     * Adds dependency.
     * @param string|SupsysticTables_Ui_Asset $dependency
     * @return $this
     */
    public function addDependency($dependency)
    {
        if ($dependency instanceof SupsysticTables_Ui_Asset) {
            $dependency = $dependency->getHandle();
        }

        $dependency = strtolower($dependency);

        if (in_array($dependency, $this->dependencies, false)) {
            return $this;
        }

        $this->dependencies[] = $dependency;

        return $this;
    }

    /**
     * Returns Dependencies.
     * @return string[]
     */
    public function getDependencies()
    {
        return $this->dependencies;
    }

    /**
     * Sets Dependencies.
     * @param string[] $dependencies
     * @return $this
     */
    public function setDependencies(array $dependencies)
    {
        $this->dependencies = $dependencies;

        return $this;
    }

    /**
     * Removes dependency.
     *
     * @param string $dependency
     * @return bool TRUE on success, FALSE otherwise
     */
    public function removeDependency($dependency)
    {
        if (false === $key = array_search(
                strtolower($dependency),
                $this->dependencies,
                false
            )
        ) {
            return false;
        }

        unset($this->dependencies[$key]);

        return true;
    }

    /**
     * Returns Version.
     * @return string
     */
    public function getVersion()
    {
        return $this->version;
    }

    /**
     * Sets Version.
     * @param string $version
     * @return $this
     */
    public function setVersion($version)
    {
        /*if (!$this->cachingAllowed) {
            $version = uniqid($version.'_');
        }*/

        $this->version = (string)$version;

        return $this;
    }

    /**
     * Returns CachingAllowed.
     * @return boolean
     */
    public function isCachingAllowed()
    {
        return $this->cachingAllowed;
    }

    /**
     * Sets CachingAllowed.
     * @param boolean $cachingAllowed
     * @return $this
     */
    public function setCachingAllowed($cachingAllowed)
    {
        $this->cachingAllowed = (bool)$cachingAllowed;

        return $this;
    }

    /**
     * Returns HookName.
     * @return string
     */
    public function getHookName()
    {
        return $this->hookName;
    }

    /**
     * Sets HookName.
     * @param string $hookName
     * @return $this
     */
    public function setHookName($hookName)
    {
        $this->hookName = $hookName;

        return $this;
    }

    public function isLoaded()
    {
        return $this->loaded;
    }
}