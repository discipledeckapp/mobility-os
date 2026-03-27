<?php
/**
 * Enqueue styles and scripts.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue front-end assets.
 */
function mv2_enqueue_assets() {
	// Google Fonts — Inter.
	wp_enqueue_style(
		'mv2-google-fonts',
		'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
		array(),
		null
	);

	// Main stylesheet.
	wp_enqueue_style(
		'mv2-style',
		MV2_URI . '/assets/css/style.css',
		array( 'mv2-google-fonts' ),
		MV2_VERSION
	);

	// Main JS.
	wp_enqueue_script(
		'mv2-main',
		MV2_URI . '/assets/js/main.js',
		array(),
		MV2_VERSION,
		true
	);

	// Localize AJAX and config for JS.
	wp_localize_script(
		'mv2-main',
		'mv2Config',
		array(
			'ajaxUrl'       => admin_url( 'admin-ajax.php' ),
			'nonce'         => wp_create_nonce( 'mv2_ajax' ),
			'appUrl'        => esc_url( mv2_app_url() ),
			'waNumber'      => esc_js( preg_replace( '/\D/', '', mv2_option( 'whatsapp_number', '2348053108039' ) ) ),
			'waMsg1'        => esc_js( mv2_option( 'wa_msg_operators', 'I want to reduce leakage in my transport business' ) ),
			'waMsg2'        => esc_js( mv2_option( 'wa_msg_starters', 'I want to start a keke business properly' ) ),
			'waMsg3'        => esc_js( mv2_option( 'wa_msg_investors', 'I want to see how Mobiris works for investors' ) ),
			'starterPlan'   => (int) mv2_option( 'price_starter', 15000 ),
			'growthPlan'    => (int) mv2_option( 'price_growth', 35000 ),
			'i18n'          => array(
				'days'     => __( 'days', 'mobiris-v2' ),
				'success'  => __( 'Thank you! We\'ll reach out within 24 hours.', 'mobiris-v2' ),
				'error'    => __( 'Something went wrong. Please try again.', 'mobiris-v2' ),
				'required' => __( 'Please fill in your name and phone number.', 'mobiris-v2' ),
			),
		)
	);
}
add_action( 'wp_enqueue_scripts', 'mv2_enqueue_assets' );

/**
 * Enqueue admin styles for lead CPT.
 *
 * @param string $hook Current admin page hook.
 */
function mv2_admin_enqueue( $hook ) {
	if ( in_array( $hook, array( 'post.php', 'post-new.php', 'edit.php' ), true ) ) {
		wp_enqueue_style(
			'mv2-admin',
			MV2_URI . '/assets/css/admin.css',
			array(),
			MV2_VERSION
		);
	}
}
add_action( 'admin_enqueue_scripts', 'mv2_admin_enqueue' );

/**
 * Add preconnect for Google Fonts performance.
 */
function mv2_preconnect_fonts() {
	echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
	echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}
add_action( 'wp_head', 'mv2_preconnect_fonts', 1 );

/**
 * Add theme color meta tag.
 */
function mv2_meta_theme_color() {
	echo '<meta name="theme-color" content="#0A1628">' . "\n";
}
add_action( 'wp_head', 'mv2_meta_theme_color', 1 );
