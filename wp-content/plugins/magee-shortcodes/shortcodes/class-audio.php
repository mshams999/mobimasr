<?php
if( !class_exists('Magee_Audio') ):
class Magee_Audio {
    
	
	public static $args;
	private $id;
    
	/**
	 * Initiate the shortcode
	 */
    public function __construct() {
	 
	    add_shortcode( 'ms_audio', array( $this,'render' ) );
	
	}
	/**
	 * Render the shortcode
	 * @param  array $args     Shortcode paramters
	 * @param  string $content Content between shortcode
	 * @return string          HTML output
	 */
     function render( $args, $content = '') {
	     
		 $defaults =  Magee_Core::set_shortcode_defaults(
		     
			 array(
			     'id'                    =>'',
				 'class'                 =>'',
				 'mute'                  =>'',
				 'mp3'                   =>'',
				 'ogg'                   =>'',
				 'wav'                   =>'',
				 'autoplay'              =>'',
				 'loop'                  =>'',    
				 'controls'              =>'', 
				 'style'                 =>'dark',
			 ),$args
	     );
	     
		 extract( $defaults );
		 self::$args = $defaults;
		 $addclass = uniqid('audiocontrols-');
		 $class .= ' '.$addclass;
		 if( $mute =='yes'):
		 $mute = 'mute';
		 else:
		 $mute = '';
		 endif;
		 if( $autoplay == 'yes'):
		 $autoplay = 'autoplay';
		 else:
		 $autoplay = '';
		 endif;
		 if( $loop == 'yes'):
		 $loop = 'loop';
		 else:
		 $loop = '';
		 endif;
		 if( $controls == 'yes'):
		 $controls = '';
		 else:
		 $controls = 'controls';
		 endif;
		 $html = '<audio preload="auto" class="ms-audio '.esc_attr($class).'" data-style="'.$style.'" data-controls="'.$controls.'"  id="'.esc_attr($id).'" data-mute="'.$mute.'" data-loop="'.$loop.'" data-autoplay="'.$autoplay.'" >';
		 if( !empty($mp3)){
		 $html .= '<source src="'.esc_url($mp3).'" type="audio/mpeg">';
		 }
		 if( !empty($ogg)){
		 $html .= '<source src="'.esc_url($ogg).'" type="audio/ogg">' ;
		 }
		 if( !empty($wav)){
		 $html .= '<source src="'.esc_url($ogg).'" type="audio/wav">' ;
		 }
		 $html .= 'Your browser does not support the audio element.' ;
		 $html .='</audio>'	 ;
		 return $html;
	 } 	 
}		 
new Magee_Audio();	
endif;	 