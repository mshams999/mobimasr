<?php
if( !class_exists('Magee_Chart_Doughnut') ):
class Magee_Chart_Doughnut {

	public static $args;
    private  $id;
	/**
	 * Initiate the shortcode
	 */
	public function __construct() {

        add_shortcode( 'ms_chart_doughnut', array( $this, 'render_parent' ) );
		add_shortcode( 'ms_doughnut', array( $this, 'render_child' ) );
	}

	/**
	 * Render the shortcode
	 * @param  array $args     Shortcode paramters
	 * @param  string $content Content between shortcode
	 * @return string          HTML output
	 */
	function render_parent( $args, $content = '') {

		$defaults =	Magee_Core::set_shortcode_defaults(
			array(
			    'width'                => '',
				'height'               => '',
			    'class'                => '',
				'id'                   => '',
			), $args
		);
		
		extract( $defaults );
		self::$args = $defaults;
		$uniqid = uniqid('doughnut-');
		$this->id = $id.$uniqid;
		
		$html = '<canvas id="'.esc_attr($this->id).'" width="'.esc_attr($width).'" height="'.esc_attr($height).'" class="'.esc_attr($class).'"></canvas>
		<script>
		if(document.getElementById(\'magee-sc-form-preview\')){
		var buyers = document.getElementById(\'magee-sc-form-preview\').contentWindow.document.getElementById("'.$this->id.'").getContext(\'2d\');
		}else{
		var buyers = document.getElementById("'.$this->id.'").getContext(\'2d\');
		}
		var doughnutData = [
		'.do_shortcode(Magee_Core::fix_shortcodes($content)).'
	    ];
		var doughnutOptions = {
			segmentShowStroke : false,
			animateScale : true
		}
		new Chart(buyers).Doughnut(doughnutData,doughnutOptions);
		</script>';
		
		return $html;
	}
	
	/**
	 * Render the child shortcode
	 * @param  array $args     Shortcode paramters
	 * @param  string $content Content between shortcode
	 * @return string          HTML output
	 */
	 function render_child( $args, $content = '') {
		
		$defaults =	Magee_Core::set_shortcode_defaults(
			array(
				'value' =>'',
				'color' =>'',
			), $args
		);
		
		extract( $defaults );
		self::$args = $defaults;
			
		$html = '{
				value: '.esc_attr($value).',
				color : "'.esc_attr($color).'",
			    },';
		return $html;
	 }	
}		

new Magee_Chart_Doughnut();
endif;