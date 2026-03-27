<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function mv2_save_lead() {
	if ( ! isset( $_POST['mv2_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['mv2_nonce'] ) ), 'mv2_lead_nonce' ) ) {
		wp_send_json_error( array( 'message' => 'Security check failed.' ) );
		return;
	}

	$name     = isset( $_POST['lead_name'] )     ? sanitize_text_field( wp_unslash( $_POST['lead_name'] ) )     : '';
	$phone    = isset( $_POST['lead_phone'] )    ? sanitize_text_field( wp_unslash( $_POST['lead_phone'] ) )    : '';
	$email    = isset( $_POST['lead_email'] )    ? sanitize_email( wp_unslash( $_POST['lead_email'] ) )         : '';
	$vehicles = isset( $_POST['lead_vehicles'] ) ? absint( $_POST['lead_vehicles'] )                            : 0;
	$stage    = isset( $_POST['lead_stage'] )    ? sanitize_text_field( wp_unslash( $_POST['lead_stage'] ) )    : '';
	$lang     = isset( $_POST['lead_lang'] )     ? sanitize_text_field( wp_unslash( $_POST['lead_lang'] ) )     : 'en';
	$source   = isset( $_SERVER['HTTP_REFERER'] ) ? esc_url_raw( wp_unslash( $_SERVER['HTTP_REFERER'] ) )       : home_url();

	if ( empty( $name ) ) {
		wp_send_json_error( array( 'message' => 'Name is required.' ) );
		return;
	}
	if ( empty( $phone ) ) {
		wp_send_json_error( array( 'message' => 'Phone number is required.' ) );
		return;
	}

	$post_id = wp_insert_post( array(
		'post_type'   => 'mv2_lead',
		'post_title'  => sanitize_text_field( $name ) . ' — ' . sanitize_text_field( $phone ),
		'post_status' => 'publish',
		'meta_input'  => array(
			'_lead_name'     => $name,
			'_lead_phone'    => $phone,
			'_lead_email'    => $email,
			'_lead_vehicles' => $vehicles,
			'_lead_stage'    => $stage,
			'_lead_lang'     => $lang,
			'_lead_source'   => $source,
		),
	) );

	if ( is_wp_error( $post_id ) ) {
		wp_send_json_error( array( 'message' => 'Could not save your details. Please try again.' ) );
		return;
	}

	$to      = get_theme_mod( 'mv2_notify_email', 'hello@mobiris.ng' );
	$subject = sprintf( '[Mobiris V2 Lead] %s — %d vehicles (%s)', $name, $vehicles, strtoupper( $stage ) );
	$body    = "New lead from mobiris.ng\n\nName: {$name}\nPhone: {$phone}\nEmail: {$email}\nVehicles: {$vehicles}\nStage: {$stage}\nLanguage: {$lang}\nSource: {$source}\n\nAdmin: " . admin_url( 'post.php?post=' . $post_id . '&action=edit' );

	wp_mail( $to, $subject, $body, array( 'Content-Type: text/plain; charset=UTF-8' ) );

	wp_send_json_success( array(
		'message' => 'Got it! We will reach you on WhatsApp or phone within 24 hours.',
		'whatsapp_num' => preg_replace( '/[^0-9]/', '', $phone ),
	) );
}
add_action( 'wp_ajax_mv2_save_lead',        'mv2_save_lead' );
add_action( 'wp_ajax_nopriv_mv2_save_lead', 'mv2_save_lead' );
