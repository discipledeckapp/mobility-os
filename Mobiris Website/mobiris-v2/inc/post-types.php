<?php
/**
 * Register custom post types: mv2_lead and mv2_use_case.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the mv2_lead CPT (lead capture).
 */
function mv2_register_lead_cpt() {
	$labels = array(
		'name'               => _x( 'Leads', 'post type general name', 'mobiris-v2' ),
		'singular_name'      => _x( 'Lead', 'post type singular name', 'mobiris-v2' ),
		'menu_name'          => _x( 'Leads', 'admin menu', 'mobiris-v2' ),
		'add_new'            => _x( 'Add New', 'lead', 'mobiris-v2' ),
		'add_new_item'       => __( 'Add New Lead', 'mobiris-v2' ),
		'edit_item'          => __( 'Edit Lead', 'mobiris-v2' ),
		'new_item'           => __( 'New Lead', 'mobiris-v2' ),
		'view_item'          => __( 'View Lead', 'mobiris-v2' ),
		'search_items'       => __( 'Search Leads', 'mobiris-v2' ),
		'not_found'          => __( 'No leads found.', 'mobiris-v2' ),
		'not_found_in_trash' => __( 'No leads found in trash.', 'mobiris-v2' ),
	);

	register_post_type(
		'mv2_lead',
		array(
			'labels'              => $labels,
			'public'              => false,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'menu_icon'           => 'dashicons-groups',
			'capability_type'     => 'post',
			'capabilities'        => array(
				'create_posts' => 'do_not_allow',
			),
			'map_meta_cap'        => true,
			'supports'            => array( 'title' ),
			'has_archive'         => false,
			'rewrite'             => false,
			'query_var'           => false,
			'show_in_rest'        => false,
		)
	);
}
add_action( 'init', 'mv2_register_lead_cpt' );

/**
 * Register the mv2_use_case CPT.
 */
function mv2_register_use_case_cpt() {
	$labels = array(
		'name'               => _x( 'Use Cases', 'post type general name', 'mobiris-v2' ),
		'singular_name'      => _x( 'Use Case', 'post type singular name', 'mobiris-v2' ),
		'menu_name'          => _x( 'Use Cases', 'admin menu', 'mobiris-v2' ),
		'add_new'            => _x( 'Add New', 'use case', 'mobiris-v2' ),
		'add_new_item'       => __( 'Add New Use Case', 'mobiris-v2' ),
		'edit_item'          => __( 'Edit Use Case', 'mobiris-v2' ),
		'new_item'           => __( 'New Use Case', 'mobiris-v2' ),
		'view_item'          => __( 'View Use Case', 'mobiris-v2' ),
		'search_items'       => __( 'Search Use Cases', 'mobiris-v2' ),
		'not_found'          => __( 'No use cases found.', 'mobiris-v2' ),
		'not_found_in_trash' => __( 'No use cases found in trash.', 'mobiris-v2' ),
	);

	register_post_type(
		'mv2_use_case',
		array(
			'labels'          => $labels,
			'public'          => true,
			'show_ui'         => true,
			'show_in_menu'    => true,
			'menu_icon'       => 'dashicons-lightbulb',
			'supports'        => array( 'title', 'editor', 'excerpt', 'thumbnail' ),
			'has_archive'     => true,
			'rewrite'         => array( 'slug' => 'use-cases' ),
			'show_in_rest'    => true,
		)
	);
}
add_action( 'init', 'mv2_register_use_case_cpt' );

/**
 * Add custom admin columns for mv2_lead.
 *
 * @param array $columns Default columns.
 * @return array
 */
function mv2_lead_columns( $columns ) {
	$new = array();
	foreach ( $columns as $key => $val ) {
		if ( 'date' === $key ) {
			$new['lead_name']     = __( 'Name', 'mobiris-v2' );
			$new['lead_phone']    = __( 'Phone / WhatsApp', 'mobiris-v2' );
			$new['lead_vehicles'] = __( 'Vehicles', 'mobiris-v2' );
			$new['lead_stage']    = __( 'Stage', 'mobiris-v2' );
			$new['lead_lang']     = __( 'Language', 'mobiris-v2' );
			$new['lead_wa']       = __( 'WhatsApp', 'mobiris-v2' );
		}
		$new[ $key ] = $val;
	}
	return $new;
}
add_filter( 'manage_mv2_lead_posts_columns', 'mv2_lead_columns' );

/**
 * Render custom column values for mv2_lead.
 *
 * @param string $column  Column key.
 * @param int    $post_id Post ID.
 */
function mv2_lead_column_values( $column, $post_id ) {
	switch ( $column ) {
		case 'lead_name':
			echo esc_html( get_post_meta( $post_id, '_lead_name', true ) );
			break;
		case 'lead_phone':
			$phone = get_post_meta( $post_id, '_lead_phone', true );
			echo esc_html( $phone );
			break;
		case 'lead_vehicles':
			echo esc_html( get_post_meta( $post_id, '_lead_vehicles', true ) ?: '—' );
			break;
		case 'lead_stage':
			$stage = get_post_meta( $post_id, '_lead_stage', true );
			$labels = array(
				'running'   => __( 'Running', 'mobiris-v2' ),
				'starting'  => __( 'Starting', 'mobiris-v2' ),
				'investing' => __( 'Investing', 'mobiris-v2' ),
			);
			echo esc_html( isset( $labels[ $stage ] ) ? $labels[ $stage ] : '—' );
			break;
		case 'lead_lang':
			$lang = get_post_meta( $post_id, '_lead_lang', true );
			echo esc_html( strtoupper( $lang ?: 'EN' ) );
			break;
		case 'lead_wa':
			$phone = get_post_meta( $post_id, '_lead_phone', true );
			if ( $phone ) {
				$number = preg_replace( '/\D/', '', $phone );
				if ( strlen( $number ) === 11 && substr( $number, 0, 1 ) === '0' ) {
					$number = '234' . substr( $number, 1 );
				}
				$url = 'https://wa.me/' . $number;
				echo '<a href="' . esc_url( $url ) . '" target="_blank" rel="noopener noreferrer" style="color:#25D366;font-weight:600;">Chat</a>';
			} else {
				echo '—';
			}
			break;
	}
}
add_action( 'manage_mv2_lead_posts_custom_column', 'mv2_lead_column_values', 10, 2 );

/**
 * Add meta box for lead details.
 */
function mv2_lead_meta_box() {
	add_meta_box(
		'mv2_lead_details',
		__( 'Lead Details', 'mobiris-v2' ),
		'mv2_lead_meta_box_html',
		'mv2_lead',
		'normal',
		'high'
	);
}
add_action( 'add_meta_boxes', 'mv2_lead_meta_box' );

/**
 * Render lead meta box HTML.
 *
 * @param WP_Post $post Current post.
 */
function mv2_lead_meta_box_html( $post ) {
	$meta_keys = array(
		'_lead_name'     => __( 'Name', 'mobiris-v2' ),
		'_lead_phone'    => __( 'Phone / WhatsApp', 'mobiris-v2' ),
		'_lead_email'    => __( 'Email', 'mobiris-v2' ),
		'_lead_vehicles' => __( 'Number of Vehicles', 'mobiris-v2' ),
		'_lead_stage'    => __( 'Business Stage', 'mobiris-v2' ),
		'_lead_source'   => __( 'Source', 'mobiris-v2' ),
		'_lead_lang'     => __( 'Language', 'mobiris-v2' ),
	);
	echo '<table class="form-table" style="margin:0;">';
	foreach ( $meta_keys as $key => $label ) {
		$value = get_post_meta( $post->ID, $key, true );
		echo '<tr><th style="width:160px;padding:8px 0;">' . esc_html( $label ) . '</th>';
		echo '<td style="padding:8px 0;"><strong>' . esc_html( $value ?: '—' ) . '</strong></td></tr>';
	}
	echo '</table>';

	// WhatsApp quick link.
	$phone = get_post_meta( $post->ID, '_lead_phone', true );
	if ( $phone ) {
		$number = preg_replace( '/\D/', '', $phone );
		if ( strlen( $number ) === 11 && substr( $number, 0, 1 ) === '0' ) {
			$number = '234' . substr( $number, 1 );
		}
		$wa_url = 'https://wa.me/' . $number . '?text=' . rawurlencode( 'Hi, I\'m following up on your Mobiris enquiry.' );
		echo '<p style="margin-top:12px;"><a href="' . esc_url( $wa_url ) . '" target="_blank" rel="noopener noreferrer" class="button button-primary" style="background:#25D366;border-color:#25D366;">&#128172; Open WhatsApp Chat</a></p>';
	}
}
