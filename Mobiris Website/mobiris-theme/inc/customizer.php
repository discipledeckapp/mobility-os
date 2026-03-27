<?php
/**
 * Mobiris Theme Customizer
 *
 * @package Mobiris
 * @since 1.0.0
 *
 * Complete WordPress Customizer settings for Mobiris fleet operations theme.
 * Handles company info, contact, social, header/footer, homepage sections, and app links.
 */

// Security check.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sanitize callback: text field
 *
 * @param string $input User input.
 * @return string Sanitized text.
 */
function mobiris_sanitize_text( $input ) {
	return sanitize_text_field( $input );
}

/**
 * Sanitize callback: textarea (allows safe HTML)
 *
 * @param string $input User input.
 * @return string Sanitized HTML.
 */
function mobiris_sanitize_textarea( $input ) {
	return wp_kses_post( $input );
}

/**
 * Sanitize callback: URL
 *
 * @param string $input User input.
 * @return string Sanitized URL.
 */
function mobiris_sanitize_url( $input ) {
	return esc_url_raw( $input );
}

/**
 * Sanitize callback: checkbox
 *
 * @param bool|string $input User input.
 * @return string '1' if checked, '' if not.
 */
function mobiris_sanitize_checkbox( $input ) {
	return ( isset( $input ) && $input ) ? '1' : '';
}

/**
 * Sanitize callback: select with choices validation
 *
 * @param string                $input   User input.
 * @param WP_Customize_Setting  $setting Setting object.
 * @return string Valid choice or default.
 */
function mobiris_sanitize_select( $input, $setting ) {
	// Get the setting's control to access choices.
	global $wp_customize;
	$control = $wp_customize->get_control( $setting->id );

	if ( ! $control || ! isset( $control->choices ) ) {
		return $setting->default;
	}

	// Validate input against allowed choices.
	if ( array_key_exists( $input, $control->choices ) ) {
		return $input;
	}

	return $setting->default;
}

/**
 * Sanitize callback: number
 *
 * @param int|string $input User input.
 * @return int Sanitized integer.
 */
function mobiris_sanitize_number( $input ) {
	return absint( $input );
}

/**
 * Register Customizer panels, sections, settings, and controls.
 *
 * @param WP_Customize_Manager $wp_customize Customizer manager instance.
 */
function mobiris_customize_register( $wp_customize ) {

	// =============================
	// MAIN PANEL: Mobiris Options
	// =============================

	$wp_customize->add_panel(
		'mobiris_options',
		array(
			'title'       => esc_html__( 'Mobiris Theme Settings', 'mobiris' ),
			'description' => esc_html__( 'Configure branding, contact info, links, and homepage sections for Mobiris.', 'mobiris' ),
			'priority'    => 10,
		)
	);

	// =============================
	// SECTION 1: Company Information
	// =============================

	$wp_customize->add_section(
		'mobiris_company',
		array(
			'title'    => esc_html__( 'Company Information', 'mobiris' ),
			'panel'    => 'mobiris_options',
			'priority' => 10,
		)
	);

	// Setting: Company Name
	$wp_customize->add_setting(
		'mobiris_company_name',
		array(
			'default'           => 'Mobiris',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_company_name',
		array(
			'label'    => esc_html__( 'Company Name', 'mobiris' ),
			'section'  => 'mobiris_company',
			'type'     => 'text',
			'priority' => 10,
		)
	);

	// Setting: Company Tagline
	$wp_customize->add_setting(
		'mobiris_company_tagline',
		array(
			'default'           => 'Fleet operations platform for Africa',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_company_tagline',
		array(
			'label'    => esc_html__( 'Company Tagline', 'mobiris' ),
			'section'  => 'mobiris_company',
			'type'     => 'text',
			'priority' => 20,
		)
	);

	// Setting: Logo Dark Background
	$wp_customize->add_setting(
		'mobiris_logo_dark',
		array(
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'mobiris_logo_dark',
			array(
				'label'       => esc_html__( 'Logo (Dark Background)', 'mobiris' ),
				'section'     => 'mobiris_company',
				'priority'    => 30,
				'mime_type'   => 'image',
			)
		)
	);

	// Setting: Logo Light Background
	$wp_customize->add_setting(
		'mobiris_logo_light',
		array(
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'mobiris_logo_light',
			array(
				'label'       => esc_html__( 'Logo (Light Background)', 'mobiris' ),
				'section'     => 'mobiris_company',
				'priority'    => 40,
				'mime_type'   => 'image',
			)
		)
	);

	// Setting: Favicon
	$wp_customize->add_setting(
		'mobiris_favicon',
		array(
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'mobiris_favicon',
			array(
				'label'       => esc_html__( 'Favicon (32×32 PNG or ICO)', 'mobiris' ),
				'section'     => 'mobiris_company',
				'priority'    => 50,
				'mime_type'   => 'image',
			)
		)
	);

	// =============================
	// SECTION 2: Contact & Communication
	// =============================

	$wp_customize->add_section(
		'mobiris_contact',
		array(
			'title'    => esc_html__( 'Contact & Communication', 'mobiris' ),
			'panel'    => 'mobiris_options',
			'priority' => 20,
		)
	);

	// Setting: Primary Email
	$wp_customize->add_setting(
		'mobiris_email',
		array(
			'default'           => 'hello@mobiris.ng',
			'transport'         => 'option',
			'sanitize_callback' => 'sanitize_email',
		)
	);

	$wp_customize->add_control(
		'mobiris_email',
		array(
			'label'    => esc_html__( 'Primary Email', 'mobiris' ),
			'section'  => 'mobiris_contact',
			'type'     => 'email',
			'priority' => 10,
		)
	);

	// Setting: Support Email
	$wp_customize->add_setting(
		'mobiris_support_email',
		array(
			'default'           => 'support@mobiris.ng',
			'transport'         => 'option',
			'sanitize_callback' => 'sanitize_email',
		)
	);

	$wp_customize->add_control(
		'mobiris_support_email',
		array(
			'label'    => esc_html__( 'Support Email', 'mobiris' ),
			'section'  => 'mobiris_contact',
			'type'     => 'email',
			'priority' => 20,
		)
	);

	// Setting: Phone Number
	$wp_customize->add_setting(
		'mobiris_phone',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_phone',
		array(
			'label'    => esc_html__( 'Phone Number', 'mobiris' ),
			'section'  => 'mobiris_contact',
			'type'     => 'tel',
			'priority' => 30,
		)
	);

	// Setting: WhatsApp Number
	$wp_customize->add_setting(
		'mobiris_whatsapp',
		array(
			'default'           => '+2348053108039',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_whatsapp',
		array(
			'label'    => esc_html__( 'WhatsApp Number', 'mobiris' ),
			'section'  => 'mobiris_contact',
			'type'     => 'tel',
			'priority' => 40,
		)
	);

	// Setting: Address Line 1
	$wp_customize->add_setting(
		'mobiris_address_line_1',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_address_line_1',
		array(
			'label'    => esc_html__( 'Address Line 1', 'mobiris' ),
			'section'  => 'mobiris_contact',
			'type'     => 'text',
			'priority' => 50,
		)
	);

	// Setting: Address Line 2
	$wp_customize->add_setting(
		'mobiris_address_line_2',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_address_line_2',
		array(
			'label'    => esc_html__( 'Address Line 2', 'mobiris' ),
			'section'  => 'mobiris_contact',
			'type'     => 'text',
			'priority' => 60,
		)
	);

	// Setting: City
	$wp_customize->add_setting(
		'mobiris_city',
		array(
			'default'           => 'Lagos',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_city',
		array(
			'label'    => esc_html__( 'City', 'mobiris' ),
			'section'  => 'mobiris_contact',
			'type'     => 'text',
			'priority' => 70,
		)
	);

	// Setting: Country
	$wp_customize->add_setting(
		'mobiris_country',
		array(
			'default'           => 'Nigeria',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_country',
		array(
			'label'    => esc_html__( 'Country', 'mobiris' ),
			'section'  => 'mobiris_contact',
			'type'     => 'text',
			'priority' => 80,
		)
	);

	// =============================
	// SECTION 3: Social Media Links
	// =============================

	$wp_customize->add_section(
		'mobiris_social',
		array(
			'title'    => esc_html__( 'Social Media Links', 'mobiris' ),
			'panel'    => 'mobiris_options',
			'priority' => 30,
		)
	);

	// Setting: Twitter / X URL
	$wp_customize->add_setting(
		'mobiris_twitter_url',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_twitter_url',
		array(
			'label'    => esc_html__( 'Twitter / X URL', 'mobiris' ),
			'section'  => 'mobiris_social',
			'type'     => 'url',
			'priority' => 10,
		)
	);

	// Setting: LinkedIn URL
	$wp_customize->add_setting(
		'mobiris_linkedin_url',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_linkedin_url',
		array(
			'label'    => esc_html__( 'LinkedIn URL', 'mobiris' ),
			'section'  => 'mobiris_social',
			'type'     => 'url',
			'priority' => 20,
		)
	);

	// Setting: Facebook URL
	$wp_customize->add_setting(
		'mobiris_facebook_url',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_facebook_url',
		array(
			'label'    => esc_html__( 'Facebook URL', 'mobiris' ),
			'section'  => 'mobiris_social',
			'type'     => 'url',
			'priority' => 30,
		)
	);

	// Setting: Instagram URL
	$wp_customize->add_setting(
		'mobiris_instagram_url',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_instagram_url',
		array(
			'label'    => esc_html__( 'Instagram URL', 'mobiris' ),
			'section'  => 'mobiris_social',
			'type'     => 'url',
			'priority' => 40,
		)
	);

	// Setting: YouTube URL
	$wp_customize->add_setting(
		'mobiris_youtube_url',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_youtube_url',
		array(
			'label'    => esc_html__( 'YouTube URL', 'mobiris' ),
			'section'  => 'mobiris_social',
			'type'     => 'url',
			'priority' => 50,
		)
	);

	// =============================
	// SECTION 4: App & Platform Links
	// =============================

	$wp_customize->add_section(
		'mobiris_app_links',
		array(
			'title'    => esc_html__( 'App & Platform Links', 'mobiris' ),
			'panel'    => 'mobiris_options',
			'priority' => 40,
		)
	);

	// Setting: Web App URL
	$wp_customize->add_setting(
		'mobiris_web_app_url',
		array(
			'default'           => 'https://app.mobiris.ng',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_web_app_url',
		array(
			'label'    => esc_html__( 'Web App URL', 'mobiris' ),
			'section'  => 'mobiris_app_links',
			'type'     => 'url',
			'priority' => 10,
		)
	);

	// Setting: Login URL
	$wp_customize->add_setting(
		'mobiris_login_url',
		array(
			'default'           => 'https://app.mobiris.ng/login',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_login_url',
		array(
			'label'    => esc_html__( 'Login URL', 'mobiris' ),
			'section'  => 'mobiris_app_links',
			'type'     => 'url',
			'priority' => 20,
		)
	);

	// Setting: Sign Up / Get Started URL
	$wp_customize->add_setting(
		'mobiris_signup_url',
		array(
			'default'           => 'https://app.mobiris.ng/signup',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_signup_url',
		array(
			'label'       => esc_html__( 'Sign Up / Get Started URL', 'mobiris' ),
			'description' => esc_html__( 'Where "Get Started" buttons link', 'mobiris' ),
			'section'     => 'mobiris_app_links',
			'type'        => 'url',
			'priority'    => 30,
		)
	);

	// Setting: iOS App Store URL
	$wp_customize->add_setting(
		'mobiris_ios_app_url',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_ios_app_url',
		array(
			'label'       => esc_html__( 'iOS App Store URL', 'mobiris' ),
			'description' => esc_html__( 'Leave blank if app not yet published (placeholder will be shown)', 'mobiris' ),
			'section'     => 'mobiris_app_links',
			'type'        => 'url',
			'priority'    => 40,
		)
	);

	// Setting: Android App URL (Google Play)
	$wp_customize->add_setting(
		'mobiris_android_app_url',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_android_app_url',
		array(
			'label'       => esc_html__( 'Google Play Store URL', 'mobiris' ),
			'description' => esc_html__( 'Leave blank if app not yet published', 'mobiris' ),
			'section'     => 'mobiris_app_links',
			'type'        => 'url',
			'priority'    => 50,
		)
	);

	// Setting: Demo URL
	$wp_customize->add_setting(
		'mobiris_demo_url',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_demo_url',
		array(
			'label'       => esc_html__( 'Book a Demo URL', 'mobiris' ),
			'description' => esc_html__( 'Calendly or booking link for demo requests', 'mobiris' ),
			'section'     => 'mobiris_app_links',
			'type'        => 'url',
			'priority'    => 60,
		)
	);

	// =============================
	// SECTION 5: Header & Navigation
	// =============================

	$wp_customize->add_section(
		'mobiris_header',
		array(
			'title'    => esc_html__( 'Header & Navigation', 'mobiris' ),
			'panel'    => 'mobiris_options',
			'priority' => 50,
		)
	);

	// Setting: Header CTA Label
	$wp_customize->add_setting(
		'mobiris_header_cta_label',
		array(
			'default'           => 'Get Started',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_header_cta_label',
		array(
			'label'    => esc_html__( 'Header CTA Label', 'mobiris' ),
			'section'  => 'mobiris_header',
			'type'     => 'text',
			'priority' => 10,
		)
	);

	// Setting: Header CTA URL
	$wp_customize->add_setting(
		'mobiris_header_cta_url',
		array(
			'default'           => 'https://app.mobiris.ng/signup',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_header_cta_url',
		array(
			'label'    => esc_html__( 'Header CTA URL', 'mobiris' ),
			'section'  => 'mobiris_header',
			'type'     => 'url',
			'priority' => 20,
		)
	);

	// Setting: Login Button Label
	$wp_customize->add_setting(
		'mobiris_header_login_label',
		array(
			'default'           => 'Log In',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_header_login_label',
		array(
			'label'    => esc_html__( 'Login Button Label', 'mobiris' ),
			'section'  => 'mobiris_header',
			'type'     => 'text',
			'priority' => 30,
		)
	);

	// Setting: Login URL
	$wp_customize->add_setting(
		'mobiris_header_login_url',
		array(
			'default'           => 'https://app.mobiris.ng/login',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_header_login_url',
		array(
			'label'    => esc_html__( 'Login URL', 'mobiris' ),
			'section'  => 'mobiris_header',
			'type'     => 'url',
			'priority' => 40,
		)
	);

	// Setting: Header Announcement Bar Text
	$wp_customize->add_setting(
		'mobiris_header_announcement',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_header_announcement',
		array(
			'label'       => esc_html__( 'Header Announcement Bar Text', 'mobiris' ),
			'description' => esc_html__( 'Show a slim announcement above the nav. Leave blank to hide.', 'mobiris' ),
			'section'     => 'mobiris_header',
			'type'        => 'text',
			'priority'    => 50,
		)
	);

	// Setting: Announcement Link URL
	$wp_customize->add_setting(
		'mobiris_header_announcement_url',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_header_announcement_url',
		array(
			'label'    => esc_html__( 'Announcement Link URL', 'mobiris' ),
			'section'  => 'mobiris_header',
			'type'     => 'url',
			'priority' => 60,
		)
	);

	// Setting: Header Style
	$wp_customize->add_setting(
		'mobiris_header_style',
		array(
			'default'           => 'light',
			'transport'         => 'option',
			'sanitize_callback' => array( 'mobiris_sanitize_select' ),
		)
	);

	$wp_customize->add_control(
		'mobiris_header_style',
		array(
			'label'    => esc_html__( 'Header Style', 'mobiris' ),
			'section'  => 'mobiris_header',
			'type'     => 'select',
			'choices'  => array(
				'light'       => esc_html__( 'Light (white bg)', 'mobiris' ),
				'dark'        => esc_html__( 'Dark (navy bg)', 'mobiris' ),
				'transparent' => esc_html__( 'Transparent (hero overlay)', 'mobiris' ),
			),
			'priority' => 70,
		)
	);

	// =============================
	// SECTION 6: Footer
	// =============================

	$wp_customize->add_section(
		'mobiris_footer',
		array(
			'title'    => esc_html__( 'Footer', 'mobiris' ),
			'panel'    => 'mobiris_options',
			'priority' => 60,
		)
	);

	// Setting: Footer Tagline
	$wp_customize->add_setting(
		'mobiris_footer_tagline',
		array(
			'default'           => 'Built for Africa\'s transport operators.',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_textarea',
		)
	);

	$wp_customize->add_control(
		'mobiris_footer_tagline',
		array(
			'label'    => esc_html__( 'Footer Tagline', 'mobiris' ),
			'section'  => 'mobiris_footer',
			'type'     => 'textarea',
			'priority' => 10,
		)
	);

	// Setting: Copyright Text
	$wp_customize->add_setting(
		'mobiris_footer_copyright',
		array(
			'default'           => '© 2025 Mobiris. All rights reserved.',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_footer_copyright',
		array(
			'label'    => esc_html__( 'Copyright Text', 'mobiris' ),
			'section'  => 'mobiris_footer',
			'type'     => 'text',
			'priority' => 20,
		)
	);

	// Setting: Show App Download Links
	$wp_customize->add_setting(
		'mobiris_footer_show_app_links',
		array(
			'default'           => '1',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_checkbox',
		)
	);

	$wp_customize->add_control(
		'mobiris_footer_show_app_links',
		array(
			'label'    => esc_html__( 'Show App Download Links in Footer', 'mobiris' ),
			'section'  => 'mobiris_footer',
			'type'     => 'checkbox',
			'priority' => 30,
		)
	);

	// Setting: Show Social Icons
	$wp_customize->add_setting(
		'mobiris_footer_show_social',
		array(
			'default'           => '1',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_checkbox',
		)
	);

	$wp_customize->add_control(
		'mobiris_footer_show_social',
		array(
			'label'    => esc_html__( 'Show Social Icons in Footer', 'mobiris' ),
			'section'  => 'mobiris_footer',
			'type'     => 'checkbox',
			'priority' => 40,
		)
	);

	// Setting: Show Newsletter Signup
	$wp_customize->add_setting(
		'mobiris_footer_show_newsletter',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_checkbox',
		)
	);

	$wp_customize->add_control(
		'mobiris_footer_show_newsletter',
		array(
			'label'    => esc_html__( 'Show Newsletter Signup in Footer', 'mobiris' ),
			'section'  => 'mobiris_footer',
			'type'     => 'checkbox',
			'priority' => 50,
		)
	);

	// Setting: Newsletter Label
	$wp_customize->add_setting(
		'mobiris_footer_newsletter_label',
		array(
			'default'           => 'Stay in the loop',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_footer_newsletter_label',
		array(
			'label'    => esc_html__( 'Newsletter Section Label', 'mobiris' ),
			'section'  => 'mobiris_footer',
			'type'     => 'text',
			'priority' => 60,
		)
	);

	// Setting: Newsletter Subtitle
	$wp_customize->add_setting(
		'mobiris_footer_newsletter_subtitle',
		array(
			'default'           => 'Fleet management insights for Africa\'s transport operators.',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_footer_newsletter_subtitle',
		array(
			'label'    => esc_html__( 'Newsletter Subtitle', 'mobiris' ),
			'section'  => 'mobiris_footer',
			'type'     => 'text',
			'priority' => 70,
		)
	);

	// =============================
	// SECTION 7: Hero Section
	// =============================

	$wp_customize->add_section(
		'mobiris_hero',
		array(
			'title'    => esc_html__( 'Homepage: Hero Section', 'mobiris' ),
			'panel'    => 'mobiris_options',
			'priority' => 70,
		)
	);

	// Setting: Hero Eyebrow
	$wp_customize->add_setting(
		'mobiris_hero_eyebrow',
		array(
			'default'           => 'Fleet Operations Platform',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_hero_eyebrow',
		array(
			'label'    => esc_html__( 'Hero Eyebrow Text', 'mobiris' ),
			'section'  => 'mobiris_hero',
			'type'     => 'text',
			'priority' => 10,
		)
	);

	// Setting: Hero Title
	$wp_customize->add_setting(
		'mobiris_hero_title',
		array(
			'default'           => 'Run your fleet with confidence',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_hero_title',
		array(
			'label'       => esc_html__( 'Hero Headline', 'mobiris' ),
			'description' => esc_html__( 'Main H1 headline. Keep under 8 words for impact.', 'mobiris' ),
			'section'     => 'mobiris_hero',
			'type'        => 'text',
			'priority'    => 20,
		)
	);

	// Setting: Hero Subtitle
	$wp_customize->add_setting(
		'mobiris_hero_subtitle',
		array(
			'default'           => 'Verify drivers, track remittance, and detect fraud across your fleet — with a cross-operator intelligence layer that no single operator can build alone.',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_textarea',
		)
	);

	$wp_customize->add_control(
		'mobiris_hero_subtitle',
		array(
			'label'    => esc_html__( 'Hero Subtitle', 'mobiris' ),
			'section'  => 'mobiris_hero',
			'type'     => 'textarea',
			'priority' => 30,
		)
	);

	// Setting: Hero Primary CTA Label
	$wp_customize->add_setting(
		'mobiris_hero_cta_primary_label',
		array(
			'default'           => 'Get Started Free',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_hero_cta_primary_label',
		array(
			'label'    => esc_html__( 'Primary CTA Label', 'mobiris' ),
			'section'  => 'mobiris_hero',
			'type'     => 'text',
			'priority' => 40,
		)
	);

	// Setting: Hero Primary CTA URL
	$wp_customize->add_setting(
		'mobiris_hero_cta_primary_url',
		array(
			'default'           => 'https://app.mobiris.ng/signup',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_hero_cta_primary_url',
		array(
			'label'    => esc_html__( 'Primary CTA URL', 'mobiris' ),
			'section'  => 'mobiris_hero',
			'type'     => 'url',
			'priority' => 50,
		)
	);

	// Setting: Hero Secondary CTA Label
	$wp_customize->add_setting(
		'mobiris_hero_cta_secondary_label',
		array(
			'default'           => 'Book a Demo',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_hero_cta_secondary_label',
		array(
			'label'    => esc_html__( 'Secondary CTA Label', 'mobiris' ),
			'section'  => 'mobiris_hero',
			'type'     => 'text',
			'priority' => 60,
		)
	);

	// Setting: Hero Secondary CTA URL
	$wp_customize->add_setting(
		'mobiris_hero_cta_secondary_url',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_hero_cta_secondary_url',
		array(
			'label'    => esc_html__( 'Secondary CTA URL', 'mobiris' ),
			'section'  => 'mobiris_hero',
			'type'     => 'url',
			'priority' => 70,
		)
	);

	// Setting: Hero Image
	$wp_customize->add_setting(
		'mobiris_hero_image',
		array(
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'mobiris_hero_image',
			array(
				'label'       => esc_html__( 'Hero Image or Dashboard Screenshot', 'mobiris' ),
				'section'     => 'mobiris_hero',
				'priority'    => 80,
				'mime_type'   => 'image',
			)
		)
	);

	// Setting: Hero Layout Style
	$wp_customize->add_setting(
		'mobiris_hero_style',
		array(
			'default'           => 'split',
			'transport'         => 'option',
			'sanitize_callback' => array( 'mobiris_sanitize_select' ),
		)
	);

	$wp_customize->add_control(
		'mobiris_hero_style',
		array(
			'label'    => esc_html__( 'Hero Layout Style', 'mobiris' ),
			'section'  => 'mobiris_hero',
			'type'     => 'select',
			'choices'  => array(
				'split'    => esc_html__( 'Split (text left, image right)', 'mobiris' ),
				'centered' => esc_html__( 'Centered (text centered, full width)', 'mobiris' ),
			),
			'priority' => 90,
		)
	);

	// Setting: Hero Show Social Proof
	$wp_customize->add_setting(
		'mobiris_hero_show_social_proof',
		array(
			'default'           => '1',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_checkbox',
		)
	);

	$wp_customize->add_control(
		'mobiris_hero_show_social_proof',
		array(
			'label'    => esc_html__( 'Show Social Proof Line', 'mobiris' ),
			'section'  => 'mobiris_hero',
			'type'     => 'checkbox',
			'priority' => 100,
		)
	);

	// Setting: Hero Social Proof Text
	$wp_customize->add_setting(
		'mobiris_hero_social_proof_text',
		array(
			'default'           => 'Trusted by transport operators across Nigeria, Ghana, and Kenya',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_hero_social_proof_text',
		array(
			'label'    => esc_html__( 'Social Proof Text', 'mobiris' ),
			'section'  => 'mobiris_hero',
			'type'     => 'text',
			'priority' => 110,
		)
	);

	// =============================
	// SECTION 8: Stats Bar
	// =============================

	$wp_customize->add_section(
		'mobiris_stats',
		array(
			'title'    => esc_html__( 'Homepage: Stats Bar', 'mobiris' ),
			'panel'    => 'mobiris_options',
			'priority' => 80,
		)
	);

	// Setting: Show Stats
	$wp_customize->add_setting(
		'mobiris_show_stats',
		array(
			'default'           => '1',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_checkbox',
		)
	);

	$wp_customize->add_control(
		'mobiris_show_stats',
		array(
			'label'    => esc_html__( 'Show Stats Section', 'mobiris' ),
			'section'  => 'mobiris_stats',
			'type'     => 'checkbox',
			'priority' => 10,
		)
	);

	// Setting: Stat 1 Value
	$wp_customize->add_setting(
		'mobiris_stat_1_value',
		array(
			'default'           => '₦7,500+',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_stat_1_value',
		array(
			'label'    => esc_html__( 'Stat 1 Value', 'mobiris' ),
			'section'  => 'mobiris_stats',
			'type'     => 'text',
			'priority' => 20,
		)
	);

	// Setting: Stat 1 Label
	$wp_customize->add_setting(
		'mobiris_stat_1_label',
		array(
			'default'           => 'Daily remittance per vehicle tracked',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_stat_1_label',
		array(
			'label'    => esc_html__( 'Stat 1 Label', 'mobiris' ),
			'section'  => 'mobiris_stats',
			'type'     => 'text',
			'priority' => 30,
		)
	);

	// Setting: Stat 2 Value
	$wp_customize->add_setting(
		'mobiris_stat_2_value',
		array(
			'default'           => '5M+',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_stat_2_value',
		array(
			'label'    => esc_html__( 'Stat 2 Value', 'mobiris' ),
			'section'  => 'mobiris_stats',
			'type'     => 'text',
			'priority' => 40,
		)
	);

	// Setting: Stat 2 Label
	$wp_customize->add_setting(
		'mobiris_stat_2_label',
		array(
			'default'           => 'Commercial vehicles in our markets',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_stat_2_label',
		array(
			'label'    => esc_html__( 'Stat 2 Label', 'mobiris' ),
			'section'  => 'mobiris_stats',
			'type'     => 'text',
			'priority' => 50,
		)
	);

	// Setting: Stat 3 Value
	$wp_customize->add_setting(
		'mobiris_stat_3_value',
		array(
			'default'           => '3',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_stat_3_value',
		array(
			'label'    => esc_html__( 'Stat 3 Value', 'mobiris' ),
			'section'  => 'mobiris_stats',
			'type'     => 'text',
			'priority' => 60,
		)
	);

	// Setting: Stat 3 Label
	$wp_customize->add_setting(
		'mobiris_stat_3_label',
		array(
			'default'           => 'Countries and growing',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_stat_3_label',
		array(
			'label'    => esc_html__( 'Stat 3 Label', 'mobiris' ),
			'section'  => 'mobiris_stats',
			'type'     => 'text',
			'priority' => 70,
		)
	);

	// Setting: Stat 4 Value
	$wp_customize->add_setting(
		'mobiris_stat_4_value',
		array(
			'default'           => '15%–20%',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_stat_4_value',
		array(
			'label'    => esc_html__( 'Stat 4 Value', 'mobiris' ),
			'section'  => 'mobiris_stats',
			'type'     => 'text',
			'priority' => 80,
		)
	);

	// Setting: Stat 4 Label
	$wp_customize->add_setting(
		'mobiris_stat_4_label',
		array(
			'default'           => 'Annual market growth rate',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_stat_4_label',
		array(
			'label'    => esc_html__( 'Stat 4 Label', 'mobiris' ),
			'section'  => 'mobiris_stats',
			'type'     => 'text',
			'priority' => 90,
		)
	);

	// =============================
	// SECTION 9: Intelligence Section
	// =============================

	$wp_customize->add_section(
		'mobiris_intelligence',
		array(
			'title'    => esc_html__( 'Homepage: Intelligence Section', 'mobiris' ),
			'panel'    => 'mobiris_options',
			'priority' => 90,
		)
	);

	// Setting: Show Intelligence
	$wp_customize->add_setting(
		'mobiris_show_intelligence',
		array(
			'default'           => '1',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_checkbox',
		)
	);

	$wp_customize->add_control(
		'mobiris_show_intelligence',
		array(
			'label'    => esc_html__( 'Show Intelligence Section', 'mobiris' ),
			'section'  => 'mobiris_intelligence',
			'type'     => 'checkbox',
			'priority' => 10,
		)
	);

	// Setting: Intelligence Eyebrow
	$wp_customize->add_setting(
		'mobiris_intelligence_eyebrow',
		array(
			'default'           => 'The Mobiris Intelligence Plane',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_intelligence_eyebrow',
		array(
			'label'    => esc_html__( 'Intelligence Section Eyebrow', 'mobiris' ),
			'section'  => 'mobiris_intelligence',
			'type'     => 'text',
			'priority' => 20,
		)
	);

	// Setting: Intelligence Title
	$wp_customize->add_setting(
		'mobiris_intelligence_title',
		array(
			'default'           => 'The fraud detection layer no single operator can build alone',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_intelligence_title',
		array(
			'label'    => esc_html__( 'Intelligence Section Title', 'mobiris' ),
			'section'  => 'mobiris_intelligence',
			'type'     => 'text',
			'priority' => 30,
		)
	);

	// Setting: Intelligence Body
	$wp_customize->add_setting(
		'mobiris_intelligence_body',
		array(
			'default'           => 'Mobiris operates across multiple transport companies. When a driver is flagged at one operator, that signal is available — anonymised — across the network. It\'s a shared trust infrastructure that gets stronger with every operator who joins.',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_textarea',
		)
	);

	$wp_customize->add_control(
		'mobiris_intelligence_body',
		array(
			'label'    => esc_html__( 'Intelligence Section Body', 'mobiris' ),
			'section'  => 'mobiris_intelligence',
			'type'     => 'textarea',
			'priority' => 40,
		)
	);

	// Setting: Intelligence CTA Label
	$wp_customize->add_setting(
		'mobiris_intelligence_cta_label',
		array(
			'default'           => 'Learn how it works',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_intelligence_cta_label',
		array(
			'label'    => esc_html__( 'Intelligence CTA Label', 'mobiris' ),
			'section'  => 'mobiris_intelligence',
			'type'     => 'text',
			'priority' => 50,
		)
	);

	// Setting: Intelligence CTA URL
	$wp_customize->add_setting(
		'mobiris_intelligence_cta_url',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_intelligence_cta_url',
		array(
			'label'    => esc_html__( 'Intelligence CTA URL', 'mobiris' ),
			'section'  => 'mobiris_intelligence',
			'type'     => 'url',
			'priority' => 60,
		)
	);

	// =============================
	// SECTION 10: App Download Section
	// =============================

	$wp_customize->add_section(
		'mobiris_app_section',
		array(
			'title'    => esc_html__( 'Homepage: App Download Section', 'mobiris' ),
			'panel'    => 'mobiris_options',
			'priority' => 100,
		)
	);

	// Setting: Show App Section
	$wp_customize->add_setting(
		'mobiris_show_app_section',
		array(
			'default'           => '1',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_checkbox',
		)
	);

	$wp_customize->add_control(
		'mobiris_show_app_section',
		array(
			'label'    => esc_html__( 'Show App Download Section', 'mobiris' ),
			'section'  => 'mobiris_app_section',
			'type'     => 'checkbox',
			'priority' => 10,
		)
	);

	// Setting: App Section Eyebrow
	$wp_customize->add_setting(
		'mobiris_app_section_eyebrow',
		array(
			'default'           => 'Available Everywhere',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_app_section_eyebrow',
		array(
			'label'    => esc_html__( 'Eyebrow', 'mobiris' ),
			'section'  => 'mobiris_app_section',
			'type'     => 'text',
			'priority' => 20,
		)
	);

	// Setting: App Section Title
	$wp_customize->add_setting(
		'mobiris_app_section_title',
		array(
			'default'           => 'Manage your fleet from anywhere',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_app_section_title',
		array(
			'label'    => esc_html__( 'Title', 'mobiris' ),
			'section'  => 'mobiris_app_section',
			'type'     => 'text',
			'priority' => 30,
		)
	);

	// Setting: App Section Subtitle
	$wp_customize->add_setting(
		'mobiris_app_section_subtitle',
		array(
			'default'           => 'The Mobiris mobile app gives drivers and operators everything they need — offline-capable, WhatsApp-integrated, and built for real African network conditions.',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_textarea',
		)
	);

	$wp_customize->add_control(
		'mobiris_app_section_subtitle',
		array(
			'label'    => esc_html__( 'Subtitle', 'mobiris' ),
			'section'  => 'mobiris_app_section',
			'type'     => 'textarea',
			'priority' => 40,
		)
	);

	// Setting: App Section Image
	$wp_customize->add_setting(
		'mobiris_app_section_image',
		array(
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'mobiris_app_section_image',
			array(
				'label'       => esc_html__( 'App Screenshot / Mockup Image', 'mobiris' ),
				'section'     => 'mobiris_app_section',
				'priority'    => 50,
				'mime_type'   => 'image',
			)
		)
	);

	// Setting: Show Web App Button
	$wp_customize->add_setting(
		'mobiris_app_section_show_web',
		array(
			'default'           => '1',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_checkbox',
		)
	);

	$wp_customize->add_control(
		'mobiris_app_section_show_web',
		array(
			'label'    => esc_html__( 'Show "Open Web App" button', 'mobiris' ),
			'section'  => 'mobiris_app_section',
			'type'     => 'checkbox',
			'priority' => 60,
		)
	);

	// =============================
	// SECTION 11: CTA Band
	// =============================

	$wp_customize->add_section(
		'mobiris_cta_band',
		array(
			'title'    => esc_html__( 'Homepage: CTA Band', 'mobiris' ),
			'panel'    => 'mobiris_options',
			'priority' => 110,
		)
	);

	// Setting: CTA Band Title
	$wp_customize->add_setting(
		'mobiris_cta_band_title',
		array(
			'default'           => 'Ready to stop leaking remittance?',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_cta_band_title',
		array(
			'label'    => esc_html__( 'CTA Band Title', 'mobiris' ),
			'section'  => 'mobiris_cta_band',
			'type'     => 'text',
			'priority' => 10,
		)
	);

	// Setting: CTA Band Subtitle
	$wp_customize->add_setting(
		'mobiris_cta_band_subtitle',
		array(
			'default'           => 'Join transport operators across Africa who use Mobiris to run tighter, smarter fleets.',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_cta_band_subtitle',
		array(
			'label'    => esc_html__( 'CTA Band Subtitle', 'mobiris' ),
			'section'  => 'mobiris_cta_band',
			'type'     => 'text',
			'priority' => 20,
		)
	);

	// Setting: CTA Band Primary Button Label
	$wp_customize->add_setting(
		'mobiris_cta_band_primary_label',
		array(
			'default'           => 'Start Free Trial',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_cta_band_primary_label',
		array(
			'label'    => esc_html__( 'Primary Button Label', 'mobiris' ),
			'section'  => 'mobiris_cta_band',
			'type'     => 'text',
			'priority' => 30,
		)
	);

	// Setting: CTA Band Primary Button URL
	$wp_customize->add_setting(
		'mobiris_cta_band_primary_url',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_cta_band_primary_url',
		array(
			'label'    => esc_html__( 'Primary Button URL', 'mobiris' ),
			'section'  => 'mobiris_cta_band',
			'type'     => 'url',
			'priority' => 40,
		)
	);

	// Setting: CTA Band Secondary Button Label
	$wp_customize->add_setting(
		'mobiris_cta_band_secondary_label',
		array(
			'default'           => 'Talk to Sales',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_cta_band_secondary_label',
		array(
			'label'    => esc_html__( 'Secondary Button Label', 'mobiris' ),
			'section'  => 'mobiris_cta_band',
			'type'     => 'text',
			'priority' => 50,
		)
	);

	// Setting: CTA Band Secondary Button URL
	$wp_customize->add_setting(
		'mobiris_cta_band_secondary_url',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_url',
		)
	);

	$wp_customize->add_control(
		'mobiris_cta_band_secondary_url',
		array(
			'label'    => esc_html__( 'Secondary Button URL', 'mobiris' ),
			'section'  => 'mobiris_cta_band',
			'type'     => 'url',
			'priority' => 60,
		)
	);

	// Setting: CTA Band Style
	$wp_customize->add_setting(
		'mobiris_cta_band_style',
		array(
			'default'           => 'blue',
			'transport'         => 'option',
			'sanitize_callback' => array( 'mobiris_sanitize_select' ),
		)
	);

	$wp_customize->add_control(
		'mobiris_cta_band_style',
		array(
			'label'    => esc_html__( 'CTA Band Style', 'mobiris' ),
			'section'  => 'mobiris_cta_band',
			'type'     => 'select',
			'choices'  => array(
				'blue'  => esc_html__( 'Brand Blue', 'mobiris' ),
				'dark'  => esc_html__( 'Dark Navy', 'mobiris' ),
				'light' => esc_html__( 'Light Grey', 'mobiris' ),
			),
			'priority' => 70,
		)
	);

	// =============================
	// SECTION 12: Partners / Trust
	// =============================

	$wp_customize->add_section(
		'mobiris_partners',
		array(
			'title'    => esc_html__( 'Homepage: Trust & Partners', 'mobiris' ),
			'panel'    => 'mobiris_options',
			'priority' => 120,
		)
	);

	// Setting: Show Partners
	$wp_customize->add_setting(
		'mobiris_show_partners',
		array(
			'default'           => '1',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_checkbox',
		)
	);

	$wp_customize->add_control(
		'mobiris_show_partners',
		array(
			'label'    => esc_html__( 'Show Partners / Trusted-By Section', 'mobiris' ),
			'section'  => 'mobiris_partners',
			'type'     => 'checkbox',
			'priority' => 10,
		)
	);

	// Setting: Partners Title
	$wp_customize->add_setting(
		'mobiris_partners_title',
		array(
			'default'           => 'Trusted by operators across Africa',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_partners_title',
		array(
			'label'    => esc_html__( 'Partners Section Title', 'mobiris' ),
			'section'  => 'mobiris_partners',
			'type'     => 'text',
			'priority' => 20,
		)
	);

	// Setting: Partners Subtitle
	$wp_customize->add_setting(
		'mobiris_partners_subtitle',
		array(
			'default'           => '',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_partners_subtitle',
		array(
			'label'    => esc_html__( 'Partners Subtitle', 'mobiris' ),
			'section'  => 'mobiris_partners',
			'type'     => 'text',
			'priority' => 30,
		)
	);

	// Setting: Show Testimonials
	$wp_customize->add_setting(
		'mobiris_show_testimonials_home',
		array(
			'default'           => '1',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_checkbox',
		)
	);

	$wp_customize->add_control(
		'mobiris_show_testimonials_home',
		array(
			'label'    => esc_html__( 'Show Testimonials on Homepage', 'mobiris' ),
			'section'  => 'mobiris_partners',
			'type'     => 'checkbox',
			'priority' => 40,
		)
	);

	// =============================
	// SECTION 13: Blog & Guides
	// =============================

	$wp_customize->add_section(
		'mobiris_blog_home',
		array(
			'title'    => esc_html__( 'Homepage: Blog & Guides Preview', 'mobiris' ),
			'panel'    => 'mobiris_options',
			'priority' => 130,
		)
	);

	// Setting: Show Blog Home
	$wp_customize->add_setting(
		'mobiris_show_blog_home',
		array(
			'default'           => '1',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_checkbox',
		)
	);

	$wp_customize->add_control(
		'mobiris_show_blog_home',
		array(
			'label'    => esc_html__( 'Show Blog Preview on Homepage', 'mobiris' ),
			'section'  => 'mobiris_blog_home',
			'type'     => 'checkbox',
			'priority' => 10,
		)
	);

	// Setting: Blog Home Title
	$wp_customize->add_setting(
		'mobiris_blog_home_title',
		array(
			'default'           => 'Insights for Africa\'s fleet operators',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_blog_home_title',
		array(
			'label'    => esc_html__( 'Blog Section Title', 'mobiris' ),
			'section'  => 'mobiris_blog_home',
			'type'     => 'text',
			'priority' => 20,
		)
	);

	// Setting: Blog Home Count
	$wp_customize->add_setting(
		'mobiris_blog_home_count',
		array(
			'default'           => 3,
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_number',
		)
	);

	$wp_customize->add_control(
		'mobiris_blog_home_count',
		array(
			'label'       => esc_html__( 'Number of Posts to Show', 'mobiris' ),
			'section'     => 'mobiris_blog_home',
			'type'        => 'number',
			'input_attrs' => array(
				'min'  => 1,
				'max'  => 6,
				'step' => 1,
			),
			'priority'    => 30,
		)
	);

	// Setting: Show Guides Home
	$wp_customize->add_setting(
		'mobiris_show_guides_home',
		array(
			'default'           => '1',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_checkbox',
		)
	);

	$wp_customize->add_control(
		'mobiris_show_guides_home',
		array(
			'label'    => esc_html__( 'Show Guides Preview on Homepage', 'mobiris' ),
			'section'  => 'mobiris_blog_home',
			'type'     => 'checkbox',
			'priority' => 40,
		)
	);

	// Setting: Guides Home Title
	$wp_customize->add_setting(
		'mobiris_guides_home_title',
		array(
			'default'           => 'Resources & Guides',
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_text',
		)
	);

	$wp_customize->add_control(
		'mobiris_guides_home_title',
		array(
			'label'    => esc_html__( 'Guides Section Title', 'mobiris' ),
			'section'  => 'mobiris_blog_home',
			'type'     => 'text',
			'priority' => 50,
		)
	);

	// Setting: Guides Home Count
	$wp_customize->add_setting(
		'mobiris_guides_home_count',
		array(
			'default'           => 3,
			'transport'         => 'option',
			'sanitize_callback' => 'mobiris_sanitize_number',
		)
	);

	$wp_customize->add_control(
		'mobiris_guides_home_count',
		array(
			'label'       => esc_html__( 'Number of Guides to Show', 'mobiris' ),
			'section'     => 'mobiris_blog_home',
			'type'        => 'number',
			'input_attrs' => array(
				'min'  => 1,
				'max'  => 6,
				'step' => 1,
			),
			'priority'    => 60,
		)
	);

}

add_action( 'customize_register', 'mobiris_customize_register' );
