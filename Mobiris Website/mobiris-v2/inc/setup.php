<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function mv2_theme_setup() {
	load_theme_textdomain( 'mobiris-v2', MV2_DIR . '/languages' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form','comment-form','comment-list','gallery','caption','script','style' ) );
	add_theme_support( 'custom-logo', array( 'height'=>80,'width'=>320,'flex-height'=>true,'flex-width'=>true ) );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );
	add_image_size( 'mv2-hero', 1400, 800, true );
	add_image_size( 'mv2-card', 600, 400, true );
	register_nav_menus( array(
		'primary'  => __( 'Primary Navigation', 'mobiris-v2' ),
		'footer-1' => __( 'Footer: Product', 'mobiris-v2' ),
		'footer-2' => __( 'Footer: Company', 'mobiris-v2' ),
		'footer-3' => __( 'Footer: Legal', 'mobiris-v2' ),
		'mobile'   => __( 'Mobile Navigation', 'mobiris-v2' ),
	) );
	if ( ! isset( $GLOBALS['content_width'] ) ) {
		$GLOBALS['content_width'] = 1200;
	}
}
add_action( 'after_setup_theme', 'mv2_theme_setup' );

function mv2_register_widgets() {
	register_sidebar( array(
		'name'          => __( 'Blog Sidebar', 'mobiris-v2' ),
		'id'            => 'mv2-blog-sidebar',
		'before_widget' => '<div class="widget %2$s">',
		'after_widget'  => '</div>',
		'before_title'  => '<h4 class="widget-title">',
		'after_title'   => '</h4>',
	) );
}
add_action( 'widgets_init', 'mv2_register_widgets' );
