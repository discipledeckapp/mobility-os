<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function mv2_enqueue_assets() {
	$uri = MV2_URI;
	$dir = MV2_DIR;

	wp_enqueue_style( 'mv2-fonts',
		'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
		array(), null );

	$css_ver = file_exists( $dir . '/assets/css/style.css' ) ? filemtime( $dir . '/assets/css/style.css' ) : MV2_VERSION;
	wp_enqueue_style( 'mv2-main', $uri . '/assets/css/style.css', array( 'mv2-fonts' ), $css_ver );

	$js_ver = file_exists( $dir . '/assets/js/main.js' ) ? filemtime( $dir . '/assets/js/main.js' ) : MV2_VERSION;
	wp_enqueue_script( 'mv2-main', $uri . '/assets/js/main.js', array(), $js_ver, array( 'strategy'=>'defer','in_footer'=>true ) );

	wp_localize_script( 'mv2-main', 'mv2Site', array(
		'ajaxUrl'    => admin_url( 'admin-ajax.php' ),
		'nonce'      => wp_create_nonce( 'mv2_ajax' ),
		'whatsapp'   => get_theme_mod( 'mv2_whatsapp', '2348053108039' ),
		'signupUrl'  => get_theme_mod( 'mv2_signup_url', 'https://app.mobiris.ng/signup' ),
	) );
}
add_action( 'wp_enqueue_scripts', 'mv2_enqueue_assets' );

function mv2_disable_emoji() {
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
}
add_action( 'init', 'mv2_disable_emoji' );
