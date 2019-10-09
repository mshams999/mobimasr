<?php
if( !class_exists('Magee_Weather') ):
class Magee_Weather {
    
	
	public static $args;
	private $id;
    
	/**
	 * Initiate the shortcode
	 */
    public function __construct() {
	 
	    add_shortcode( 'ms_weather', array( $this,'render' ) );
	
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
			    'class'			 	=> '',
				'id'				=> '',
				'background_color'	=> '',
				'background_img'	=> '',
				'width'				=> '',
				'height'			=> '',
				'api_key'           => '',
				'location'          => '',
				'units'             => '',
				'weather_detail'    => '',
				'forecast'          => '',
				'forecast_cnt'      => 4,
			 ),$args
	     );
		extract( $defaults );
		self::$args = $defaults; 
		if(is_numeric($width)) 
		$width = $width.'px';
		if(is_numeric($height))
		$height = $height.'px';
		$uniqid = uniqid('weather-');
		$class .= ' '.$uniqid;
		$api_query = '';
		if(is_numeric($location)){
		  $api_query					= "id=" . urlencode($location);
		  }else{
		  $api_query					= "q=" . urlencode($location);
		}
		$now_ping = "http://api.openweathermap.org/data/2.5/weather?" . $api_query . "&units=" . esc_attr($units) ."&APPID=".esc_attr($api_key);
		$now_ping_get = wp_remote_get( $now_ping);
		// PING URL ERROR
		if( is_wp_error( $now_ping_get ) ) return $now_ping_get->get_error_message();
		
		// GET BODY OF REQUEST
		$city_data = json_decode( $now_ping_get['body'] );
		if( isset($city_data->cod) AND $city_data->cod !== 200){
		  return $city_data->message; 
		}
		
		$data_main = '';
		$wi_class = '';
	    if(isset($city_data->weather)){
		$data_main = $city_data->weather[0]->main;
		$data_icon = $city_data->weather[0]->icon;
		switch($data_icon){
			case '01d':
			$wi_class = 'wi-day-sunny';
			break;
			case '01n':
			$wi_class = 'wi-night-clear';
			break;
			case '02d':
			$wi_class = 'wi-day-cloudy';
			break;
			case '02n':
			$wi_class = 'wi-night-alt-cloudy';
			break;
			case '03d':
			$wi_class = 'wi-day-cloudy-gusts';
			break;
			case '03n':
			$wi_class = 'wi-night-alt-cloudy-gusts';
			break;
			case '04d':
			$wi_class = 'wi-day-cloudy-windy';
			break;
			case '04n':
			$wi_class = 'wi-night-alt-cloudy-windy';
			break;
			case '09d':
			$wi_class = 'wi-day-showers';
			break;
			case '09n':
			$wi_class = 'wi-night-alt-showers';
			break;
			case '10d':
			$wi_class = 'wi-day-rain';
			break;
			case '10n':
			$wi_class = 'wi-night-alt-rain';
			break;
			case '11d':
			$wi_class = 'wi-day-thunderstorm';
			break;
			case '11n':
			$wi_class = 'wi-night-alt-thunderstorm';
			break;
			case '13d':
			$wi_class = 'wi-day-snow';
			break;
			case '13n':
			$wi_class = 'wi-night-alt-snow';
			break;
			case '50d':
			$wi_class = 'wi-day-fog';
			break;
			case '50n':
			$wi_class = 'wi-night-fog';
			break;
			}
		} 
		$html = '<style type="text/css">
		.'.$uniqid.'{
		background-color:'.$background_color.';
		background-image:url('.esc_url($background_img).');
		width:'.$width.';
		height:'.$height.';
		}
		</style>';
		$html .= '<div class="magee-wheather-box '.$class.'" id="'.$id.'">
				  <div class="magee-wheather simple">';
		if(isset($city_data->name))
		$html .= '<h2>'.$city_data->name.'</h2>';
				  
		$html .='	<div class="w-today">
					  <div class="w-icon-wrap">
						<i class="wi '.$wi_class.'"></i>
						<p class="w-text">'.$data_main.'</p>
					  </div>';
		if(isset($city_data->main)):		
		switch($units){
		case 'metric':
		$html .= '<p class="w-temp">'.round($city_data->main->temp).'<sup>°C</sup></p>';
		break;	
		case 'imperial':
		$html .= '<p class="w-temp">'.round($city_data->main->temp).'<sup>°F</sup></p>';
		break;
		}	  
		endif;	
		if($weather_detail == 'yes'):
		$days = array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday');
		$today = $days[date('w')];
		$sunrise = '';
		$sunset = '';
		$temp_max = '';
		$temp_min = '';
		$humidity = '';
		$pressure = '';
		$wind     = '';
		if(isset($city_data->sys)){
		 $sunrise = date('H:i',$city_data->sys->sunrise);
		 $sunset  = (date('H',$city_data->sys->sunset)-12).':'.date('i',$city_data->sys->sunset);
		 }
		 //current temp
		$ping_temp  = "http://api.openweathermap.org/data/2.5/forecast/daily?".$api_query . "&units=" . esc_attr($units) ."&APPID=".esc_attr($api_key)."&cnt=1";
		$temp_ping_get = wp_remote_get($ping_temp);
		$temp_data = json_decode( $temp_ping_get['body'] );
		
		if(isset($temp_data->list)){
		 switch($units){
			case 'metric':
			$temp_max =  round($temp_data->list[0]->temp->max).'<sup>°C</sup>';
		    $temp_min =  round($temp_data->list[0]->temp->min).'<sup>°C</sup>';
			break;	
			case 'imperial':
			$temp_max =  round($temp_data->list[0]->temp->max).'<sup>°F</sup>';
		    $temp_min =  round($temp_data->list[0]->temp->min).'<sup>°F</sup>';
			break;
			}	  
		$humidity = $city_data->main->humidity;
		$pressure = $city_data->main->pressure.' hpa';
		} 
		if(isset($city_data->wind)){
		 switch($units){
			case 'metric':
			$wind = $city_data->wind->speed.'m/s';
			break;	
			case 'imperial':
			$wind = $city_data->wind->speed.'mph';
			break;
			}	
		}
		$html .= '<div class="w-detail">
        <p class="w-day">'.$today.'</p>
        <ul class="astronomy">
          <li><i class="wi wi-sunrise"></i> '.$sunrise.' AM</li>
          <li><i class="wi wi-sunset"></i> '.$sunset.' PM</li>
        </ul>
        <ul class="temp">
          <li>Max : '.$temp_max.'</li>
          <li>Min : '.$temp_min.'</li>
        </ul>
        <ul class="atmosphere">
          <li><i class="wi wi-humidity"></i> '.$humidity.'</li>
          <li><i class="wi wi-cloud-up"></i> '.$pressure.'</li>
          <li><i class="wi wi-strong-wind"></i> '.$wind.'</li>
        </ul>
      </div>';
		endif;
		$html .= '			</div>';
		if($forecast == 'yes'):
		$forecast_url  = "http://api.openweathermap.org/data/2.5/forecast/daily?".$api_query . "&units=" . esc_attr($units) ."&APPID=".esc_attr($api_key)."&cnt=".$forecast_cnt;
		$forecast_ping_get = wp_remote_get($forecast_url);
		if( is_wp_error( $forecast_ping_get ) ) 
		{
			return $forecast_ping_get->get_error_message(); 
		}	
		
		$forecast_data = json_decode( $forecast_ping_get['body'] );
		
		if( isset($forecast_data->cod) && $forecast_data->cod !== '200'){
			return $forecast_data->message; 
		}
		$html .= '<table class="w-forecasts">
                    <tbody>';
		$item = '';	
		$forcastday = '';
		$forcast_wi_class = '';
		$forcaset_max = '';
		$forcaset_min = '';					
		for($i=1;$i<$forecast_cnt;$i++){
		   if(isset($forecast_data->list)){
		   $days = array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday');
		   $time = $forecast_data->list;
		   $forcastday = $days[date('w',$time[$i]->dt)];   
		   $forcast_icon = $time[$i]->weather[0]->icon;
		   switch( $forcast_icon){
			case '01d':
			$forcast_wi_class = 'wi-day-sunny';
			break;
			case '01n':
			$forcast_wi_class = 'wi-night-clear';
			break;
			case '02d':
			$forcast_wi_class = 'wi-day-cloudy';
			break;
			case '02n':
			$forcast_wi_class = 'wi-night-alt-cloudy';
			break;
			case '03d':
			$forcast_wi_class = 'wi-day-cloudy-gusts';
			break;
			case '03n':
			$forcast_wi_class = 'wi-night-alt-cloudy-gusts';
			break;
			case '04d':
			$forcast_wi_class = 'wi-day-cloudy-windy';
			break;
			case '04n':
			$forcast_wi_class = 'wi-night-alt-cloudy-windy';
			break;
			case '09d':
			$forcast_wi_class = 'wi-day-showers';
			break;
			case '09n':
			$forcast_wi_class = 'wi-night-alt-showers';
			break;
			case '10d':
			$forcast_wi_class = 'wi-day-rain';
			break;
			case '10n':
			$forcast_wi_class = 'wi-night-alt-rain';
			break;
			case '11d':
			$forcast_wi_class = 'wi-day-thunderstorm';
			break;
			case '11n':
			$forcast_wi_class = 'wi-night-alt-thunderstorm';
			break;
			case '13d':
			$forcast_wi_class = 'wi-day-snow';
			break;
			case '13n':
			$forcast_wi_class = 'wi-night-alt-snow';
			break;
			case '50d':
			$forcast_wi_class = 'wi-day-fog';
			break;
			case '50n':
			$forcast_wi_class = 'wi-night-fog';
			break;
			}
		   if(isset($time[$i]->temp)){ 
			   switch($units){
				case 'metric':
				$forcaset_max =  round($time[$i]->temp->max).'<sup>°C</sup>';
				$forcaset_min =  round($time[$i]->temp->min).'<sup>°C</sup>';
				break;	
				case 'imperial':
				$forcaset_max =  round($time[$i]->temp->max).'<sup>°F</sup>';
				$forcaset_min =  round($time[$i]->temp->min).'<sup>°F</sup>';
				break;
				}	
			}	   	
		   }
		$item .= '<tr class="w-day">
          <td>'.$forcastday.'</td>
          <td><i class="wi '.$forcast_wi_class.'"></i></td>
          <td class="w-max">'.$forcaset_max.'</td>
          <td class="w-min">'.$forcaset_min.'</td>
        </tr>'  ; 
		}
		$html .= $item ;
		$html .= '</tbody>
    </table>';	
		endif; 
		$html .= '		  </div>
				</div>
			';
		return $html;
 } 
	 
}
new Magee_Weather();	
endif;	 		 