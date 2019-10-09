<?php


class SupsysticTables_Settings_Controller extends SupsysticTables_Core_BaseController
{
    /**
     * @return Rsc_Http_Response
     */
    public function indexAction()
    {

        wp_enqueue_style('supsystic-tables-settings-index-css');
        wp_enqueue_script('supsystic-tables-settings-index-js');

        $templates = $this->getModule('settings')->getTemplatesAliases();
        $settings = get_option($this->getConfig()->get('db_prefix') . 'settings');

        try {
            return $this->response(
                $templates['settings.index'],
                array('settings' => $settings, 'wpRoles' => wp_roles()->role_names)
            );
        } catch (Exception $e) {
            return $this->response('error.twig', array('exception' => $e));
        }
    }
	/**
	 * @return Rsc_Http_Response
	 */
	public function getSettingsAction() {
		$settings = get_option($this->getConfig()->get('db_prefix') . 'settings');
		return $this->response(
			Rsc_Http_Response::AJAX,
			array_merge(array('settings'=>$settings), array('success' => true))
		);

	}
	public function saveSettingsAction(Rsc_Http_Request $request) {

		$optionsName = $this->getConfig()->get('db_prefix') . 'settings';
		$currentSettings = get_option($optionsName);
		$settings = $request->post->get('settings', array());

		if (!$currentSettings) {
			$currentSettings = array();
		}

		// This functions only checks one dimension of n-dimensional array and
		// if array have sub array-elements they are casted to string and since
		// php 5.4 it throws notices
		$diff = @array_diff($settings, $currentSettings);
		$intersect = @array_intersect($settings, $currentSettings);
		$merge = array_merge($intersect, $diff);

		update_option($optionsName, $merge);
		return $this->redirect($this->generateUrl('settings'));
	}
}
