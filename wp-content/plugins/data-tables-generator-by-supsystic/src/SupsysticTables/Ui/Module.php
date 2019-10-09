<?php


class SupsysticTables_Ui_Module extends SupsysticTables_Core_BaseModule
{
    /** @var  SupsysticTables_Ui_AssetInterface[] */
    private $assets;

    /**
     * {@inheritdoc}
     */
    public function onInit()
    {
        parent::onInit();

        $this->assets = array();
    }

    /**
     * {@inheritdoc}
     */
    public function afterModulesLoaded()
    {
        parent::afterModulesLoaded();
        $this->loadAssets();
    }

    /**
     * Returns Assets.
     * @return SupsysticTables_Ui_AssetInterface[]
     */
    public function getAssets()
    {
        return $this->assets;
    }

    /**
     * Sets Assets.
     * @param SupsysticTables_Ui_AssetInterface[] $assets
     */
    public function setAssets(array $assets)
    {
        if (count($assets) === 0) {
            $this->assets = array();
        }

        foreach ($assets as $asset) {
            $this->add($asset);
        }
    }

    /**
     * Adds the asset to the queue.
     * @param SupsysticTables_Ui_AssetInterface $asset
     * @return SupsysticTables_Ui_Module
     */
    public function add(SupsysticTables_Ui_AssetInterface $asset)
    {
        $this->assets[] = $asset;

        return $this;
    }

    /**
     * Creates new asset.
     * @param string $type Asset type (script or style)
     * @param string|null $handle Asset handle
     * @return SupsysticTables_Ui_AssetInterface|SupsysticTables_Ui_Asset
     */
    public function create($type, $handle = null)
    {
        $types = array('script', 'style');

        if (!in_array($type, $types, true)) {
            throw new InvalidArgumentException(
                sprintf(
                    'Invalid asset type "%s". Type must be one of this: %s',
                    $type,
                    implode(', ', $types)
                )
            );
        }

        $className = 'SupsysticTables_Ui_Style';
        if ($type === 'script') {
            $className = 'SupsysticTables_Ui_Script';
        }

        /** @var SupsysticTables_Ui_Asset $asset */
        $asset = new $className;

        if ($handle) {
            $asset->setHandle($handle);
        }

        return $asset;
    }

    /**
     * Creates new script.
     * @param string|null $handle Script handle
     * @return SupsysticTables_Ui_AssetInterface|SupsysticTables_Ui_Asset
     */
    public function createScript($handle = null)
    {
        return $this->create('script', $handle);
    }

    /**
     * Creates new style.
     * @param string|null $handle Style handle
     * @return SupsysticTables_Ui_AssetInterface|SupsysticTables_Ui_Asset
     */
    public function createStyle($handle = null)
    {
        return $this->create('style', $handle);
    }

    /**
     * Loads the assets
     */
    public function loadAssets()
    {
        if (count($this->assets) === 0) {
            return;
        }

        $isPluginPage = $this->getEnvironment()->isPluginPage();
        foreach ($this->assets as $asset) {
            if ('admin_enqueue_scripts' !== $asset->getHookName() || $isPluginPage) {
                $asset->register();
            }
        }
    }

	/**
	 * Checks is user logged in
	 */
	public function getCurrentUserInfo() {
		if(!function_exists('wp_get_current_user')) {
			$this->loadPlugins();
		}
		return wp_get_current_user();
	}
	public function isUserLoggedIn() {
		if(!function_exists('wp_get_current_user') || !function_exists('is_user_logged_in')) {
			$this->loadPlugins();
		}
		return is_user_logged_in();
	}

	public function loadPlugins() {
		require_once(ABSPATH. 'wp-includes/pluggable.php');
	}
}