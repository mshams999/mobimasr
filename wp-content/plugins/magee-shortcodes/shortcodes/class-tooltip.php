<?php
if( !class_exists('Magee_Tooltip') ):
class Magee_Tooltip {

	public static $args;
    private  $id;


	/**
	 * Initiate the shortcode
	 */
	public function __construct() {

        add_shortcode( 'ms_tooltip', array( $this, 'render' ) );
	}

	/**
	 * Render the shortcode
	 * @param  array $args     Shortcode paramters
	 * @param  string $content Content between shortcode
	 * @return string          HTML output
	 */
	function render( $args, $content = '') {

		$defaults =	Magee_Core::set_shortcode_defaults(
			array(
				'id' 					=>'',
				'class' 				=>'',
				'title'					=>'',	
				'background_color'      =>'',
				'border_radius'         =>'',
				'trigger'				=>'click',
				'placement'				=>'top',
			), $args
		);
		
		extract( $defaults );
		self::$args = $defaults;
        if(is_numeric($border_radius))
		$border_radius = $border_radius.'px';
		
        $addclass = uniqid("tooltip-");
		$class .= ' '.$addclass;
		$html = '';
		if($background_color !== '')
		$html .= '<style type="text/css">.'.$addclass.' + .tooltip > .tooltip-inner {background-color: '.$background_color.';border-radius:'.$border_radius.';}
.'.$addclass.' + .tooltip > .tooltip-arrow {border-'.$placement.'-color: '.$background_color.';}</style>';
		 
		
		$html .= sprintf('<span class="%s tooltip-text" id="%s" data-toggle="tooltip" data-trigger="%s" data-placement="%s" data-original-title="%s" >%s</span>',$class,$id,$trigger,$placement,$title,do_shortcode( Magee_Core::fix_shortcodes($content)));
       
		return $html;
	}
	
}

new Magee_Tooltip();
endif;