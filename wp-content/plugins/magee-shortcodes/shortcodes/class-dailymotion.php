<?php
if( !class_exists('Magee_Dailymotion') ):
class Magee_Dailymotion {
    
	
	public static $args;
	private $id;
    
	/**
	 * Initiate the shortcode
	 */
    public function __construct() {
	 
	    add_shortcode( 'ms_dailymotion', array( $this,'render' ) );
	
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
				 'width'                 =>'',
				 'height'                =>'',
				 'mute'                  =>'',
				 'link'                  =>'',
				 'autoplay'              =>'',
				 'loop'                  =>'',    
				 'controls'              =>'',  
			 ),$args
	     );
	    
		 extract( $defaults );
		 self::$args = $defaults;
		 if(is_numeric($width))
			$width = $width.'px';
		 if(is_numeric($height))
			$height = $height.'px'; 
		 if( $autoplay == 'yes'):
		    $autoplay = '1';
		 else:
		    $autoplay = '0';
	     endif;
		 if( $loop == 'yes'):
		    $loop = '1';
		 else:
		    $loop = '0';
	     endif;
		 if( $controls == 'yes'):
		    $controls = '1';
		 else:
		    $controls = '0';
	     endif;
		 if( $mute == 'yes'):
		    $mute = '1';
		 else:	 
		    $mute = '0';
		 endif; 
		 if( $link !== '') 
		 $link = strtok(basename(esc_url($link)),'_');
		 if( $width == '100%' || $width == '' &&  $height == '100%' || $height == ''):
		 $html = '<div id="dailymotion" class="magee-dailymotion" data-width="'.$width.'" data-height="'.$height.'"><iframe id="'.esc_attr($id).'" class="'.esc_attr($class).'" src="//www.dailymotion.com/embed/video/' . $link . '?autoplay='.$autoplay.'&loop='.$loop.'&controls='.$controls.'&mute='.$mute.'" frameborder="0" allowfullscreen></iframe></div>';
		 
		else:
		$html = '<div id="dailymotion" class="magee-dailymotion" data-width="'.$width.'" data-height="'.$height.'"><iframe id="'.esc_attr($id).'" class="'.esc_attr($class).'" width="'.$width.'" height="'.$height.'" src="//www.dailymotion.com/embed/video/' . $link . '?autoplay='.$autoplay.'&loop='.$loop.'&controls='.$controls.'&mute='.$mute.'" frameborder="0" allowfullscreen></iframe></div>';
		endif;		   
		 return $html;
	 } 
	 
}

new Magee_Dailymotion();		
endif; 