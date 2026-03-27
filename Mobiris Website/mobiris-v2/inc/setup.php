<?php
/**
 * Theme setup: supports, menus, image sizes, widget areas.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Theme setup.
 */
function mv2_setup() {
	load_theme_textdomain( 'mobiris-v2', MV2_DIR . '/languages' );

	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'customize-selective-refresh-widgets' );
	add_theme_support( 'wp-block-styles' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'responsive-embeds' );

	// Custom logo.
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 60,
			'width'       => 180,
			'flex-width'  => true,
			'flex-height' => true,
		)
	);

	// Image sizes.
	add_image_size( 'mv2-hero', 1200, 700, true );
	add_image_size( 'mv2-card', 600, 400, true );
	add_image_size( 'mv2-thumb', 400, 280, true );

	// Navigation menus.
	register_nav_menus(
		array(
			'primary'       => __( 'Primary Navigation', 'mobiris-v2' ),
			'footer-col-1'  => __( 'Footer Column 1 — Product', 'mobiris-v2' ),
			'footer-col-2'  => __( 'Footer Column 2 — Company', 'mobiris-v2' ),
			'footer-col-3'  => __( 'Footer Column 3 — Legal', 'mobiris-v2' ),
		)
	);
}
add_action( 'after_setup_theme', 'mv2_setup' );

/**
 * Register widget areas.
 */
function mv2_widgets_init() {
	register_sidebar(
		array(
			'name'          => __( 'Blog Sidebar', 'mobiris-v2' ),
			'id'            => 'mv2-sidebar-blog',
			'description'   => __( 'Widgets displayed on blog/archive pages.', 'mobiris-v2' ),
			'before_widget' => '<div id="%1$s" class="widget %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h3 class="widget-title">',
			'after_title'   => '</h3>',
		)
	);

	register_sidebar(
		array(
			'name'          => __( 'Footer Widgets', 'mobiris-v2' ),
			'id'            => 'mv2-footer-widgets',
			'description'   => __( 'Widgets in the footer widget zone.', 'mobiris-v2' ),
			'before_widget' => '<div id="%1$s" class="widget %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4 class="widget-title">',
			'after_title'   => '</h4>',
		)
	);
}
add_action( 'widgets_init', 'mv2_widgets_init' );

/**
 * Custom body classes.
 *
 * @param array $classes Existing body classes.
 * @return array
 */
function mv2_body_classes( $classes ) {
	if ( ! is_singular() ) {
		$classes[] = 'mv2-archive';
	}
	if ( mv2_is_front() ) {
		$classes[] = 'mv2-home';
	}
	return $classes;
}
add_filter( 'body_class', 'mv2_body_classes' );

/**
 * Excerpt length.
 *
 * @param int $length Default length.
 * @return int
 */
function mv2_excerpt_length( $length ) {
	return 30;
}
add_filter( 'excerpt_length', 'mv2_excerpt_length', 999 );

/**
 * Excerpt more link.
 *
 * @param string $more Default more string.
 * @return string
 */
function mv2_excerpt_more( $more ) {
	return '&hellip;';
}
add_filter( 'excerpt_more', 'mv2_excerpt_more' );
