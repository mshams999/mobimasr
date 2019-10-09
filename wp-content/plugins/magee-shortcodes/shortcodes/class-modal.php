<?php
if( !class_exists('Magee_Modal') ):
class Magee_Modal {

	public static $args;
    private  $id;
	private  $modal_anchor_text;
	private  $modal_content;

	/**
	 * Initiate the shortcode
	 */
	public function __construct() {

        add_shortcode( 'ms_modal', array( $this, 'render' ) );
		add_shortcode( 'ms_modal_anchor_text', array( $this, 'render_modal_anchor_text' ) );
		add_shortcode( 'ms_modal_content', array( $this, 'render_modal_content' ) );
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
				'effect'                =>'',	
				'title' 				=>'',
				'title_color' 			=>'',
				'heading_background' 	=>'',
				'background' 			=>'',
				'color' 				=>'',
				'width' 				=>'',
				'height' 				=>'',
				'overlay_color' 		=>'#000000',
				'overlay_opacity' 		=>'0.3',
				'close_icon'            =>'yes',
			), $args
		);
		
		extract( $defaults );
		self::$args = $defaults;
		$uniqid = uniqid('modal-');
		$this->id = $id.$uniqid;
        if(isset($width) && is_numeric($width))
		$width = $width.'px';
		if(isset($height) && is_numeric($height))
		$height = $height.'px';
		 
		$html = '';
		$html .='<style type="text/css">';
		if(isset($title_color) && $title_color !== '')
		$html .='#'.$uniqid.' .magee-modal-title-wrapper h3{color:'.$title_color.'}';
		if(isset($heading_background) && $heading_background !== '')
		$html .='#'.$uniqid.' .magee-modal-title-wrapper{background:'.$heading_background.'}';
		if(isset($background) && $background !== '')
		$html .='#'.$uniqid.' .magee-modal-content-wrapper{background:'.$background.'}';
		if(isset($color) && $color !== '')
		$html .='#'.$uniqid.' .magee-modal-content-wrapper{color:'.$color.'}';
		if(isset($width) && $width !== '')
		$html .='#'.$uniqid.' .magee-modal-content-wrapper{width:'.$width.'}';
		if(isset($height) && $height !== '')
		$html .='#'.$uniqid.' .magee-modal-content-wrapper{height:'.$height.'}';
		if(isset($overlay_color) && $overlay_color !== '')
		$overlay_color = Magee_Core::hex2rgb($overlay_color);
		$html .='#'.$uniqid.' .magee-modal-overlay{background-color:rgba('.$overlay_color[0].','.$overlay_color[1].','.$overlay_color[2].','.$overlay_opacity.');}';
		
		$html .='</style>';
        do_shortcode( Magee_Core::fix_shortcodes($content));
		
		$html .= sprintf('<div id="%s" class="magee-modal-trigger %s" data-id="%s" data-title="%s" data-content="%s" data-effect="%s" data-close_icon="%s">%s</div>',$id,$class,$uniqid,$title,base64_encode(do_shortcode( Magee_Core::fix_shortcodes($this->modal_content))), $effect,$close_icon,do_shortcode( Magee_Core::fix_shortcodes($this->modal_anchor_text)));
		
		return $html;
	}
	
	/**
	 * Render the child shortcode
	 * @param  array $args     Shortcode paramters
	 * @param  string $content Content between shortcode
	 * @return string          HTML output
	 */
		function render_modal_anchor_text( $args, $content = '') {
		
		$defaults =	Magee_Core::set_shortcode_defaults(
			array(
			), $args
		);

		extract( $defaults );
		self::$args = $defaults;
						 
		$this->modal_anchor_text = do_shortcode( Magee_Core::fix_shortcodes($content));
		 
	}
	
	/**
	 * Render the child shortcode
	 * @param  array $args     Shortcode paramters
	 * @param  string $content Content between shortcode
	 * @return string          HTML output
	 */
		function render_modal_content( $args, $content = '') {
		
		$defaults =	Magee_Core::set_shortcode_defaults(
			array(
			), $args
		);

		extract( $defaults );
		self::$args = $defaults;
						 
		$this->modal_content = do_shortcode( Magee_Core::fix_shortcodes($content));
	
	}
	
}

new Magee_Modal();
endif;