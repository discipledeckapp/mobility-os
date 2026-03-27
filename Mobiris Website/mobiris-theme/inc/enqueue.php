<?php
/**
 * Scripts and Styles Enqueue
 * Handles loading of stylesheets, scripts, fonts, and localization.
 *
 * @package Mobiris
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue theme scripts and styles.
 *
 * @return void
 */
function mobiris_enqueue_assets() {
	// Get theme directory URI and file paths for cache busting.
	$theme_uri = get_template_directory_uri();
	$theme_dir = get_template_directory();

	// Google Fonts: DM Sans and DM Mono.
	$fonts_url = 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600;700&display=swap';
	wp_enqueue_style( 'mobiris-google-fonts', $fonts_url, array(), null );

	// Main stylesheet with versioning.
	$main_css_path = $theme_dir . '/assets/css/main.css';
	$main_css_version = file_exists( $main_css_path ) ? filemtime( $main_css_path ) : wp_get_theme()->get( 'Version' );
	wp_enqueue_style(
		'mobiris-main',
		$theme_uri . '/assets/css/main.css',
		array( 'mobiris-google-fonts' ),
		$main_css_version,
		'all'
	);

	// Main script with deferred loading and versioning.
	$main_js_path = $theme_dir . '/assets/js/main.js';
	$main_js_version = file_exists( $main_js_path ) ? filemtime( $main_js_path ) : wp_get_theme()->get( 'Version' );
	wp_enqueue_script(
		'mobiris-main',
		$theme_uri . '/assets/js/main.js',
		array(),
		$main_js_version,
		array(
			'strategy' => 'defer',
			'in_footer' => true,
		)
	);

	// Navigation script with deferred loading and versioning.
	$nav_js_path = $theme_dir . '/assets/js/navigation.js';
	$nav_js_version = file_exists( $nav_js_path ) ? filemtime( $nav_js_path ) : wp_get_theme()->get( 'Version' );
	wp_enqueue_script(
		'mobiris-navigation',
		$theme_uri . '/assets/js/navigation.js',
		array(),
		$nav_js_version,
		array(
			'strategy' => 'defer',
			'in_footer' => true,
		)
	);

	// Localize mobiris-main script with site-wide data.
	wp_localize_script(
		'mobiris-main',
		'mobirisSite',
		array(
			'ajaxUrl'  => admin_url( 'admin-ajax.php' ),
			'themeUrl' => $theme_uri,
			'siteUrl'  => home_url(),
			'nonce'    => wp_create_nonce( 'mobiris_nonce' ),
		)
	);

	// Dequeue jQuery migrate on production if jQuery is still loaded.
	if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
		wp_dequeue_script( 'jquery-migrate' );
	}

	// Add inline script to prevent layout shift on heavy JavaScript loads.
	$inline_script = "
	document.documentElement.classList.add( 'js-enabled' );
	";
	wp_add_inline_script( 'mobiris-navigation', $inline_script, 'before' );
}
add_action( 'wp_enqueue_scripts', 'mobiris_enqueue_assets' );

/**
 * Enqueue block editor styles.
 *
 * @return void
 */
function mobiris_enqueue_editor_styles() {
	// Register Google Fonts for editor.
	$fonts_url = 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600;700&display=swap';
	wp_enqueue_style( 'mobiris-editor-fonts', $fonts_url );

	// Enqueue editor stylesheet.
	$theme_uri = get_template_directory_uri();
	$theme_dir = get_template_directory();

	$editor_css_path = $theme_dir . '/assets/css/editor-style.css';
	$editor_css_version = file_exists( $editor_css_path ) ? filemtime( $editor_css_path ) : wp_get_theme()->get( 'Version' );

	add_editor_style( $theme_uri . '/assets/css/editor-style.css' );

	// Custom editor inline styles to match theme.
	$editor_inline = "
	:root {
		--color-primary: #2563EB;
		--color-primary-dark: #1D4ED8;
		--color-primary-tint: #DBEAFE;
		--color-navy: #0F172A;
		--color-background: #F8FAFC;
		--color-card: #FFFFFF;
		--color-border: #E2E8F0;
	}
	body {
		font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
	}
	.wp-block-heading {
		font-weight: 600;
	}
	";
	wp_add_inline_style( 'mobiris-editor-fonts', $editor_inline );
}
add_action( 'enqueue_block_editor_assets', 'mobiris_enqueue_editor_styles' );

/**
 * Add custom script attributes for performance.
 *
 * @param string $tag    The script tag HTML.
 * @param string $handle The script handle.
 * @return string
 */
function mobiris_script_tag_attributes( $tag, $handle ) {
	// Add defer to Disqus comments if they're loaded.
	if ( 'disqus' === $handle ) {
		return str_replace( ' src', ' async src', $tag );
	}

	return $tag;
}
add_filter( 'script_loader_tag', 'mobiris_script_tag_attributes', 10, 2 );

/**
 * Disable emoji scripts for better performance if not needed.
 *
 * @return void
 */
function mobiris_disable_emojis() {
	// Remove WP emoji DNS prefetch.
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
	remove_filter( 'the_content_feed', 'wp_staticize_emoji_for_feed' );
	remove_filter( 'comment_text_rss', 'wp_staticize_emoji_for_feed' );
}
add_action( 'init', 'mobiris_disable_emojis' );

/**
 * Conditionally load Google Analytics or other tracking code.
 * Hook this to wp_head or wp_footer depending on your setup.
 *
 * @return void
 */
function mobiris_enqueue_analytics() {
	// Placeholder for analytics code (e.g., Google Analytics, Mixpanel).
	// To use, add your tracking code here or store in customizer.
	// Example:
	// $ga_id = get_theme_mod( 'mobiris_ga_id' );
	// if ( ! empty( $ga_id ) ) { ... }
}
// Uncomment to activate:
// add_action( 'wp_head', 'mobiris_enqueue_analytics' );

/**
 * Add preconnect and prefetch headers for external resources.
 *
 * @return void
 */
function mobiris_add_resource_hints() {
	// Preconnect to Google Fonts.
	echo '<link rel="preconnect" href="https://fonts.googleapis.com" />' . "\n";
	echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />' . "\n";

	// Prefetch DNS for app domain.
	echo '<link rel="dns-prefetch" href="//app.mobiris.ng" />' . "\n";
}
add_action( 'wp_head', 'mobiris_add_resource_hints', 2 );

/**
 * Remove unnecessary WordPress head elements for cleaner HTML.
 *
 * @return void
 */
function mobiris_clean_wp_head() {
	// Remove WordPress version meta.
	remove_action( 'wp_head', 'wp_generator' );

	// Remove REST API discovery links (optional, depends on use case).
	// remove_action( 'wp_head', 'rest_output_link_wp_head' );
	// remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );

	// Remove adjacent post rel links (if not using).
	// remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head' );
}
add_action( 'init', 'mobiris_clean_wp_head' );
