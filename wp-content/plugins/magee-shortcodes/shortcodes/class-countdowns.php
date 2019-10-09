<?php
if( !class_exists('Magee_Countdowns') ):
class Magee_Countdowns {

	public static $args;
	private $google_font;
    private  $id;

	/**
	 * Initiate the shortcode
	 */
	public function __construct() {
      
        add_shortcode( 'ms_countdowns', array( $this, 'render' ) );
		
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
				'id' =>'magee-countdowns',
				'class' =>'',
				'topicon' => '',
				'fontcolor' => '',
				'backgroundcolor' => '',
				'endtime' => date('Y-m-d H:i:s',strtotime(' 1 month')),
				'nowtime' => '',
				'type' => 'normal',
				'day_field_text' => __('Days','magee-shortcodes-pro' ),
				'hours_field_text' => __('Hours','magee-shortcodes-pro' ),
				'minutes_field_text' => __('Minutes','magee-shortcodes-pro' ),
				'seconds_field_text' => __('Seconds','magee-shortcodes-pro' ),
				'google_fonts' => '',
				'circle_type_day_color' => '',
				'circle_type_hours_color' => '',
				'circle_type_minutes_color' => '',
				'circle_type_seconds_color' => '',
			), $args
		);
		
		extract( $defaults );
		self::$args = $defaults;
		$countdownsID = uniqid('countdowns');
		$addclass = uniqid('countdown');
		$class .= ' '.$addclass;
		$css_style = '';
		$boxed = '';
		$html = '';
		switch($type){
			
		    case 'normal': 
			
			if( $backgroundcolor )
			$css_style .= '#'.$countdownsID.' .magee-counter-box{background-color:'.$backgroundcolor.';}';
			$boxed = 'boxed';
			if( $fontcolor)
			$css_style .= '#'.$countdownsID.' .magee-counter-box h3.counter-title{color:'.$fontcolor.'; }';
			$css_style .= '#'.$countdownsID.' .magee-counter-box{color:'.$fontcolor.';}';
			$html .= '<style type="text/css">'.$css_style.'</style>';
			
			$html .= '<div class="magee-countdown-wrap center-block '.esc_attr($class).'" id="'.esc_attr($id).'">
											<ul class="magee-countdown row" id="'.$countdownsID.'">
												<li class="col-sm-3">
												  <div class="magee-counter-box '.$boxed.'">
													<div class="counter days">
														<span class="counter-num"></span>
													</div>
													<h3 class="counter-title">
														'.__('Days','magee-shortcodes-pro' ).'
													</h3>
												  </div>
												</li>
												<li class="col-sm-3">
												  <div class="magee-counter-box '.$boxed.'">
													<div class="counter hours">
														<span class="counter-num"></span>
													</div>
													<h3 class="counter-title">
														'.__('Hours','magee-shortcodes-pro' ).'
													</h3>
												  </div>	
												</li>
												<li class="col-sm-3">
												 <div class="magee-counter-box '.$boxed.'">
													<div class="counter minutes">
														<span class="counter-num"></span>
													</div>
													<h3 class="counter-title">
														'.__('Minutes','magee-shortcodes-pro' ).'
													</h3>
												  </div>	
												</li>
												<li class="col-sm-3">
												  <div class="magee-counter-box '.$boxed.'">
													<div class="counter seconds">
														<span class="counter-num"></span>
													</div>
													<h3 class="counter-title">
														'.__('Seconds','magee-shortcodes-pro' ).'
													</h3>
												  </div>	
												</li>
											</ul>
										</div>';
			$html .= '<script language="javascript">';
			$html .= 'jQuery(function($) {';
			$html .= 'if($("#magee-sc-form-preview").length>0){';
			$html .= '$("#magee-sc-form-preview").ready(function(){
			$("#magee-sc-form-preview").contents().find("#'.$countdownsID.'").countdown("'.$endtime.'", function(event) {
					$("#magee-sc-form-preview").contents().find("#'.$countdownsID.' .days .counter-num").text(
						event.strftime("%D")
					);
					$("#magee-sc-form-preview").contents().find("#'.$countdownsID.' .hours .counter-num").text(
						event.strftime("%H")
					);
					$("#magee-sc-form-preview").contents().find("#'.$countdownsID.' .minutes .counter-num").text(
						event.strftime("%M")
					);
					$("#magee-sc-form-preview").contents().find("#'.$countdownsID.' .seconds .counter-num").text(
						event.strftime("%S")
					);
				});
				});}else{';
			$html .= '$(document).ready(function(){
					$("#'.$countdownsID.'").countdown("'.$endtime.'", function(event) {
					$("#'.$countdownsID.' .days .counter-num").text(
						event.strftime("%D")
					);
					$("#'.$countdownsID.' .hours .counter-num").text(
						event.strftime("%H")
					);
					$("#'.$countdownsID.' .minutes .counter-num").text(
						event.strftime("%M")
					);
					$("#'.$countdownsID.' .seconds .counter-num").text(
						event.strftime("%S")
					);
				});
				
					});}';
			$html .= '})';		
			$html .= '</script>';
			
			break;
			case 'circle':
			$google_url = '';
			if($google_fonts !== ''){
				$google_url = str_replace(', ','|',$google_fonts );
				$google_url = esc_url('//fonts.googleapis.com/css?family=' .$google_url) ;	
				$google_id = uniqid('wpd_google-fonts-');
				wp_enqueue_style($google_id, $google_url, false, '', false );	
			}
			$class .=' '.$countdownsID;
			if( $backgroundcolor ):
			$css_style .= '.'.$addclass.'{background-color:'.$backgroundcolor.';}';
			$html .= '<style type="text/css">'.$css_style.'</style>';
			endif;
			$html .= '<div class="magee-countdown-wrap magee-countdown-circle-type '.esc_attr($class).'" data-google_font_url="'.$google_url.'" id="'.esc_attr($id).'" data-fontcolor="'.esc_attr($fontcolor).'" data-endtime="'.strtotime(esc_attr($endtime)).'" data-nowtime="'.esc_attr($nowtime).'" data-day_field_text="'.esc_attr($day_field_text).'" data-hours_field_text="'.esc_attr($hours_field_text).'" data-minutes_field_text="'.esc_attr($minutes_field_text).'" data-seconds_field_text="'.esc_attr($seconds_field_text).'" data-google_fonts="'.esc_attr($google_fonts).'" data-google_url="'.$google_url.'" data-circle_type_day_color="'.esc_attr($circle_type_day_color).'" data-circle_type_hours_color="'.esc_attr($circle_type_hours_color).'" data-circle_type_minutes_color="'.esc_attr($circle_type_minutes_color).'" data-circle_type_seconds_color="'.esc_attr($circle_type_seconds_color).'"></div>';
			break;
			}
		return $html;
	} 
	
				
	
}

new Magee_Countdowns();
endif;