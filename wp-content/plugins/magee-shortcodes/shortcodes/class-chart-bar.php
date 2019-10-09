<?php
if( !class_exists('Magee_Chart_Bar') ):
class Magee_Chart_Bar {

	public static $args;
    private  $id;
	/**
	 * Initiate the shortcode
	 */
	public function __construct() {

        add_shortcode( 'ms_chart_bar', array( $this, 'render_parent' ) );
		add_shortcode( 'ms_bar', array( $this, 'render_child' ) );
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
				'label'                => '',
			), $args
		);
		
		extract( $defaults );
		self::$args = $defaults;
		$uniqid = uniqid('bar-');
		$this->id = $id.$uniqid;
		
		$html = '<canvas id="'.esc_attr($this->id).'" width="'.esc_attr($width).'" height="'.esc_attr($height).'" class="'.esc_attr($class).'"></canvas>
		<script>
		if(document.getElementById(\'magee-sc-form-preview\')){
		var buyers = document.getElementById(\'magee-sc-form-preview\').contentWindow.document.getElementById("'.$this->id.'").getContext(\'2d\');
		}else{
		var buyers = document.getElementById("'.$this->id.'").getContext(\'2d\');
		}
		var barData = {
		labels : ['.do_shortcode($label).'],
		datasets : ['.do_shortcode(Magee_Core::fix_shortcodes($content)).'
		]	
	    }
		new Chart(buyers).Bar(barData);
		
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
				'data' =>'',
				'fillcolor' =>'',
				'fillopacity' =>'',
				'strokecolor' =>'',
				'strokeopacity' => '',
			), $args
		);
		
		extract( $defaults );
		self::$args = $defaults;
		
        $fillcolor = str_replace('#','',$fillcolor);
		if(strlen($fillcolor) == 6 ):
		$r1 = hexdec(substr($fillcolor,0,2)) ;
		$g1 = hexdec(substr($fillcolor,2,2)) ;
		$b1 = hexdec(substr($fillcolor,4,2)) ;
		endif;
		$strokecolor = str_replace('#','',$strokecolor);
		if(strlen($strokecolor) == 6 ):
		$r2 = hexdec(substr($strokecolor,0,2)) ;
		$g2 = hexdec(substr($strokecolor,2,2)) ;
		$b2 = hexdec(substr($strokecolor,4,2)) ;
		endif;
		
		$html = '{
				fillColor : "rgba('.$r1.','.$g1.','.$b1.','.esc_attr($fillopacity).')",
				strokeColor : "rgba('.$r2.','.$g2.','.$b2.','.esc_attr($strokeopacity).')",
				data : ['.$data.'],
			    },';
		return $html;
	 }	
}		

new Magee_Chart_Bar();
endif;