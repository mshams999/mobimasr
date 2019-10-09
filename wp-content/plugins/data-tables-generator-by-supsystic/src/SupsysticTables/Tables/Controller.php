<?php


class SupsysticTables_Tables_Controller extends SupsysticTables_Core_BaseController
{
    /**
     * Shows the list of the tables.
     * @return Rsc_Http_Response
     */
    public function indexAction()
    {
        try {
			$this->getEnvironment()->getModule('tables')->setIniLimits();
            $tables = $this->getModel('tables')->getAll(array(
				'order'    => 'DESC',
				'order_by' => 'id'
			));
            return $this->response('@tables/index.twig', array('tables' => $tables));
        } catch (Exception $e) {
            return $this->response('error.twig', array('exception' => $e));
        }
    }

    /**
     * Validate and creates the new table.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function createAction(Rsc_Http_Request $request)
    {
        $title = trim($request->post->get('title'));
        $rowsCount = (int) $request->post->get('rows');
        $colsCount = (int) $request->post->get('cols');

        try {
			if (!$this->isValidTitle($title)) {
                return $this->ajaxError($this->translate('Title can\'t be empty or more than 255 characters'));
            }
			$this->getEnvironment()->getModule('tables')->setIniLimits();
			// Add base settings
            $tableId = $this->getModel('tables')->add(array('title' => $title, 'settings' => serialize(array())));

			if($tableId) {
				$rows = array();

				for($i = 0; $i < $rowsCount; $i++) {
					array_push($rows, array('cells' => array()));
					for($j = 0; $j < $colsCount; $j++) {
						array_push($rows[$i]['cells'], array(
							'data' => '',
							'calculatedValue' => '',
                   			'hidden' => '',
                    		'type' => 'text',
                    		'formatType' => '',
							'meta' => array()
						));
					}
				}
				// Save an empty table's rows to prevent error when the Data Tables script will be executed
				$this->getModel('tables')->setRows($tableId, $rows);
			}
        } catch (Exception $e) {
            return $this->ajaxError($e->getMessage());
        }

        return $this->ajaxSuccess(array('url' => $this->generateUrl('tables', 'view', array('id' => $tableId))));
    }

    /**
     * Removes the table.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function removeAction(Rsc_Http_Request $request)
    {
        $id = $this->isAjax() ? $request->post->get('id') : $request->query->get('id');

        try {
			$ids = is_array($id) ? $id : array($id);
			foreach ($ids as $i => $id) {
            	$this->getModel('tables')->removeById($id);
			}
        } catch (Exception $e) {
            if ($this->isAjax()) {
                return $this->ajaxError($e->getMessage());
            }

            return $this->response('error.twig', array('exception' => $e));
        }

        if ($this->isAjax()) {
            return $this->ajaxSuccess();
        }

        return $this->redirect($this->generateUrl('tables'));
    }

    /**
     * Show the table settings, editor, etc.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function viewAction(Rsc_Http_Request $request)
    {
		$this->getEnvironment()->getModule('tables')->setIniLimits();

		/** @var SupsysticTables_Tables_Model_Languages $languages */
		$languages = $this->getModel('languages', 'tables');

		try {
			add_action('admin_enqueue_scripts', function(){
				wp_enqueue_media();
			});
            $id = $request->query->get('id');
			$table = $this->getModel('tables')->getById($id);
        } catch (Exception $e) {
            return $this->response('error.twig', array('exception' => $e));
        }
		if(isset($table->settings['features']['after_table_loaded_script']) && !empty($table->settings['features']['after_table_loaded_script'])) {
			$table->settings['features']['after_table_loaded_script'] = base64_decode($table->settings['features']['after_table_loaded_script']);
		}

        $settings = get_option($this->getConfig()->get('db_prefix') . 'settings');
		$contactForm = $this->getEnvironment()->getModule('contactForm');
		$contactFormIsInstalled = $contactForm->isInstalled();

        return $this->response(
            '@tables/view.twig',
            array(
                'table'             => $table,
                'attributes'        => array(
                    'cols' => $request->query->get('cols', 5),
                    'rows' => $request->query->get('rows', 5),
                    'new' => $request->query->get('new', 0)
                ),
                'translations'      => $languages->getTranslations(),
                'settings'          => $settings,
				'contact_form' => array(
					'install_link' => admin_url('plugin-install.php?s=contact+form+by+supsystic&tab=search&type=term'),
					'create_link' => $contactFormIsInstalled ? $contactForm->findModule('options')->getTabUrl('forms_add_new') : '',
					'is_installed' => $contactFormIsInstalled,
					'forms_list' => $contactFormIsInstalled && method_exists($contactForm->getModel(), 'getAllForms') 
						? $contactForm->getModel()->getAllForms() : array(),
					'pages_list' => $contactFormIsInstalled ? $this->getPagesListForSelect() : array(),
				),
            )
        );
    }

	public function getPagesListForSelect() {
		global $wpdb;
		// We are not using wp methods here - as list can be very large - and it can take too much memory
		$allPagesForSelect = array();
		$postTypesForPostsList = array('page', 'post', 'product', 'blog', 'grp_pages', 'documentation');
		$allPages = $wpdb->get_results("SELECT ID, post_title FROM $wpdb->posts WHERE post_type IN ('". implode("','", $postTypesForPostsList). "') AND post_status IN ('publish','draft') ORDER BY post_title", ARRAY_A);
		$allPagesForSelect[home_url()] = $this->getEnvironment()->translate('Main Home Page');
		if(!empty($allPages)) {
			foreach($allPages as $p) {
				$allPagesForSelect[get_permalink($p['ID'])] = $p['post_title'];
			}
		}
		return $allPagesForSelect;
	}

    /**
     * Renames the table.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function renameAction(Rsc_Http_Request $request)
    {
        $id = $request->post->get('id');
        $title = trim($request->post->get('title'));

        try {
            $this->getModel('tables')->set($id, array(
                'title' => $title
            ));
        } catch (Exception $e) {
            return $this->ajaxError($e->getMessage());
        }

        return $this->ajaxSuccess();
    }

    /**
     * Get Data for AJAX paging.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function getPageRowsAction(Rsc_Http_Request $request)
    {
        $id = (int)$request->post->get('id');
        $tables = $this->getModel('tables');
        
        try {
            $this->getEnvironment()->getModule('tables')->setIniLimits();
            $start = $request->post->get('start');
            $length = $request->post->get('length');
            $searchAll = $request->post->get('search');
            $columns = $request->post->get('columns');
            $searchParams = $request->post->get('searchParams');
            $searchValue = $request->post->get('searchValue');
            if (isset($searchValue) && $searchValue != '') {
                $searchAll['value'] = $searchValue;
            }
            $searchCols = array();
            foreach ($columns as $j => $column) {
                if (isset($column['search']) && isset($column['search']['value'])) {
                    $search = $column['search']['value'];
                    if($search != '') {
                        $list = explode('|', $search);
                        if (!in_array('', $list)) {
                            $searchCols[$j] = $list;
                        }
                    }
                }
            }
            $order = $request->post->get('order');
            $orderCol = (isset($order[0]) && isset($order[0]['column']) ? $order[0]['column'] : false);
            $orderAsc = (isset($order[0]) && isset($order[0]['dir']) && $order[0]['dir'] == 'asc');
            $header = (int)$request->post->get('header');
            $footer = (int)$request->post->get('footer');
			$table = $tables->getById($id);

			if($this->getEnvironment()->isWooPro() && isset($table->woo_settings) && isset($table->woo_settings['woocommerce']['enable']) && $table->woo_settings['woocommerce']['enable'] === 'on'){
				$rows = $this->getEnvironment()->getModule('woocommerce')->getController()->getRowsByPart($id, array(), $start, $length, $searchAll['value']);
			}else{
				$rows = $tables->getRowsByPart($id, ($searchAll['value'] == '' ? false : $searchAll['value']), $searchCols, $orderCol, $orderAsc, $start, $length, $header, $footer, $searchParams, $table);
			}
			$table->rows = $rows['data'];
            $module = $this->getEnvironment()->getModule('tables');
            $module->setIniLimits();
            $module->setDataForPage($table);
           
            return $this->ajaxSuccess(array('draw' => $request->post->get('draw'),
                'recordsTotal' => $rows['recordsTotal'],
                'recordsFiltered' => $rows['recordsFiltered'],
                'rows' => $module->render($id)));

        } catch (Exception $e) {
            return $this->ajaxError($e->getMessage());
        }
    }

    /**
     * Returns the table columns.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function getColumnsAction(Rsc_Http_Request $request)
    {
        /** @var SupsysticTables_Tables_Model_Tables $tables */
        $tables = $this->getModel('tables');
        $id = $request->post->get('id');

        try {
            return $this->ajaxSuccess(
                array('columns' => $tables->getColumns($id))
            );
        } catch (Exception $e) {
            return $this->ajaxError($e->getMessage());
        }
    }

    /**
     * Updates the table columns.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function updateColumnsAction(Rsc_Http_Request $request)
    {
        /** @var SupsysticTables_Tables_Model_Tables $tables */
        $tables = $this->getModel('tables');
        $id = $request->post->get('id');
        $columns = $request->post->get('columns');

        try {
            $tables->setColumns($id, $columns);
        } catch (Exception $e) {
            return $this->ajaxError(
                sprintf(
                    $this->translate(
                        'Failed to save table columns: %s'
                    ),
                    $e->getMessage()
                )
            );
        }

        return $this->ajaxSuccess();
    }

    /**
     * Returns count of table rows.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function getCountRowsAction(Rsc_Http_Request $request)
    {
        $tables = $this->getModel('tables');
        $id = $request->post->get('id');

        try {
            $this->getEnvironment()->getModule('tables')->setIniLimits();

            return $this->ajaxSuccess(array(
                'countRows' => $tables->getCountRows($id)
            ));
        } catch (Exception $e) {
            return $this->ajaxError($e->getMessage());
        }
    }

    /**
     * Returns the table rows.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function getRowsAction(Rsc_Http_Request $request)
    {
        /** @var SupsysticTables_Tables_Model_Tables $tables */
        $tables = $this->getModel('tables');
        $id = $request->post->get('id');
        $limit = $request->post->get('limit');
        $offset = $request->post->get('offset');

        try {
			$this->getEnvironment()->getModule('tables')->setIniLimits();

            return $this->ajaxSuccess(array(
                'rows' => $tables->getRows($id, isset($limit) ? $limit : 0, 'ASC', isset($offset) ? $offset : 0)
            ));
        } catch (Exception $e) {
            return $this->ajaxError($e->getMessage());
        }
    }

    /**
     * Updates the table rows.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function updateRowsAction(Rsc_Http_Request $request)
    {
		/** @var SupsysticTables_Tables_Model_Tables $tables */
        $tables = $this->getModel('tables');
        $id = $request->post->get('id');
        $step = $request->post->get('step');
		$last = (bool) $request->post->get('last');
		$rowsData = $request->post->get('rows');
		$rows = $this->prepareData($rowsData);

        // ticket #1024
        if (null === $rows) {
            $message = $this->translate('Can\'t decode table rows from JSON.');

            if (function_exists('json_last_error')) {
                $message .= 'Error: ' . json_last_error();
            }

            return $this->ajaxError($message);
        }

        try {
			$this->getEnvironment()->getModule('tables')->setIniLimits();

			if(!empty($step)) {
				$tables->setRowsByPart($id, $rows, $step, $last);
			} else {
				$tables->setRows($id, $rows);
			}

        } catch (Exception $e) {
            return $this->ajaxError(
                sprintf(
                    $this->translate(
                        'Failed to save table rows: %s'
                    ),
                    $e->getMessage()
                )
            );
        }
        $this->cleanCache($id);
        return $this->ajaxSuccess();
    }

    /**
     * Saves the table settings.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function saveSettingsAction(Rsc_Http_Request $request)
    {
        $id = $request->post->get('id');
        $data = $request->post->get('settings');
        if (get_magic_quotes_gpc()) {
           $data = stripslashes($data);
        }
        parse_str($data, $settings);

        try {
			$this->getEnvironment()->getModule('tables')->setIniLimits();
            $this->getModel('tables')->set($id, array('settings' => htmlspecialchars(serialize($settings), ENT_QUOTES)));
        } catch (Exception $e) {
            return $this->ajaxError($e->getMessage());
        }

        $this->cleanCache($id);
        return $this->ajaxSuccess();
    }

    /**
     * Renders the table.
     * @param Rsc_Http_Request $request
     * @return Rsc_Http_Response
     */
    public function renderAction(Rsc_Http_Request $request)
    {
        /** @var SupsysticTables_Tables_Module $tables */
        $tables = $this->getEnvironment()->getModule('tables');
        $id = $request->post->get('id');
		$tables->setIniLimits();
        $data = $request->post->get('settings');
        $settings = false;
        if($data && !empty($data)) {
            if(get_magic_quotes_gpc()) {
                $data = stripslashes($data);
            }
            parse_str($data, $settings);
        }
        $preview = $request->post->get('preview');
        
        $tables->isPreview = ($preview && $preview == 1);
        if($tables->isPreview) {
            $this->cleanCache($id);
        }
        return $this->ajaxSuccess(array('table' => $tables->render((int)$id, $settings)));
    }

    /**
     * Updates table meta (Cells merging, etc)
     * @param \Rsc_Http_Request $request
     * @return \Rsc_Http_Response
     */
    public function updateMetaAction(Rsc_Http_Request $request)
    {
        /** @var SupsysticTables_Tables_Model_Tables $tables */
        $tables = $this->getModel('tables');
        $id = $request->post->get('id');
        $metaData = $request->post->get('meta');
        $meta = $this->prepareData($metaData);

        // ticket #1024
        if (null === $meta) {
            $message = $this->translate('Can\'t decode table meta from JSON.');

            if (function_exists('json_last_error')) {
                $message .= 'Error: ' . json_last_error();
            }

            return $this->ajaxError($message);
        }

        try {
			$this->getEnvironment()->getModule('tables')->setIniLimits();
            $tables->setMeta($id, $meta);
        } catch (Exception $e) {
            return $this->ajaxError(
                sprintf(
                    $this->translate('Failed to save table meta data: %s'),
                    $e->getMessage()
                )
            );
        }

        return $this->ajaxSuccess();
    }

    public function getMetaAction(Rsc_Http_Request $request)
    {
        $id = $request->post->get('id');
        /** @var SupsysticTables_Tables_Model_Tables $tables */
        $tables = $this->getModel('tables');
		$this->getEnvironment()->getModule('tables')->setIniLimits();

        return $this->ajaxSuccess(array('meta' => $tables->getMeta($id)));
    }

    /**
     * Validates the table title.
     * @param string $title
     * @return bool
     */
    protected function isValidTitle($title)
    {
        return is_string($title) && ($title !== '' && strlen($title) < 255);
    }

	public function sendUsageStat($state) {
		$apiUrl = 'http://updates.supsystic.com';

		$reqUrl = $apiUrl . '?mod=options&action=saveUsageStat&pl=rcs';
		wp_remote_post($reqUrl, array(
			'body' => array(
				'site_url' => get_bloginfo('wpurl'),
				'site_name' => get_bloginfo('name'),
				'plugin_code' => 'stb',
				'all_stat' => array('views' => 'review', 'code' => $state),
			)
		));

		return true;
	}

    public function cleanCache($id)
    {
        $cachePath = $this->getConfig()->get('plugin_cache_tables') . DIRECTORY_SEPARATOR . $id;
        if (file_exists($cachePath)) {
            unlink($cachePath);
        }
    }

	public function prepareData($data) {
		$decodedData = '';

		if(is_array($data)) {
			foreach ($data as $d) {
				$decodedData .= $d;
			}
		} else {
			$decodedData = $data;
		}
		if (get_magic_quotes_gpc()) {
			$decodedData = stripslashes($decodedData);
		}
		$decodedData = json_decode($decodedData, true);

		return $decodedData;
	}

    public function cloneTableAction(Rsc_Http_Request $request)
    {
		$tablesModule = $this->getEnvironment()->getModule('tables');
		$tablesModel = $this->getModel('tables');

		$tablesModule->setIniLimits();
		$id = $request->post->get('id');
        $title = $request->post->get('title');
        $clonedTable = $tablesModel->getById($id);
        $clonedTable->rows = $tablesModel->getRows($id);

        try {
            if (!$this->isValidTitle($title)) {
                return $this->ajaxError($this->translate('Title can\'t be empty or more than 255 characters'));
            }
            $tableData = array(
				'title' => $title,
				'settings' => serialize($clonedTable->settings),
				'meta' => serialize($clonedTable->meta)
			);
            if($this->getEnvironment()->isWooPro()){
				$wooSettings = $tablesModel->getWooSettings($id);
				$tableData['woo_settings'] = $wooSettings;
			}
            $tableId = $tablesModel->add($tableData);
			$newTableMeta = $clonedTable->meta;
			$newTableMeta['css'] = preg_replace('/#supsystic-table-(\d+)/', '#supsystic-table-' . $tableId, $clonedTable->meta['css']);
			$tablesModel->setMeta($tableId,$newTableMeta);
            $tablesModel->setRows($tableId, $clonedTable->rows);
			$tablesModule->additionalCloningActions($clonedTable, $tableId);

            return $this->ajaxSuccess(array('id' => $tableId));

        } catch (Exception $e) {
            return $this->ajaxError($e->getMessage());
        }
    }

    public function reviewNoticeResponseAction(Rsc_Http_Request $request) {
        $responseCode = $request->post->get('responseCode');
        $responseType = $request->post->get('responseType');

		$optionname = 'reviewNotice';
        switch ( $responseType ){
			case 'wooads':
				$optionname = 'wooAdsNotice';
				break;
			case 'stars':
				$optionname = 'reviewNotice';
				break;
		}

		$option = $this->getConfig()->get('db_prefix') . $optionname;

        if ($responseCode === 'later') {
            update_option($option, array(
                'time' => time() + (60 * 60 * 24 * 2),
                'shown' => false
            ));
        } else {
            update_option($option, array(
                'shown' => true
            ));
        }

        return $this->ajaxSuccess();
    }

	/**
	 * Returns full list of the tables.
	 * Uses for adding of shortcode button to TinyMCE Editor.
	 *
	 * @return Rsc_Http_Response
	 */
	public function listAction() {
		try{
			$tables = $this->getModel('tables')->getAll(array(
				'order' => 'ASC',
				'order_by' => 'title'
			));
			return $this->ajaxSuccess(array('tables' => $tables));
		} catch (Exception $e) {
			return $this->ajaxError($e->getMessage());
		}
	}

	public function getListForTblAction( Rsc_Http_Request $request)
	{
		$data = $request->post->get('data');

		$page = $data['page'];
		$rowsLimit = $data['rows'];
		$orderBy = $data['sidx'];
		$sortOrder = $data['sord'];
		$search = $data['search'];

		$core = $this->getEnvironment()->getModule('core');
		$model = $core->getModelsFactory()->get('tables');

		// Get total pages count for current request
		$totalCount = $model->getTablesCount();
		$totalPages = 0;
		if($totalCount > 0) {
			$totalPages = ceil($totalCount / $rowsLimit);
		}
		if($page > $totalPages) {
			$page = $totalPages;
		}
		// Calc limits - to get data only for current set
		$limitStart = $rowsLimit * $page - $rowsLimit; // do not put $limit*($page - 1)
		if($limitStart < 0)
			$limitStart = 0;

		$data = $model->getListTbl(
			array(
				'orderBy' => $orderBy,
				'sortOrder' => $sortOrder,
				'rowsLimit' => $rowsLimit,
				'limitStart' => $limitStart,
				'search' => $search,
			)
		);

		$data = $this->_prepareListForTbl($data);

		return $this->ajaxSuccess(array(
			'page' => $page,
			'total' => $totalPages,
			'rows' => $data,
		));

	}

	public function _prepareListForTbl($data){
		$config = $this->getEnvironment()->getConfig();
		$tableShortcode = $config->get('shortcode_name');

		foreach($data as $key=>$row){
			$id = $row['id'];
			$shortcode = "[".$tableShortcode." id=".$id."]";
			$phpcode = htmlspecialchars("<?php echo supsystic_tables_get(".$id."); ?>");
			$titleUrl = "<a href=".$this->generateUrl('tables', 'view', array( 'id' => $id ) ).">".$row['title']." <i class='fa fa-fw fa-pencil'></i></a>";
			$data[$key]['shortcode'] = $shortcode;
			$data[$key]['phpcode'] = $phpcode;
			$data[$key]['title'] = $titleUrl;
		}
		return $data;
	}

}
