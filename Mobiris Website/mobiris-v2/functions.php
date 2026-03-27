<?php
/**
 * Mobiris V2 Theme Functions
 * Transport risk infrastructure for Nigerian operators.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MV2_VERSION', '2.0.0' );
define( 'MV2_DIR', get_template_directory() );
define( 'MV2_URI', get_template_directory_uri() );
define( 'MV2_TEXT_DOMAIN', 'mobiris-v2' );

/**
 * Load all inc/ files.
 */
$mv2_includes = array(
	'inc/setup.php',
	'inc/enqueue.php',
	'inc/post-types.php',
	'inc/page-creation.php',
	'inc/ajax.php',
	'inc/customizer.php',
);

foreach ( $mv2_includes as $file ) {
	$filepath = MV2_DIR . '/' . $file;
	if ( file_exists( $filepath ) ) {
		require_once $filepath;
	}
}

/**
 * Helper: get customizer setting with fallback.
 *
 * @param string $key     Customizer key without mv2_ prefix.
 * @param mixed  $default Default value.
 * @return mixed
 */
function mv2_option( $key, $default = '' ) {
	return get_theme_mod( 'mv2_' . $key, $default );
}

/**
 * Build a WhatsApp URL with a pre-filled message.
 *
 * @param string $message Pre-filled message.
 * @return string
 */
function mv2_wa_url( $message = '' ) {
	$number = mv2_option( 'whatsapp_number', '2348053108039' );
	$number = preg_replace( '/\D/', '', $number );
	if ( $message ) {
		return 'https://wa.me/' . $number . '?text=' . rawurlencode( $message );
	}
	return 'https://wa.me/' . $number;
}

/**
 * Format Nigerian Naira amount.
 *
 * @param int|float $amount Amount in NGN.
 * @return string
 */
function mv2_naira( $amount ) {
	return '&#8358;' . number_format( (float) $amount, 0, '.', ',' );
}

/**
 * Get app signup URL.
 *
 * @return string
 */
function mv2_app_url() {
	return mv2_option( 'app_url', 'https://app.mobiris.ng/signup' );
}

/**
 * Render inline SVG safely.
 *
 * @param string $name SVG name in assets/svg/.
 * @return string
 */
function mv2_svg( $name ) {
	$path = MV2_DIR . '/assets/svg/' . sanitize_file_name( $name ) . '.svg';
	if ( file_exists( $path ) ) {
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		return file_get_contents( $path );
	}
	return '';
}

/**
 * Check if current page is front page.
 *
 * @return bool
 */
function mv2_is_front() {
	return is_front_page() && ! is_home();
}
