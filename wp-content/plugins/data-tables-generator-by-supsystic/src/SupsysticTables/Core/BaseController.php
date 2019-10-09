<?php


abstract class SupsysticTables_Core_BaseController extends Rsc_Mvc_Controller
{
    /**
     * Returns an instance of the model.
     * @param string $model
     * @param $module
     * @return SupsysticTables_Core_BaseModel
     */
    public function getModel($model, $module = null)
    {
        return $this->getCoreModule()->getModelsFactory()->get($model, $module);
    }

    /**
     * Creates an instance of the model and returns it.
     * @param string $model
     * @param string|Rsc_Mvc_Module $module
     * @return SupsysticTables_Core_BaseModel
     */
    public function createModel($model, $module = null)
    {
        return $this->getCoreModule()->getModelsFactory()->factory($model, $module);
    }

    /**
     * Translates a string.
     * @param string $string String to translate
     * @return string
     */
    public function translate($string)
    {
        return $this->getEnvironment()->translate($string);
    }

    /**
     * Is ajax request?
     * @return bool
     */
    public function isAjax()
    {
        // $request->isXmlHttpRequest() has a bug and not working.
        // So do it with headers params
        $request = $this->getRequest();

        return $request->headers->has('X_REQUESTED_WITH') && $request->headers->get('X_REQUESTED_WITH') === 'XMLHttpRequest';
    }

    /**
     * Returns AJAX success response.
     * @param array $data
     * @return Rsc_Http_Response
     */
    public function ajaxSuccess(array $data = array())
    {
        return $this->response(
            Rsc_Http_Response::AJAX,
            array_merge($data, array('success' => true))
        );
    }

    /**
     * Returns AJAX error response.
     * @param string $message
     * @param array $data
     * @return Rsc_Http_Response
     */
    public function ajaxError(
        $message = 'Something went wrong.',
        array $data = array()
    ) {
        return $this->response(
            Rsc_Http_Response::AJAX,
            array_merge($data, array('success' => false, 'message' => $message))
        );
    }

    /**
     * Returns the core module
     * @returns SupsysticTables_Core_Module
     */
    private function getCoreModule()
    {
        return $this->getEnvironment()->getModule('core');
    }

}