<?php
/**
 * Theme Setup
 * Registers theme supports, nav menus, image sizes, widget areas.
 *
 * @package Mobiris
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Setup theme defaults and register support for various WordPress features.
 *
 * @return void
 */
function mobiris_theme_setup() {
	// Automatic feed links.
	add_theme_support( 'automatic-feed-links' );

	// Custom title tag.
	add_theme_support( 'title-tag' );

	// Post thumbnails.
	add_theme_support( 'post-thumbnails' );

	// HTML5 markup.
	add_theme_support(
		'html5',
		array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
			'script',
			'style',
		)
	);

	// Custom logo.
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 100,
			'width'       => 350,
			'flex-height' => true,
			'flex-width'  => true,
		)
	);

	// Custom background.
	add_theme_support(
		'custom-background',
		array(
			'default-color' => 'f8fafc',
		)
	);

	// Responsive embeds.
	add_theme_support( 'responsive-embeds' );

	// Wide alignment for blocks.
	add_theme_support( 'align-wide' );

	// Editor color palette.
	add_theme_support(
		'editor-color-palette',
		array(
			array(
				'name'  => __( 'Primary Blue', 'mobiris' ),
				'slug'  => 'primary-blue',
				'color' => '#2563EB',
			),
			array(
				'name'  => __( 'Primary Dark', 'mobiris' ),
				'slug'  => 'primary-dark',
				'color' => '#1D4ED8',
			),
			array(
				'name'  => __( 'Primary Tint', 'mobiris' ),
				'slug'  => 'primary-tint',
				'color' => '#DBEAFE',
			),
			array(
				'name'  => __( 'Navy / Ink', 'mobiris' ),
				'slug'  => 'navy-ink',
				'color' => '#0F172A',
			),
			array(
				'name'  => __( 'Ink Soft', 'mobiris' ),
				'slug'  => 'ink-soft',
				'color' => '#1E293B',
			),
			array(
				'name'  => __( 'Background', 'mobiris' ),
				'slug'  => 'background',
				'color' => '#F8FAFC',
			),
			array(
				'name'  => __( 'Card', 'mobiris' ),
				'slug'  => 'card',
				'color' => '#FFFFFF',
			),
			array(
				'name'  => __( 'Border', 'mobiris' ),
				'slug'  => 'border',
				'color' => '#E2E8F0',
			),
			array(
				'name'  => __( 'Success', 'mobiris' ),
				'slug'  => 'success',
				'color' => '#16A34A',
			),
			array(
				'name'  => __( 'Warning', 'mobiris' ),
				'slug'  => 'warning',
				'color' => '#D97706',
			),
			array(
				'name'  => __( 'Error', 'mobiris' ),
				'slug'  => 'error',
				'color' => '#DC2626',
			),
		)
	);

	// Editor font sizes.
	add_theme_support(
		'editor-font-sizes',
		array(
			array(
				'name'      => __( 'Small', 'mobiris' ),
				'slug'      => 'small',
				'size'      => 14,
			),
			array(
				'name'      => __( 'Normal', 'mobiris' ),
				'slug'      => 'normal',
				'size'      => 16,
			),
			array(
				'name'      => __( 'Medium', 'mobiris' ),
				'slug'      => 'medium',
				'size'      => 18,
			),
			array(
				'name'      => __( 'Large', 'mobiris' ),
				'slug'      => 'large',
				'size'      => 24,
			),
			array(
				'name'      => __( 'Extra Large', 'mobiris' ),
				'slug'      => 'extra-large',
				'size'      => 32,
			),
		)
	);

	// Register navigation menus.
	register_nav_menus(
		array(
			'primary'      => __( 'Primary Navigation', 'mobiris' ),
			'footer-1'     => __( 'Footer: Product', 'mobiris' ),
			'footer-2'     => __( 'Footer: Company', 'mobiris' ),
			'footer-3'     => __( 'Footer: Legal', 'mobiris' ),
			'mobile'       => __( 'Mobile Navigation', 'mobiris' ),
		)
	);

	// Set the content width global variable.
	if ( ! isset( $GLOBALS['content_width'] ) ) {
		$GLOBALS['content_width'] = 1200;
	}
}
add_action( 'after_setup_theme', 'mobiris_theme_setup' );

/**
 * Register custom image sizes.
 *
 * @return void
 */
function mobiris_register_image_sizes() {
	// Hero image: 1200x700 with hard crop.
	add_image_size( 'hero-image', 1200, 700, true );

	// Feature thumbnail: 800x500 with hard crop.
	add_image_size( 'feature-thumb', 800, 500, true );

	// Card thumbnail: 600x400 with hard crop.
	add_image_size( 'card-thumb', 600, 400, true );

	// Team thumbnail: 400x400 with hard crop.
	add_image_size( 'team-thumb', 400, 400, true );
}
add_action( 'after_setup_theme', 'mobiris_register_image_sizes' );

/**
 * Register widget areas / sidebars.
 *
 * @return void
 */
function mobiris_register_widget_areas() {
	// Blog sidebar.
	register_sidebar(
		array(
			'name'          => __( 'Blog Sidebar', 'mobiris' ),
			'id'            => 'sidebar-blog',
			'description'   => __( 'Primary sidebar for blog posts', 'mobiris' ),
			'before_widget' => '<div id="%1$s" class="widget %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h3 class="widget-title">',
			'after_title'   => '</h3>',
		)
	);

	// Guide/Resources sidebar.
	register_sidebar(
		array(
			'name'          => __( 'Resources Sidebar', 'mobiris' ),
			'id'            => 'sidebar-guide',
			'description'   => __( 'Sidebar for guide and resource pages', 'mobiris' ),
			'before_widget' => '<div id="%1$s" class="widget %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h3 class="widget-title">',
			'after_title'   => '</h3>',
		)
	);

	// Footer column 1.
	register_sidebar(
		array(
			'name'          => __( 'Footer Column 1', 'mobiris' ),
			'id'            => 'footer-widget-1',
			'description'   => __( 'First footer widget area', 'mobiris' ),
			'before_widget' => '<div id="%1$s" class="widget %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4 class="widget-title">',
			'after_title'   => '</h4>',
		)
	);

	// Footer column 2.
	register_sidebar(
		array(
			'name'          => __( 'Footer Column 2', 'mobiris' ),
			'id'            => 'footer-widget-2',
			'description'   => __( 'Second footer widget area', 'mobiris' ),
			'before_widget' => '<div id="%1$s" class="widget %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4 class="widget-title">',
			'after_title'   => '</h4>',
		)
	);

	// Footer column 3.
	register_sidebar(
		array(
			'name'          => __( 'Footer Column 3', 'mobiris' ),
			'id'            => 'footer-widget-3',
			'description'   => __( 'Third footer widget area', 'mobiris' ),
			'before_widget' => '<div id="%1$s" class="widget %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4 class="widget-title">',
			'after_title'   => '</h4>',
		)
	);

	// Footer column 4.
	register_sidebar(
		array(
			'name'          => __( 'Footer Column 4', 'mobiris' ),
			'id'            => 'footer-widget-4',
			'description'   => __( 'Fourth footer widget area', 'mobiris' ),
			'before_widget' => '<div id="%1$s" class="widget %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4 class="widget-title">',
			'after_title'   => '</h4>',
		)
	);
}
add_action( 'widgets_init', 'mobiris_register_widget_areas' );

/**
 * Hide admin bar from front-end for non-admin users.
 *
 * @return void
 */
function mobiris_hide_admin_bar_for_non_admins() {
	if ( is_admin_bar_showing() && ! current_user_can( 'manage_options' ) ) {
		show_admin_bar( false );
	}
}
add_action( 'wp_footer', 'mobiris_hide_admin_bar_for_non_admins' );

/**
 * Disable Gutenberg on select post types for simpler editing experience.
 * Can be removed if full block editor is preferred across all post types.
 *
 * @param bool   $use_block_editor Whether the block editor should be used.
 * @param string $post_type         The post type being edited.
 * @return bool
 */
function mobiris_disable_gutenberg_on_post_types( $use_block_editor, $post_type ) {
	// Use classic editor for testimonials and FAQs for simpler editing.
	$disable_on_types = array( 'testimonial', 'faq' );

	if ( in_array( $post_type, $disable_on_types, true ) ) {
		return false;
	}

	return $use_block_editor;
}
add_filter( 'use_block_editor_for_post_type', 'mobiris_disable_gutenberg_on_post_types', 10, 2 );
