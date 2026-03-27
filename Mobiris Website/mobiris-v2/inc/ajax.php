<?php
/**
 * AJAX handlers for lead capture form.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handle lead form submission.
 * Accepts both logged-in and non-logged-in users.
 */
function mv2_save_lead() {
	// Verify nonce.
	if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'mv2_ajax' ) ) {
		wp_send_json_error( array( 'message' => __( 'Security check failed. Please refresh and try again.', 'mobiris-v2' ) ), 403 );
	}

	// Validate required fields.
	$name  = isset( $_POST['lead_name'] ) ? sanitize_text_field( wp_unslash( $_POST['lead_name'] ) ) : '';
	$phone = isset( $_POST['lead_phone'] ) ? sanitize_text_field( wp_unslash( $_POST['lead_phone'] ) ) : '';

	if ( empty( $name ) || empty( $phone ) ) {
		wp_send_json_error( array( 'message' => __( 'Name and phone number are required.', 'mobiris-v2' ) ), 422 );
	}

	// Sanitize optional fields.
	$email    = isset( $_POST['lead_email'] ) ? sanitize_email( wp_unslash( $_POST['lead_email'] ) ) : '';
	$vehicles = isset( $_POST['lead_vehicles'] ) ? absint( $_POST['lead_vehicles'] ) : 0;
	$stage    = isset( $_POST['lead_stage'] ) ? sanitize_key( wp_unslash( $_POST['lead_stage'] ) ) : '';
	$lang     = isset( $_POST['lead_lang'] ) ? sanitize_key( wp_unslash( $_POST['lead_lang'] ) ) : 'en';
	$source   = isset( $_POST['lead_source'] ) ? sanitize_text_field( wp_unslash( $_POST['lead_source'] ) ) : 'website';

	// Validate stage.
	$allowed_stages = array( 'running', 'starting', 'investing' );
	if ( ! in_array( $stage, $allowed_stages, true ) ) {
		$stage = '';
	}

	// Validate language.
	if ( ! in_array( $lang, array( 'en', 'fr' ), true ) ) {
		$lang = 'en';
	}

	// Rate limiting: check for duplicate phone in last 24 hours.
	$recent = get_posts(
		array(
			'post_type'      => 'mv2_lead',
			'posts_per_page' => 1,
			'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				array(
					'key'   => '_lead_phone',
					'value' => $phone,
				),
			),
			'date_query'     => array(
				array(
					'after' => '24 hours ago',
				),
			),
			'fields'         => 'ids',
		)
	);

	if ( ! empty( $recent ) ) {
		// Still succeed silently to avoid enumeration.
		wp_send_json_success(
			array(
				'message'  => __( 'Thank you! We\'ll be in touch shortly.', 'mobiris-v2' ),
				'wa_url'   => mv2_wa_url( __( 'I want to learn more about Mobiris', 'mobiris-v2' ) ),
				'existing' => true,
			)
		);
	}

	// Create post title as "Name — Phone".
	$post_title = $name . ' — ' . $phone;

	$post_id = wp_insert_post(
		array(
			'post_title'  => $post_title,
			'post_type'   => 'mv2_lead',
			'post_status' => 'publish',
		)
	);

	if ( is_wp_error( $post_id ) ) {
		wp_send_json_error( array( 'message' => __( 'Could not save your details. Please try WhatsApp instead.', 'mobiris-v2' ) ), 500 );
	}

	// Save meta.
	update_post_meta( $post_id, '_lead_name', $name );
	update_post_meta( $post_id, '_lead_phone', $phone );
	update_post_meta( $post_id, '_lead_email', $email );
	update_post_meta( $post_id, '_lead_vehicles', $vehicles );
	update_post_meta( $post_id, '_lead_stage', $stage );
	update_post_meta( $post_id, '_lead_source', $source );
	update_post_meta( $post_id, '_lead_lang', $lang );
	update_post_meta( $post_id, '_lead_ip', mv2_get_client_ip() );
	update_post_meta( $post_id, '_lead_ua', isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '' );

	// Send notification email.
	mv2_send_lead_notification( $post_id, $name, $phone, $email, $vehicles, $stage );

	// Build WhatsApp follow-up URL.
	$wa_message = 'Hi ' . $name . ', this is Mobiris. Thanks for your interest! We\'ll call you shortly to discuss your fleet of ' . ( $vehicles ? $vehicles . ' vehicles' : 'vehicles' ) . '.';
	$wa_url     = mv2_wa_url( $wa_message );

	wp_send_json_success(
		array(
			'message' => __( 'Thank you! We\'ll reach out within 24 hours via WhatsApp or phone.', 'mobiris-v2' ),
			'wa_url'  => $wa_url,
		)
	);
}
add_action( 'wp_ajax_mv2_save_lead', 'mv2_save_lead' );
add_action( 'wp_ajax_nopriv_mv2_save_lead', 'mv2_save_lead' );

/**
 * Send email notification to team when a new lead is received.
 *
 * @param int    $post_id  Lead post ID.
 * @param string $name     Lead name.
 * @param string $phone    Lead phone.
 * @param string $email    Lead email.
 * @param int    $vehicles Vehicle count.
 * @param string $stage    Business stage.
 */
function mv2_send_lead_notification( $post_id, $name, $phone, $email, $vehicles, $stage ) {
	$notify_email = mv2_option( 'lead_notify_email', 'hello@mobiris.ng' );
	if ( empty( $notify_email ) ) {
		return;
	}

	$subject = sprintf(
		/* translators: %s: lead name */
		__( 'New Mobiris Lead: %s', 'mobiris-v2' ),
		$name
	);

	$admin_url = admin_url( 'post.php?post=' . $post_id . '&action=edit' );

	$stage_labels = array(
		'running'   => 'Business is running',
		'starting'  => 'Starting a new business',
		'investing' => 'Investing in vehicles',
	);

	$body  = "A new lead has been submitted on mobiris.ng:\n\n";
	$body .= "Name:      " . $name . "\n";
	$body .= "Phone:     " . $phone . "\n";
	$body .= "Email:     " . ( $email ?: 'Not provided' ) . "\n";
	$body .= "Vehicles:  " . ( $vehicles ? $vehicles : 'Not specified' ) . "\n";
	$body .= "Stage:     " . ( isset( $stage_labels[ $stage ] ) ? $stage_labels[ $stage ] : 'Not specified' ) . "\n\n";
	$body .= "View in admin: " . $admin_url . "\n\n";
	$body .= "Quick WhatsApp: https://wa.me/" . preg_replace( '/\D/', '', $phone ) . "\n";

	wp_mail( $notify_email, $subject, $body );
}

/**
 * Get client IP address.
 *
 * @return string
 */
function mv2_get_client_ip() {
	$ip_keys = array( 'HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR' );
	foreach ( $ip_keys as $key ) {
		if ( ! empty( $_SERVER[ $key ] ) ) {
			$ip = sanitize_text_field( wp_unslash( $_SERVER[ $key ] ) );
			// Take first IP if comma-separated.
			$ip = explode( ',', $ip )[0];
			$ip = trim( $ip );
			if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) {
				return $ip;
			}
		}
	}
	return '';
}
