<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function mv2_register_post_types() {
	// Leads CPT
	register_post_type( 'mv2_lead', array(
		'labels' => array(
			'name'          => __( 'Leads', 'mobiris-v2' ),
			'singular_name' => __( 'Lead', 'mobiris-v2' ),
			'menu_name'     => __( 'Website Leads', 'mobiris-v2' ),
			'all_items'     => __( 'All Leads', 'mobiris-v2' ),
			'not_found'     => __( 'No leads yet', 'mobiris-v2' ),
		),
		'public'             => false,
		'publicly_queryable' => false,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'show_in_rest'       => false,
		'has_archive'        => false,
		'supports'           => array( 'title', 'custom-fields' ),
		'menu_icon'          => 'dashicons-businessman',
		'capabilities'       => array( 'create_posts' => 'do_not_allow' ),
		'map_meta_cap'       => true,
	) );

	// Use-case scenarios CPT
	register_post_type( 'mv2_use_case', array(
		'labels' => array(
			'name'          => __( 'Use Cases', 'mobiris-v2' ),
			'singular_name' => __( 'Use Case', 'mobiris-v2' ),
			'menu_name'     => __( 'Use Cases', 'mobiris-v2' ),
			'add_new_item'  => __( 'Add New Use Case', 'mobiris-v2' ),
			'edit_item'     => __( 'Edit Use Case', 'mobiris-v2' ),
			'not_found'     => __( 'No use cases found', 'mobiris-v2' ),
		),
		'public'             => false,
		'publicly_queryable' => false,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'show_in_rest'       => true,
		'has_archive'        => false,
		'supports'           => array( 'title', 'editor', 'custom-fields' ),
		'menu_icon'          => 'dashicons-format-quote',
	) );
}
add_action( 'init', 'mv2_register_post_types' );

// Lead admin columns
function mv2_lead_columns( $cols ) {
	return array(
		'cb'            => $cols['cb'],
		'title'         => __( 'Name / Phone', 'mobiris-v2' ),
		'lead_vehicles' => __( 'Vehicles', 'mobiris-v2' ),
		'lead_stage'    => __( 'Stage', 'mobiris-v2' ),
		'lead_whatsapp' => __( 'WhatsApp', 'mobiris-v2' ),
		'lead_lang'     => __( 'Lang', 'mobiris-v2' ),
		'date'          => __( 'Date', 'mobiris-v2' ),
	);
}
add_filter( 'manage_mv2_lead_posts_columns', 'mv2_lead_columns' );

function mv2_lead_column_content( $col, $id ) {
	switch ( $col ) {
		case 'lead_vehicles':
			echo esc_html( get_post_meta( $id, '_lead_vehicles', true ) ?: '—' );
			break;
		case 'lead_stage':
			echo esc_html( get_post_meta( $id, '_lead_stage', true ) ?: '—' );
			break;
		case 'lead_lang':
			echo esc_html( strtoupper( get_post_meta( $id, '_lead_lang', true ) ?: 'en' ) );
			break;
		case 'lead_whatsapp':
			$phone = get_post_meta( $id, '_lead_phone', true );
			if ( $phone ) {
				$num = preg_replace( '/[^0-9]/', '', $phone );
				echo '<a href="https://wa.me/' . esc_attr( $num ) . '?text=' . rawurlencode( 'Hello, following up on your Mobiris enquiry.' ) . '" target="_blank">WhatsApp ↗</a>';
			} else {
				echo '—';
			}
			break;
	}
}
add_action( 'manage_mv2_lead_posts_custom_column', 'mv2_lead_column_content', 10, 2 );
