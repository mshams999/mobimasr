<?php


class SupsysticTables_Core_ModelsFactory 
{
    /**
     * @var SupsysticTables_Core_BaseModel[]
     */
    protected $models;

    /**
     * @var Rsc_Environment
     */
    protected $environment;

    /**
     * Constructs the models factory
     * @param Rsc_Environment $environment
     */
    public function __construct(Rsc_Environment $environment)
    {
        $this->models = array();
        $this->environment = $environment;
    }

    /**
     * @param string $model
     * @param string|Rsc_Mvc_Module $module
     */
    public function factory($model, $module = null)
    {
        $className = $this->getClassName($model, $module);

        if (!class_exists($className) && $this->environment->isPro() ) {
            $className = $this->getClassName(
                $model,
                $module,
                $this->environment->getConfig()->get('pro_modules_prefix')
            );
        }

		if (!class_exists($className) && $this->environment->isWooPro()) {
			$className = $this->getClassName(
				$model,
				$module,
				$this->environment->getConfig()->get('pro_woo_modules_prefix')
			);
		}

        if (!class_exists($className)) {
            throw new InvalidArgumentException(
                sprintf('Cant find class for model %s', $model)
            );
        }

        $class = new $className;

        if ($class instanceof Rsc_Environment_AwareInterface) {
            $class->setEnvironment($this->environment);
        }

        if (method_exists($class, 'onInstanceReady')) {
            $class->onInstanceReady();
        }

        return $class;
    }

    /**
     * @param string $model
     * @param string|Rsc_Mvc_Module $module
     * @return SupsysticTables_Core_BaseModel
     */
    public function get($model, $module = null)
    {
        $className = $this->getClassName($model, $module);

        try {
            if (!array_key_exists($className, $this->models)) {
                $this->models[$className] = $this->factory($model, $module);
            }
        } catch (InvalidArgumentException $e) {
            throw $e;
        }

        return $this->models[$className];
    }

    /**
     * Builds the model name.
     * @param string $model
     * @param string|Rsc_Mvc_Module $module
     * @param string $prefix
     * @return string
     */
    protected function getClassName($model, $module, $prefix = null)
    {
        if (null === $prefix) {
            $prefix = $this->environment->getConfig()->get('plugin_prefix');
        }

        if (!$module) {
            $module = $model;
        }

        if ($module instanceof Rsc_Mvc_Module) {
            $e = explode('_', get_class($module));
            $prefix = array_shift($e);
            $module = $module->getModuleName();
        }

        $className = $prefix . '_' . ucfirst($module) . '_Model_' . ucfirst($model);

        return $className;
    }
}