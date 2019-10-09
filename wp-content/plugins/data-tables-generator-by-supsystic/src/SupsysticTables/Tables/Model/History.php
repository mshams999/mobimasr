<?php
class SupsysticTables_Tables_Model_History extends SupsysticTables_Core_BaseModel
{
	/**
	 * For this model is important to create the mirror functions in SupsysticTables_Tables_Model_Tables
	 * @see SupsysticTables_Tables_Model_Tables::getAllTableHistory and ets.
	 */

	public function getAllTableHistory($tableId)
	{
		$query = $this->getQueryBuilder()
			->select('*')
			->from($this->getTable('rows_history'))
			->where('table_id', '=', (int)$tableId);

		$history = $this->db->get_results($query->build());

		if ($this->db->last_error) {
			throw new RuntimeException($this->db->last_error);
		}
		for($i = 0; $i < count($history); $i++) {
			$history[$i] = $this->_afterSimpleGet($history[$i]);
		}

		return $history;
	}

	public function getUserTableHistory($userId, $tableId, $period = null)
	{
		$query = $this->getQueryBuilder()
			->select('*')
			->from($this->getTable('rows_history'))
			->where('table_id', '=', (int)$tableId)
			->andWhere('user_id', '=', (int)$userId);
		$history = $this->db->get_results($query->build());

		if ($this->db->last_error) {
			throw new RuntimeException($this->db->last_error);
		}
		$historyTable = $this->_checkUserTableHistoryByPeriod($tableId, $history, $period);

		if(!$history || ($history && !$historyTable)) {
			$historyTable = $this->createUserTableHistory($userId, $tableId);
		}
		$historyTable = $this->_afterSimpleGet($historyTable);

		return $historyTable;
	}

	public function _checkUserTableHistoryByPeriod($tableId, $history, $period = null)
	{
		$settings = $this->getHistorySettings($tableId);
		$historyTable = array();

		if(!empty($settings['history']['period'])) {
			if(!function_exists('date_create')) {
				throw new RuntimeException($this->environment->translate('You should to use PHP v.5.2.0 or greater to use the period feature for history table.'));
			}
			$history = array_reverse($history);
			$today = date_create();
			$needCreate = empty($period);
			$period = !empty($period) ? $period : $today;
			$periodFormat = '';
			$format = '';
			$include = false;

			switch($settings['history']['period']) {
				case 'day':
					$format = 'Y-m-d';
					break;
				case 'week':
					$format = 'W';
					break;
				case 'month':
					$format = 'Y-m';
					break;
				case 'year':
					$format = 'Y';
					break;
				default:
					break;
			}
			if(!empty($history)) {
				for($i = 0; $i < count($history); $i++) {
					$created = date_create($history[$i]->created);
					$periodFormat = date_format($period, $format);
					$include = $periodFormat == date_format($created, $format);
					$needCreate = date_format($period, $format) == date_format($today, $format);

					if($include) {
						// It is a table which has included for needed period
						$historyTable = $history[$i];
						break;
					}
				}
			} else {
				$needCreate = date_format($period, $format) == date_format($today, $format);
			}
			if(!$include && !$needCreate) {
				throw new RuntimeException(sprintf('The table with ID %d not exists for %s period.', $tableId, $periodFormat));
			}
		} else {
			$count = count($history);
			$index = $count > 0 ? $count - 1 : 0;
			$historyTable = $count ? $history[$index] : $historyTable;
		}

		return $historyTable;
	}

	public function updateUserTableHistory($userId, $tableId, $data, $period = null)
	{
		// Fix for compatibility with old PRO versions start
		$config = $this->environment->getConfig();
		$updateField = version_compare($config->get('plugin_version_pro'), '1.4.3', '>') ? 'updated' : 'created';
		// Fix for compatibility with old PRO versions end

		for($i = 0; $i < count($data); $i++) {
			$data[$i] = $this->prepareRowsData($data[$i], true);
		}
		$history = array('data' => serialize($data),);
		$history[$updateField] = date('Y-m-d H:i:s');
		$historyTable = $this->getUserTableHistory($userId, $tableId, $period);

		if($historyTable) {
			$query = $this->getQueryBuilder()
				->update($this->getTable('rows_history'))
				->fields(array_keys($history))
				->values(array_values($history))
				->where('id', '=', (int) $historyTable->id);
			$this->db->get_results($query->build());

			if ($this->db->last_error) {
				throw new RuntimeException($this->db->last_error);
			}
		}
	}

	public function createUserTableHistory($userId, $tableId)
	{
		$query = $this->getQueryBuilder()
			->select('data')
			->from($this->getTable('rows'))
			->where('table_id', '=', (int)$tableId)
			->orderBy('id')
			->order('ASC');
		$rows = $this->db->get_results($query->build());

		if($this->db->last_error) {
			throw new RuntimeException($this->db->last_error);
		}
		if(!$rows) {
			throw new RuntimeException(sprintf('The table with ID %d not exists.', $tableId));
		}

		$history = array(
			'user_id' => $userId,
			'table_id' => $tableId,
			'data' => array()
		);
		for($i = 0; $i < count($rows); $i++) {
			array_push($history['data'], unserialize($rows[$i]->data));
		}
		$history['data'] = serialize($history['data']);

		$query = $this->getQueryBuilder()
			->insertInto($this->getTable('rows_history'))
			->fields(array_keys($history))
			->values(array_values($history));
		$this->db->get_results($query->build());

		if ($this->db->last_error) {
			throw new RuntimeException($this->db->last_error);
		}

		$query = $this->getQueryBuilder()
			->select('*')
			->from($this->getTable('rows_history'))
			->where('id', '=', (int)$this->db->insert_id);
		$table = $this->db->get_row($query->build());

		if ($this->db->last_error) {
			throw new RuntimeException($this->db->last_error);
		}

		return $table;
	}

	public function sortHistory($a, $b) {
		if(isset($a['cells'], $a['cells'][0], $b['cells'], $b['cells'][0])) {
			if($a['cells'][0]['y'] > $b['cells'][0]['y'])
				return 1;
			if($a['cells'][0]['y'] < $b['cells'][0]['y'])
				return -1;
		}
		return 0;
	}
	
	public function _afterSimpleGet($historyTable) {
		$historyTable->data = unserialize($historyTable->data);
		usort($historyTable->data, array($this, 'sortHistory'));

		for($i = 0; $i < count($historyTable->data); $i++) {
			$historyTable->data[$i] = $this->prepareRowsData($historyTable->data[$i], false);
		}

		return $historyTable;
	}

	public function getHistorySettings($id) {
		$query = $this->getQueryBuilder()
			->select('history_settings')
			->from($this->getTable('tables'))
			->where('id', '=', (int)$id);
		$settings = $this->db->get_row($query->build());

		if ($this->db->last_error) {
			throw new RuntimeException($this->db->last_error);
		}
		if(!$settings) {
			throw new RuntimeException(sprintf('The table with ID %d not exists.', $id));
		}
		$settings->history_settings = unserialize($settings->history_settings);

		return $settings->history_settings;
	}

	public function setHistorySettings($id, $settings) {
		$query = $this->getQueryBuilder()
			->update($this->getTable('tables'))
			->where('id', '=', (int)$id)
			->set(array('history_settings' => serialize($settings)));

		$this->db->query($query->build());

		if ($this->db->last_error) {
			throw new RuntimeException($this->db->last_error);
		}
	}

	public function prepareRowsData($data, $compress = true)
	{
		$core = $this->environment->getModule('core');
		$tables = $core->getModelsFactory()->get('tables');
		return $tables->prepareRowsData($data, $compress);
	}
}