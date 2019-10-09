<?php
class SupsysticTables_Promo_Model_Promo extends SupsysticTables_Core_BaseModel
{
	private $_bigCli;
	
	public function firstRun() {
		$this->_bigStatAdd('Welcome Show');
		update_option($this->getPrefix(). 'plug_welcome_show', time());	// Remember this
	}
	
	private function _getBigStatClient() {
		if(!$this->_bigCli) {
			$path = $this->environment->getConfig()->get('plugin_source'). '/'
					. $this->environment->getConfig()->get('plugin_prefix'). '/'
					. 'Promo/Model/classes/lib/Mixpanel.php';
			if(!class_exists('Mixpanel') && is_file($path)) {
				require_once($path);
			}
			if(class_exists('Mixpanel')) {
				$opts = array();
				if(!function_exists('curl_init')) {
					$opts['consumer'] = 'socket';
				}
				if(class_exists('Mixpanel')) {
					$this->_bigCli = Mixpanel::getInstance("463025c1f6d80420eb95689073ce1b7a", $opts);
				}
			}
		}
		return $this->_bigCli;
	}
	private function _bigStatAdd( $key, $properties = array() ) {
		if(function_exists('json_encode')) {
			$this->_getBigStatClient();
			if($this->_bigCli) {
				$this->_bigCli->track( $key, $properties );
			}
		}
	}

	public function saveDeactivateData( $d ) {
		$deactivateParams = array();
		$reasonsLabels = array(
			'not_working' => 'Not working',
			'found_better' => 'Found better',
			'not_need' => 'Not need',
			'temporary' => 'Temporary',
			'other' => 'Other',
		);
		$deactivateParams['Reason'] = isset($d['deactivate_reason']) && $d['deactivate_reason'] 
			? $reasonsLabels[ $d['deactivate_reason'] ]
			: 'No reason';
		if(isset($d['deactivate_reason']) && $d['deactivate_reason']) {
			switch( $d['deactivate_reason'] ) {
				case 'found_better':
					$deactivateParams['Better plugin'] = $d['better_plugin'];
					break;
				case 'other':
					$deactivateParams['Other'] = $d['other'];
					break;
			}
		}
		$this->_bigStatAdd('Deactivated', $deactivateParams);
		$startUsage = get_option($this->getPrefix(). 'plug_welcome_show');
		if($startUsage) {
			$usedTime = time() - $startUsage;
			$this->_bigStatAdd('Used Time', array(
				'Seconds' => $usedTime, 
				'Hours' => round($usedTime / 60 / 60), 
				'Days' => round($usedTime / 60 / 60 / 24)
			));
		}
		return true;
	}
}