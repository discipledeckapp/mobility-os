<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function mv2_create_pages_on_activation() {
	$pages = array(
		array( 'title' => 'Home',                    'slug' => 'home',                   'template' => '',                                         'is_front' => true ),
		array( 'title' => 'Blog',                    'slug' => 'blog',                   'template' => '',                                         'is_posts' => true ),
		array( 'title' => 'Product',                 'slug' => 'product',                'template' => 'page-templates/template-product.php' ),
		array( 'title' => 'Solutions',               'slug' => 'solutions',              'template' => 'page-templates/template-solutions.php' ),
		array( 'title' => 'For Fleet Owners',        'slug' => 'for-fleet-owners',       'template' => 'page-templates/template-fleet-owners.php' ),
		array( 'title' => 'For Investors',           'slug' => 'for-investors',          'template' => 'page-templates/template-investors.php' ),
		array( 'title' => 'How It Works',            'slug' => 'how-it-works',           'template' => 'page-templates/template-how-it-works.php' ),
		array( 'title' => "Why You're Losing Money", 'slug' => 'why-losing-money',       'template' => 'page-templates/template-why-losing-money.php' ),
		array( 'title' => 'Start Transport Business','slug' => 'start-transport-business','template' => 'page-templates/template-start-business.php' ),
		array( 'title' => 'Profit Calculator',       'slug' => 'profit-calculator',      'template' => 'page-templates/template-calculator.php' ),
		array( 'title' => 'Pricing',                 'slug' => 'pricing',                'template' => 'page-templates/template-pricing.php' ),
		array( 'title' => 'Contact',                 'slug' => 'contact',                'template' => 'page-templates/template-contact.php' ),
		array( 'title' => 'Privacy Policy',          'slug' => 'privacy-policy',         'template' => '' ),
		array( 'title' => 'Terms of Service',        'slug' => 'terms-of-service',       'template' => '' ),
	);

	$front_id = null;
	$posts_id = null;

	foreach ( $pages as $p ) {
		$existing = get_page_by_path( $p['slug'] );
		if ( $existing ) {
			if ( ! empty( $p['is_front'] ) ) $front_id = $existing->ID;
			if ( ! empty( $p['is_posts'] ) ) $posts_id = $existing->ID;
			continue;
		}
		$id = wp_insert_post( array(
			'post_type'    => 'page',
			'post_title'   => $p['title'],
			'post_name'    => $p['slug'],
			'post_status'  => 'publish',
			'post_content' => '',
		) );
		if ( ! is_wp_error( $id ) ) {
			if ( ! empty( $p['template'] ) ) update_post_meta( $id, '_wp_page_template', $p['template'] );
			if ( ! empty( $p['is_front'] ) ) $front_id = $id;
			if ( ! empty( $p['is_posts'] ) ) $posts_id = $id;
		}
	}

	if ( $front_id ) { update_option( 'show_on_front', 'page' ); update_option( 'page_on_front', $front_id ); }
	if ( $posts_id ) { update_option( 'page_for_posts', $posts_id ); }

	// Primary menu
	$menu_obj = wp_get_nav_menu_object( 'MV2 Primary' );
	if ( ! $menu_obj ) {
		$menu_id = wp_create_nav_menu( 'MV2 Primary' );
		$nav_pages = array( 'Product', 'For Fleet Owners', 'For Investors', 'How It Works', 'Pricing', 'Blog', 'Contact' );
		$order = 1;
		foreach ( $nav_pages as $pt ) {
			$pg = get_page_by_title( $pt );
			if ( $pg ) {
				wp_update_nav_menu_item( $menu_id, 0, array(
					'menu-item-title'      => $pg->post_title,
					'menu-item-object'     => 'page',
					'menu-item-object-id'  => $pg->ID,
					'menu-item-type'       => 'post_type',
					'menu-item-status'     => 'publish',
					'menu-item-position'   => $order++,
				) );
			}
		}
		$locs = get_theme_mod( 'nav_menu_locations', array() );
		$locs['primary'] = $menu_id;
		set_theme_mod( 'nav_menu_locations', $locs );
	}

	flush_rewrite_rules();
}
add_action( 'after_switch_theme', 'mv2_create_pages_on_activation' );
