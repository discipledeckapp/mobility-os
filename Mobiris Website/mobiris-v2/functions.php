<?php
/**
 * Mobiris V2 — functions.php
 * Loads all theme modules in dependency order.
 *
 * @package MobirisV2
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'MV2_VERSION', '2.0.0' );
define( 'MV2_DIR',     get_template_directory() );
define( 'MV2_URI',     get_template_directory_uri() );
define( 'MV2_TEXT',    'mobiris-v2' );

require_once MV2_DIR . '/inc/setup.php';
require_once MV2_DIR . '/inc/enqueue.php';
require_once MV2_DIR . '/inc/customizer.php';
require_once MV2_DIR . '/inc/post-types.php';
require_once MV2_DIR . '/inc/page-creation.php';
require_once MV2_DIR . '/inc/ajax.php';

/**
 * Load a homepage part safely.
 */
function mv2_part( $name ) {
	$path = MV2_DIR . '/parts/home/' . $name . '.php';
	if ( file_exists( $path ) ) {
		include $path;
	}
}

/**
 * Load a global part safely.
 */
function mv2_global( $name ) {
	$path = MV2_DIR . '/parts/global/' . $name . '.php';
	if ( file_exists( $path ) ) {
		include $path;
	}
}

/**
 * Excerpt length.
 */
function mv2_excerpt_length( $l ) { return 22; }
add_filter( 'excerpt_length', 'mv2_excerpt_length' );

function mv2_excerpt_more( $m ) { return '…'; }
add_filter( 'excerpt_more', 'mv2_excerpt_more' );

/**
 * Body classes.
 */
function mv2_body_classes( $classes ) {
	if ( is_singular() ) $classes[] = 'mv2-singular';
	return $classes;
}
add_filter( 'body_class', 'mv2_body_classes' );
