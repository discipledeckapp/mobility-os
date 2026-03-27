<?php
/**
 * Auto-create pages and navigation menus on theme activation.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Create all required pages on theme switch.
 */
function mv2_create_pages() {
	$pages = array(
		array(
			'title'    => 'Home',
			'slug'     => 'home',
			'template' => '',
			'content'  => '',
		),
		array(
			'title'    => 'Blog',
			'slug'     => 'blog',
			'template' => '',
			'content'  => '',
		),
		array(
			'title'    => 'Product',
			'slug'     => 'product',
			'template' => 'page-templates/template-product.php',
			'content'  => '',
		),
		array(
			'title'    => 'Solutions',
			'slug'     => 'solutions',
			'template' => 'page-templates/template-solutions.php',
			'content'  => '',
		),
		array(
			'title'    => 'For Fleet Owners',
			'slug'     => 'for-fleet-owners',
			'template' => 'page-templates/template-fleet-owners.php',
			'content'  => '',
		),
		array(
			'title'    => 'For Investors',
			'slug'     => 'for-investors',
			'template' => 'page-templates/template-investors.php',
			'content'  => '',
		),
		array(
			'title'    => 'How It Works',
			'slug'     => 'how-it-works',
			'template' => 'page-templates/template-how-it-works.php',
			'content'  => '',
		),
		array(
			'title'    => 'Why You\'re Losing Money',
			'slug'     => 'why-losing-money',
			'template' => 'page-templates/template-why-losing-money.php',
			'content'  => '',
		),
		array(
			'title'    => 'Start Transport Business',
			'slug'     => 'start-transport-business',
			'template' => 'page-templates/template-start-business.php',
			'content'  => '',
		),
		array(
			'title'    => 'Profit Calculator',
			'slug'     => 'profit-calculator',
			'template' => 'page-templates/template-calculator.php',
			'content'  => '',
		),
		array(
			'title'    => 'Pricing',
			'slug'     => 'pricing',
			'template' => 'page-templates/template-pricing.php',
			'content'  => '',
		),
		array(
			'title'    => 'Contact',
			'slug'     => 'contact',
			'template' => 'page-templates/template-contact.php',
			'content'  => '',
		),
		array(
			'title'    => 'Privacy Policy',
			'slug'     => 'privacy-policy',
			'template' => '',
			'content'  => '<p>Please review our privacy policy carefully. This document describes how Growth Figures Limited collects, uses, and protects personal data in compliance with the Nigeria Data Protection Act 2023 (NDPA 2023).</p>',
		),
		array(
			'title'    => 'Terms of Service',
			'slug'     => 'terms-of-service',
			'template' => '',
			'content'  => '<p>By using Mobiris, you agree to these terms of service provided by Growth Figures Limited.</p>',
		),
	);

	$created_ids = array();

	foreach ( $pages as $page_data ) {
		// Check if page already exists by slug.
		$existing = get_page_by_path( $page_data['slug'] );
		if ( $existing ) {
			$created_ids[ $page_data['slug'] ] = $existing->ID;
			// Update template if needed.
			if ( $page_data['template'] ) {
				update_post_meta( $existing->ID, '_wp_page_template', $page_data['template'] );
			}
			continue;
		}

		$args = array(
			'post_title'   => $page_data['title'],
			'post_name'    => $page_data['slug'],
			'post_status'  => 'publish',
			'post_type'    => 'page',
			'post_content' => $page_data['content'],
			'post_author'  => 1,
		);

		$page_id = wp_insert_post( $args );
		if ( $page_id && ! is_wp_error( $page_id ) ) {
			if ( $page_data['template'] ) {
				update_post_meta( $page_id, '_wp_page_template', $page_data['template'] );
			}
			$created_ids[ $page_data['slug'] ] = $page_id;
		}
	}

	// Set front page and blog page.
	if ( isset( $created_ids['home'] ) ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $created_ids['home'] );
	}
	if ( isset( $created_ids['blog'] ) ) {
		update_option( 'page_for_posts', $created_ids['blog'] );
	}

	// Create primary navigation menu.
	mv2_create_primary_menu( $created_ids );
	mv2_create_footer_menus( $created_ids );
}
add_action( 'after_switch_theme', 'mv2_create_pages' );

/**
 * Create primary navigation menu.
 *
 * @param array $page_ids Map of slug => page ID.
 */
function mv2_create_primary_menu( $page_ids ) {
	$menu_name = 'Primary Navigation';
	$menu_exists = wp_get_nav_menu_object( $menu_name );

	if ( $menu_exists ) {
		$menu_id = $menu_exists->term_id;
		// Clear existing items.
		$existing_items = wp_get_nav_menu_items( $menu_id );
		if ( $existing_items ) {
			foreach ( $existing_items as $item ) {
				wp_delete_post( $item->ID, true );
			}
		}
	} else {
		$menu_id = wp_create_nav_menu( $menu_name );
	}

	if ( is_wp_error( $menu_id ) ) {
		return;
	}

	$primary_items = array(
		array( 'title' => 'Product',         'slug' => 'product' ),
		array( 'title' => 'Solutions',        'slug' => 'solutions' ),
		array( 'title' => 'For Fleet Owners', 'slug' => 'for-fleet-owners' ),
		array( 'title' => 'How It Works',     'slug' => 'how-it-works' ),
		array( 'title' => 'Pricing',          'slug' => 'pricing' ),
		array( 'title' => 'Blog',             'slug' => 'blog' ),
		array( 'title' => 'Contact',          'slug' => 'contact' ),
	);

	$order = 1;
	foreach ( $primary_items as $item ) {
		if ( isset( $page_ids[ $item['slug'] ] ) ) {
			wp_update_nav_menu_item(
				$menu_id,
				0,
				array(
					'menu-item-title'     => $item['title'],
					'menu-item-object'    => 'page',
					'menu-item-object-id' => $page_ids[ $item['slug'] ],
					'menu-item-type'      => 'post_type',
					'menu-item-status'    => 'publish',
					'menu-item-position'  => $order,
				)
			);
			$order++;
		}
	}

	// Assign menu to primary location.
	$locations = get_theme_mod( 'nav_menu_locations', array() );
	$locations['primary'] = $menu_id;
	set_theme_mod( 'nav_menu_locations', $locations );
}

/**
 * Create footer navigation menus.
 *
 * @param array $page_ids Map of slug => page ID.
 */
function mv2_create_footer_menus( $page_ids ) {
	// Footer col 1 — Product.
	$footer1_items = array(
		array( 'title' => 'Product',                  'slug' => 'product' ),
		array( 'title' => 'How It Works',              'slug' => 'how-it-works' ),
		array( 'title' => 'Pricing',                   'slug' => 'pricing' ),
		array( 'title' => 'Why You\'re Losing Money',  'slug' => 'why-losing-money' ),
		array( 'title' => 'Profit Calculator',         'slug' => 'profit-calculator' ),
	);

	// Footer col 2 — Company.
	$footer2_items = array(
		array( 'title' => 'Solutions',                'slug' => 'solutions' ),
		array( 'title' => 'For Fleet Owners',          'slug' => 'for-fleet-owners' ),
		array( 'title' => 'For Investors',             'slug' => 'for-investors' ),
		array( 'title' => 'Start Transport Business',  'slug' => 'start-transport-business' ),
		array( 'title' => 'Blog',                      'slug' => 'blog' ),
		array( 'title' => 'Contact',                   'slug' => 'contact' ),
	);

	// Footer col 3 — Legal.
	$footer3_items = array(
		array( 'title' => 'Privacy Policy', 'slug' => 'privacy-policy' ),
		array( 'title' => 'Terms of Service', 'slug' => 'terms-of-service' ),
	);

	$footer_menus = array(
		'footer-col-1' => array( 'name' => 'Footer — Product',  'items' => $footer1_items ),
		'footer-col-2' => array( 'name' => 'Footer — Company',  'items' => $footer2_items ),
		'footer-col-3' => array( 'name' => 'Footer — Legal',    'items' => $footer3_items ),
	);

	$locations = get_theme_mod( 'nav_menu_locations', array() );

	foreach ( $footer_menus as $location => $menu_data ) {
		$existing = wp_get_nav_menu_object( $menu_data['name'] );
		if ( $existing ) {
			$menu_id = $existing->term_id;
		} else {
			$menu_id = wp_create_nav_menu( $menu_data['name'] );
		}

		if ( is_wp_error( $menu_id ) ) {
			continue;
		}

		$order = 1;
		foreach ( $menu_data['items'] as $item ) {
			if ( isset( $page_ids[ $item['slug'] ] ) ) {
				wp_update_nav_menu_item(
					$menu_id,
					0,
					array(
						'menu-item-title'     => $item['title'],
						'menu-item-object'    => 'page',
						'menu-item-object-id' => $page_ids[ $item['slug'] ],
						'menu-item-type'      => 'post_type',
						'menu-item-status'    => 'publish',
						'menu-item-position'  => $order,
					)
				);
				$order++;
			}
		}

		$locations[ $location ] = $menu_id;
	}

	set_theme_mod( 'nav_menu_locations', $locations );
}
