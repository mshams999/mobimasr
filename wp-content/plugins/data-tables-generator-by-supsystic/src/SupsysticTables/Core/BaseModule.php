<?php


abstract class SupsysticTables_Core_BaseModule extends Rsc_Mvc_Module
{
    /**
     * {@inheritdoc}
     */
    public function onInit()
    {
        parent::onInit();

        $dispathcer = $this->getEnvironment()->getDispatcher();
        $dispathcer->on('after_ui_loaded', array($this, 'afterUiLoaded'));
        $dispathcer->on('after_modules_loaded', array($this, 'afterModulesLoaded'));
        //add_action('admin_enqueue_scripts', array($this, 'adminEnqueueScriptsAction'));
        
    }

    /**
     * Loads the scripts and styles for the current module.
     */
    public function afterUiLoaded(SupsysticTables_Ui_Module $ui)
    {
        return;
    }

    /**
     * Runs after the all plugin modules are loaded.
     */
    public function afterModulesLoaded()
    {
        return;
    }

    public function adminEnqueueScriptsAction() {
        $location = untrailingslashit(plugin_dir_url(__FILE__));
        wp_enqueue_style('supsystic-tables-base', $location . '/assets/css/base.css');
    }

    public function config($name = null) {
        if (!$name) {
            return $this->getConfig();
        }
        return $this->getConfig()->get($name);
    }

	/**
	 * Convert the letters of cell column index to the numbers
	 * @param $data
	 * @return mixed
	 */
	public function _lettersToNumbers($data) {
		$letters = range('A', 'Z');
		$lettersLength = count($letters);
		$isArray = is_array($data);
		$data = $isArray ? $data : array($data);

		foreach($data as $k => $v) {
			$index = 0;
			$v = strtoupper($v);
			$vArr = str_split($v);
			$vLength = count($vArr);
			foreach($vArr as $ik => $iv) {
				if(!is_numeric($iv) && in_array($iv, $letters)) {
					if($ik == ($vLength - 1)) {
						$index += array_search($iv, $letters) + 1;
					} else {
						$index += $lettersLength;
					}
				}
			}
			if($index) {
				$data[$k] = $index;
			}
		}
		return $isArray ? $data : $data[0];
	}
}