<?php
if( !class_exists('Magee_Piechart') ):
class Magee_Piechart {

	public static $args;
    private  $id;

	/**
	 * Initiate the shortcode
	 */
	public function __construct() {

        add_shortcode( 'ms_piechart', array( $this, 'render' ) );
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
				'class' =>'',
				'percent' => '80',
				'line_cap' => '',
				'filledcolor'=>'#fdd200',
				'unfilledcolor'=>'#f5f5f5',
				'size' =>'200',
				'font_size' =>'40px'
			), $args
		);
		
		extract( $defaults );
		self::$args = $defaults;
		$chartID = uniqid('chart-');
		$uniq_class   = $chartID;
		$class       .= ' '.$uniq_class;
		$size         = str_replace('px','',absint($size));
		$html = '<style>.'.$uniq_class.' .chart-title{line-height: '.$size.'px;font-size:'.esc_attr($font_size).';}.'.$uniq_class.'{height:'.$size.'px;width:'.$size.'px;}</style>';
		$html .= '<div class="chart magee-chart-box '.esc_attr($class).'" data-percent="'.esc_attr($percent).'" id="'.$chartID.'" data-barcolor="'.esc_attr($filledcolor).'" data-trackcolor="'.esc_attr($unfilledcolor).'" data-size="'.absint($size).'" data-linecap="'.esc_attr($line_cap).'">
                                                <div class="chart-title">'.do_shortcode( Magee_Core::fix_shortcodes($content)).'</div>
                                            </div>';
	
		return $html;
	} 
	
}

new Magee_Piechart();
endif;