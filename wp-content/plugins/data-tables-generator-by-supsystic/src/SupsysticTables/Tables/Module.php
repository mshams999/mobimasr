<?php

class SupsysticTables_Tables_Module extends SupsysticTables_Core_BaseModule
{
	/**
	 * Data for render table with single selected cell, rows or columns
	 */
	protected $isSingleCell = array();
	protected $isTablePart = array();
	/**
	 * Data for loading tables' rows from history
	 */
    public $isFromHistory = array();
	public $historyData = array();
	/**
	 * Check for auto import data from Google Spreadsheet
	 */
	protected $checkSpreadsheet = false;
	/**
	 * Contains the value of "search" shortcode param for applying it to table
	 */
	private $tableSearch = '';
	private $shortAttributes = array();
	/**
	 * Variables for appending of table styles to site header
	 */
	private $_tablesInPosts = array();
	private $_tablesObj = array();
	private $_tablesStyles = array();

	public $isPreview = false;

	/**
     * {@inheritdoc}
     */
    public function onInit()
    {
        parent::onInit();

		$dispatcher = $this->getEnvironment()->getDispatcher();
		$dispatcher->on('before_table_render', array($this, 'loadLanguageData'));

        $this->registerShortcodes();
        $this->registerTwigTableRender();
        $this->registerMenuItem();
        $this->addTwigHighlighter();
        $this->registerSearchFilter();

        $this->cacheDirectory = $this->getConfig()->get('plugin_cache_tables');

        if ($this->isPluginPage()) {
            $this->reviewNoticeCheck();
            $this->wooProAddonAds();
        }
		add_action('template_redirect', array($this, 'getDataTablesInPosts'));
        add_action('wp_head', array($this, 'setDataTableStyles'));
        add_action('widgets_init', array($this, 'registerWidget'));
		add_action('shutdown', array($this, 'onShutdown'));
        $dispatcher = $this->getEnvironment()->getDispatcher();
        $dispatcher->on('after_tables_loaded', array($this, 'onAfterLoaded'));
		$this->renderTableProSections();

		add_filter('jetpack_lazy_images_blacklisted_classes', array($this, 'excludeFromLazyLoad'), 999, 1);
    }

	public function getDataTablesInPosts() {
		if(empty($this->_tablesInPosts)) {
			global $wp_query;

			$havePostsListing = $wp_query && is_object($wp_query) && isset($wp_query->posts) && is_array($wp_query->posts) && !empty($wp_query->posts);

			if($havePostsListing) {
				$config = $this->getEnvironment()->getConfig();
				$tableShortcode = $config->get('shortcode_name');

				foreach($wp_query->posts as $post) {
					if(is_object($post) && isset($post->post_content)) {
						// Get all supsystic table shortcodes
						if(preg_match_all('/\[\s*'. $tableShortcode .'\s+.*\]/iUs', $post->post_content, $matches)) {
							if(!empty($matches[0])) {
								foreach($matches[0] as $data) {
									// Find all params in shortcodes we have got
									preg_match_all('/(?P<KEYS>\w+)\=[\"\']?(?P<VALUES>[^\"\']*)[\"\']?[\s+|\]]/iU', $data, $params);
									if(!is_array($params['KEYS'])) {
										$params['KEYS'] = array( $params['KEYS'] );
									}
									if(!is_array($params['VALUES'])) {
										$params['VALUES'] = array( $params['VALUES'] );
									}
									$table_params = array();
									foreach($params['KEYS'] as $key => $val) {
										if($val == 'id') {
											array_push($this->_tablesInPosts, $params['VALUES'][$key]);
										}
										$table_params[$val] = $params['VALUES'][$key];
									}
								}
							}
//							echo '<pre>';
//							var_dump($this->_tablesInPosts);
//							exit;
						}
					}
				}
			}
		}
		return $this->_tablesInPosts;
	}

	public function setDataTableStyles() {
		if(!empty($this->_tablesInPosts)) {
			$tablesOnPage = $this->getDataTablesObj();

			foreach($tablesOnPage as $table) {
				print $this->addDataTableStyles($table->view_id);
			}
		}
	}

	public function addDataTableStyles($tableViewId) {
		$tableObj = is_object($tableViewId) ? $tableViewId : $this->_tablesObj[$tableViewId];
		array_push($this->_tablesStyles, $tableObj->view_id);
		$styles = '';
		$customStyles = '';

		if(!empty($tableObj->meta) && !empty($tableObj->meta) && isset($tableObj->meta['css'])) {
			$styles = $tableObj->meta['css'];
			$styles = trim(preg_replace('/\/\*.*\*\//Us', '', $styles));
		}
		if(isset($tableObj->settings['styles']) && isset($tableObj->settings['styles']['useCustomStyles'])) {
			$standardFontsList = $this->getStandardFontsList();
			$allFontsList = $this->getFontsList();

			if(isset($tableObj->settings['styles']['headerFontFamily'])) {
				$family = $tableObj->settings['styles']['headerFontFamily'];
				if(in_array($family, $allFontsList)	&& !in_array($family, $standardFontsList)) {
					$customStyles = '@import url("//fonts.googleapis.com/css?family='.str_replace(' ', '+', $family).'");';
				}
			}
			if(isset($tableObj->settings['styles']['cellFontFamily'])) {
				$family = $tableObj->settings['styles']['cellFontFamily'];
				if(in_array($family, $allFontsList)	&& !in_array($family, $standardFontsList)) {
					$customStyles .= '@import url("//fonts.googleapis.com/css?family='.str_replace(' ', '+', $family).'");';
				}
			}
			if(!$this->isPreview) {
				$customStyles .= str_replace('supsystic-table-{id}', 'supsystic-table-'.$tableObj->id, $tableObj->settings['styles']['customCss']);
			}
		}

		if(!empty($styles) || !empty($customStyles)) {
			return $this->getTwig()->render('@tables/styles.twig',
				array(
					'viewId' => $tableObj->view_id,
					'styles' => empty($styles) ? '' : $tableObj->meta['css'],
					'customStyles' => $customStyles
				)
			);
		}
		return '';
	}

	public function setDataForPage($table) {
		$table->isDisplayed = false;
		$table->isPageRows = true;
		$this->_tablesObj[$table->view_id] = $table;
	}

	public function getDataTablesObj() {
		if(empty($this->_tablesObj)) {
			$core = $this->getEnvironment()->getModule('core');				// @var SupsysticTables_Core_Module $core
			$tables = $core->getModelsFactory()->get('tables');				// @var SupsysticTables_Tables_Model_Tables $tables
			$tablesInPosts = $this->getDataTablesInPosts();

			foreach($tablesInPosts as $tableId) {
				$tableObj = $tables->getById($tableId);

				if(empty($tableObj)) continue;

				$tableObj->isDisplayed = false;
				$this->_tablesObj[$tableObj->view_id] = $tableObj;
			}
		}
		return $this->_tablesObj;
	}

	/**
	 * Add the capability to search in the tables
	 */
	public function registerSearchFilter() {
		if (!is_admin()) {
			$settings = get_option('supsystic_tbl_settings');

			if (!empty($settings['table_search'])) {
				add_filter('posts_search' , array($this, 'globalTablesSearchFilter'), 10, 2);
			}
		}
	}

	public function globalTablesSearchFilter($where, $query) {
		if($query->is_search() && $query->is_main_query()) {
			$search_query = trim(get_search_query());

			if(!empty($search_query)) {
				$core = $this->getEnvironment()->getModule('core');
				$tables = $core->getModelsFactory()->get('tables');
				$tokens = array_filter(explode(' ', $search_query));

				if(!empty($tokens)) {
					$tableIds = $tables->getTableIdsBySearchTokens($tokens);

					if(!empty($tableIds)) {
						$postIds = $tables->getPostIdsByTableIds($tableIds);

						if(!empty($postIds)) {
							global $wpdb;
							$idsStr = implode(',',array_keys($postIds));

							$exact = get_query_var( 'exact' );
							$n = ( empty( $exact ) ) ? '%' : '';
							$where = $wpdb->remove_placeholder_escape( $where );

							foreach($tokens as $token) {
								$old_or = "OR ({$wpdb->posts}.post_content LIKE '{$n}{$token}{$n}')";
								$new_or = $old_or . " OR {$wpdb->posts}.ID IN ({$idsStr}) ";
								$where = str_replace( $old_or, $new_or, $where );
							}

							$where = $wpdb->add_placeholder_escape( $where );
						}
					}
				}
			}
		}
		return $where;
	}

		/**
     * Renders the table
     * @param int $id
     * @return string
     */
    public function render($id, $settings = false)
    {
        if($this->disallowIndexing($id)) {
            return;
        }
        $cachePath = $this->cacheDirectory . DIRECTORY_SEPARATOR . $id;

		$environment = $this->getEnvironment();
		$dispatcher = $environment->getDispatcher();
		$twig = $environment->getTwig();
		$core = $environment->getModule('core');				// @var SupsysticTables_Core_Module $core
		$tables = $core->getModelsFactory()->get('tables');		// @var SupsysticTables_Tables_Model_Tables $tables
		$table = null;

		if(!$this->isSingleCell && !$this->isTablePart) {
			foreach($this->_tablesObj as $view_id => $tbl) {
				if($tbl->id == $id && !$tbl->isDisplayed) {
					$this->_tablesObj[$view_id]->isDisplayed = true;
					$table = $this->_tablesObj[$view_id];
					break;
				}
			}
		}
		$table = $table ? $table : $tables->getById($id);
		
		if (!$table) {
			return sprintf($environment->translate('The table with ID %d not exists.'), $id);
		}
		$table->isDB = ($environment->isPro() && !$this->isSingleCell && !$this->isTablePart && isset($table->settings['source']) && isset($table->settings['source']['database']) && $table->settings['source']['database'] == 'on');
		
		if($settings) {
			if($table->isDB) {
				$settings['source'] = $table->settings['source'];
			}
			$settings['disableCache'] = 'on';
			$table->settings = $settings;
		}
		$table->isSSP = (!$this->isSingleCell
			&& !$this->isTablePart
			&& isset($table->settings['features']['paging'])
			&& $table->settings['features']['paging'] == 'on'
			&& isset($table->settings['serverSideProcessing'])
			&& $table->settings['serverSideProcessing'] == 'on'
		);
		
		if(!isset($table->isPageRows)) {
			$table->isPageRows = false;
		}
		$this->checkSpreadsheet = $this->checkSpreadsheet && !$table->isPageRows
			&& $environment->isPro()
			&& isset($table->settings['features']['import']['google']['automatically_update'])
			&& isset($table->settings['features']['import']['google']['link'])
			&& !empty($table->settings['features']['import']['google']['link']);

        if (!$table->isSSP
			&& !isset($table->settings['disableCache'])
			&& empty($this->tableSearch)
			&& !$this->isSingleCell
			&& !$this->isTablePart
			&& !$this->checkSpreadsheet
			&& !$this->isFromHistory
			&& file_exists($cachePath)
			&& $this->getEnvironment()->isProd()
		) {
			// Connect scripts and styles depending on table settings and table's cells settings for table cache
			$dispatcher->apply('before_table_render', array($table));
			$dispatcher->apply('before_table_render_from_cache', array($table));
			return file_get_contents($cachePath);
        }
		if ($this->checkSpreadsheet) {
			try {
				$this->getEnvironment()->getModule('importer')->autoUpdateTableFromGoogle($id, $table);
			} catch(Exception $e) {
				return $e->getMessage();
			}
			// We need to get the new rows' data from db
			$table->meta = $tables->getMeta($id);
		}
		if(!$table->isPageRows) {
			$table->rows = $tables->getNeededRows($id, $table->settings, $table->isSSP, $this->shortAttributes);
			$this->shortAttributes = array();

        	if (isset($table->meta['columnsWidth'])) {
            	$columnsTotalWidth = array_sum($table->meta['columnsWidth']);

            	if($columnsTotalWidth) {
					foreach ($table->meta['columnsWidth'] as &$value) {
						$value = round($value / $columnsTotalWidth * 100, 4);
					}
				}
			}
        }

		if(!$environment->isPro()) {
			 $table->settings['styling']['lightboxImg'] = '';
		}
		if($this->isSingleCell) {
			// Unset unneeded elements and features
			unset($table->settings['elements']['head']);
			unset($table->settings['elements']['foot']);
			unset($table->settings['elements']['caption']);
			unset($table->settings['features']['ordering']);
			unset($table->settings['features']['paging']);
			unset($table->settings['features']['searching']);
			unset($table->settings['features']['after_table_loaded_script']);

			$table->meta['css'] = $table->meta['css'] .
				'#supsystic-table-' . $table->view_id . ' #supsystic-table-' . $id . ' { margin-left: 0; }' .
				'#supsystic-table-' . $table->view_id . ' #supsystic-table-' . $id . ',
				#supsystic-table-' . $table->view_id . ' #supsystic-table-' . $id . ' th,
				#supsystic-table-' . $table->view_id . ' #supsystic-table-' . $id . ' td { width: auto !important; min-width: 100px; }';

			foreach($table->rows as $key => $row) {
				if ($this->isSingleCell['row'] === $key + 1) {
					foreach($row['cells'] as $index => $cell) {
						if($this->isSingleCell['col'] === $index + 1) {
							// For correct work of saving data through editable fields
							$table->rows[$key]['cells'][$index]['row'] = $key + 1;
							$table->rows[$key]['cells'][$index]['col'] = $index;

							// Because we can not calculate value after removing all unneeded cells
							if(!empty($table->rows[$key]['cells'][$index]['calculatedValue'])) {
								$table->rows[$key]['cells'][$index]['data'] = $table->rows[$key]['cells'][$index]['calculatedValue'];
							}
						} else {
							unset($table->rows[$key]['cells'][$index]);
						}
					}
				} else {
					unset($table->rows[$key]);
				}
			}
		}
		if($this->isTablePart) {
			foreach($table->rows as $key => $row) {
				if(empty($this->isTablePart['row']) || in_array($key + 1, $this->isTablePart['row'])) {
					foreach($row['cells'] as $index => $cell) {
						if(empty($this->isTablePart['col']) || in_array($index + 1, $this->isTablePart['col'])) {
							// For correct work of saving data through editable fields
							$table->rows[$key]['cells'][$index]['row'] = $key + 1;
							$table->rows[$key]['cells'][$index]['col'] = $index;

							// Because we can not calculate value after removing all unneeded cells
							if(!empty($table->rows[$key]['cells'][$index]['calculatedValue'])) {
								$table->rows[$key]['cells'][$index]['data'] = $table->rows[$key]['cells'][$index]['calculatedValue'];
							}
						} else if(!empty($this->isTablePart['col'])) {
							unset($table->rows[$key]['cells'][$index]);
						}
					}
				} else if(!empty($this->isTablePart['row'])) {
					unset($table->rows[$key]);
				}
			}
		}
		if(!empty($table->meta['mergedCells'])) {
			unset($table->settings['features']['ordering']);
		}
		foreach($table->rows as $key => $row) {
			if(isset($row['cells']) && !empty($row['cells'])) {
				foreach($row['cells'] as $index => $cell) {
					if($this->isFromHistory) {
						if(!empty($this->isFromHistory[$key]['cells'][$index]) && in_array('data', array_keys($this->isFromHistory[$key]['cells'][$index]))) {
							$table->rows[$key]['cells'][$index]['data'] = $this->isFromHistory[$key]['cells'][$index]['data'];
						}
						if(!empty($this->isFromHistory[$key]['cells'][$index]) && in_array('calculatedValue', array_keys($this->isFromHistory[$key]['cells'][$index]))) {
							$table->rows[$key]['cells'][$index]['calculatedValue'] = $this->isFromHistory[$key]['cells'][$index]['calculatedValue'];
						}
					}
					$table->rows[$key]['cells'][$index]['data'] = do_shortcode($table->rows[$key]['cells'][$index]['data']);
				}
			}
		}
		$table->mirrorFooter = $this->getMirrorFooter($table);
		$table->history = (bool) $this->isFromHistory;
		$table->history_data = $this->historyData;
		$table->encoded_title = htmlspecialchars($table->title, ENT_QUOTES);

		// Fix for some crashed logo links
		if(!empty($table->settings['exportLogo']['src']) && strpos($table->settings['exportLogo']['src'], 'http') === false) {
			// Try to fix link
			if(strpos($table->settings['exportLogo']['src'], '/wp-content') === 0) {
				$table->settings['exportLogo']['src'] = home_url($table->settings['exportLogo']['src']);
			}
		}
		// Connect scripts and styles depending on table settings and table's cells settings
		$dispatcher->apply('before_table_render', array($table));
		if($table->isSSP) {
			$dispatcher->apply('before_table_render_ssp', array($table));
		}
		$searchValue = '';

		if(!empty($this->tableSearch)) {
			$table->search_value = $this->tableSearch;
			// clean variable for correct render of other tables on the page
			$this->tableSearch = '';
		}

		$show_edit_link = '';
        if( is_user_logged_in() ) {
            $user = wp_get_current_user();
            $roles = is_array($user->roles) ? $user->roles : array($user->roles);
            $pluginSettings = get_option($this->getController()->getConfig()->get('db_prefix') . 'settings', 'access_roles');
            if (!empty($roles) && !empty($pluginSettings)) {
                foreach ($roles as $role) {
                    if (in_array($role, $pluginSettings)) {
                        $show_edit_link = $this->_getTblLink($id);
                        break;
                    }
                }
            }

            if (current_user_can('manage_options')) {
                $show_edit_link = $this->_getTblLink($id);
            }
        }

		$renderData = $twig->render($this->getShortcodeTemplate(), array('table' => $table, 'is_feed' => is_feed(), 'show_edit_link' => $show_edit_link));
        $renderData = preg_replace('/\s+/', ' ', trim($renderData));

		if(!$table->isSSP && !in_array($table->view_id, $this->_tablesStyles)) {
			$renderData = $this->addDataTableStyles($table) . $renderData;
		}
        if (!$this->isSingleCell && !$this->isTablePart && !$this->checkSpreadsheet && !$this->isFromHistory && isset($this->cacheDirectory)) {
            file_put_contents($cachePath, $renderData);
        }
		// clean variables for correct render of other tables on the page
		$this->isSingleCell = $this->isTablePart = $this->isFromHistory = $this->historyData = array();
		$this->checkSpreadsheet = false;

		return $renderData;
    }

    private function _getTblLink($id) {
        return "<a href=".$this->getController()->generateUrl('tables', 'view', array( 'id' => $id ) ).">". $this->getEnvironment()->translate('Edit'). " <i class='fa fa-fw fa-pencil'></i></a>";
    }

	public function getMirrorFooter($table) {
		$footer = array();

		if(!in_array('customFooter', $table->settings)) {
			$headerRowsCount = !empty($table->settings['headerRowsCount']) ? $table->settings['headerRowsCount'] : 1;
			$footer = array_slice($table->rows, 0, $headerRowsCount);

			foreach($footer as $key => $row) {
				foreach($row['cells'] as $index => $cell) {
					if(!empty($table->meta['mergedCells'])) {
						foreach($table->meta['mergedCells'] as $m) {
							if($m['row'] == $key && $m['col'] == $index && $m['rowspan'] > 1) {
								$newKey = $key + $m['rowspan'] - 1;
								$footer[$newKey]['cells'][$index] = $cell;
								$footer[$newKey]['cells'][$index]['rewrite'] = array(
									'rowspan' => $m['rowspan'],
									'colspan' => $m['colspan'],
									'display' => true,
								);
								$footer[$key]['cells'][$index]['rewrite'] = array(
									'rowspan' => 1,
									'colspan' => 1,
									'display' => false,
								);
							}
						}
					}
				}
			}
			$footer = array_reverse($footer);
		}
		return $footer;
	}

	/**
	 * Renders the value of single cell
	 * @param int $tableId
	 * @param int $tableRowId
	 * @param int $tableColId
	 * @return string
	 */
	public function renderCellValue($tableId, $tableRowId, $tableColId)
	{
		$value = $this->translate('No value');
		$environment = $this->getEnvironment();
		$core = $environment->getModule('core');
		$tables = $core->getModelsFactory()->get('tables');

		try {
			$rows = $tables->getRows($tableId);
		} catch (Exception $e) {
			return $this->ajaxError(
				sprintf($this->translate('Failed to get table rows: %s'), $e->getMessage())
			);
		}

		if(!empty($rows)) {
			foreach($rows as $key => $row) {
				if($key == $tableRowId - 1) {
					if(isset($row['cells']) && !empty($row['cells'])) {
						foreach($row['cells'] as $index => $cell) {
							if($index == $tableColId - 1) {
								if(!empty($rows[$key]['cells'][$index]['calculatedValue'])) {
									$value = $rows[$key]['cells'][$index]['calculatedValue'];
								} else {
									$value = $rows[$key]['cells'][$index]['data'];
								}
							}
						}
					}
				}
			}
		}

		return $value;
	}

	/**
	 * Returns shortcode template name.
	 * @return string
	 */
	public function getShortcodeTemplate()
	{
		return '@tables/shortcode.twig';
	}

    public function doShortcode($attributes)
    {
        $environment = $this->getEnvironment();
        $config = $environment->getConfig();

        if (!array_key_exists('id', $attributes)) {
            return sprintf(
				$environment->translate('Mandatory attribute "id" is not specified. ' . 'Shortcode usage example: [%s id="{table_id}"]'),
				$config->get('shortcode_name')
			);
        }
		if(!empty($attributes['search'])) {
			$this->tableSearch = $attributes['search'];
		}
        $ui = $environment->getModule('ui');
        $assets = array_filter($ui->getAssets(), array($this, 'filterAssets'));

        if (count($assets) > 0) {
            foreach ($assets as $asset) {
                add_action('wp_footer', array($asset, 'load'));
            }
        }
        $this->shortAttributes = $attributes;
        return $this->render((int)$attributes['id']);
    }

	public function doValueShortcode($attributes)
	{
		$environment = $this->getEnvironment();
		$config = $environment->getConfig();
		$shortcode = $config->get('shortcode_value_name');

		if (!array_key_exists('id', $attributes) || !array_key_exists('row', $attributes) || !array_key_exists('col', $attributes)) {
			return $environment->translate('There are not all shortcode\'s attributes specified. Usage example') . ':<br />'
			. sprintf('[%s id="{table id}" row="{row number}" col="{column number}"]', $shortcode);
		}
		return $this->renderCellValue((int)$attributes['id'], (int)$attributes['row'], (int)$this->_lettersToNumbers($attributes['col']));
	}

	public function doCellShortcode($attributes)
	{
		$environment = $this->getEnvironment();
		$config = $environment->getConfig();
		$shortcode = $config->get('shortcode_cell_name');

		if (!array_key_exists('id', $attributes) || !array_key_exists('row', $attributes) || !array_key_exists('col', $attributes)) {
			return $environment->translate('There are not all shortcode attributes specified. Usage example') . ':<br />'
			. sprintf('[%s id="{table id}" row="{row number}" col="{column number}"]', $shortcode);
		}
		$ui = $environment->getModule('ui');
		$assets = array_filter($ui->getAssets(), array($this, 'filterAssets'));

		if (count($assets) > 0) {
			foreach ($assets as $asset) {
				add_action('wp_footer', array($asset, 'load'));
			}
		}
		$this->isSingleCell = array('row' => (int)$attributes['row'], 'col' => (int)$this->_lettersToNumbers($attributes['col']));

		return $this->render((int) (int)$attributes['id']);
	}

	public function doTablePartShortcode($attributes) {
		$environment = $this->getEnvironment();
		$config = $environment->getConfig();
		$shortcode = $config->get('shortcode_row_name');

		if (!array_key_exists('id', $attributes) || (!array_key_exists('row', $attributes) && !array_key_exists('col', $attributes))) {
			return $environment->translate('There are not all shortcode attributes specified. Usage example') . ':<br />'
			. sprintf('[%s id="{table id}" row="{row numbers splitted by comma}" col="{column numbers splitted by comma}"]', $shortcode);
		}
		$ui = $environment->getModule('ui');
		$assets = array_filter($ui->getAssets(), array($this, 'filterAssets'));

		if (count($assets) > 0) {
			foreach ($assets as $asset) {
				add_action('wp_footer', array($asset, 'load'));
			}
		}


		$rowsResult = array();
		$rows = array_filter(
			explode(',', $attributes['row'])
		);
		foreach ($rows as $row ){
			if (strpos($row, '-') !== false) {
				$minMaxVals = explode('-', $row);
				foreach (range($minMaxVals[0], $minMaxVals[1]) as $item) {
					$rowsResult[] = (string)$item;
				}
			}else{
				$rowsResult[] = (string)$row;
			}

		}

		$colsResult = array();
		$cols = array_filter(
			explode(',', $attributes['col'])
		);
		foreach ($cols as $col ){
			if (strpos($col, '-') !== false) {
				$minMaxVals = explode('-', $col);
				foreach (range($minMaxVals[0], $minMaxVals[1]) as $item) {
					$colsResult[] = $this->_lettersToNumbers((string)$item);
				}
			}else{
				$colsResult[] = $this->_lettersToNumbers((string)$col);
			}
		}

		$this->isTablePart = array(
			'row' => $rowsResult,
			'col' => $colsResult,
		);

		return $this->render((int)$attributes['id']);
	}

	protected function registerShortcodes()
	{
		$config = $this->getEnvironment()->getConfig();

		add_shortcode($config->get('shortcode_name'), array($this, 'doShortcode'));
		add_shortcode($config->get('shortcode_part_name'), array($this, 'doTablePartShortcode'));
		add_shortcode($config->get('shortcode_cell_name'), array($this, 'doCellShortcode'));
		add_shortcode($config->get('shortcode_value_name'), array($this, 'doValueShortcode'));
	}

	public function registerWidget() {
		register_widget('SupsysticTables_Widget');
	}

    private function registerTwigTableRender()
    {
        $twig = $this->getEnvironment()->getTwig();
        $callable = array($this, 'render');


        $twig->addFunction(new Twig_SimpleFunction('render_table', $callable, array('is_safe' => array('html'))));
    }

	private function addTwigHighlighter()
	{
		$twig = $this->getEnvironment()->getTwig();

		$twig->addFilter( new Twig_SimpleFilter('highlight', 'highlight_string', array('is_safe' => array('html'))));
	}

	/**
	 * Returns only not loaded assets
	 * @param \SupsysticTables_Ui_Asset $asset
	 * @return bool
	 */
	public function filterAssets(SupsysticTables_Ui_Asset $asset)
	{
		return !$asset->isLoaded() && 'wp_enqueue_scripts' === $asset->getHookName();
	}

	/**
	 * {@inheritdoc}
	 */
	public function afterUiLoaded(SupsysticTables_Ui_Module $ui)
	{
		parent::afterUiLoaded($ui);

		$environment = $this->getEnvironment();
		$version = $environment->getConfig()->get('plugin_version');
		$cachingAllowed = $environment->isProd();
		$hookName = 'admin_enqueue_scripts';
		$dynamicHookName = is_admin() ? $hookName : 'wp_enqueue_scripts';

		// Styles
		$ui->add(
			$ui->createStyle('supsystic-tables-tables-loaders-css')
				->setHookName($dynamicHookName)
				->setModuleSource($this, 'css/loaders.css')
				->setVersion('1.1.0')
				->setCachingAllowed($cachingAllowed)
		);

		$ui->add(
			$ui->createStyle('supsystic-tables-shortcode-css')
				->setHookName($dynamicHookName)
				->setModuleSource($this, 'css/tables.shortcode.css')
				->setVersion($version)
				->setCachingAllowed($cachingAllowed)
		);

		// Scripts
		$this->loadRuleJS($ui);

		$this->loadHandsontable($ui);

		$this->loadEyeconColorpicker($ui);

		$this->loadJqueryToolbar($ui);

		$this->loadAceCssEditor($ui);

		$this->loadDataTables($ui);

		if ($environment->isPro()) $this->loadFeatherLight($ui);

		$ui->add(
			$ui->createScript('supsystic-tables-datatables-numeral')
				->setHookName($dynamicHookName)
				->setModuleSource($this, 'libraries/numeral.min.js')
				->setVersion($version)
				->setCachingAllowed(true)
				->addDependency('jquery')
				->addDependency('supsystic-tables-datatables-js')
		);

		$ui->add(
			$ui->createScript('supsystic-tables-shortcode')
				->setHookName($dynamicHookName)
				->setModuleSource($this, 'js/tables.shortcode.js')
				->setVersion($version)
				->setCachingAllowed($cachingAllowed)
				->addDependency('jquery')
				->addDependency('supsystic-tables-datatables-js')
				->addDependency('supsystic-tables-datatables-numeral')
		);

		$ui->add(
			$ui->createScript('supsystic-tables-notify')
				->setHookName($dynamicHookName)
				->setSource($environment->getConfig()->get('plugin_url') . '/app/assets/js/notify.js')
				->setVersion($version)
				->setCachingAllowed($cachingAllowed)
				->addDependency('jquery')
				->addDependency('supsystic-tables-datatables-js')
				->addDependency('supsystic-tables-datatables-numeral')
		);

		/* Backend scripts */
		if ($environment->isModule('tables')) {
			$ui->add(
				$ui->createScript('jquery-ui-autocomplete')
					->setHookName($hookName)
			);

			if ($environment->isAction('index')) {
				$ui->add(
					$ui->createScript('supsystic-tables-tables-index-list')
						->setHookName($hookName)
						->setModuleSource($this, 'js/tables.admin.list.js')
						->setCachingAllowed($cachingAllowed)
						->setVersion($version)
						->addDependency('jquery-ui-dialog')
				);
				$ui->add(
					$ui->createScript('supsystic-tables-tables-index')
						->setHookName($hookName)
						->setModuleSource($this, 'js/tables.index.js')
						->setCachingAllowed($cachingAllowed)
						->setVersion($version)
						->addDependency('jquery-ui-dialog')
				);
				$ui->add(
					$ui->createStyle('supsystic-tables-tables-index-css')
						->setHookName($hookName)
						->setModuleSource($this, 'css/tables.index.css')
						->setCachingAllowed($cachingAllowed)
						->setVersion($version)
				);
				$ui->add(
					$ui->createStyle('jquery-slider')
						->setHookName($hookName)
						->setLocalSource( 'css/jquery-slider.css')
						->setCachingAllowed($cachingAllowed)
						->setVersion($version)
				);
				$ui->add(
					$ui->createStyle('jquery-ui-min')
						->setHookName($hookName)
						->setLocalSource('css/jquery-ui.min.css')
						->setCachingAllowed($cachingAllowed)
						->setVersion($version)
				);
				/*$ui->add(
					$ui->createStyle('jquery-ui-structure')
						->setHookName($hookName)
						->setLocalSource('css/jquery-ui.structure.min.css')
						->setCachingAllowed($cachingAllowed)
						->setVersion($version)
				);*/
				$ui->add(
					$ui->createStyle('jquery-ui-theme')
						->setHookName($hookName)
						->setLocalSource('css/jquery-ui.theme.min.css')
						->setCachingAllowed($cachingAllowed)
						->setVersion($version)
				);
			}

			if ($environment->isAction('view')) {
				// WordPress Media Library JavaScript APIs
				add_action($hookName, array($this, 'loadMediaScripts'));

				// Styles
				$ui->add(
					$ui->createStyle('supsystic-tables-tables-editor-css')
						->setHookName($hookName)
						->setModuleSource($this, 'css/tables.editor.css')
						->setCachingAllowed($cachingAllowed)
						->setVersion($version)
				);

				$ui->add(
					$ui->createStyle('supsystic-tables-tables-view')
						->setHookName($hookName)
						->setModuleSource($this, 'css/tables.view.css')
						->setCachingAllowed($cachingAllowed)
						->setVersion($version)
				);

				// Scripts
				$ui->add(
					$ui->createScript('supsystic-tables-moment-duration-js')
						->setHookName($hookName)
						->setModuleSource($this, 'libraries/moment-duration-format.js')
						->setCachingAllowed(true)
						->setVersion('1.3.0')
				);
				$ui->add(
					$ui->createScript('supsystic-tables-slimscroll-js')
						->setHookName($hookName)
						->setModuleSource($this, 'libraries/slimscroll.min.js')
						->setCachingAllowed(true)
						->setVersion('1.3.8')
				);

				$ui->add(
					$ui->createScript('supsystic-tables-tables-model')
						->setHookName($hookName)
						->setModuleSource($this, 'js/tables.model.js')
						->setCachingAllowed($cachingAllowed)
						->setVersion($version)
				);

				$ui->add(
					$ui->createScript('supsystic-tables-editor-init-js')
						->setHookName($hookName)
						->setModuleSource($this, 'js/editor/tables.editor.js')
						->setCachingAllowed($cachingAllowed)
						->setVersion($version)
				);

				$ui->add(
					$ui->createScript('supsystic-tables-editor-toolbar-js')
						->setHookName($hookName)
						->setModuleSource($this, 'js/editor/tables.editor.toolbar.js')
						->setCachingAllowed($cachingAllowed)
						->setVersion($version)
				);

				$ui->add(
					$ui->createScript('supsystic-tables-editor-formula-js')
						->setHookName($hookName)
						->setModuleSource($this, 'js/editor/tables.editor.formula.js')
						->setCachingAllowed($cachingAllowed)
						->setVersion($version)
						->addDependency('jquery-ui-autocomplete')
				);

				$ui->add(
					$ui->createScript('supsystic-tables-tables-view')
						->setHookName($hookName)
						->setModuleSource($this, 'js/tables.view.js')
						->addDependency('supsystic-tables-editor-init-js')
						->setCachingAllowed($cachingAllowed)
						->setVersion($version)
				);
			}
		}
	}

	public function loadMediaScripts() {
		wp_enqueue_media();
	}

	private function loadDataTables(SupsysticTables_Ui_Module $ui)
	{
		$hookName = 'admin_enqueue_scripts';
		$frontendHookName = 'wp_enqueue_scripts';
		$dynamicHookName = is_admin() ? $hookName : $frontendHookName;
		$coreModulePath = untrailingslashit(plugin_dir_url(dirname(__FILE__)) . 'Core');

		if (is_admin() && !$this->getEnvironment()->isModule('tables')) {
			return;
		}

		$ui->add(
			$ui->createStyle('supsystic-tables-datatables-css')
				->setHookName($dynamicHookName)
				->setSource($coreModulePath . '/assets/css/lib/jquery.dataTables.min.css')
				->setVersion('1.10.12')
				->setCachingAllowed(true)
		);

		$ui->add(
			$ui->createStyle('supsystic-tables-datatables-responsive-css')
				->setHookName($dynamicHookName)
				->setSource($coreModulePath . '/assets/css/lib/responsive.dataTables.min.css')
				->setVersion('2.0.2')
				->setCachingAllowed(true)
		);

		$ui->add(
			$ui->createStyle('supsystic-tables-datatables-fixed-columns-css')
				->setHookName($dynamicHookName)
				->setSource($coreModulePath . '/assets/css/lib/fixedColumns.dataTables.min.css')
				->setVersion('3.2.2')
				->setCachingAllowed(true)
		);

		$ui->add(
			$ui->createStyle('supsystic-tables-datatables-fixed-headers-css')
				->setHookName($dynamicHookName)
				->setSource($coreModulePath . '/assets/css/lib/fixedHeader.dataTables.min.css')
				->setVersion('3.1.2')
				->setCachingAllowed(true)
		);

		$ui->add(
			$ui->createScript('supsystic-tables-datatables-js')
				->setHookName($dynamicHookName)
				->setSource($coreModulePath . '/assets/js/lib/jquery.dataTables.min.js')
				->setVersion('1.10.12')
				->setCachingAllowed(true)
				->addDependency('jquery')
		);

		$ui->add(
			$ui->createScript('supsystic-tables-datatables-responsive-js')
				->setHookName($dynamicHookName)
				->setSource($coreModulePath . '/assets/js/lib/dataTables.responsive.min.js')
				->setVersion('2.0.2')
				->setCachingAllowed(true)
				->addDependency('jquery')
				->addDependency('supsystic-tables-datatables-js')
		);

		$ui->add(
			$ui->createScript('supsystic-tables-datatables-fixed-columns-js')
				->setHookName($dynamicHookName)
				->setSource($coreModulePath . '/assets/js/lib/dataTables.fixedColumns.min.js')
				->setVersion('3.2.2')
				->setCachingAllowed(true)
				->addDependency('jquery')
				->addDependency('supsystic-tables-datatables-js')
		);

		$ui->add(
			$ui->createScript('supsystic-tables-datatables-fixed-headers-js')
				->setHookName($dynamicHookName)
				->setSource($coreModulePath . '/assets/js/lib/dataTables.fixedHeader.min.js')
				->setVersion('3.2.2')
				->setCachingAllowed(true)
				->addDependency('jquery')
				->addDependency('supsystic-tables-datatables-js')
		);

		$ui->add(
			$ui->createScript('supsystic-tables-datatables-extensions-js')
				->setHookName($dynamicHookName)
				->setSource($coreModulePath . '/assets/js/lib/dataTables.customExtensions.js')
				->setVersion('1.10.11')
				->setCachingAllowed(true)
				->addDependency('jquery')
				->addDependency('supsystic-tables-datatables-js')
		);

		/*$ui->add(
			$ui->createScript('supsystic-tables-datatables-natural-sort-js')
				->setHookName($dynamicHookName)
				->setSource($coreModulePath . '/assets/js/lib/natural.js')
				->setVersion('1.10.11')
				->setCachingAllowed(true)
				->addDependency('jquery')
				->addDependency('supsystic-tables-datatables-js')
		);*/
	}

	private function loadFeatherLight(SupsysticTables_Ui_Module $ui)
	{
		$hookName = 'admin_enqueue_scripts';
		$dynamicHookName = is_admin() ? $hookName : 'wp_enqueue_scripts';

		if (is_admin() && !$this->getEnvironment()->isModule('tables', 'view')) {
			return;
		}

		$ui->add(
			$ui->createScript('supsystic-tables-featherlight-js')
				->setHookName($dynamicHookName)
				->setModuleSource($this, 'libraries/featherlight/featherlight.min.js')
				->setCachingAllowed(true)
				->addDependency('jquery')
				->setVersion('1.7.13')
		);

		$ui->add(
			$ui->createStyle('supsystic-tables-tables-featherlight-css')
				->setHookName($dynamicHookName)
				->setModuleSource($this, 'libraries/featherlight/featherlight.min.css')
				->setCachingAllowed(true)
				->setVersion('1.7.13')
		);
	}

	private function loadRuleJS(SupsysticTables_Ui_Module $ui)
	{
		$hookName = 'admin_enqueue_scripts';
		$dynamicHookName = is_admin() ? $hookName : 'wp_enqueue_scripts';

		if (is_admin() && !$this->getEnvironment()->isModule('tables', 'view')) {
			return;
		}

		$ui->add(
			$ui->createScript('supsystic-tables-rulejs-libs-js')
				->setHookName($dynamicHookName)
				->setModuleSource($this, 'libraries/ruleJS/ruleJS.lib.full.js')
		);

		$ui->add(
			$ui->createScript('supsystic-tables-rulejs-parser-js')
				->setHookName($dynamicHookName)
				->setModuleSource($this, 'libraries/ruleJS/parser.js')
		);

		$ui->add(
			$ui->createScript('supsystic-tables-rulejs-js')
				->setHookName($dynamicHookName)
				->setModuleSource($this, 'libraries/ruleJS/ruleJS.js')
		);
	}

	private function loadHandsontable(SupsysticTables_Ui_Module $ui)
	{
		$hookName = 'admin_enqueue_scripts';

		if (!is_admin() || (is_admin() && !$this->getEnvironment()->isModule('tables', 'view'))) {
			return;
		}

		// Styles
		$ui->add(
			$ui->createStyle('supsystic-tables-handsontable-css')
				->setHookName($hookName)
				//->setExternalSource('https://cdnjs.cloudflare.com/ajax/libs/handsontable/0.31.1/handsontable.full.min.css')
				->setModuleSource($this, 'libraries/handsontable/handsontable.full.min.css')
				->setCachingAllowed(true)
				->setVersion('0.31.1')
		);

		$ui->add(
			$ui->createStyle('supsystic-tables-rulejs-hot-css')
				->setHookName($hookName)
				->setModuleSource($this, 'libraries/ruleJS/handsontable.formula.css')
		);

		// Scripts
		$ui->add(
			$ui->createScript('supsystic-tables-handsontable-js')
				->setHookName($hookName)
				//->setExternalSource('https://cdnjs.cloudflare.com/ajax/libs/handsontable/0.31.1/handsontable.full.min.js')
				->setModuleSource($this, 'libraries/handsontable/handsontable.full.min.js')
				->setCachingAllowed(true)
				->setVersion('0.31.1')
		);

		$ui->add(
			$ui->createScript('supsystic-tables-rulejs-hot-js')
				->setHookName($hookName)
				->setModuleSource($this, 'libraries/ruleJS/handsontable.formula.js')
				->addDependency('supsystic-tables-handsontable-js')
		);
	}

	private function loadEyeconColorpicker(SupsysticTables_Ui_Module $ui) {
		$hookName = 'admin_enqueue_scripts';

		if (!is_admin() || (is_admin() && !$this->getEnvironment()->isModule('tables', 'view'))) {
			return;
		}

		$ui->add(
			$ui->createStyle('supsystic-tables-colorpicker-css')
				->setHookName($hookName)
				->setModuleSource($this, 'libraries/colorpicker/colorpicker.css')
				->setCachingAllowed(true)
		);

		$ui->add(
			$ui->createScript('supsystic-tables-colorpicker-js')
				->setHookName($hookName)
				->setModuleSource($this, 'libraries/colorpicker/colorpicker.js')
				->setCachingAllowed(true)
		);
	}

	private function loadJqueryToolbar(SupsysticTables_Ui_Module $ui) {
		$hookName = 'admin_enqueue_scripts';

		if (!is_admin() || (is_admin() && !$this->getEnvironment()->isModule('tables', 'view'))) {
			return;
		}

		$ui->add(
			$ui->createStyle('supsystic-tables-toolbar-css')
				->setHookName($hookName)
				->setModuleSource($this, 'libraries/toolbar/jquery.toolbars.css')
				->setCachingAllowed(true)
		);

		$ui->add(
			$ui->createScript('supsystic-tables-toolbar-js')
				->setHookName($hookName)
				->setModuleSource($this, 'libraries/toolbar/jquery.toolbar.js')
				->setCachingAllowed(true)
		);
	}

	private function loadAceCssEditor(SupsysticTables_Ui_Module $ui)
	{
		$hookName = 'admin_enqueue_scripts';

		if (!is_admin() || (is_admin() && !$this->getEnvironment()->isModule('tables', 'view'))) {
			return;
		}

		$ui->add(
			$ui->createScript('supsystic-tables-ace-editor-js')
				->setHookName($hookName)
				->setModuleSource($this, 'js/ace/ace.js')
		);

		$ui->add(
			$ui->createScript('supsystic-tables-ace-editor-mode-js')
				->setHookName($hookName)
				->setModuleSource($this, 'js/ace/mode-css.js')
				->addDependency('supsystic-tables-ace-editor-js')
		);

		$ui->add(
			$ui->createScript('supsystic-tables-ace-editor-theme-js')
				->setHookName($hookName)
				->setModuleSource($this, 'js/ace/theme-monokai.js')
				->addDependency('supsystic-tables-ace-editor-js')
		);
	}

	public function loadLanguageData($table) {
		if(isset($table->settings['language']['file'])) {
			$tableLang = !empty($table->settings['language']['file']) ? $table->settings['language']['file'] : 'default';
			$langModel = $this->getModule('tables')->getController()->getModel('languages', 'tables');
			$langList = $langModel->getDefaultLanguages();
			$langData = $langModel->getLanguagesData();

			if ($tableLang == 'browser') {
				$browserLangs = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);

				foreach ($browserLangs as $locale) {
					$lang = substr($locale, 0, 2);

					if(!empty($langList[$locale])) {
						$tableLang = $langList[$locale];
						break;
					}
					if(!empty($langList[$lang])) {
						$tableLang = $langList[$lang];
						break;
					}
				}
			}
			if(!empty($langData[$tableLang])) {
				if(is_admin()) {
					$table->settings['translation'] = $langData[$tableLang];
				} else {
					wp_localize_script('tables-core', 'g_stbTblLangData', $langData[$tableLang]);
				}
			}
		}

		return $table;
	}

	public function getFontsList() {
		return array("ABeeZee","Abel","Abril Fatface","Aclonica","Acme","Actor","Adamina","Advent Pro","Aguafina Script","Akronim","Aladin","Aldrich","Alef","Alegreya","Alegreya SC","Alegreya Sans","Alegreya Sans SC","Alex Brush","Alfa Slab One","Alice","Alike","Alike Angular","Allan","Allerta","Allerta Stencil","Allura","Almendra","Almendra Display","Almendra SC","Amarante","Amaranth","Amatic SC","Amethysta","Amiri","Anaheim","Andada","Andika","Angkor","Annie Use Your Telescope","Anonymous Pro","Antic","Antic Didone","Antic Slab","Anton","Arapey","Arbutus","Arbutus Slab","Architects Daughter","Archivo Black","Archivo Narrow","Arimo","Arizonia","Armata","Artifika","Arvo","Asap","Asset","Astloch","Asul","Atomic Age","Aubrey","Audiowide","Autour One","Average","Average Sans","Averia Gruesa Libre","Averia Libre","Averia Sans Libre","Averia Serif Libre","Bad Script","Balthazar","Bangers","Basic","Battambang","Baumans","Bayon","Belgrano","Belleza","BenchNine","Bentham","Berkshire Swash","Bevan","Bigelow Rules","Bigshot One","Bilbo","Bilbo Swash Caps","Biryani","Bitter","Black Ops One","Bokor","Bonbon","Boogaloo","Bowlby One","Bowlby One SC","Brawler","Bree Serif","Bubblegum Sans","Bubbler One","Buenard","Butcherman","Butterfly Kids","Cabin","Cabin Condensed","Cabin Sketch","Caesar Dressing","Cagliostro","Calligraffitti","Cambay","Cambo","Candal","Cantarell","Cantata One","Cantora One","Capriola","Cardo","Carme","Carrois Gothic","Carrois Gothic SC","Carter One","Caudex","Cedarville Cursive","Ceviche One","Changa One","Chango","Chau Philomene One","Chela One","Chelsea Market","Chenla","Cherry Cream Soda","Cherry Swash","Chewy","Chicle","Chivo","Cinzel","Cinzel Decorative","Clicker Script","Coda","Codystar","Combo","Comfortaa","Coming Soon","Concert One","Condiment","Content","Contrail One","Convergence","Cookie","Copse","Corben","Courgette","Cousine","Coustard","Covered By Your Grace","Crafty Girls","Creepster","Crete Round","Crimson Text","Croissant One","Crushed","Cuprum","Cutive","Cutive Mono","Damion","Dancing Script","Dangrek","Dawning of a New Day","Days One","Dekko","Delius","Delius Swash Caps","Delius Unicase","Della Respira","Denk One","Devonshire","Dhurjati","Didact Gothic","Diplomata","Diplomata SC","Domine","Donegal One","Doppio One","Dorsa","Dosis","Dr Sugiyama","Droid Sans","Droid Sans Mono","Droid Serif","Duru Sans","Dynalight","EB Garamond","Eagle Lake","Eater","Economica","Ek Mukta","Electrolize","Elsie","Elsie Swash Caps","Emblema One","Emilys Candy","Engagement","Englebert","Enriqueta","Erica One","Esteban","Euphoria Script","Ewert","Exo","Exo 2","Expletus Sans","Fanwood Text","Fascinate","Fascinate Inline","Faster One","Fasthand","Fauna One","Federant","Federo","Felipa","Fenix","Finger Paint","Fira Mono","Fira Sans","Fjalla One","Fjord One","Flamenco","Flavors","Fondamento","Fontdiner Swanky","Forum","Francois One","Freckle Face","Fredericka the Great","Fredoka One","Freehand","Fresca","Frijole","Fruktur","Fugaz One","GFS Didot","GFS Neohellenic","Gabriela","Gafata","Galdeano","Galindo","Gentium Basic","Gentium Book Basic","Geo","Geostar","Geostar Fill","Germania One","Gidugu","Gilda Display","Give You Glory","Glass Antiqua","Glegoo","Gloria Hallelujah","Goblin One","Gochi Hand","Gorditas","Goudy Bookletter 1911","Graduate","Grand Hotel","Gravitas One","Great Vibes","Griffy","Gruppo","Gudea","Gurajada","Habibi","Halant","Hammersmith One","Hanalei","Hanalei Fill","Handlee","Hanuman","Happy Monkey","Headland One","Henny Penny","Herr Von Muellerhoff","Hind","Holtwood One SC","Homemade Apple","Homenaje","IM Fell DW Pica","IM Fell DW Pica SC","IM Fell Double Pica","IM Fell Double Pica SC","IM Fell English","IM Fell English SC","IM Fell French Canon","IM Fell French Canon SC","IM Fell Great Primer","IM Fell Great Primer SC","Iceberg","Iceland","Imprima","Inconsolata","Inder","Indie Flower","Inika","Irish Grover","Istok Web","Italiana","Italianno","Jacques Francois","Jacques Francois Shadow","Jaldi","Jim Nightshade","Jockey One","Jolly Lodger","Josefin Sans","Josefin Slab","Joti One","Judson","Julee","Julius Sans One","Junge","Jura","Just Another Hand","Just Me Again Down Here","Kalam","Kameron","Kantumruy","Karla","Karma","Kaushan Script","Kavoon","Kdam Thmor","Keania One","Kelly Slab","Kenia","Khand","Khmer","Khula","Kite One","Knewave","Kotta One","Koulen","Kranky","Kreon","Kristi","Krona One","Kurale","La Belle Aurore","Laila","Lakki Reddy","Lancelot","Lateef","Lato","League Script","Leckerli One","Ledger","Lekton","Lemon","Libre Baskerville","Life Savers","Lilita One","Lily Script One","Limelight","Linden Hill","Lobster","Lobster Two","Londrina Outline","Londrina Shadow","Londrina Sketch","Londrina Solid","Lora","Love Ya Like A Sister","Loved by the King","Lovers Quarrel","Luckiest Guy","Lusitana","Lustria","Macondo","Macondo Swash Caps","Magra","Maiden Orange","Mako","Mallanna","Mandali","Marcellus","Marcellus SC","Marck Script","Margarine","Marko One","Marmelad","Martel","Martel Sans","Marvel","Mate","Mate SC","Maven Pro","McLaren","Meddon","MedievalSharp","Medula One","Megrim","Meie Script","Merienda","Merienda One","Merriweather","Merriweather Sans","Metal","Metal Mania","Metamorphous","Metrophobic","Michroma","Milonga","Miltonian","Miltonian Tattoo","Miniver","Miss Fajardose","Modak","Modern Antiqua","Molengo","Monda","Monofett","Monoton","Monsieur La Doulaise","Montaga","Montez","Montserrat","Montserrat Alternates","Montserrat Subrayada","Moul","Moulpali","Mountains of Christmas","Mouse Memoirs","Mr Bedfort","Mr Dafoe","Mr De Haviland","Mrs Saint Delafield","Mrs Sheppards","Muli","Mystery Quest","NTR","Neucha","Neuton","New Rocker","News Cycle","Niconne","Nixie One","Nobile","Nokora","Norican","Nosifer","Nothing You Could Do","Noticia Text","Noto Sans","Noto Serif","Nova Cut","Nova Flat","Nova Mono","Nova Oval","Nova Round","Nova Script","Nova Slim","Nova Square","Numans","Nunito","Odor Mean Chey","Offside","Old Standard TT","Oldenburg","Oleo Script","Oleo Script Swash Caps","Open Sans","Oranienbaum","Orbitron","Oregano","Orienta","Original Surfer","Oswald","Over the Rainbow","Overlock","Overlock SC","Ovo","Oxygen","Oxygen Mono","PT Mono","PT Sans","PT Sans Caption","PT Sans Narrow","PT Serif","PT Serif Caption","Pacifico","Palanquin","Palanquin Dark","Paprika","Parisienne","Passero One","Passion One","Pathway Gothic One","Patrick Hand","Patrick Hand SC","Patua One","Paytone One","Peddana","Peralta","Permanent Marker","Petit Formal Script","Petrona","Philosopher","Piedra","Pinyon Script","Pirata One","Plaster","Play","Playball","Playfair Display","Playfair Display SC","Podkova","Poiret One","Poller One","Poly","Pompiere","Pontano Sans","Port Lligat Sans","Port Lligat Slab","Pragati Narrow","Prata","Preahvihear","Press Start 2P","Princess Sofia","Prociono","Prosto One","Puritan","Purple Purse","Quando","Quantico","Quattrocento","Quattrocento Sans","Questrial","Quicksand","Quintessential","Qwigley","Racing Sans One","Radley","Rajdhani","Raleway","Raleway Dots","Ramabhadra","Ramaraja","Rambla","Rammetto One","Ranchers","Rancho","Ranga","Rationale","Ravi Prakash","Redressed","Reenie Beanie","Revalia","Ribeye","Ribeye Marrow","Righteous","Risque","Roboto","Roboto Condensed","Roboto Slab","Rochester","Rock Salt","Rokkitt","Romanesco","Ropa Sans","Rosario","Rosarivo","Rouge Script","Rozha One","Rubik Mono One","Rubik One","Ruda","Rufina","Ruge Boogie","Ruluko","Rum Raisin","Ruslan Display","Russo One","Ruthie","Rye","Sacramento","Sail","Salsa","Sanchez","Sancreek","Sansita One","Sarina","Sarpanch","Satisfy","Scada","Scheherazade","Schoolbell","Seaweed Script","Sevillana","Seymour One","Shadows Into Light","Shadows Into Light Two","Shanti","Share","Share Tech","Share Tech Mono","Shojumaru","Short Stack","Siemreap","Sigmar One","Signika","Signika Negative","Simonetta","Sintony","Sirin Stencil","Six Caps","Skranji","Slabo 13px","Slabo 27px","Slackey","Smokum","Smythe","Sniglet","Snippet","Snowburst One","Sofadi One","Sofia","Sonsie One","Sorts Mill Goudy","Source Code Pro","Source Sans Pro","Source Serif Pro","Special Elite","Spicy Rice","Spinnaker","Spirax","Squada One","Sree Krushnadevaraya","Stalemate","Stalinist One","Stardos Stencil","Stint Ultra Condensed","Stint Ultra Expanded","Stoke","Strait","Sue Ellen Francisco","Sumana","Sunshiney","Supermercado One","Suranna","Suravaram","Suwannaphum","Swanky and Moo Moo","Syncopate","Tangerine","Taprom","Tauri","Teko","Telex","Tenali Ramakrishna","Tenor Sans","Text Me One","The Girl Next Door","Tienne","Timmana","Tinos","Titan One","Titillium Web","Trade Winds","Trocchi","Trochut","Trykker","Tulpen One","Ubuntu","Ubuntu Condensed","Ubuntu Mono","Ultra","Uncial Antiqua","Underdog","Unica One","UnifrakturMaguntia","Unkempt","Unlock","Unna","VT323","Vampiro One","Varela","Varela Round","Vast Shadow","Vesper Libre","Vibur","Vidaloka","Viga","Voces","Volkhov","Vollkorn","Voltaire","Waiting for the Sunrise","Wallpoet","Walter Turncoat","Warnes","Wellfleet","Wendy One","Wire One","Yanone Kaffeesatz","Yellowtail","Yeseva One","Yesteryear","Zeyada");
	}

	public function getStandardFontsList() {
		return array("Georgia","Palatino Linotype","Times New Roman","Arial","Helvetica","Arial Black","Gadget","Comic Sans MS","Impact","Charcoal","Lucida Sans Unicode","Lucida Grande","Tahoma","Geneva","Trebuchet MS","Verdana","Geneva","Courier New","Courier","Lucida Console","Monaco");
	}

    private function registerMenuItem()
    {
        $environment = $this->getEnvironment();
        $menu = $environment->getMenu();
        $plugin_menu = $this->getConfig()->get('plugin_menu');
        $capability = $plugin_menu['capability'];

        $item = $menu->createSubmenuItem();
        $item->setCapability($capability)
            ->setMenuSlug($menu->getMenuSlug() . '#add')
            ->setMenuTitle($environment->translate('Add table'))
            ->setModuleName('tables')
            ->setPageTitle($environment->translate('Add table'));
		// Avoid conflicts with old vendor version
		if(method_exists($item, 'setSortOrder')) {
			$item->setSortOrder(20);
		}

        $menu->addSubmenuItem('add_table', $item);

        $item = $menu->createSubmenuItem();
        $item->setCapability($capability)
           ->setMenuSlug($menu->getMenuSlug() . '&module=tables')
           ->setMenuTitle($environment->translate('Tables'))
           ->setModuleName('tables')
           ->setPageTitle($environment->translate('Tables'));
		// Avoid conflicts with old vendor version
		if(method_exists($item, 'setSortOrder')) {
			$item->setSortOrder(30);
		}

        $menu->addSubmenuItem('tables', $item);

		// We change Settings submenu position
		if($menu->getSubmenuItem('settings')) {
			$settings = $menu->getSubmenuItem('settings');
			$menu->deleteSubmenuItem('settings');
			$menu->addSubmenuItem('settings', $settings);
		}
    }

    public function disallowIndexing($id) {

        $core = $this->getEnvironment()->getModule('core');
        $tables = $core->getModelsFactory()->get('tables');
        $settings = $tables->getSettings($id);

        if (!$settings) {
            return false;
        }
        if (!isset($settings['disallowIndexing'])) {
            return false;
        }
        $userAgent = $this->getRequest()->headers->get('USER_AGENT');
        $pattern = '/(abachobot|acoon|aesop_com_spiderman|ah-ha.com crawler|appie|arachnoidea|architextspider|atomz|baidu|bing|bot|deepindex|esismartspider|ezresult|fast-webcrawler|feed|fido|fluffy the spider|gigabot|google|googlebot|gulliver|gulper|gulper|henrythemiragorobot|http|ia_archiver|jeevesteoma|kit-fireball|linkwalker|lnspiderguy|lycos_spider|mantraagent|mediapartners|msn|nationaldirectory-superspider|nazilla|openbot|openfind piranha,shark|robozilla|scooter|scrubby|search|slurp|sogou|sohu|soso|spider|tarantula|teoma_agent1|test|uk searcher spider|validator|w3c_validator|wdg_validator|webaltbot|webcrawler|websitepulse|wget|winona|yahoo|yodao|zyborg)/i';
        return (bool) preg_match($pattern, $userAgent);
    }

    public function reviewNoticeCheck() {
        $option = $this->config('db_prefix') . 'reviewNotice';
        $notice = get_option($option);
        if (!$notice) {
            update_option($option, array(
                'time' => time() + (60 * 60 * 24 * 7),
                'shown' => false
            ));
        } elseif ($notice['shown'] === false && time() > $notice['time']) {
            add_action('admin_notices', array($this, 'showReviewNotice'));
        }
    }

    public function showReviewNotice() {
        print $this->getTwig()->render('@tables/notice/review.twig');
    }

    public function wooProAddonAds(){
		$option = $this->config('db_prefix') . 'wooAdsNotice';
		$notice = get_option($option);
		if (!$notice) {
			update_option($option, array(
				'time' => time() - 1000,
				'shown' => false
			));
		} elseif ($notice['shown'] === false && time() > $notice['time']) {
			add_action('admin_notices', array($this, 'showWooAdsNotice'));
		}
	}

	public function showWooAdsNotice() {
		print $this->getTwig()->render('@tables/notice/wooAds.twig');
	}

	public function setIniLimits() {
		// Override local and wp limits
		if(strlen(ini_get('memory_limit')) < 4) {
			ini_set('memory_limit', '12000M');
		}
		if(strlen(ini_get('connect_timeout')) < 2) {
			ini_set('connect_timeout', 24000);
		}
		if(strlen(ini_get('max_execution_time')) < 2) {
			ini_set('max_execution_time', 24000);
		}
		if(strlen(ini_get('max_input_time')) < 2) {
			ini_set('max_input_time', 24000);
		}
	}

	/**
	 * Executes after module loaded.
	 */
	public function onAfterLoaded()
	{
		$config = $this->getEnvironment()->getConfig();
	}

	/**
	 * Call wp footer manualy on broken themes to ensure than scripts are loaded
	 */
	public function onShutdown() {
		$settings = get_option('supsystic_tbl_settings');
		if (empty($settings['disable_wp_footer_fix']) && !is_admin() && did_action('after_setup_theme') && did_action('get_footer') && !did_action('wp_footer')) {
			wp_footer();
		}
	}

	/**
	 * Runs the callbacks after the table editor tabs rendered.
	 */
	private function renderTableProSections()
	{
		$dispatcher = $this->getEnvironment()->getDispatcher();

		$dispatcher->on('tabs_rendered', array($this, 'afterTabsRendered'));
		$dispatcher->on('tabs_content_rendered', array($this, 'afterTabsContentRendered'));
	}

	/**
	 * Renders the "TableHistory" and "Source" tab.
	 * @param \stdClass $table Current table
	 */
	public function afterTabsRendered()
	{
		$twig = $this->getEnvironment()->getTwig();
		$twig->display('@tables/partials/historyTab.twig', array());
		$twig->display('@tables/partials/sourceTab.twig', array());
	}

	/**
	 * Renders the "TableHistory" and "Source" tabs content.
	 * @param \stdClass $table Current table
	 */
	public function afterTabsContentRendered($table)
	{
		$twig = $this->getEnvironment()->getTwig();
		$dispatcher = $this->getEnvironment()->getDispatcher();

		$twig->display(
			$dispatcher->apply('table_history_tabs_content_template', array('@tables/partials/historyTabContent.twig')),
			$dispatcher->apply('table_history_tabs_content_data', array(array( 'table' => $table )))
		);
		$twig->display(
			$dispatcher->apply('table_source_tabs_content_template', array('@tables/partials/sourceTabContent.twig')),
			$dispatcher->apply('table_source_tabs_content_data', array(array( 'table' => $table )))
		);
	}

	public function getShortcodesList()
	{
		$environment = $this->getEnvironment();
		$config = $environment->getConfig();
		$dispatcher = $environment->getDispatcher();
		$shortcodes = array(
			'shortcode' => array(
				'name' => $config->get('shortcode_name'),
				'label' => $environment->translate('Table Shortcode'),
				'attrs' => '',
			),
			'part_shortcode' => array(
				'name' => $config->get('shortcode_part_name'),
				'label' => $environment->translate('Table Part Shortcode'),
				'attrs' => 'row=1-3 col=A,B',
			),
			'cell_shortcode' => array(
				'name' => $config->get('shortcode_cell_name'),
				'label' => $environment->translate('Cell Shortcode'),
				'attrs' => 'row=1 col=A',
			),
			'value_shortcode' => array(
				'name' => $config->get('shortcode_value_name'),
				'label' => $environment->translate('Value Shortcode'),
				'attrs' => 'row=1 col=A',
			),
			'php_code' => array(
				'name' => $config->get('shortcode_name'),
				'label' => $environment->translate('PHP code'),
				'attrs' => '',
			),
		);

		if($this->getEnvironment()->isPro()) {
			// it should be here for compatibility with old pro versions
			$shortcodes['history_shortcode'] = array(
				'name' => $config->get('shortcode_name'),
				'label' => $environment->translate('History Shortcode'),
				'attrs' => 'use_history=1',
			);
			$shortcodes['sql_shortcode'] = array(
				'name' => $config->get('shortcode_name'),
				'label' => $environment->translate('SQL Shortcode'),
				'attrs' => 'sql1=1 sql2="yes"',
			);
		}

		return $dispatcher->apply('table-shortcodes-list', array($shortcodes));
	}

	public function additionalCloningActions($clonedTable, $newTableId) {
		return $clonedTable;
	}

	public function excludeFromLazyLoad($classes) {
		array_push($classes, 'stbSkipLazy');
		return $classes;
	}
}

require_once('Model/widget.php');
