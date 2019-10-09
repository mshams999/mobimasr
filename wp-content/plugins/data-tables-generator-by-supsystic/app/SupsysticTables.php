<?php

/**
 * Class SupsysticTables
 */
class SupsysticTables
{
    private $environment;

    public function __construct()
    {
        if (!class_exists('Rsc_Autoloader', false)) {
            require dirname(dirname(__FILE__)) . '/vendor/Rsc/Autoloader.php';
            Rsc_Autoloader::register();
        }

		add_action('init', array($this, 'addShortcodeButton'));

        $menuSlug = 'supsystic-tables';
        $pluginPath = dirname(dirname(__FILE__));
		$environment = new Rsc_Environment('st', '1.9.76', $pluginPath);

        /* Configure */
        $environment->configure(
            array(
                'optimizations'    	=> 1,
                'environment'      	=> $this->getPluginEnvironment(),
                'default_module'   	=> 'tables',
                'lang_domain'      	=> 'supsystic_tables',
                'lang_path'        	=> plugin_basename(dirname(__FILE__)) . '/langs',
                'plugin_prefix'    	=> 'SupsysticTables',
                'plugin_source'    	=> $pluginPath . '/src',
				'plugin_title_name' => 'Data Tables',
                'plugin_menu'      	=> array(
                    'page_title' => __('Tables by Supsystic', $menuSlug),
                    'menu_title' => __('Tables by Supsystic', $menuSlug),
                    'capability' => 'manage_options',
                    'menu_slug'  => $menuSlug,
                    'icon_url'   => 'dashicons-editor-table',
                    'position'   => '102.2',
                ),
                'shortcode_prefix'   				=> $menuSlug,
                'shortcode_name'   					=> defined('SUPSYSTIC_TABLES_SHORTCODE_NAME') ? SUPSYSTIC_TABLES_SHORTCODE_NAME : $menuSlug,
                'shortcode_part_name'   			=> defined('SUPSYSTIC_TABLES_PART_SHORTCODE_NAME') ? SUPSYSTIC_TABLES_PART_SHORTCODE_NAME : $menuSlug . '-part',
				'shortcode_cell_name'   			=> defined('SUPSYSTIC_TABLES_CELL_SHORTCODE_NAME') ? SUPSYSTIC_TABLES_CELL_SHORTCODE_NAME : $menuSlug . '-cell-full',
				'shortcode_value_name'				=> defined('SUPSYSTIC_TABLES_VALUE_SHORTCODE_NAME') ? SUPSYSTIC_TABLES_VALUE_SHORTCODE_NAME : $menuSlug . '-cell',
                'db_prefix'       					=> 'supsystic_tbl_',
                'hooks_prefix'						=> 'supsystic_tbl_',
				'ajax_url'		     				=> admin_url('admin-ajax.php'),
                'admin_url'							=> admin_url(),
                'plugin_db_update' 					=> true,
                'revision_key'     					=> '_supsystic_tables_rev',
                'revision'							=> 61,
				'welcome_page_was_showed'			=> get_option('supsystic_tbl_welcome_page_was_showed'),
				'promo_controller' 					=> 'SupsysticTables_Promo_Controller'
            )
        );
        
        $this->environment = $environment;
        $this->initFilesystem();
    }

    public function run()
    {
        $this->environment->run();
    }

    public function activate($bootstrap)
    {
//        if (!get_option($this->environment->getPluginName().'_installed', 1)) {
//            register_activation_hook($bootstrap, array($this, 'createSchema'));
//        }
    }

    public function createSchema()
    {
        global $wpdb;

        if (is_file($schema = dirname(__FILE__) . '/configs/dbschema.sql')) {
            $prefix = $wpdb->prefix . $this->environment
                    ->getConfig()
                    ->get('db_prefix');

            $sql = str_replace('%prefix%', $prefix, file_get_contents($schema));

            if (!function_exists('dbDelta')) {
                require_once(ABSPATH.'wp-admin/includes/upgrade.php');
            }
            $wpdb->query('SET FOREIGN_KEY_CHECKS=0');
            dbDelta($sql);
            $wpdb->query('SET FOREIGN_KEY_CHECKS=1');
            update_option($this->environment->getPluginName().'_installed', 1);
        }
    }

    public function dropSchema()
    {
        global $wpdb;

        $prefix = $wpdb->prefix . $this->environment
                ->getConfig()
                ->get('db_prefix');

        $tables = $wpdb->get_results('SHOW TABLES LIKE \''.$prefix.'%\'', ARRAY_N);

        if (count($tables) < 1) {
            return;
        }

        $wpdb->query('SET FOREIGN_KEY_CHECKS=0');
        foreach ($tables as $inded => $table) {
            $wpdb->query('DROP TABLE IF EXISTS '.array_pop($table).' CASCADE;');
        }

        $wpdb->query('SET FOREIGN_KEY_CHECKS=1');
    }

    public function deactivate($bootstrap)
    {
//        register_deactivation_hook($bootstrap, array($this, 'dropSchema'));
    }

    public function getEnvironment()
    {
        return $this->environment;
    }

    protected function getPluginEnvironment()
    {
		$environment = Rsc_Environment::ENV_PRODUCTION;

		if (defined('WP_DEBUG') && WP_DEBUG) {
			if (defined('SUPSYSTIC_STB_DEBUG') && SUPSYSTIC_STB_DEBUG) {
				$environment = Rsc_Environment::ENV_DEVELOPMENT;
			}
		}

        return $environment;
    }

    protected function initFilesystem()
    {
        $directories = array(
            'tmp' => '/supsystic-tables',
            'log' => '/supsystic-tables/log',
            'cache' => '/supsystic-tables/cache',
            'cache_tables' => '/supsystic-tables/cache/tables',
        );

        foreach ($directories as $key => $dir) {
            if (false !== $fullPath = $this->makeDirectory($dir)) {
                $this->environment->getConfig()->add('plugin_' . $key, $fullPath);
            }
        }
    }

    /**
     * Make directory in uploads directory.
     * @param string $directory Relative to the WP_UPLOADS dir
     * @return bool|string FALSE on failure, full path to the directory on success
     */
    protected function makeDirectory($directory)
    {
        $uploads = wp_upload_dir();

        $basedir = $uploads['basedir'];
        $dir = $basedir . $directory;
        if (!is_dir($dir)) {
            if (false === @mkdir($dir, 0775, true)) {
                return false;
            }
        } else {
            if (! is_writable($dir)) {
                return false;
            }
        }

        return $dir;
    }

	public function addShortcodeButton() {
		add_filter('mce_external_plugins', array($this, 'addButton'));
		add_filter('mce_buttons', array($this, 'registerButton'));
		wp_enqueue_script('jquery');
		if(is_admin()) {
			wp_enqueue_script('stb-bpopup-js', $this->environment->getConfig()->get('plugin_url') . '/app/assets/js/plugins/jquery.bpopup.min.js', array('jquery'), false, true);
			wp_enqueue_style('stb-bpopup', $this->environment->getConfig()->get('plugin_url') . '/app/assets/css/editor-dialog.css');
		}
	}

	public function addButton( $plugin_array ) {
		$plugin_array['addShortcodeDataTable'] = $this->environment->getConfig()->get('plugin_url') . '/app/assets/js/buttons.js';

		return $plugin_array;
	}

	public function registerButton( $buttons ) {
		array_push( $buttons, 'addShortcodeDataTable', 'selectShortcode' );

		return $buttons;
	}
}
