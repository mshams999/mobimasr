<?php

namespace NinjaTable\FrontEnd\DataProviders;

use League\Csv\Reader;

class CsvProvider
{
	public function boot()
	{
		add_filter('ninja_tables_get_table_settings', array($this, 'getTableSettings'));
		add_filter('ninja_tables_get_table_data', array($this, 'getTableData'), 10, 5);
		add_filter('ninja_tables_fetching_table_rows_csv', array($this, 'data'), 10, 5);
	}

	public function getTableSettings($table)
	{
		try {
			$provider = sanitize_title(
				get_post_meta($table->ID, '_ninja_tables_data_provider', true), 'default', 'display'
			);

			if (in_array($provider, array('csv', 'google-csv'))) {
				$table->isEditable = false;
				$table->dataSourceType = 'external';
				$table->remoteURL = get_post_meta($table->ID, '_ninja_tables_data_provider_url', true);
				$table->isEditableMessage = 'Your table columns were initially created from the external data source url so if you have made any changes in that resource (added/removed columns) then you may re-sync the settings to reflect the changes here. Otherwise you\'ll see data according to old column settings.';
			}
			
			return $table;
			
		} catch (\Exception $e) {
			return $table;
		}
	}

	public function getTableData($tableId, $data, $total, $perPage, $offset)
	{
		try {
			$newData = [];
			$url = get_post_meta($tableId, '_ninja_tables_data_provider_url', true);
			foreach ($this->getDataFromCsv($tableId, $url) as $key => $value) {
				$newData[] = array(
					'id' => ++$key,
					'values' => $value,
					'position' => $key,
				);
			}

			if ($totalNewData = count($newData)) {
				return array(
					array_slice($newData, $offset, $perPage),
					$totalNewData
				);
			}
			
			return array($data, $total);
			
		} catch (\Exception $e) {
			return array($data, $total);
		}
	}

	public function data($data, $tableId, $defaultSorting, $disableCache, $limit)
	{
		$url = get_post_meta($tableId, '_ninja_tables_data_provider_url', true);

	    return $url ? $this->getDataFromCsv($tableId, $url) : $data;
	}

	protected function getDataFromCsv($tableId, $url)
	{
		$columns = array();
		foreach(ninja_table_get_table_columns($tableId) as $column) {
			$columns[$column['original_name']] = $column;
		}

		return array_map(function($row) use ($columns) {
			$newRow = array();
			foreach ($columns as $key => $column) {
				$newRow[$column['key']] = $row[$key];
			}
			return $newRow;
		}, $this->csvToArray($url));
	}

	protected function csvToArray($url)
	{
		$reader = Reader::createFromString(file_get_contents($url));

	    $data = array();
		$header = $reader->fetchOne();
		foreach ($reader->setOffset(1)->fetch() as $row) {
            $data[] = array_combine($header, $row);
        }

	    return $data;
	}
}
