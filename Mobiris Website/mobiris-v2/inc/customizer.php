<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function mv2_customizer( $wp_customize ) {

	// ── PANEL: Mobiris V2 Settings ─────────────────────────────────────
	$wp_customize->add_panel( 'mv2_panel', array(
		'title'    => __( 'Mobiris V2 Settings', 'mobiris-v2' ),
		'priority' => 30,
	) );

	// ── SECTION: Brand ──────────────────────────────────────────────────
	$wp_customize->add_section( 'mv2_brand', array(
		'title' => __( 'Brand & Contact', 'mobiris-v2' ),
		'panel' => 'mv2_panel',
	) );
	$brand_fields = array(
		'mv2_company_name'  => array( 'label' => 'Company Name',          'default' => 'Mobiris' ),
		'mv2_tagline'       => array( 'label' => 'Brand Tagline',          'default' => 'Mobility Risk Infrastructure' ),
		'mv2_whatsapp'      => array( 'label' => 'WhatsApp Number (digits only)', 'default' => '2348053108039' ),
		'mv2_notify_email'  => array( 'label' => 'Lead notification email','default' => 'hello@mobiris.ng' ),
		'mv2_signup_url'    => array( 'label' => 'App Signup URL',         'default' => 'https://app.mobiris.ng/signup' ),
		'mv2_login_url'     => array( 'label' => 'App Login URL',          'default' => 'https://app.mobiris.ng/login' ),
		'mv2_ios_url'       => array( 'label' => 'iOS App Store URL (leave blank = coming soon)', 'default' => '' ),
		'mv2_android_url'   => array( 'label' => 'Android Play Store URL (leave blank = coming soon)', 'default' => '' ),
	);
	foreach ( $brand_fields as $key => $args ) {
		$wp_customize->add_setting( $key, array( 'default' => $args['default'], 'sanitize_callback' => 'sanitize_text_field', 'transport' => 'postMessage' ) );
		$wp_customize->add_control( $key, array( 'label' => $args['label'], 'section' => 'mv2_brand', 'type' => 'text' ) );
	}

	// ── SECTION: WhatsApp Messages ───────────────────────────────────────
	$wp_customize->add_section( 'mv2_whatsapp_msgs', array(
		'title' => __( 'WhatsApp Pre-filled Messages', 'mobiris-v2' ),
		'panel' => 'mv2_panel',
	) );
	$wa_fields = array(
		'mv2_wa_msg_operator' => array( 'label' => 'Operators message',  'default' => 'I want to reduce leakage in my transport business' ),
		'mv2_wa_msg_starter'  => array( 'label' => 'Starters message',   'default' => 'I want to start a keke business properly' ),
		'mv2_wa_msg_investor' => array( 'label' => 'Investors message',  'default' => 'I want to see how Mobiris works for investors' ),
	);
	foreach ( $wa_fields as $key => $args ) {
		$wp_customize->add_setting( $key, array( 'default' => $args['default'], 'sanitize_callback' => 'sanitize_text_field' ) );
		$wp_customize->add_control( $key, array( 'label' => $args['label'], 'section' => 'mv2_whatsapp_msgs', 'type' => 'text' ) );
	}

	// ── SECTION: Pricing ─────────────────────────────────────────────────
	$wp_customize->add_section( 'mv2_pricing', array(
		'title' => __( 'Pricing', 'mobiris-v2' ),
		'panel' => 'mv2_panel',
	) );
	$pricing_fields = array(
		'mv2_price_starter'    => array( 'label' => 'Starter plan price',    'default' => '₦15,000/month' ),
		'mv2_price_growth'     => array( 'label' => 'Growth plan price',     'default' => '₦35,000/month' ),
		'mv2_price_enterprise' => array( 'label' => 'Enterprise plan label', 'default' => 'Custom' ),
		'mv2_price_verify'     => array( 'label' => 'Verification fee',      'default' => '₦1,000/check' ),
	);
	foreach ( $pricing_fields as $key => $args ) {
		$wp_customize->add_setting( $key, array( 'default' => $args['default'], 'sanitize_callback' => 'sanitize_text_field' ) );
		$wp_customize->add_control( $key, array( 'label' => $args['label'], 'section' => 'mv2_pricing', 'type' => 'text' ) );
	}

	// ── SECTION: Hero ─────────────────────────────────────────────────
	$wp_customize->add_section( 'mv2_hero', array(
		'title' => __( 'Homepage Hero', 'mobiris-v2' ),
		'panel' => 'mv2_panel',
	) );
	$hero_fields = array(
		'mv2_hero_h1_en'      => array( 'label' => 'Hero H1 (English)',   'default' => "Driver say 'today slow'...\nbut your money no add up." ),
		'mv2_hero_h1_fr'      => array( 'label' => 'Hero H1 (French)',    'default' => "Le chauffeur dit 'aujourd'hui c'est calme'...\nmais votre argent ne correspond pas." ),
		'mv2_hero_sub_en'     => array( 'label' => 'Hero Subheading (EN)','default' => 'Mobiris gives transport operators visibility, control, and accountability — from driver verification to daily remittance.' ),
		'mv2_hero_sub_fr'     => array( 'label' => 'Hero Subheading (FR)','default' => 'Mobiris donne aux opérateurs de transport visibilité, contrôle et responsabilité — de la vérification des conducteurs au suivi quotidien.' ),
		'mv2_hero_cta_en'     => array( 'label' => 'Hero CTA (EN)',       'default' => 'Start Free — 14 Days' ),
		'mv2_hero_cta_fr'     => array( 'label' => 'Hero CTA (FR)',       'default' => 'Commencer Gratuitement — 14 Jours' ),
	);
	foreach ( $hero_fields as $key => $args ) {
		$wp_customize->add_setting( $key, array( 'default' => $args['default'], 'sanitize_callback' => 'sanitize_textarea_field' ) );
		$type = strpos( $key, '_sub_' ) !== false ? 'textarea' : 'text';
		$wp_customize->add_control( $key, array( 'label' => $args['label'], 'section' => 'mv2_hero', 'type' => $type ) );
	}

	// ── SECTION: Section Visibility ──────────────────────────────────────
	$wp_customize->add_section( 'mv2_visibility', array(
		'title' => __( 'Section Visibility', 'mobiris-v2' ),
		'panel' => 'mv2_panel',
	) );
	$vis_fields = array(
		'mv2_show_profit_opp'  => 'Show: Profit Opportunity',
		'mv2_show_leakage'     => 'Show: Leakage Exposure',
		'mv2_show_pain'        => 'Show: Pain Amplification',
		'mv2_show_before_after'=> 'Show: Before vs After',
		'mv2_show_calculator'  => 'Show: Calculator',
		'mv2_show_use_cases'   => 'Show: Use Case Scenarios',
		'mv2_show_pricing'     => 'Show: Pricing on Homepage',
		'mv2_show_blog_preview'=> 'Show: Blog Preview',
	);
	foreach ( $vis_fields as $key => $label ) {
		$wp_customize->add_setting( $key, array( 'default' => '1', 'sanitize_callback' => 'absint' ) );
		$wp_customize->add_control( $key, array( 'label' => $label, 'section' => 'mv2_visibility', 'type' => 'checkbox' ) );
	}
}
add_action( 'customize_register', 'mv2_customizer' );

// Helper
function mv2_opt( $key, $fallback = '' ) {
	return get_theme_mod( $key, $fallback );
}

function mv2_wa_url( $msg_key ) {
	$num = mv2_opt( 'mv2_whatsapp', '2348053108039' );
	$msg = mv2_opt( $msg_key, 'I want to learn about Mobiris' );
	return 'https://wa.me/' . rawurlencode( $num ) . '?text=' . rawurlencode( $msg );
}

function mv2_signup_url() {
	return esc_url( mv2_opt( 'mv2_signup_url', 'https://app.mobiris.ng/signup' ) );
}
