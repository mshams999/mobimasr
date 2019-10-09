<?php


abstract class SupsysticTables_Core_BaseModel extends Rsc_Mvc_Model implements Rsc_Environment_AwareInterface
{
    /**
     * @var Rsc_Environment
     */
    protected $environment;

    /**
     * Sets the environment.
     * @param Rsc_Environment $environment
     */
    public function setEnvironment(Rsc_Environment $environment)
    {
        $this->environment = $environment;
    }

    /**
     * Runs after models factory created model.
     */
    public function onInstanceReady()
    {
    }

    /**
     * Starts the transaction.
     */
    public function transactionStart()
    {
        $this->db->query('START TRANSACTION');
    }

    public function transactionCommit()
    {
        $this->db->query('COMMIT');
    }

    public function transactionRollback()
    {
        $this->db->query('ROLLBACK');
    }

    /**
     * Returns both database and plugin prefixes.
     * @return string
     */
    public function getPrefix()
    {
        if (!$this->environment) {
            throw new RuntimeException('Can\'t get prefix without app environment.');
        }

        $database = $this->db->prefix;
        $plugin = $this->environment->getConfig()->get('db_prefix');

        return $database.$plugin;
    }

    /**
     * Returns the raw table name of the current model.
     * @return string
     */
    public function getRawTableName()
    {
        $classNameParts = explode('_', get_class($this));
        return strtolower(end($classNameParts));
    }

    /**
     * Returns table name.
     * @param string|null $tableName Optional table name. Model name will be used if parameter is NULL.
     * @return string
     */
    public function getTable($tableName = null)
    {
        if (null === $tableName) {
            $tableName = $this->getRawTableName();
        }

        return $this->getPrefix().$tableName;
    }

    /**
     * Returns table field.
     * @param string|null $tableName
     * @param string $fieldName
     * @param string|null $as
     * @return string
     */
    public function getField($tableName = null, $fieldName = 'id', $as = null)
    {
        $field = $this->getTable($tableName).'.'.$fieldName;

        if (is_string($as)) {
            $field = $field.' AS '.$as;
        }

        return $field;
    }

    /**
     * Returns the all table rows
     * @param array $parameters Query extra parameters
     * @return stdClass[]|null
     */
    public function getAll(array $parameters = array())
    {
        $query = $this->getQueryBuilder()
            ->select('*')
            ->from($this->getTable());

        $query = $this->populateQuery($query, $parameters);
        $rows = $this->db->get_results($query->build());

        if ($this->db->last_error) {
            throw new RuntimeException($this->db->last_error);
        }

        return $this->dispatchFilter('get_all', $rows);
    }

    /**
     * Returns row.
     * @param string $field Field name
     * @param mixed $value Sanitized value to search
     * @param array $parameters Query extra parameters
     * @return stdClass|null
     */
    public function get($field, $value, array $parameters = array())
    {
        $query = $this->getQueryBuilder()
            ->select('*')
            ->from($this->getTable())
            ->where($field, '=', htmlspecialchars($value));

        $query = $this->populateQuery($query, $parameters);
        $row = $this->db->get_row($query->build());

        if ($this->db->last_error) {
            throw new RuntimeException($this->db->last_error);
        }

        return $this->dispatchFilter('get', $row);
    }

    /**
     * Removes row by field.
     * @param string $field Field name
     * @param mixed $value Field value
     * @param array $parameters Query extra parameters
     * @throws RuntimeException if query failed.
     */
    public function remove($field, $value, array $parameters = array())
    {
        $query = $this->getQueryBuilder()
            ->deleteFrom($this->getTable())
            ->where($field, '=', htmlspecialchars($value));

        $query = $this->populateQuery($query, $parameters);


        $this->db->query($query->build());
        if ($this->db->last_error) {
            throw new RuntimeException($this->db->last_error);
        }
    }

    /**
     * Adds data to the database.
     * @param array $fields Key-value pairs of the data.
     * @return int Row id
     * @throws InvalidArgumentException if empty array is specified.
     * @throws RuntimeException if query failed.
     */
    public function add(array $fields)
    {
        if (count($fields) === 0) {
            throw new InvalidArgumentException(
                'The values for the insertion were not specified.'
            );
        }

		$values = $this->beforeValuesSet($fields);

        $query = $this->getQueryBuilder()
            ->insertInto($this->getTable())
            ->fields(array_keys($fields))
            ->values($values);

		$this->db->query(
			$this->db->prepare($query->build(), array_values($fields)));


        if ($this->db->last_error) {
            throw new RuntimeException($this->db->last_error);
        }

        return $this->db->insert_id;
    }

    /**
     * Updates row with the specified id.
     * @param int $id Row id
     * @param array $fields Key-value pairs of the data
     * @throws InvalidArgumentException if empty array is specified.
     * @throws RuntimeException if query failed.
     */
    public function set($id, array $fields)
    {
        if (count($fields) === 0) {
            throw new InvalidArgumentException(
                'The values for the updates were not specified.'
            );
        }

		$values = $this->beforeValuesSet($fields);

		$query = $this->getQueryBuilder()
            ->update($this->getTable())
            ->fields(array_keys($fields))
            ->values($values)
            ->where('id', '=', (int)$id);


		$this->db->query(
			$this->db->prepare($query->build(), array_values($fields)));

        if ($this->db->last_error) {
            throw new RuntimeException($this->db->last_error);
        }
    }

	protected function beforeValuesSet($fields) {
		$values = array();

		for($i = 0; $i < count($fields); $i++) {
			$values[] = '%s';
		}

		return $values;
	}

    /**
     * Returns row by id.
     * @param int $id
     * @param array $parameters Query extra parameters
     * @return stdClass|null
     */
    public function getById($id, array $parameters = array())
    {
        return $this->get('id', (int)$id, $parameters);
    }

    /**
     * Removes row by id.
     * @param int $id
     * @param array $parameters Query extra parameters
     * @throws RuntimeException if query failed.
     */
    public function removeById($id, array $parameters = array())
    {
        try {
			$id = (int)$id;
            $this->remove('id', $id, $parameters);
			$this->dispatchFilter('remove', $id);
        } catch (RuntimeException $e) {
            throw $e;
        }
    }

    /**
     * Applies the filters the the query results.
     * Method builds the name like %hooks_prefix%%table_name%_%name%.
     * @param string $name Filter name
     * @param mixed $result Query result
     * @return mixed
     */
    protected function dispatchFilter($name, $result)
    {
		if (!$this->environment) {
            return $result;
        }

        return $this->environment->getDispatcher()->apply(
            $this->getRawTableName() . '_' . strtolower($name),
            array($result)
        );
    }

    /**
     * Populates the query with the extra parameters.
     * @param BarsMaster_ChainQueryBuilder $queryBuilder
     * @param array $parameters
     * @return BarsMaster_ChainQueryBuilder
     */
    protected function populateQuery(
        BarsMaster_ChainQueryBuilder $queryBuilder,
        array $parameters
    ) {
        if (count($parameters) === 0) {
            return $queryBuilder;
        }

        if (array_key_exists('order_by', $parameters)) {
            $queryBuilder->orderBy($parameters['order_by']);
        }

        if (array_key_exists('order', $parameters)) {
            $queryBuilder->order($parameters['order']);
        }

        if (array_key_exists('limit', $parameters)) {
            $queryBuilder->limit((int)$parameters['limit']);
        }

        if (array_key_exists('offset', $parameters)) {
            $queryBuilder->offset((int)$parameters['offset']);
        }

        return $queryBuilder;
    }
}