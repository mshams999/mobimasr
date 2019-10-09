<?php


class SupsysticTables_Core_Module extends SupsysticTables_Core_BaseModule
{
    /**
     * @var SupsysticTables_Core_ModelsFactory
     */
    protected $modelsFactory;

	private $mainRequestRoute;

	private $mainRequestAction;

	private $mainRequestError = '';

	private $frontendMethods = array(
		'ajax' => array(
			'tables' => array('saveEditableFields', 'getPageRows'),
			'woocommerce' => array('productsAddToCart')
		),
		'post' => array(
			'importer' => array('import'),
		),
	);

    /**
     * {@inheritdoc}
     */
    public function onInit()
    {
        parent::onInit();

		$path = dirname(dirname(dirname(dirname(__FILE__))));
		$url = plugins_url(basename($path));
		$config = $this->getEnvironment()->getConfig();

		$config->add('plugin_url', $url);
		$config->add('plugin_path', $path);

        $this->registerMainRequestHandler();
        $this->registerTwigFunctions();
        $this->update();

        if ((function_exists('get_magic_quotes_gpc') && get_magic_quotes_gpc()) && $this->getEnvironment()->isPluginPage()) {
            add_action('admin_notices', array($this, 'noticeMagicQuotes'));
        }

        //add_action('admin_menu', array($this, 'removeDefaultSubMenu'), 999);
    }

	public function enquieAjaxUrl() {
		wp_localize_script('tables-core', 'ajax_obj', array(
			'ajaxurl' => admin_url('admin-ajax.php' ),
		));
	}

	public function addCommonPluginData() {
		$environment = $this->getEnvironment();

		$jsData = array(
			'ajaxurl' 		=> admin_url('admin-ajax.php'),
			'siteUrl'		=> get_bloginfo('wpurl'). '/',
			'pluginsUrl'	=> plugins_url(),
			'isAdmin'		=> is_admin(),
		);
		if(is_admin()) {
			$jsData['isPro'] = $environment->isPro();
			$jsData['isWooPro'] = $environment->isWooPro();
		}
		wp_localize_script('jquery', 'SDT_DATA', $jsData);
	}

	public  function addFontsData() {
		$standardFontsList = array();
		$allFontsList = array();
		if($this->getEnvironment()->isPro()) {
			$tablesModule = $this->getModule('tables');
			$standardFontsList = $tablesModule->getStandardFontsList();
			$allFontsList = $tablesModule->getFontsList();
		}
		wp_localize_script('tables-core', 'g_stbStandartFontsList', $standardFontsList);
		wp_localize_script('tables-core', 'g_stbAllFontsList', $allFontsList);
	}

	/**
     * {@inheritdoc}
     */
    public function afterUiLoaded(SupsysticTables_Ui_Module $ui)
    {
        parent::afterUiLoaded($ui);

        $environment = $this->getEnvironment();
        $cachingAllowed = $environment->isProd();
        $pluginVersion = $environment->getConfig()->get('plugin_version');
        $hookName = 'admin_enqueue_scripts';
		$dynamicHookName = is_admin() ? $hookName : 'wp_enqueue_scripts';

        /* jQuery */
        $ui->add(
			$ui->createScript('jquery')
			->setHookName($dynamicHookName)
		);

		$ui->add(
			$ui->createScript('jquery-ui-dialog')
				->setHookName($hookName)
		);

		/* Core script with common functions in supsystic.Tables namespace */
		$ui->add(
			$ui->createScript('tables-core')
				->setHookName($dynamicHookName)
				->setModuleSource($this, 'js/core.js')
				->addDependency('jquery')
				->setCachingAllowed($cachingAllowed)
				->setVersion($pluginVersion)
		);
		add_action('wp_enqueue_scripts', array($this, 'enquieAjaxUrl'), 999);
		add_action($dynamicHookName, array($this, 'addCommonPluginData'), 999);
		add_action($dynamicHookName, array($this, 'addFontsData'), 999);

		/* Script for creating new table by click on main plugin tab "Add table" */
		$ui->add(
			$ui->createScript('tables-create-table')
				->setHookName($hookName)
				->setModuleSource($this, 'js/create-table.js')
				->setDependencies(array('jquery', 'jquery-ui-dialog'))
				->setCachingAllowed($cachingAllowed)
				->setVersion($pluginVersion)
		);

		$ui->add(
			$ui->createStyle('supsystic-tables-base')
				->setHookName($hookName)
				->setModuleSource($this, 'css/base.css')
				->setCachingAllowed($cachingAllowed)
				->setVersion($pluginVersion)
		);

		/* Tooltipster */
		$ui->add(
			$ui->createStyle('tables-tooltipster')
				->setHookName($hookName)
				->setModuleSource($this, 'css/tooltipster.css')
				->setCachingAllowed($cachingAllowed)
				->setVersion($pluginVersion)
		);

		$ui->add(
			$ui->createScript('tables-tooltipster')
				->setHookName($hookName)
				->setModuleSource($this, 'js/jquery.tooltipster.min.js')
				->addDependency('jquery')
				->setCachingAllowed(true)
				->setVersion($pluginVersion)
		);

		/* Bootstrap */
		$ui->add(
			$ui->createScript('tables-bootstrap')
				->setHookName($hookName)
				->setLocalSource('js/libraries/bootstrap/bootstrap.min.js')
				->addDependency('jquery')
				->setCachingAllowed(true)
				->setVersion('3.3.1')
		);

		/* Chosen */
		$ui->add(
			$ui->createStyle('tables-chosen')
				->setHookName($hookName)
				->setLocalSource('css/chosen.min.css')
				->setCachingAllowed($cachingAllowed)
				->setVersion($pluginVersion)
		);

		$ui->add(
			$ui->createScript('tables-chosen')
				->setHookName($hookName)
				->setLocalSource('js/plugins/chosen.jquery.min.js')
				->addDependency('jquery')
				->setCachingAllowed(true)
				->setVersion('1.4.2')
		);

		/* iCheck */
		$ui->add(
			$ui->createScript('tables-iCheck')
				->setHookName($hookName)
				->setLocalSource('js/plugins/icheck.min.js')
				->addDependency('jquery')
				->setCachingAllowed(true)
				->setVersion('1.0.2')
		);

		/* Supsystic UI */
		$ui->add(
			$ui->createStyle('tables-bootstrap')
				->setHookName($hookName)
				->setLocalSource('css/libraries/bootstrap/bootstrap.min.css')
				->setCachingAllowed($cachingAllowed)
				->setVersion($pluginVersion)
		);

		$ui->add(
			$ui->createStyle('tables-ui-inputs')
				->setHookName($hookName)
				->setLocalSource('css/libraries/supsystic/inputs.css')
				->setCachingAllowed($cachingAllowed)
				->setVersion($pluginVersion)
		);

		$ui->add(
			$ui->createStyle('tables-ui-buttons')
				->setHookName($hookName)
				->setLocalSource('css/libraries/supsystic/buttons.css')
				->setCachingAllowed($cachingAllowed)
				->setVersion($pluginVersion)
		);

		$ui->add(
			$ui->createStyle('tables-ui-forms')
				->setHookName($hookName)
				->setLocalSource('css/libraries/supsystic/forms.css')
				->setCachingAllowed($cachingAllowed)
				->setVersion($pluginVersion)
		);

		$ui->add(
			$ui->createStyle('supsystic-font-awesome')
				->setHookName($hookName)
				->setExternalSource('//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css')
				->setCachingAllowed($cachingAllowed)
				->setVersion('4.7.0')
		);

		$ui->add(
			$ui->createStyle('tables-ui-styles')
				->setHookName($hookName)
				->setLocalSource('css/supsystic-ui.css')
				->setCachingAllowed($cachingAllowed)
				->setVersion($pluginVersion)
		);

		$ui->add(
			$ui->createScript('tables-ui')
				->setHookName($hookName)
				->setLocalSource('js/supsystic.ui.js')
				->addDependency('jquery')
				->setCachingAllowed($cachingAllowed)
				->setVersion($pluginVersion)
		);

		if ($environment->isAction('index')) {
			$appAssetsPath = plugin_dir_path(dirname(dirname(dirname(__FILE__)))).'app/assets/';
			$locale = $environment->getLangCode2Letter();
			$locale = file_exists($appAssetsPath.'js/i18n/grid.locale-'.$locale.'.js') ? $locale : 'en';

			$ui->add(
				$ui->createStyle('jqgrid-css')
					->setHookName($hookName)
					->setLocalSource('css/libraries/jqGrid/ui.jqgrid.css')
					->setCachingAllowed($cachingAllowed)
					->setVersion('4.7.0')
			);
			$ui->add(
				$ui->createScript('jquery-jqGrid-locale')
					->setHookName($hookName)
					->setLocalSource('js/i18n/grid.locale-'.$locale.'.js')
					->addDependency('jquery')
					->setCachingAllowed($cachingAllowed)
					->setVersion($pluginVersion)
			);
			$ui->add(
				$ui->createScript('jquery-jqGrid')
					->setHookName($hookName)
					->setLocalSource('js/libraries/jqGrid/jquery.jqGrid.min.js')
					->addDependency('jquery')
					->setCachingAllowed($cachingAllowed)
					->setVersion($pluginVersion)
			);
		}
    }

	/**
     * Returns the models factory
     * @return SupsysticTables_Core_ModelsFactory
     */
    public function getModelsFactory()
    {
        if (!$this->modelsFactory) {
            $this->modelsFactory = new SupsysticTables_Core_ModelsFactory(
                $this->getEnvironment()
            );
        }

        return $this->modelsFactory;
    }

    public function removeDefaultSubMenu()
    {
        global $submenu;
        if (is_admin()) {
			unset($submenu[$this->getEnvironment()->getMenu()->getMenuSlug()][0]);
        }
    }

	/**
	 * Parse all requests on backend and frontend.
	 * @return mixed
	 */
	public function parseMainRequest() {
		$request = $this->getRequest();
		$this->setMainRequestRoute($request->post->get('route'));
		$this->setMainRequestAction($request->post->get('action'));
	}

	public function setMainRequestRoute($route) {
		$this->mainRequestRoute = $route;
	}

	public function getMainRequestRoute() {
		return $this->mainRequestRoute;
	}

	public function setMainRequestAction($action) {
		$this->mainRequestAction = $action;
	}

	public function getMainRequestAction() {
		return $this->mainRequestAction;
	}

	public function getMainRequestError() {
		return $this->mainRequestError;
	}

	public function setMainRequestError($error) {
		$this->mainRequestError = $error;
	}

	public function getFrontendMethods($type = false) {
		if(!empty($type)) {
			return !empty($this->frontendMethods[$type]) ? $this->frontendMethods[$type] : false;
		}
		return $this->frontendMethods;
	}

    /**
     * Handles the ajax requests and returns the response.
     * @return mixed
     */
	public function handleAjaxRequest()
	{
		$this->handleMainRequest(true);
	}

	public function handlePostRequest()
	{
		$this->handleMainRequest();
	}

    private function handleMainRequest($isAjax = false)
    {
		$environment = $this->getEnvironment();
		$request = $this->getRequest();
		$route = $this->getMainRequestRoute();
		$isDebug = defined('WP_DEBUG') && WP_DEBUG;
		$isError = false;

        if (!array_key_exists('module', $route)) {
			$isError = true;
			$message = $environment->translate('Invalid route specified: missing "module" key.');
			$this->throwHandleMainRequestError($message, $isAjax, $isDebug);
        }
        $moduleName = $route['module'];
		$actionName = $isAjax ? 'indexAction' : '';

		if (array_key_exists('action', $route)) {
			$actionName = $route['action'] . 'Action';
		}


		$module = $environment->getModule($moduleName);

        if (!$module) {
			$isError = true;
			$message = sprintf($environment->translate('You are requested to the non-existing module "%s".'), $moduleName);
			$this->throwHandleMainRequestError($message, $isAjax, $isDebug);
        }
        if (!method_exists($module->getController(), $actionName)) {
			$isError = true;
			$message = sprintf($environment->translate('You are requested to the non-existing route: %s::%s'), $moduleName, $actionName);
			$this->throwHandleMainRequestError($message, $isAjax, $isDebug);
		}
		if($isAjax) {
			$request->headers->add('X_REQUESTED_WITH', 'XMLHttpRequest');
		}
		if($isAjax || (!$isAjax && !$isError)) {
			return call_user_func_array(array($module->getController(), $actionName), array($request));
		}
    }

	private function throwHandleMainRequestError($message, $isAjax, $isDebug) {
		if ($isAjax) {
			wp_send_json_error(array('message' => $message));
		} else {
			if ($isDebug) {
				$this->setMainRequestError($message);
			}
		}
	}

    public function buildProUrl(array $parameters = array())
    {
        $config = $this->getEnvironment()->getConfig();
        $homepage = $config->get('plugin_homepage');
        $campaign = $config->get('campaign');

        if (!array_key_exists('utm_source', $parameters)) {
            $parameters['utm_source'] = 'plugin';
        }

        if (!array_key_exists('utm_campaign', $parameters)) {
            $parameters['utm_campaign'] = $campaign;
        }

        return $homepage . '?' . http_build_query($parameters);
    }
    public function getCdnUrl() {
		return (is_ssl() ? 'https' : 'http').'://supsystic-42d7.kxcdn.com/';
	}

	public function addPregReplaceFilter($input, $regexp, $replace)
	{
		return preg_replace($regexp, $replace, $input);
	}

    public function noticeMagicQuotes()
    {
        $message = sprintf(
            $this->getEnvironment()->translate(
                'Your PHP configuration has enabled "%s" directive. ' .
                'This is deprecated directive and we are can not guarantee ' .
                'that the plugin will work properly. To turn off this directive check the %s tutorial %s.'
            ),
            '<strong>magic_quotes_gpc</strong>',
            '<a href="http://php.net/manual/en/security.magicquotes.disabling.php" target="_blank">',
            '<sup><i class="fa fa-fw fa-external-link"></i></sup></a>'
        );

        echo '<div class="error"><p>' . $message . '</p></div>';
    }

	/**
	 * Registers the ajax request handler
	 */
    private function registerMainRequestHandler()
	{
		$this->parseMainRequest();
		$route = $this->getMainRequestRoute();
		$action = $this->getMainRequestAction();
		$config = $this->getEnvironment()->getConfig();
		$action_name = 'wp_ajax_' . $config['plugin_menu']['menu_slug'];
		$ajaxFrontendMethods = $this->getFrontendMethods('ajax');
		$postFrontendMethods = $this->getFrontendMethods('post');
		$isFrontendAjax = false;
		$isFrontendPost = false;

		// Ajax handler (for backend and frontend)
		if(!empty($route) && !empty($ajaxFrontendMethods)) {
			foreach($ajaxFrontendMethods as $module => $actions) {
				if(isset($route['module']) && $module == $route['module']) {
					if(isset($route['action']) && in_array($route['action'], $actions)) {
						$isFrontendAjax = true;
					}
				}
			}
		}
		if($isFrontendAjax && !is_user_logged_in()) {
			$action_name = 'wp_ajax_nopriv_' . $config['plugin_menu']['menu_slug'];
		}
		add_action($action_name, array($this, 'handleAjaxRequest'));

		// Post handler (for frontend only)
		if($action == $config['plugin_menu']['menu_slug'] && !empty($route) && !empty($postFrontendMethods)) {
			foreach($postFrontendMethods as $module => $actions) {
				if(isset($route['module']) && $module == $route['module']) {
					if(isset($route['action']) && in_array($route['action'], $actions)) {
						$isFrontendPost = true;
					}
				}
			}
		}
		if(!is_admin() && $isFrontendPost) {
			add_action('init', array($this, 'handlePostRequest'));
		}
	}

    /**
     * Updates the plugin database if it is needed.
     */
    private function update()
    {
        $environment = $this->getEnvironment();
        $config = $environment->getConfig();

        $optionName = $config->get('hooks_prefix') . 'plugin_version';
        $currentVersion = $config->get('plugin_version');
        $oldVersion = get_option($optionName);

        if (version_compare($oldVersion, $currentVersion) === -1) {
			if (function_exists('is_multisite') && is_multisite()) {
				global $wpdb;
				$blog_id = $wpdb->get_col("SELECT blog_id FROM $wpdb->blogs");
				foreach ($blog_id as $id) {
					if (switch_to_blog($id)) {
						$this->cleanTablesCache();
						update_option($optionName, $currentVersion);
						restore_current_blog();
					}
				}
			} else {
				$this->cleanTablesCache();
				update_option($optionName, $currentVersion);
			}
        }

        $revision = array(
            'current' => (int)$config->get('revision'),
            'installed' => (int)get_option($config->get('revision_key'), -1)
        );

        if ($revision['current'] <= $revision['installed']) {
            return;
        }

        if (function_exists('is_multisite') && is_multisite()) {
				global $wpdb;
				$blog_id = $wpdb->get_col("SELECT blog_id FROM $wpdb->blogs");
				foreach ($blog_id as $id) {
					if (switch_to_blog($id)) {
						$this->makeDbUpdate($revision);
						restore_current_blog();
					}
				}
			} else {
				$this->makeDbUpdate($revision);
			}
    }
	
	private function makeDbUpdate($revision) {
		$environment = $this->getEnvironment();
        $config = $environment->getConfig();
		
		/** @var SupsysticTables_Core_Model_Core $core */
        $core = $this->getModelsFactory()->get('core');
        $updatesPath = $this->getLocation() . '/updates';

        for ($i = $revision['installed']; $i <= $revision['current']; $i++) {
            $file = $updatesPath . '/rev-'.$i.'.sql';

            if (!file_exists($file)) {
                continue;
            }

            try {
                $core->updateFromFile($file);
            } catch (Exception $e) {
                if (!$environment->isPluginPage()) {
                    return;
                }

                wp_die(
                    sprintf(
                        'Failed to update plugin database. Reason: %s',
                        $e->getMessage()
                    )
                );
            }
        }

        update_option($config->get('revision_key'), $revision['current']);
	}

	public function getPluginDirectoryUrl($path)
	{
		return plugin_dir_url($this->getEnvironment()->getPluginPath() . '/index.php') . '/' . $path;
	}

    private function registerTwigFunctions()
    {
        $twig = $this->getEnvironment()->getTwig();

		$twig->addFunction(
			new Twig_SimpleFunction('plugin_directory_url', array($this, 'getPluginDirectoryUrl'))
		);
		$twig->addFunction(
			new Twig_SimpleFunction('build_pro_url', array($this, 'buildProUrl'))
		);
        $twig->addFunction(
			new Twig_SimpleFunction('translate', array($this, 'translate'))
        );
        if (function_exists('dump') && $this->getEnvironment()->isDev()) {
            $twig->addFunction(
				new Twig_SimpleFunction('dump', 'dump')
			);
        }
		if (function_exists('preg_replace')) {
			$twig->addFilter(
				new Twig_SimpleFilter('preg_replace', array($this, 'addPregReplaceFilter'))
			);
		}
    }

    private function cleanTablesCache() {
        $cachePath = $this->getConfig()->get('plugin_cache_tables');
        if ($cachePath) {
            array_map('unlink', glob("$cachePath/*"));
        }
    }
}
