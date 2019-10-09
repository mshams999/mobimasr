<?php 
/**
* 
*/
class SupsysticTables_Promo_Controller extends SupsysticTables_Core_BaseController
{
    public function indexAction(Rsc_Http_Request $request)
    {
		$environment = $this->getEnvironment();

		if ($environment->isPluginPage() && !$environment->isModule('promo', 'welcome')) {
			return $this->redirect($this->generateUrl('promo', 'welcome'));
		}

		wp_enqueue_style(
			'supsystic-tables-step-tutorial',
			$environment->getConfig()->get('plugin_url') . '/app/assets/css/libraries/bootstrap/bootstrap.min.css'
		);

		update_option($environment->getConfig()->get('db_prefix') . 'welcome_page_was_showed', 1);

		return $this->response(
			'@promo/promo.twig',
			array(
				'plugin_name' => $this->getConfig()->get('plugin_title_name'),
				'plugin_version' => $this->getConfig()->get('plugin_version'),
				'start_url' => '?page=supsystic-tables&module=promo&action=showTutorial'
			)
		);
	}

    public function showTutorialAction()
    {
		update_user_meta(get_current_user_id(), 'supsystic-tables-tutorial_was_showed', 0);
        return $this->redirect($this->generateUrl('overview', 'index', array('supsystic_tutorial' => 'begin')));
    }
	
	/**
     * Just let us know. Love is Sharing
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function saveDeactivateDataAction(Rsc_Http_Request $request)
    {
		$this->getModel('promo')->saveDeactivateData(array(
			'deactivate_reason' => $request->query->get('deactivate_reason'),
			'better_plugin' => $request->query->get('better_plugin'),
			'other' => $request->query->get('other'),
		));
		
        return $this->ajaxSuccess();
    }
}