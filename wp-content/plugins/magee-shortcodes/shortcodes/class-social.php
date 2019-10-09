<?php
if( !class_exists('Magee_Social') ):
class Magee_Social {

	public static $args;
    private  $id;

	/**
	 * Initiate the shortcode
	 */
	public function __construct() {

        add_shortcode( 'ms_social', array( $this, 'render' ) );
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
				'id' 					=>'magee-social',
				'class' 				=>'',
				'icon_size'				=>'',
				'effect_3d'				=>'no',
				'title'					=>'',
				'icon'					=>'',
				'iconlink'				=>'#',
				'icontarget'            =>'',
				'iconcolor'				=>'#A0A0A0',
				'backgroundcolor'		=>'transparent',
				'iconboxedradius'		=>'',
			), $args
		);
		
		extract( $defaults );
		self::$args = $defaults;
		if(is_numeric($icon_size))
		$icon_size = $icon_size.'px';
		
		$uniqid = uniqid('social-');
		$this->id = $id.$uniqid;

		$uqid =  uniqid('tab');
		$sty3d='';
		$textstyle = sprintf(' .%s_social_icon_acolor{ color: %s !important ; background-color: %s !important; font-size: %s; }',
			$uqid,$iconcolor,$backgroundcolor,$icon_size);
		$styles = sprintf( '<style type="text/css" scoped="scoped">%s </style>', $textstyle);
		
		if ( $effect_3d=='yes')
		{
			$sty3d .=' icon-3d';
		}	
		
		switch($iconboxedradius)
		{
			case 'normal':

				break;					
			case 'boxed':
					$sty3d .=' icon-boxed';
				break;
			case 'rounded':
					$sty3d .=' icon-boxed rounded';
				break;
			case 'circle':
					$sty3d .=' icon-boxed circle';
				break;
		}
		
		if( stristr($icon,'fa-')):	
		$html=sprintf(' %s <a href="%s" target="%s" Id="%s" class="fa %s magee-icon  %s %s %s_social_icon_acolor" data-toggle="tooltip" data-placement="top" title="" data-original-title="%s"></a>',
			$styles,$iconlink,$icontarget,$id,$icon,$sty3d,$class,$uqid,$title);
		else:
		$html=sprintf(' %s <a href="%s" target="%s" Id="%s" class="fa magee-icon  %s %s %s_social_icon_acolor" data-toggle="tooltip" data-placement="top" title="" data-original-title="%s"><img src="%s" class="image_instead"/></a>',$styles,$iconlink,$icontarget,$id,$sty3d,$class,$uqid,$title,$icon);
			
		endif;
		return $html;
	}
	
}

new Magee_Social();
endif;