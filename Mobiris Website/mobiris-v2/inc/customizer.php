<?php
/**
 * Theme Customizer settings.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register customizer settings, sections, and controls.
 *
 * @param WP_Customize_Manager $wp_customize Customizer object.
 */
function mv2_customizer_register( $wp_customize ) {

	// -------------------------------------------------------------------------
	// Panel: Mobiris V2 Settings
	// -------------------------------------------------------------------------
	$wp_customize->add_panel(
		'mv2_panel',
		array(
			'title'    => __( 'Mobiris V2 Settings', 'mobiris-v2' ),
			'priority' => 30,
		)
	);

	// =========================================================================
	// SECTION: Contact & WhatsApp
	// =========================================================================
	$wp_customize->add_section(
		'mv2_contact',
		array(
			'title'    => __( 'Contact & WhatsApp', 'mobiris-v2' ),
			'panel'    => 'mv2_panel',
			'priority' => 10,
		)
	);

	// WhatsApp number.
	$wp_customize->add_setting(
		'mv2_whatsapp_number',
		array(
			'default'           => '2348053108039',
			'sanitize_callback' => 'mv2_sanitize_digits',
			'transport'         => 'postMessage',
		)
	);
	$wp_customize->add_control(
		'mv2_whatsapp_number',
		array(
			'label'       => __( 'WhatsApp Number (digits only, with country code)', 'mobiris-v2' ),
			'description' => __( 'E.g. 2348053108039 — no plus sign, no spaces.', 'mobiris-v2' ),
			'section'     => 'mv2_contact',
			'type'        => 'text',
		)
	);

	// Lead notification email.
	$wp_customize->add_setting(
		'mv2_lead_notify_email',
		array(
			'default'           => 'hello@mobiris.ng',
			'sanitize_callback' => 'sanitize_email',
			'transport'         => 'refresh',
		)
	);
	$wp_customize->add_control(
		'mv2_lead_notify_email',
		array(
			'label'   => __( 'Lead Notification Email', 'mobiris-v2' ),
			'section' => 'mv2_contact',
			'type'    => 'email',
		)
	);

	// App URL.
	$wp_customize->add_setting(
		'mv2_app_url',
		array(
			'default'           => 'https://app.mobiris.ng/signup',
			'sanitize_callback' => 'esc_url_raw',
			'transport'         => 'postMessage',
		)
	);
	$wp_customize->add_control(
		'mv2_app_url',
		array(
			'label'   => __( 'App Signup URL', 'mobiris-v2' ),
			'section' => 'mv2_contact',
			'type'    => 'url',
		)
	);

	// iOS App Store URL.
	$wp_customize->add_setting(
		'mv2_ios_url',
		array(
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
			'transport'         => 'postMessage',
		)
	);
	$wp_customize->add_control(
		'mv2_ios_url',
		array(
			'label'       => __( 'iOS App Store URL', 'mobiris-v2' ),
			'description' => __( 'Leave empty to show "Coming soon" badge.', 'mobiris-v2' ),
			'section'     => 'mv2_contact',
			'type'        => 'url',
		)
	);

	// Android Play Store URL.
	$wp_customize->add_setting(
		'mv2_android_url',
		array(
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
			'transport'         => 'postMessage',
		)
	);
	$wp_customize->add_control(
		'mv2_android_url',
		array(
			'label'       => __( 'Android Play Store URL', 'mobiris-v2' ),
			'description' => __( 'Leave empty to show "Coming soon" badge.', 'mobiris-v2' ),
			'section'     => 'mv2_contact',
			'type'        => 'url',
		)
	);

	// =========================================================================
	// SECTION: WhatsApp Messages
	// =========================================================================
	$wp_customize->add_section(
		'mv2_wa_messages',
		array(
			'title'    => __( 'WhatsApp Pre-filled Messages', 'mobiris-v2' ),
			'panel'    => 'mv2_panel',
			'priority' => 20,
		)
	);

	$wa_messages = array(
		'wa_msg_operators' => array(
			'label'   => __( 'Operators Message', 'mobiris-v2' ),
			'default' => 'I want to reduce leakage in my transport business',
		),
		'wa_msg_starters'  => array(
			'label'   => __( 'Starters Message', 'mobiris-v2' ),
			'default' => 'I want to start a keke business properly',
		),
		'wa_msg_investors' => array(
			'label'   => __( 'Investors Message', 'mobiris-v2' ),
			'default' => 'I want to see how Mobiris works for investors',
		),
	);

	foreach ( $wa_messages as $key => $data ) {
		$wp_customize->add_setting(
			'mv2_' . $key,
			array(
				'default'           => $data['default'],
				'sanitize_callback' => 'sanitize_text_field',
				'transport'         => 'postMessage',
			)
		);
		$wp_customize->add_control(
			'mv2_' . $key,
			array(
				'label'   => $data['label'],
				'section' => 'mv2_wa_messages',
				'type'    => 'text',
			)
		);
	}

	// =========================================================================
	// SECTION: Pricing
	// =========================================================================
	$wp_customize->add_section(
		'mv2_pricing',
		array(
			'title'    => __( 'Pricing', 'mobiris-v2' ),
			'panel'    => 'mv2_panel',
			'priority' => 30,
		)
	);

	$pricing_fields = array(
		'price_starter'             => array( 'label' => __( 'Starter Plan (₦/month)', 'mobiris-v2' ),       'default' => '15000' ),
		'price_starter_vehicles'    => array( 'label' => __( 'Starter — Max Vehicles', 'mobiris-v2' ),        'default' => '10' ),
		'price_growth'              => array( 'label' => __( 'Growth Plan (₦/month)', 'mobiris-v2' ),         'default' => '35000' ),
		'price_growth_vehicles'     => array( 'label' => __( 'Growth — Min Vehicles', 'mobiris-v2' ),         'default' => '20' ),
		'price_verification'        => array( 'label' => __( 'Verification Fee (₦/check)', 'mobiris-v2' ),    'default' => '1000' ),
		'price_trial_days'          => array( 'label' => __( 'Free Trial Days', 'mobiris-v2' ),               'default' => '14' ),
	);

	foreach ( $pricing_fields as $key => $data ) {
		$wp_customize->add_setting(
			'mv2_' . $key,
			array(
				'default'           => $data['default'],
				'sanitize_callback' => 'absint',
				'transport'         => 'postMessage',
			)
		);
		$wp_customize->add_control(
			'mv2_' . $key,
			array(
				'label'   => $data['label'],
				'section' => 'mv2_pricing',
				'type'    => 'number',
			)
		);
	}

	// =========================================================================
	// SECTION: Hero Content
	// =========================================================================
	$wp_customize->add_section(
		'mv2_hero',
		array(
			'title'    => __( 'Hero Section', 'mobiris-v2' ),
			'panel'    => 'mv2_panel',
			'priority' => 40,
		)
	);

	$wp_customize->add_setting(
		'mv2_hero_headline_en',
		array(
			'default'           => "Driver say 'today slow'... but your money no add up.",
			'sanitize_callback' => 'sanitize_text_field',
			'transport'         => 'postMessage',
		)
	);
	$wp_customize->add_control(
		'mv2_hero_headline_en',
		array(
			'label'   => __( 'Hero Headline (English)', 'mobiris-v2' ),
			'section' => 'mv2_hero',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'mv2_hero_headline_fr',
		array(
			'default'           => "Le chauffeur dit 'aujourd'hui c'est calme'... mais votre argent ne correspond pas.",
			'sanitize_callback' => 'sanitize_text_field',
			'transport'         => 'postMessage',
		)
	);
	$wp_customize->add_control(
		'mv2_hero_headline_fr',
		array(
			'label'   => __( 'Hero Headline (French)', 'mobiris-v2' ),
			'section' => 'mv2_hero',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'mv2_hero_cta1_text',
		array(
			'default'           => 'Start Free — 14 Days',
			'sanitize_callback' => 'sanitize_text_field',
			'transport'         => 'postMessage',
		)
	);
	$wp_customize->add_control(
		'mv2_hero_cta1_text',
		array(
			'label'   => __( 'Hero CTA 1 Text', 'mobiris-v2' ),
			'section' => 'mv2_hero',
			'type'    => 'text',
		)
	);

	// =========================================================================
	// SECTION: Section Visibility
	// =========================================================================
	$wp_customize->add_section(
		'mv2_visibility',
		array(
			'title'    => __( 'Section Visibility', 'mobiris-v2' ),
			'panel'    => 'mv2_panel',
			'priority' => 50,
		)
	);

	$sections = array(
		'show_profit_opportunity' => __( 'Show Profit Opportunity Section', 'mobiris-v2' ),
		'show_leakage_exposure'   => __( 'Show Leakage Exposure Section', 'mobiris-v2' ),
		'show_pain_amplification' => __( 'Show Pain Amplification Section', 'mobiris-v2' ),
		'show_product_intro'      => __( 'Show Product Intro Section', 'mobiris-v2' ),
		'show_how_it_works'       => __( 'Show How It Works Section', 'mobiris-v2' ),
		'show_before_after'       => __( 'Show Before/After Section', 'mobiris-v2' ),
		'show_calculator'         => __( 'Show Calculator Section', 'mobiris-v2' ),
		'show_use_cases'          => __( 'Show Use Cases Section', 'mobiris-v2' ),
		'show_lead_capture'       => __( 'Show Lead Capture Section', 'mobiris-v2' ),
		'show_whatsapp_cta'       => __( 'Show WhatsApp CTA Section', 'mobiris-v2' ),
		'show_pricing'            => __( 'Show Pricing Section', 'mobiris-v2' ),
		'show_final_cta'          => __( 'Show Final CTA Section', 'mobiris-v2' ),
	);

	foreach ( $sections as $key => $label ) {
		$wp_customize->add_setting(
			'mv2_' . $key,
			array(
				'default'           => true,
				'sanitize_callback' => 'mv2_sanitize_checkbox',
				'transport'         => 'postMessage',
			)
		);
		$wp_customize->add_control(
			'mv2_' . $key,
			array(
				'label'   => $label,
				'section' => 'mv2_visibility',
				'type'    => 'checkbox',
			)
		);
	}

	// =========================================================================
	// SECTION: Brand
	// =========================================================================
	$wp_customize->add_section(
		'mv2_brand',
		array(
			'title'    => __( 'Brand & Identity', 'mobiris-v2' ),
			'panel'    => 'mv2_panel',
			'priority' => 60,
		)
	);

	$wp_customize->add_setting(
		'mv2_company_name',
		array(
			'default'           => 'Mobiris',
			'sanitize_callback' => 'sanitize_text_field',
			'transport'         => 'postMessage',
		)
	);
	$wp_customize->add_control(
		'mv2_company_name',
		array(
			'label'   => __( 'Company Name', 'mobiris-v2' ),
			'section' => 'mv2_brand',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'mv2_tagline',
		array(
			'default'           => 'Mobility Risk Infrastructure',
			'sanitize_callback' => 'sanitize_text_field',
			'transport'         => 'postMessage',
		)
	);
	$wp_customize->add_control(
		'mv2_tagline',
		array(
			'label'   => __( 'Tagline', 'mobiris-v2' ),
			'section' => 'mv2_brand',
			'type'    => 'text',
		)
	);
}
add_action( 'customize_register', 'mv2_customizer_register' );

/**
 * Sanitize digits-only field.
 *
 * @param string $value Input value.
 * @return string
 */
function mv2_sanitize_digits( $value ) {
	return preg_replace( '/\D/', '', $value );
}

/**
 * Sanitize checkbox value.
 *
 * @param mixed $value Checkbox value.
 * @return bool
 */
function mv2_sanitize_checkbox( $value ) {
	return (bool) $value;
}
