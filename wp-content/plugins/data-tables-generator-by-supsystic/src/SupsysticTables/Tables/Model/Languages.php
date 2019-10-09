<?php


class SupsysticTables_Tables_Model_Languages extends SupsysticTables_Core_BaseModel
{
	private $_langData = array();

	/**
	 * Returns an associative array of DataTables translation.
	 * The array keys is language name in browser.
	 * The array values is name of language for connecting of language data.
	 * @return array
	 */
    public function getDefaultLanguages()
    {
        return array(
            'default' => 'default',
            'browser' => 'browser',
			'af' => 'Afrikaans',
			'sq' => 'Albanian',
			'Amharic',
			'ar' => 'Arabic',
			'hy' => 'Armenian',
			'az' => 'Azerbaijan',
			'bn' => 'Bangla',
			'eu' => 'Basque',
			'be' => 'Belarusian',
			'bg' => 'Bulgarian',
			'ca' => 'Catalan',
			'zh-TW' => 'Chinese-traditional',
			'zh' => 'Chinese',
			'hr' => 'Croatian',
			'cs' => 'Czech',
			'da' => 'Danish',
			'nl' => 'Dutch',
            //'English', // it is default language
			'et' => 'Estonian',
			'fil' => 'Filipino',
			'fi' => 'Finnish',
			'fr' => 'French',
			'gl' => 'Galician',
			'ka' => 'Georgian',
			'de' => 'German',
			'el' => 'Greek',
			'gu' => 'Gujarati',
			'he' => 'Hebrew',
			'hi' => 'Hindi',
			'hu' => 'Hungarian',
			'is' => 'Icelandic',
			'Indonesian-Alternative',
			'id' => 'Indonesian',
			'ga' => 'Irish',
			'it' => 'Italian',
			'ja' => 'Japanese',
			'kk'=> 'Kazakh',
			'ko' => 'Korean',
			'ky' => 'Kyrgyz',
			'lv' => 'Latvian',
			'lt' => 'Lithuanian',
			'mk' => 'Macedonian',
			'ms' => 'Malay',
			'mn' => 'Mongolian',
			'ne' => 'Nepali',
			'nb' => 'Norwegian-Bokmal',
			'nn' => 'Norwegian-Nynorsk',
			'ps' => 'Pashto',
			'fa' => 'Persian',
			'pl' => 'Polish',
			'pt-BR' => 'Portuguese-Brasil',
			'pt' => 'Portuguese',
			'ro' => 'Romanian',
			'ru' => 'Russian',
			'sr' => 'Serbian',
			'si' => 'Sinhala',
			'sk' => 'Slovak',
			'sl' => 'Slovenian',
			'es' => 'Spanish',
			'sw' => 'Swahili',
			'sv' => 'Swedish',
			'ta' => 'Tamil',
			'te' => 'telugu',
			'te-IN' => 'telugu',
			'th' => 'Thai',
			'tr' => 'Turkish',
			'uk' => 'Ukrainian',
			'ur' => 'Urdu',
			'uz' => 'Uzbek',
			'vi' => 'Vietnamese',
			'cy' => 'Welsh',
        );
    }

    /**
     * Returns an array of the current languages at the official DataTable repo.
     * @return array|null
     */
    public function downloadLanguages()
    {
        $url = 'https://api.github.com/repos/DataTables/Plugins/contents/i18n';
        $languages = array();
        $response = wp_remote_get($url);

        if (is_wp_error($response)) {
            return null;
        }
        if (200 !== wp_remote_retrieve_response_code($response)) {
            return null;
        }
        $files = json_decode($response['body']);

        if (!is_array($files)) {
            return null;
        }
        foreach ($files as $file) {
            $languages[] = str_replace('.lang', '', $file->name);
        }

        return $languages;
    }

    /**
     * Tries to download full list of the languages from the official repo or
     * returns the default languages list of download failed.
     * @return array
     */
    public function getLanguages()
    {
        $languages = $this->downloadLanguages();

        if (null === $languages) {
            $languages = $this->getDefaultLanguages();
        }

        return $languages;
    }

	/**
	 * Returns the list of translation data for all available languages.
	 * @return array|mixed
	 */
	public function getLanguagesData()
	{
		if(empty($this->_langData)) {
			$this->_langData = include_once $this->environment->getModule('tables')->getLocation() . '/assets/languagesData.php';
		}
		return $this->_langData;
	}

	/**
	 * Returns the names list of languages, available for translation.
	 * @return array
	 */
	public function getTranslations()
	{
		return array_unique(array_values($this->getDefaultLanguages()));
	}
}