<?php
/**
 * Plugin Name: Tada
 * Description: Prefetch the page a user is about to click on.
 * Author: Ben Gillbanks
 * Version: 1.1.1
 * Author URI: https://prothemedesign.com
 */

/**
 * Uses Instant.page - https://instant.page/
 * The script is licenced under MIT
 * The source code can be found on Github: https://github.com/instantpage/instant.page
 */

/**
 * Add the Instant Page script to the footer.
 */
function tada_enqueue_scripts() {

	wp_enqueue_script( 'tada-script', plugins_url( '/scripts/instantpage.min.js' , __FILE__ ), null, '1.2.2', true );
	wp_script_add_data( 'tada-script', 'script_execution', 'async' );

}

add_action( 'wp_enqueue_scripts', 'tada_enqueue_scripts' );


/**
 * Change the script type from text/javascript to module.
 *
 * The instant page script requires the type to be module but WordPress does not
 * allow an elegant way to do this. So we have to resort to checking every
 * script and only changing the ones we need.
 *
 * @param [string] $tag The script tag to check.
 * @param [string] $handle The script handle.
 * @param [string] $src The script source.
 * @return void
 */
function tada_script_type( $tag, $handle, $src ) {

	if ( 'tada-script' === $handle ) {
		$tag = str_replace( 'text/javascript', 'module', $tag );
	}

	return $tag;

}

add_filter( 'script_loader_tag', 'tada_script_type', 10, 3 );
