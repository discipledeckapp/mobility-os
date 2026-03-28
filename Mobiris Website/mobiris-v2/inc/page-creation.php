<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Create all theme pages and configure Reading Settings.
 * Safe to call multiple times — skips pages that already exist
 * but always re-applies front/posts page and nav menu settings.
 *
 * @param bool $force  When true, overwrites existing page templates too.
 */
function mv2_create_pages_on_activation( $force = false ) {
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
			$id = $existing->ID;
			// Always (re-)apply the template so a pre-existing page gets wired up correctly.
			if ( ! empty( $p['template'] ) ) {
				update_post_meta( $id, '_wp_page_template', $p['template'] );
			}
		} else {
			$id = wp_insert_post( array(
				'post_type'    => 'page',
				'post_title'   => $p['title'],
				'post_name'    => $p['slug'],
				'post_status'  => 'publish',
				'post_content' => '',
			) );
			if ( is_wp_error( $id ) ) continue;
			if ( ! empty( $p['template'] ) ) {
				update_post_meta( $id, '_wp_page_template', $p['template'] );
			}
		}

		if ( ! empty( $p['is_front'] ) ) $front_id = $id;
		if ( ! empty( $p['is_posts'] ) ) $posts_id = $id;
	}

	// Always re-apply Reading Settings so the front page is correct
	// even when the Home/Blog pages already existed before activation.
	if ( $front_id ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $front_id );
	}
	if ( $posts_id ) {
		update_option( 'page_for_posts', $posts_id );
	}

	// Primary nav menu — create once, skip if already present.
	$menu_obj = wp_get_nav_menu_object( 'MV2 Primary' );
	if ( ! $menu_obj ) {
		$menu_id   = wp_create_nav_menu( 'MV2 Primary' );
		$nav_pages = array( 'Product', 'For Fleet Owners', 'For Investors', 'How It Works', 'Pricing', 'Blog', 'Contact' );
		$order     = 1;
		foreach ( $nav_pages as $pt ) {
			$pg = get_page_by_title( $pt );
			if ( $pg ) {
				wp_update_nav_menu_item( $menu_id, 0, array(
					'menu-item-title'     => $pg->post_title,
					'menu-item-object'    => 'page',
					'menu-item-object-id' => $pg->ID,
					'menu-item-type'      => 'post_type',
					'menu-item-status'    => 'publish',
					'menu-item-position'  => $order++,
				) );
			}
		}
		$locs             = get_theme_mod( 'nav_menu_locations', array() );
		$locs['primary']  = $menu_id;
		set_theme_mod( 'nav_menu_locations', $locs );
	}

	update_option( 'mv2_setup_done', '1' );
	flush_rewrite_rules();
}

// Fires on normal theme activation via Appearance → Themes.
add_action( 'after_switch_theme', 'mv2_create_pages_on_activation' );

// ── Admin notice + manual re-run ─────────────────────────────────────────────

/**
 * Handle the "Run Setup" button click.
 * Hooked on admin_init so it runs before any output.
 */
function mv2_handle_setup_action() {
	if (
		! isset( $_GET['mv2_run_setup'] ) ||
		! current_user_can( 'manage_options' )
	) {
		return;
	}

	check_admin_referer( 'mv2_run_setup' );
	mv2_create_pages_on_activation( true );

	wp_safe_redirect( add_query_arg(
		array( 'mv2_setup_ok' => '1' ),
		admin_url()
	) );
	exit;
}
add_action( 'admin_init', 'mv2_handle_setup_action' );

/**
 * Show an admin notice if setup hasn't completed, or after a successful run.
 */
function mv2_setup_admin_notice() {
	if ( ! current_user_can( 'manage_options' ) ) return;

	// Success banner after manual run.
	if ( isset( $_GET['mv2_setup_ok'] ) ) {
		echo '<div class="notice notice-success is-dismissible"><p>';
		echo '<strong>Mobiris V2:</strong> All pages created and front page configured. ';
		echo '<a href="' . esc_url( home_url( '/' ) ) . '" target="_blank">View homepage →</a>';
		echo '</p></div>';
		return;
	}

	// Prompt if setup hasn't been marked done yet.
	if ( get_option( 'mv2_setup_done' ) ) return;

	$run_url = wp_nonce_url(
		add_query_arg( 'mv2_run_setup', '1', admin_url() ),
		'mv2_run_setup'
	);

	echo '<div class="notice notice-warning"><p>';
	echo '<strong>Mobiris V2:</strong> Theme pages have not been created yet. ';
	echo '<a href="' . esc_url( $run_url ) . '" style="font-weight:700;">Run Setup Now →</a>';
	echo '</p></div>';
}
add_action( 'admin_notices', 'mv2_setup_admin_notice' );
