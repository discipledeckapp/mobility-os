<?php
/**
 * Mobiris v3 — Theme Functions
 *
 * @package mobiris-v3
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ─────────────────────────────────────────────
// Theme setup
// ─────────────────────────────────────────────
function mobiris_setup(): void {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'html5', [ 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ] );
    add_theme_support( 'customize-selective-refresh-widgets' );

    register_nav_menus( [
        'primary' => __( 'Primary Navigation', 'mobiris-v3' ),
    ] );
}
add_action( 'after_setup_theme', 'mobiris_setup' );

// ─────────────────────────────────────────────
// Enqueue styles & scripts
// ─────────────────────────────────────────────
function mobiris_enqueue_assets(): void {
    // Google Fonts — DM Sans
    wp_enqueue_style(
        'mobiris-fonts',
        'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap',
        [],
        null
    );

    // Main stylesheet
    wp_enqueue_style(
        'mobiris-main',
        get_template_directory_uri() . '/assets/css/main.css',
        [ 'mobiris-fonts' ],
        wp_get_theme()->get( 'Version' )
    );

    // Inline CSS variables from Customizer
    $brand_color      = get_theme_mod( 'mobiris_brand_color', '#2563eb' );
    $brand_dark       = get_theme_mod( 'mobiris_brand_color_dark', '#1d4ed8' );
    wp_add_inline_style( 'mobiris-main', mobiris_build_css_vars( $brand_color, $brand_dark ) );

    // Main JS
    wp_enqueue_script(
        'mobiris-main',
        get_template_directory_uri() . '/assets/js/main.js',
        [],
        wp_get_theme()->get( 'Version' ),
        true
    );
}
add_action( 'wp_enqueue_scripts', 'mobiris_enqueue_assets' );

/**
 * Build :root CSS variables string from Customizer values.
 */
function mobiris_build_css_vars( string $brand, string $brand_dark ): string {
    $brand_rgb  = mobiris_hex_to_rgb( $brand );
    $tint       = mobiris_lighten_hex( $brand, 0.92 );

    return sprintf(
        ':root {
            --brand:       %s;
            --brand-dark:  %s;
            --brand-tint:  %s;
            --brand-rgb:   %s;
        }',
        esc_attr( $brand ),
        esc_attr( $brand_dark ),
        esc_attr( $tint ),
        esc_attr( $brand_rgb )
    );
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Convert #rrggbb to "r, g, b" for rgba() usage. */
function mobiris_hex_to_rgb( string $hex ): string {
    $hex = ltrim( $hex, '#' );
    if ( strlen( $hex ) === 3 ) {
        $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
    }
    $r = hexdec( substr( $hex, 0, 2 ) );
    $g = hexdec( substr( $hex, 2, 2 ) );
    $b = hexdec( substr( $hex, 4, 2 ) );
    return "$r, $g, $b";
}

/** Blend hex color with white to produce a light tint. */
function mobiris_lighten_hex( string $hex, float $amount ): string {
    $hex = ltrim( $hex, '#' );
    if ( strlen( $hex ) === 3 ) {
        $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
    }
    $r = (int) round( hexdec( substr( $hex, 0, 2 ) ) * (1 - $amount) + 255 * $amount );
    $g = (int) round( hexdec( substr( $hex, 2, 2 ) ) * (1 - $amount) + 255 * $amount );
    $b = (int) round( hexdec( substr( $hex, 4, 2 ) ) * (1 - $amount) + 255 * $amount );
    return sprintf( '#%02x%02x%02x', $r, $g, $b );
}

// ─────────────────────────────────────────────
// Customizer
// ─────────────────────────────────────────────
require get_template_directory() . '/customizer.php';

// ─────────────────────────────────────────────
// Sanitization helpers (reusable across customizer.php)
// ─────────────────────────────────────────────

function mobiris_sanitize_text( string $value ): string {
    return wp_kses_post( $value );
}

function mobiris_sanitize_url( string $value ): string {
    return esc_url_raw( $value );
}

function mobiris_sanitize_checkbox( $value ): bool {
    return (bool) $value;
}

function mobiris_sanitize_color( string $value ): string {
    if ( preg_match( '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/', $value ) ) {
        return $value;
    }
    return '#2563eb';
}
