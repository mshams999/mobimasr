<?php

/**
 * Class SupsysticTables_ContactForm_Module
 * interaction with Contact Form by Supsystic plugin
 */
class SupsysticTables_ContactForm_Module extends SupsysticTables_Core_BaseModule
{
	/**
	 * @var string
	 */
	private $frameClass;

	/**
	 * {@inheritdoc}
	 */
	public function onInit()
	{
		parent::onInit();
		$this->frameClass = 'frameCfs';

	}

	/**
	 * @return bool
	 */
	public function isInstalled()
	{
		return class_exists($this->frameClass, false);
	}

	/**
	 * Call method from the Contact Forms frame class.
	 * @param string $method Method name.
	 * @param array $arguments An array of the arguments.
	 * @throws BadMethodCallException
	 * @return mixed
	 */
	public function call($method, $arguments = null)
	{
		if (!method_exists($this->getInstance(), $method)) {
			throw new BadMethodCallException(
				sprintf(
					$this->getEnvironment()->translate(
						'Call to undefined method %1$s for %2$s.'
					),
					$method,
					$this->frameClass
				)
			);
		}

		return call_user_func_array(
			array($this->getInstance(), $method),
			$arguments
		);
	}

	/**
	 * Returns forms module from the Contact Forms by Supsystic.
	 * @return formsCfs
	 */
	public function getModule()
	{
		return $this->findModule('forms');
	}

	/**
	 * Find and returns Contact Forms module.
	 * @param string $name Module name
	 * @return modulePps
	 */
	public function findModule($name)
	{
		return $this->call('getModule', array($name));
	}

	/**
	 * Returns forms model from the Contact Forms by Supsystic.
	 * @return formsModelCfs
	 */
	public function getModel()
	{
		return $this->getModule()->getModel();
	}

	/**
	 * Returns FrameClass.
	 * @return string
	 */
	public function getFrameClass()
	{
		return $this->frameClass;
	}

	/**
	 * Sets FrameClass.
	 * @param string $frameClass
	 */
	public function setFrameClass($frameClass)
	{
		$this->frameClass = $frameClass;
	}


	protected function getInstance()
	{
		if (!$this->isInstalled()) {
			throw new RuntimeException(
				'Failed to get Contact Forms by Supsystic instance. Plugin not activated.'
			);
		}

		return call_user_func_array(array($this->frameClass, '_'), array());
	}
}