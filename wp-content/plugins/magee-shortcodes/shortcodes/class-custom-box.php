<?php
if( !class_exists('Magee_Custom_Box') ):
class Magee_Custom_Box {

	public static $args;
    private  $id;

	/**
	 * Initiate the shortcode
	 */
	public function __construct() {

        add_shortcode( 'ms_custom_box', array( $this, 'render' ) );
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
				'fixed_background'      =>'', 
				'background_position'   =>'', 
				'padding' 				=>'',
				'backgroundimage' 		=>'',
			), $args
		);
		
		extract( $defaults );
		self::$args = $defaults;
		if(is_numeric($padding))
		$padding = $padding.'px'; 
		if($fixed_background == 'yes'):
		$fixed_background = 'fixed';
		else:
		$fixed_background = '';
		endif;
		
		$uniqid = uniqid('custom_box-');

		$textstyle = sprintf(' .custom-box-1 {padding: %s; background-image: url(%s);background-attachment: %s;background-position: %s;} ',$padding,$backgroundimage,$fixed_background,$background_position);
		$styles = sprintf( '<style type="text/css" scoped="scoped">%s </style>', $textstyle);		
		$html = sprintf(' %s<div class="custom-box-1 %s" id="%s">%s </div>',$styles,$class,$id,do_shortcode( Magee_Core::fix_shortcodes($content)));
  
		
		return $html;
	}
	
}

new Magee_Custom_Box();
endif;