<?php

/**
 * Class SocialSharing_Promo_Module
 *
 * Promo module.
 */
class SupsysticTables_Promo_Module extends SupsysticTables_Core_BaseModule
{
	/**
	 * Module initialization.
	 */
	public function onInit()
	{
		parent::onInit();

		if(is_admin()) {
			add_action('admin_init', array($this, 'loadAdminPromoAssets'));
			add_action('wp_ajax_supsystic-tables-tutorial-close', array($this, 'endTutorial'));

			$dispatcher = $this->getEnvironment()->getDispatcher();
			$dispatcher->on('messages', array($this, 'renderDiscountMsg'));
			
			$this->_checkFirstRun();
			add_action('admin_footer', array($this, 'checkPluginDeactivation'));
		}
	}
	
	private function _setUsed() {
		update_option($this->config('db_prefix'). 'plug_was_used', 1);
	}
	
	private function _isUsed() {
		return (int) get_option($this->config('db_prefix'). 'plug_was_used');
	}
	
	private function _checkFirstRun() {
		if(!$this->_isUsed()) {	// First time plugin run
			$this->getController()->getModel('promo')->firstRun();
			$this->_setUsed();
		}
	}

	public function loadAdminPromoAssets() {
		if (!get_user_meta(get_current_user_id(), 'supsystic-tables-tutorial_was_showed', true)) {
			add_action('admin_enqueue_scripts', array($this, 'enqueueTutorialAssets'));
		}
	}

	public function enqueueTutorialAssets()
	{
		$modulePath = untrailingslashit(plugin_dir_url(__FILE__));
		wp_enqueue_script(
				'supsystic-tables-step-tutorial',
				$modulePath . '/assets/js/tutorial.js',
				array('wp-pointer')
			);
		wp_enqueue_style('wp-pointer');

		$data = array(
			'next'  => $this->translate('Next'),
			'close' => $this->translate('Close Tutorial'),
			'pointersData'	=> $this->pointers(),
		);

		wp_localize_script('supsystic-tables-step-tutorial', 'DataTablesPromoPointers', $data);
	}

	public function pointers()
	{
		return array(
			array(
				'id' => 'step-0',
				'class' => 'supsystic-tables-tutorial-step-0',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Welcome to Data Tables plugin by Supsystic!')),
				'content'   => sprintf('<p>%s</p>', $this->translate('Thank you for choosing our Data Tables plugin. Just click here to start using it - and we will show you it\'s possibilities and powerfull features.')),
				'target' => '#toplevel_page_supsystic-tables',
				'edge'	  => 'left',
				'align'	 => 'left',
				'nextURL' => $this->getEnvironment()->generateUrl('overview')
			),
			array(
				'id' => 'step-1',
				'class' => 'supsystic-tables-tutorial-step-1',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Hello! This is the Data Tables by Supsystic')),
				'content'   => sprintf('<p>%s</p>', $this->translate('Thank you for choosing our Data Tables plugin. Let’s make a quick tour through features and main options of the plugin. Just click “Next” button.')),
				'target' => 'nav.supsystic-navigation li:eq(0)',
				'edge'	  => 'top',
				'align'	 => 'left',
				'nextURL' => $this->getEnvironment()->generateUrl('tables', 'index')
			),
			array(
				'id' => 'step-2',
				'class' => 'supsystic-tables-tutorial-step-2',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Create your first table')),
				'content'   => sprintf('<p>%s</p>', $this->translate('Click on the button “Add new table” and see the first form, which you need to fill in. A very simple step!')),
				'target' => 'nav.supsystic-navigation li:eq(1)',
				'edge'	  => 'top',
				'align'	 => 'left',
				'nextURL' => false,
			),
			array(
				'id' => 'step-3',
				'class' => 'supsystic-tables-tutorial-step-3',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Enter the name and create Data Table')),
				'content'   => sprintf('<p>%s</p>', $this->translate('Fill the table title and choose the number of columns and rows. Don’t worry, you will be able to change it (add or delete some) later!')),
				'target' => '#addDialog',
				'edge'	  => 'left',
				'align'	 => 'left',
				'nextURL' => false,
			),
			array(
				'id' => 'step-4',
				'class' => 'supsystic-tables-tutorial-step-4',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Settings')),
				'content'   => sprintf('<p>%s</p>', $this->translate('Main Settings of your first table. Here you can see main settings which are conected with languages, table elements, styling and other different editors settings. Generally it’s a tab where you can edit the visual part of the whole table, switch on/off the responsive mode, set pagination etc.')),
				'target' => '.tabs-wrapper li:eq(1)',
				'edge'	  => 'top',
				'align'	 => 'left',
				'nextURL' => '#',
			),
			array(
				'id' => 'step-5',
				'class' => 'supsystic-tables-tutorial-step-5',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Editor')),
				'content'   => sprintf('<p>%s</p>', $this->translate('The most important part of settings - Editor. Here you can fill all the cells of your table, add some colors, play with fonts and sizes. This insert also allows you to change the alignment of your font, add formats (percents, currency), images and links to make your table more visual attraction.')),
				'target' => '.tabs-wrapper li:eq(2)',
				'edge'	  => 'top',
				'align'	 => 'left',
				'nextURL' => '#',
			),
			array(
				'id' => 'step-6',
				'class' => 'supsystic-tables-tutorial-step-6',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Preview')),
				'content'   => sprintf('<p>%s</p>', $this->translate('Preview insert for your comfort. Before updating the table on your page - you can see the result of your efforts and changes, look at it and enjoy the final outcome.')),
				'target' => '.tabs-wrapper li:eq(3)',
				'edge'	  => 'top',
				'align'	 => 'left',
				'nextURL' => '#',
			),
			array(
				'id' => 'step-7',
				'class' => 'supsystic-tables-tutorial-step-7',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('CSS Editor')),
				'content'   => sprintf('<p>%s</p>', $this->translate('In case you have special or at least, basic knowledge of CSS code - you can easily change the table here. Just make sure that you know, what you are doing and you will not destroy the table.')),
				'target' => '.tabs-wrapper li:eq(4)',
				'edge'	  => 'top',
				'align'	 => 'left',
				'nextURL' => '#',
			),
			array(
				'id' => 'step-8',
				'class' => 'supsystic-tables-tutorial-step-8',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Diagrams')),
				'content'   => sprintf('<p>%s</p>', $this->translate('Diagrams - this is a Pro feature of our plugin, which can help you to follow the statistics of your table. Several types for every taste and any wishes.')),
				'target' => '.tabs-wrapper li:eq(5)',
				'edge'	  => 'top',
				'align'	 => 'left',
				'nextURL' => '#',
			),
			array(
				'id' => 'step-9',
				'class' => 'supsystic-tables-tutorial-step-9',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Import/Export')),
				'content'   => sprintf('<p>%s</p>', $this->translate('With these two buttons in our Pro version you can Import any table of csv format and Export the whole table, which you have done.')),
				'target' => '.control-buttons li:eq(3)',
				'edge'	  => 'right',
				'align'	 => 'right',
				'nextURL' => '#',
			),
			array(
				'id' => 'step-10',
				'class' => 'supsystic-tables-tutorial-step-10',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Well done!')),
				'content'   => sprintf('<p>%s</p>', $this->translate('<b>Upgrading</b> <br>Once you have purchased Premium version of plugin  - you’ll have to enter license key (you can find it in your personal account on our site). Go to the License tab and enter your email and license key. Once you have activated your PRO license - you can use all its advanced options. <br><br>That’s all. From this moment you can use your Data Table without any doubt. But if you still have some question - do not hesitate to contact us through our <a href="https://supsystic.com/contact-us/">internal support</a> or on our <a href="http://supsystic.com/forum/datatable-plugin/">Supsystic Forum.</a> Besides you can always describe your questions on <a href="https://wordpress.org/support/plugin/data-tables-generator-by-supsystic">WordPress Ultimate Forum.</a> <br><br><b>Enjoy this plugin?</b> <br>It will be nice if you`ll help us and boost plugin with <a href="https://wordpress.org/support/view/plugin-reviews/data-tables-generator-by-supsystic?rate=5#postform/">Five Stars rating on WordPress.org.</a> <br><br>We hope that you like our Data Table plugin and wish you all the best! Good luck!')),
				'target' => '.tabs-wrapper li:eq(1)',
				'edge'	  => 'top',
				'align'	 => 'left',
				'nextURL' => '#',
			)
		);
	}

	public function endTutorial() {
		update_user_meta(get_current_user_id(), 'supsystic-tables-tutorial_was_showed', 1);
	}

	public function renderDiscountMsg()
	{
		$environment = $this->getEnvironment();
		if($environment->isPro() && $environment->isModule('license') && $environment->getModule('license')->isActive()) {
			$proPluginsList = array(
				'ultimate-maps-by-supsystic-pro', 'newsletters-by-supsystic-pro', 'contact-form-by-supsystic-pro', 'live-chat-pro',
				'digital-publications-supsystic-pro', 'coming-soon-supsystic-pro', 'price-table-supsystic-pro', 'tables-generator-pro',
				'social-share-pro', 'popup-by-supsystic-pro', 'supsystic_slider_pro', 'supsystic-gallery-pro', 'google-maps-easy-pro',
				'backup-supsystic-pro',
			);
			$activePluginsList = get_option('active_plugins', array());
			$activeProPluginsCount = 0;
			foreach($activePluginsList as $actPl) {
				foreach($proPluginsList as $proPl) {
					if(strpos($actPl, $proPl) !== false) {
						$activeProPluginsCount++;
					}
				}
			}
			if($activeProPluginsCount === 1) {
				$twig = $this->getEnvironment()->getTwig();
				$twig->display('@promo/discountMessage.twig', array(
					'bundlePageLink' => '//supsystic.com/all-plugins/',
					'buyLink' => $this->getDiscountBuyUrl(),
				));
			}
		}
	}

	public function getDiscountBuyUrl() {
		$environment = $this->getEnvironment();
		$pluginCode = $environment->getConfig()->get('plugin_product_code');
		$license = $environment->getModule('license')->getHelper()->getCredentials();
		$license['key'] = md5($license['key']);
		$license = urlencode(base64_encode(implode('|', $license)));
		return 'http://supsystic.com/?mod=manager&pl=lms&action=extend&plugin_code='. $pluginCode. '&lic='. $license;
	}
	
	public function checkPluginDeactivation() {
		if(function_exists('get_current_screen')) {
			$screen = get_current_screen();
			if($screen && isset($screen->base) && $screen->base == 'plugins') {
				$twig = $this->getEnvironment()->getTwig();
				$twig->display('@promo/pluginDeactivation.twig', array(
					'pluginName' => $this->getConfig()->get('plugin_title_name'),
				));
				$modulePath = untrailingslashit(plugin_dir_url(__FILE__));
				wp_enqueue_script('jquery-ui-dialog');
				wp_enqueue_script(
					$this->config('db_prefix'). 'plug-deactivation',
					$modulePath . '/assets/js/admin.plugins.js',
					array('jquery-ui-dialog')
				);
				// And you will ask - "So, why we actyally have OOP, MVC and other patterns here - 
				// if only one possibility to acomplish your goal - is to make such dump codes?"
				// And I will answer - "I don't know" ........
				$pluginPath = $this->getEnvironment()->getPluginPath();
				$pluginDirName = basename($pluginPath);
				$pluginUrl = plugin_dir_url($pluginPath). $pluginDirName. '/';

				wp_enqueue_script('jquery-ui-dialog');
				
				/*$ui->createStyle('tables-ui-styles')
				->setHookName($hookName)
				->setLocalSource('css/supsystic-ui.css')*/
						
				wp_enqueue_style('tables-ui-styles', $pluginUrl. '/app/assets/css/supsystic-ui.css');
				//wp_enqueue_style('supsystic-jquery-ui', $pluginUrl. '/app/assets/css/jquery-ui.min.css');
				//wp_enqueue_style('supsystic-jquery-ui.theme', $pluginUrl. '/app/assets/css/jquery-ui.theme.min.css');
				//wp_enqueue_style('supsystic-jquery-ui.structure', $pluginUrl. '/app/assets/css/jquery-ui.structure.min.css');
				wp_enqueue_style('jquery-ui','//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/smoothness/jquery-ui.css');
				wp_enqueue_style('supsystic-font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
				
				wp_localize_script($this->config('db_prefix'). 'plug-deactivation', 'dtsPluginsData', array(
					'plugName' => $pluginDirName. '/index.php',
				));
		
				/*framePtw::_()->getModule('templates')->loadCoreJs();
				framePtw::_()->getModule('templates')->loadCoreCss();
				framePtw::_()->getModule('templates')->loadJqueryUi();
*/
			}
		}
	}
}