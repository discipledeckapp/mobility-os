<?php
/**
 * Mobiris Theme Functions
 *
 * Bootstrap file for the Mobiris WordPress theme.
 * Loads all theme functionality, settings, and integrations.
 *
 * @package Mobiris
 * @since 1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Define theme constants
 */
define( 'MOBIRIS_VERSION', '1.0.0' );
define( 'MOBIRIS_DIR', get_template_directory() );
define( 'MOBIRIS_URI', get_template_directory_uri() );
define( 'MOBIRIS_TEXT_DOMAIN', 'mobiris' );

/**
 * Require all inc/ files in dependency order
 */
require_once MOBIRIS_DIR . '/inc/theme-setup.php';
require_once MOBIRIS_DIR . '/inc/enqueue.php';
require_once MOBIRIS_DIR . '/inc/customizer.php';
require_once MOBIRIS_DIR . '/inc/custom-post-types.php';
require_once MOBIRIS_DIR . '/inc/template-functions.php';
require_once MOBIRIS_DIR . '/inc/seo.php';
require_once MOBIRIS_DIR . '/inc/walker-nav.php';

/**
 * Handle contact form AJAX submission
 *
 * Sanitizes and validates form data, sends email notification,
 * and returns JSON response to the client.
 *
 * @since 1.0.0
 * @return void Exits with JSON response
 */
function mobiris_handle_contact_form() {
	// Verify nonce for security
	if ( ! isset( $_POST['mobiris_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['mobiris_nonce'] ) ), 'mobiris_ajax' ) ) {
		wp_send_json_error( array( 'message' => __( 'Security check failed.', MOBIRIS_TEXT_DOMAIN ) ) );
	}

	// Sanitize and validate inputs
	$name    = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '';
	$email   = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	$phone   = isset( $_POST['phone'] ) ? sanitize_text_field( wp_unslash( $_POST['phone'] ) ) : '';
	$subject = isset( $_POST['subject'] ) ? sanitize_text_field( wp_unslash( $_POST['subject'] ) ) : '';
	$message = isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '';
	$company = isset( $_POST['company'] ) ? sanitize_text_field( wp_unslash( $_POST['company'] ) ) : '';

	// Validate required fields
	if ( empty( $name ) ) {
		wp_send_json_error( array( 'message' => __( 'Name is required.', MOBIRIS_TEXT_DOMAIN ) ) );
	}

	if ( empty( $email ) || ! is_email( $email ) ) {
		wp_send_json_error( array( 'message' => __( 'A valid email address is required.', MOBIRIS_TEXT_DOMAIN ) ) );
	}

	// Prepare email
	$recipient = mobiris_get_customizer_value( 'mobiris_email', 'hello@mobiris.ng' );
	$email_subject = sprintf( '[Mobiris Website] Contact Form: %s', sanitize_text_field( $subject ) );

	// Build email body
	$email_body = sprintf(
		"You have received a new contact form submission.\n\n" .
		"Name: %s\n" .
		"Email: %s\n" .
		"Phone: %s\n" .
		"Company: %s\n" .
		"Subject: %s\n\n" .
		"Message:\n%s\n\n" .
		"---\n" .
		"Submitted from: %s",
		sanitize_text_field( $name ),
		sanitize_email( $email ),
		sanitize_text_field( $phone ),
		sanitize_text_field( $company ),
		sanitize_text_field( $subject ),
		sanitize_textarea_field( $message ),
		esc_url( home_url() )
	);

	// Set email headers
	$headers = array( 'Content-Type: text/plain; charset=UTF-8' );
	$headers[] = sprintf( 'Reply-To: %s', sanitize_email( $email ) );

	// Send email
	$mail_sent = wp_mail( $recipient, $email_subject, $email_body, $headers );

	if ( $mail_sent ) {
		wp_send_json_success( array(
			'message' => __( 'Thank you! Your message has been sent successfully.', MOBIRIS_TEXT_DOMAIN ),
		) );
	} else {
		wp_send_json_error( array(
			'message' => __( 'An error occurred while sending your message. Please try again later.', MOBIRIS_TEXT_DOMAIN ),
		) );
	}
}
add_action( 'wp_ajax_mobiris_contact_form', 'mobiris_handle_contact_form' );
add_action( 'wp_ajax_nopriv_mobiris_contact_form', 'mobiris_handle_contact_form' );

/**
 * Handle newsletter subscription AJAX submission
 *
 * Validates email and prepares for email service integration.
 * Currently returns success placeholder — integrate with email service provider.
 *
 * @since 1.0.0
 * @return void Exits with JSON response
 */
function mobiris_handle_newsletter() {
	// Verify nonce for security
	if ( ! isset( $_POST['mobiris_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['mobiris_nonce'] ) ), 'mobiris_ajax' ) ) {
		wp_send_json_error( array( 'message' => __( 'Security check failed.', MOBIRIS_TEXT_DOMAIN ) ) );
	}

	// Sanitize and validate email
	$email = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';

	if ( empty( $email ) || ! is_email( $email ) ) {
		wp_send_json_error( array( 'message' => __( 'A valid email address is required.', MOBIRIS_TEXT_DOMAIN ) ) );
	}

	// TODO: Integrate with email service provider (Mailchimp, ConvertKit, etc.)
	// For now, this is a placeholder that returns success

	wp_send_json_success( array(
		'message' => __( 'Thank you for subscribing! Check your email for confirmation.', MOBIRIS_TEXT_DOMAIN ),
	) );
}
add_action( 'wp_ajax_mobiris_newsletter', 'mobiris_handle_newsletter' );
add_action( 'wp_ajax_nopriv_mobiris_newsletter', 'mobiris_handle_newsletter' );

/**
 * Handle lead capture form AJAX submission
 *
 * Saves the lead as a 'mobiris_lead' custom post type and sends
 * an email notification to hello@mobiris.ng.
 *
 * @since 1.0.0
 * @return void Exits with JSON response
 */
function mobiris_save_lead() {
	// Verify nonce
	if ( ! isset( $_POST['lead_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['lead_nonce'] ) ), 'mobiris_lead_nonce' ) ) {
		wp_send_json_error( array( 'message' => 'Security check failed.' ) );
		return;
	}

	// Sanitize inputs
	$name     = isset( $_POST['lead_name'] ) ? sanitize_text_field( wp_unslash( $_POST['lead_name'] ) ) : '';
	$phone    = isset( $_POST['lead_phone'] ) ? sanitize_text_field( wp_unslash( $_POST['lead_phone'] ) ) : '';
	$email    = isset( $_POST['lead_email'] ) ? sanitize_email( wp_unslash( $_POST['lead_email'] ) ) : '';
	$vehicles = isset( $_POST['lead_vehicles'] ) ? absint( $_POST['lead_vehicles'] ) : 0;
	$country  = isset( $_POST['lead_country'] ) ? sanitize_text_field( wp_unslash( $_POST['lead_country'] ) ) : '';

	// Required fields
	if ( empty( $name ) ) {
		wp_send_json_error( array( 'message' => 'Name is required.' ) );
		return;
	}

	if ( empty( $phone ) ) {
		wp_send_json_error( array( 'message' => 'Phone number is required.' ) );
		return;
	}

	if ( $vehicles < 1 ) {
		wp_send_json_error( array( 'message' => 'Please enter your vehicle count.' ) );
		return;
	}

	// Create the lead post
	$post_id = wp_insert_post( array(
		'post_type'   => 'mobiris_lead',
		'post_title'  => sanitize_text_field( $name ) . ' — ' . sanitize_text_field( $phone ),
		'post_status' => 'publish',
		'meta_input'  => array(
			'_lead_name'     => $name,
			'_lead_phone'    => $phone,
			'_lead_email'    => $email,
			'_lead_vehicles' => $vehicles,
			'_lead_country'  => $country,
			'_lead_source'   => isset( $_SERVER['HTTP_REFERER'] ) ? esc_url_raw( wp_unslash( $_SERVER['HTTP_REFERER'] ) ) : home_url(),
			'_lead_date'     => current_time( 'mysql' ),
		),
	) );

	if ( is_wp_error( $post_id ) ) {
		wp_send_json_error( array( 'message' => 'Could not save your details. Please try again.' ) );
		return;
	}

	// Send notification email
	$recipient    = get_theme_mod( 'mobiris_email', 'hello@mobiris.ng' );
	$email_subject = sprintf( '[Mobiris Lead] %s — %d vehicles (%s)', $name, $vehicles, strtoupper( $country ) );
	$email_body    = sprintf(
		"New lead from mobiris.ng\n\nName: %s\nPhone/WhatsApp: %s\nEmail: %s\nVehicles: %d\nCountry: %s\n\nAdmin: %s\n\nReach them on WhatsApp: https://wa.me/%s",
		$name,
		$phone,
		$email,
		$vehicles,
		$country,
		esc_url( admin_url( 'post.php?post=' . $post_id . '&action=edit' ) ),
		preg_replace( '/[^0-9]/', '', $phone )
	);

	wp_mail(
		$recipient,
		$email_subject,
		$email_body,
		array( 'Content-Type: text/plain; charset=UTF-8' )
	);

	wp_send_json_success( array(
		'message' => 'Got it! We\'ll reach you on WhatsApp or phone within 24 hours.',
	) );
}
add_action( 'wp_ajax_mobiris_save_lead', 'mobiris_save_lead' );
add_action( 'wp_ajax_nopriv_mobiris_save_lead', 'mobiris_save_lead' );

/**
 * Profit calculator shortcode — standalone page embed
 *
 * @since 1.0.0
 * @return string
 */
function mobiris_shortcode_profit_calculator() {
	ob_start();
	get_template_part( 'template-parts/home/profit-calculator' );
	return ob_get_clean();
}
add_shortcode( 'mobiris_profit_calculator', 'mobiris_shortcode_profit_calculator' );

/**
 * Get customizer value with fallback default
 *
 * Wrapper around get_theme_mod() with built-in defaults.
 *
 * @since 1.0.0
 * @param string $key The customizer key to retrieve.
 * @param mixed  $default The fallback default value.
 * @return mixed The customizer value or default.
 */
function mobiris_get_customizer_value( $key, $default = '' ) {
	return get_theme_mod( $key, $default );
}

/**
 * Check if current page is the homepage
 *
 * @since 1.0.0
 * @return bool True if on homepage, false otherwise.
 */
function mobiris_is_homepage() {
	return is_front_page() || ( is_home() && ! is_paged() );
}

/**
 * Get platform access links for web, iOS, and Android apps
 *
 * Returns an array of platform download/access links configured
 * via the WordPress Customizer.
 *
 * @since 1.0.0
 * @return array Array of platform links with keys: web, ios, android
 */
function mobiris_get_platform_access_links() {
	return array(
		'web' => array(
			'label'     => __( 'Open Web App', MOBIRIS_TEXT_DOMAIN ),
			'url'       => mobiris_get_customizer_value( 'mobiris_web_app_url', 'https://app.mobiris.ng' ),
			'platform'  => 'web',
			'available' => true,
		),
		'ios' => array(
			'label'     => __( 'Download on App Store', MOBIRIS_TEXT_DOMAIN ),
			'url'       => mobiris_get_customizer_value( 'mobiris_ios_app_url', '' ),
			'platform'  => 'ios',
			'available' => ! empty( mobiris_get_customizer_value( 'mobiris_ios_app_url', '' ) ),
		),
		'android' => array(
			'label'     => __( 'Get on Google Play', MOBIRIS_TEXT_DOMAIN ),
			'url'       => mobiris_get_customizer_value( 'mobiris_android_app_url', '' ),
			'platform'  => 'android',
			'available' => ! empty( mobiris_get_customizer_value( 'mobiris_android_app_url', '' ) ),
		),
	);
}

/**
 * Remove default WordPress emoji scripts for performance
 *
 * Disables emoji detection and script loading to improve frontend
 * performance and reduce unnecessary HTTP requests.
 *
 * @since 1.0.0
 * @return void
 */
function mobiris_disable_emoji() {
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );
	remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
	remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
	remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
}
add_action( 'init', 'mobiris_disable_emoji' );

/**
 * Create default pages and menus on theme activation
 *
 * Sets up essential WordPress pages and navigation menus with
 * proper templates and menu assignments.
 *
 * @since 1.0.0
 * @return void
 */
function mobiris_setup_theme_on_activation() {
	// Array of pages to create with their properties.
	// 9 core pages as required by the Mobiris growth system.
	$pages = array(
		array(
			'title'    => __( 'Home', MOBIRIS_TEXT_DOMAIN ),
			'slug'     => 'home',
			'template' => '',
			'is_home'  => true,
			'content'  => '',
		),
		array(
			'title'    => __( 'Blog', MOBIRIS_TEXT_DOMAIN ),
			'slug'     => 'blog',
			'template' => '',
			'is_posts' => true,
			'content'  => '',
		),
		array(
			'title'    => __( 'Start Your Transport Business', MOBIRIS_TEXT_DOMAIN ),
			'slug'     => 'start-transport-business',
			'template' => 'template-solutions.php',
			'content'  => "<!-- wp:paragraph -->\n<p>Everything you need to run a compliant, profitable transport business in Nigeria, Ghana, Kenya, or South Africa — from driver verification to daily remittance tracking.</p>\n<!-- /wp:paragraph -->",
		),
		array(
			'title'    => __( 'Why You\'re Losing Money', MOBIRIS_TEXT_DOMAIN ),
			'slug'     => 'why-losing-money',
			'template' => 'template-platform.php',
			'content'  => "<!-- wp:paragraph -->\n<p>Most transport operators lose 10–20% of their monthly remittance to untracked shortfalls, unreported disputes, and drivers who know there is no system. This page explains exactly how the leakage happens — and how to stop it.</p>\n<!-- /wp:paragraph -->",
		),
		array(
			'title'    => __( 'How Mobiris Works', MOBIRIS_TEXT_DOMAIN ),
			'slug'     => 'how-mobiris-works',
			'template' => 'template-features.php',
			'content'  => "<!-- wp:paragraph -->\n<p>From driver onboarding to daily remittance reconciliation — here's how the Mobiris platform works for your fleet.</p>\n<!-- /wp:paragraph -->",
		),
		array(
			'title'    => __( 'For Fleet Owners', MOBIRIS_TEXT_DOMAIN ),
			'slug'     => 'for-fleet-owners',
			'template' => 'template-solutions.php',
			'content'  => "<!-- wp:paragraph -->\n<p>Mobiris is built for operators managing 5 to 500+ vehicles across keke, danfo, korope, matatu, and minibus taxi operations. Verify drivers, track payments, and build a compliance record — starting today.</p>\n<!-- /wp:paragraph -->",
		),
		array(
			'title'    => __( 'For Investors', MOBIRIS_TEXT_DOMAIN ),
			'slug'     => 'for-investors',
			'template' => 'template-about.php',
			'content'  => "<!-- wp:paragraph -->\n<p>Mobiris is building risk infrastructure for Africa's 10M+ commercial vehicles. We are the first purpose-built platform combining biometric driver verification, remittance enforcement, and cross-operator fraud intelligence for the vehicle-for-hire segment.</p>\n<!-- /wp:paragraph -->",
		),
		array(
			'title'    => __( 'Profit Calculator', MOBIRIS_TEXT_DOMAIN ),
			'slug'     => 'profit-calculator',
			'template' => 'template-platform.php',
			'content'  => "<!-- wp:paragraph -->\n<p>Calculate how much remittance your fleet may be losing every month — and what you could recover with Mobiris.</p>\n<!-- /wp:paragraph -->\n[mobiris_profit_calculator]",
		),
		array(
			'title'    => __( 'Contact', MOBIRIS_TEXT_DOMAIN ),
			'slug'     => 'contact',
			'template' => 'template-contact.php',
			'content'  => "<!-- wp:paragraph -->\n<p>Get in touch with the Mobiris team. We'll respond within 24 hours — usually on WhatsApp.</p>\n<!-- /wp:paragraph -->",
		),
		array(
			'title'    => __( 'Get the App', MOBIRIS_TEXT_DOMAIN ),
			'slug'     => 'get-the-app',
			'template' => 'template-app-download.php',
			'content'  => '',
		),
		array(
			'title'    => __( 'Pricing', MOBIRIS_TEXT_DOMAIN ),
			'slug'     => 'pricing',
			'template' => 'template-pricing.php',
			'content'  => '',
		),
		array(
			'title'    => __( 'Privacy Policy', MOBIRIS_TEXT_DOMAIN ),
			'slug'     => 'privacy-policy',
			'template' => '',
			'content'  => '',
		),
		array(
			'title'    => __( 'Terms of Service', MOBIRIS_TEXT_DOMAIN ),
			'slug'     => 'terms-of-service',
			'template' => '',
			'content'  => '',
		),
	);

	$home_page_id  = null;
	$posts_page_id = null;

	// Create pages if they don't exist
	foreach ( $pages as $page ) {
		$page_exists = get_page_by_path( $page['slug'] );

		if ( ! $page_exists ) {
			$page_id = wp_insert_post( array(
				'post_type'    => 'page',
				'post_title'   => $page['title'],
				'post_name'    => $page['slug'],
				'post_status'  => 'publish',
				'post_content' => isset( $page['content'] ) ? $page['content'] : '',
			) );

			if ( ! is_wp_error( $page_id ) ) {
				// Set page template if provided
				if ( ! empty( $page['template'] ) ) {
					update_post_meta( $page_id, '_wp_page_template', $page['template'] );
				}

				// Track home and posts pages for later assignment
				if ( isset( $page['is_home'] ) && $page['is_home'] ) {
					$home_page_id = $page_id;
				}
				if ( isset( $page['is_posts'] ) && $page['is_posts'] ) {
					$posts_page_id = $page_id;
				}
			}
		} else {
			// Get ID of existing page
			if ( isset( $page['is_home'] ) && $page['is_home'] ) {
				$home_page_id = $page_exists->ID;
			}
			if ( isset( $page['is_posts'] ) && $page['is_posts'] ) {
				$posts_page_id = $page_exists->ID;
			}
		}
	}

	// Set homepage and posts page
	if ( $home_page_id ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $home_page_id );
	}
	if ( $posts_page_id ) {
		update_option( 'page_for_posts', $posts_page_id );
	}

	// Create primary navigation menu
	$primary_menu_exists = wp_get_nav_menu_object( 'Primary' );
	if ( ! $primary_menu_exists ) {
		$primary_menu_id = wp_create_nav_menu( 'Primary' );
		set_theme_mod( 'nav_menu_locations', array( 'primary' => $primary_menu_id ) );
	} else {
		$primary_menu_id = $primary_menu_exists->term_id;
	}

	// Add pages to primary menu in order
	$menu_pages = array( 'How Mobiris Works', 'For Fleet Owners', 'Pricing', 'Why You\'re Losing Money', 'For Investors', 'Blog', 'Contact' );
	$menu_order = 1;

	foreach ( $menu_pages as $page_title ) {
		$page = get_page_by_title( $page_title );
		if ( $page ) {
			wp_update_nav_menu_item(
				$primary_menu_id,
				0,
				array(
					'menu-item-title'   => $page->post_title,
					'menu-item-object'  => 'page',
					'menu-item-object-id' => $page->ID,
					'menu-item-type'    => 'post_type',
					'menu-item-status'  => 'publish',
					'menu-item-position' => $menu_order,
				)
			);
			$menu_order++;
		}
	}

	// Create footer menus
	$footer_menus = array(
		'Footer: Product',
		'Footer: Company',
		'Footer: Legal',
	);

	foreach ( $footer_menus as $menu_name ) {
		if ( ! wp_get_nav_menu_object( $menu_name ) ) {
			wp_create_nav_menu( $menu_name );
		}
	}

	// Assign footer menus
	$menu_locations = get_theme_mod( 'nav_menu_locations', array() );
	if ( is_array( $menu_locations ) ) {
		$product_menu = wp_get_nav_menu_object( 'Footer: Product' );
		$company_menu = wp_get_nav_menu_object( 'Footer: Company' );
		$legal_menu    = wp_get_nav_menu_object( 'Footer: Legal' );

		if ( $product_menu ) {
			$menu_locations['footer-product'] = $product_menu->term_id;
		}
		if ( $company_menu ) {
			$menu_locations['footer-company'] = $company_menu->term_id;
		}
		if ( $legal_menu ) {
			$menu_locations['footer-legal'] = $legal_menu->term_id;
		}

		set_theme_mod( 'nav_menu_locations', $menu_locations );
	}

	// Flush rewrite rules
	flush_rewrite_rules();
}
add_action( 'after_switch_theme', 'mobiris_setup_theme_on_activation' );

/**
 * Display theme activation notice with customizer link
 *
 * Shows a dismissible admin notice after theme activation,
 * guiding users to the WordPress Customizer to configure the theme.
 *
 * @since 1.0.0
 * @return void
 */
function mobiris_activation_notice() {
	// Check if notice has been dismissed
	if ( get_transient( 'mobiris_activation_notice' ) === false ) {
		?>
		<div class="notice notice-info is-dismissible" data-notice-type="mobiris-activation">
			<p>
				<strong><?php esc_html_e( 'Welcome to Mobiris!', MOBIRIS_TEXT_DOMAIN ); ?></strong>
			</p>
			<p>
				<?php esc_html_e( 'Your Mobiris theme is active. Visit the Customizer to configure your site settings, colors, logos, and more.', MOBIRIS_TEXT_DOMAIN ); ?>
			</p>
			<p>
				<a href="<?php echo esc_url( admin_url( 'customize.php' ) ); ?>" class="button button-primary">
					<?php esc_html_e( 'Open Customizer', MOBIRIS_TEXT_DOMAIN ); ?>
				</a>
			</p>
		</div>
		<script>
			document.addEventListener( 'DOMContentLoaded', function() {
				const notices = document.querySelectorAll( '[data-notice-type="mobiris-activation"]' );
				notices.forEach( function( notice ) {
					const closeButton = notice.querySelector( '.notice-dismiss' );
					if ( closeButton ) {
						closeButton.addEventListener( 'click', function() {
							fetch( '<?php echo esc_url( admin_ajax_url ); ?>', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/x-www-form-urlencoded',
								},
								body: 'action=mobiris_dismiss_activation_notice&_ajax_nonce=<?php echo esc_attr( wp_create_nonce( 'mobiris_dismiss_notice' ) ); ?>',
							} );
						} );
					}
				} );
			} );
		</script>
		<?php

		// Set transient to hide notice for 30 days
		set_transient( 'mobiris_activation_notice', true, 30 * DAY_IN_SECONDS );
	}
}
add_action( 'admin_notices', 'mobiris_activation_notice' );

/**
 * Dismiss activation notice via AJAX
 *
 * @since 1.0.0
 * @return void
 */
function mobiris_dismiss_activation_notice() {
	if ( ! isset( $_POST['_ajax_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_ajax_nonce'] ) ), 'mobiris_dismiss_notice' ) ) {
		wp_die();
	}

	set_transient( 'mobiris_activation_notice', true, 30 * DAY_IN_SECONDS );
	wp_die();
}
add_action( 'wp_ajax_mobiris_dismiss_activation_notice', 'mobiris_dismiss_activation_notice' );

/**
 * Register FAQ shortcode
 *
 * Renders FAQs from the faq custom post type as an accordion.
 * Filters by category if provided.
 *
 * @since 1.0.0
 * @param array $atts {
 *     @type string $category Optional. FAQ category slug to filter by.
 * }
 * @return string Rendered HTML of FAQ accordion.
 */
function mobiris_shortcode_faqs( $atts ) {
	$atts = shortcode_atts(
		array(
			'category' => '',
		),
		$atts,
		'mobiris_faqs'
	);

	$args = array(
		'post_type'      => 'faq',
		'posts_per_page' => -1,
		'orderby'        => 'menu_order',
		'order'          => 'ASC',
	);

	// Filter by category if provided
	if ( ! empty( $atts['category'] ) ) {
		$args['tax_query'] = array(
			array(
				'taxonomy' => 'faq_category',
				'field'    => 'slug',
				'terms'    => sanitize_text_field( $atts['category'] ),
			),
		);
	}

	$faqs = get_posts( $args );

	if ( empty( $faqs ) ) {
		return '<p>' . esc_html__( 'No FAQs found.', MOBIRIS_TEXT_DOMAIN ) . '</p>';
	}

	$output = '<div class="mobiris-faq-accordion">';

	foreach ( $faqs as $faq ) {
		$output .= sprintf(
			'<div class="faq-item"><button class="faq-toggle" aria-expanded="false">%s</button><div class="faq-content" style="display:none;">%s</div></div>',
			esc_html( $faq->post_title ),
			wp_kses_post( $faq->post_content )
		);
	}

	$output .= '</div>';

	return $output;
}
add_shortcode( 'mobiris_faqs', 'mobiris_shortcode_faqs' );

/**
 * Register testimonials shortcode
 *
 * Renders testimonials from the testimonial custom post type
 * as a grid of cards.
 *
 * @since 1.0.0
 * @param array $atts {
 *     @type int $count Number of testimonials to display. Default 3.
 * }
 * @return string Rendered HTML of testimonial grid.
 */
function mobiris_shortcode_testimonials( $atts ) {
	$atts = shortcode_atts(
		array(
			'count' => 3,
		),
		$atts,
		'mobiris_testimonials'
	);

	$count = absint( $atts['count'] );

	$testimonials = get_posts( array(
		'post_type'      => 'testimonial',
		'posts_per_page' => $count,
		'orderby'        => 'rand',
	) );

	if ( empty( $testimonials ) ) {
		return '<p>' . esc_html__( 'No testimonials found.', MOBIRIS_TEXT_DOMAIN ) . '</p>';
	}

	$output = '<div class="mobiris-testimonials-grid">';

	foreach ( $testimonials as $testimonial ) {
		$author_title = get_post_meta( $testimonial->ID, '_testimonial_author_title', true );
		$author_company = get_post_meta( $testimonial->ID, '_testimonial_author_company', true );

		$output .= sprintf(
			'<div class="testimonial-card"><blockquote>%s</blockquote><footer><strong>%s</strong><br><span class="title">%s</span><span class="company">%s</span></footer></div>',
			wp_kses_post( $testimonial->post_content ),
			esc_html( $testimonial->post_title ),
			esc_html( $author_title ),
			esc_html( $author_company )
		);
	}

	$output .= '</div>';

	return $output;
}
add_shortcode( 'mobiris_testimonials', 'mobiris_shortcode_testimonials' );

/**
 * Register contact form shortcode
 *
 * Renders a complete contact form with nonce, name, email,
 * phone, company, subject, and message fields.
 *
 * @since 1.0.0
 * @param array $atts Shortcode attributes (unused).
 * @return string Rendered HTML contact form.
 */
function mobiris_shortcode_contact_form( $atts ) {
	$nonce = wp_create_nonce( 'mobiris_ajax' );

	$output = sprintf(
		'<form class="mobiris-contact-form" id="mobiris-contact-form">
			<input type="hidden" name="mobiris_nonce" value="%s">
			<div class="form-group">
				<label for="contact-name">%s</label>
				<input type="text" id="contact-name" name="name" required aria-required="true">
			</div>
			<div class="form-group">
				<label for="contact-email">%s</label>
				<input type="email" id="contact-email" name="email" required aria-required="true">
			</div>
			<div class="form-group">
				<label for="contact-phone">%s</label>
				<input type="tel" id="contact-phone" name="phone">
			</div>
			<div class="form-group">
				<label for="contact-company">%s</label>
				<input type="text" id="contact-company" name="company">
			</div>
			<div class="form-group">
				<label for="contact-subject">%s</label>
				<input type="text" id="contact-subject" name="subject" required aria-required="true">
			</div>
			<div class="form-group">
				<label for="contact-message">%s</label>
				<textarea id="contact-message" name="message" rows="5" required aria-required="true"></textarea>
			</div>
			<button type="submit" class="button button-primary">%s</button>
		</form>',
		esc_attr( $nonce ),
		esc_html__( 'Name', MOBIRIS_TEXT_DOMAIN ),
		esc_html__( 'Email', MOBIRIS_TEXT_DOMAIN ),
		esc_html__( 'Phone', MOBIRIS_TEXT_DOMAIN ),
		esc_html__( 'Company', MOBIRIS_TEXT_DOMAIN ),
		esc_html__( 'Subject', MOBIRIS_TEXT_DOMAIN ),
		esc_html__( 'Message', MOBIRIS_TEXT_DOMAIN ),
		esc_html__( 'Send Message', MOBIRIS_TEXT_DOMAIN )
	);

	return $output;
}
add_shortcode( 'mobiris_contact_form', 'mobiris_shortcode_contact_form' );

/**
 * Register CTA band shortcode
 *
 * Renders an inline call-to-action band section with title,
 * subtitle, button, and optional style.
 *
 * @since 1.0.0
 * @param array $atts {
 *     @type string $title CTA title text.
 *     @type string $subtitle CTA subtitle text.
 *     @type string $cta_label Button label text.
 *     @type string $cta_url Button target URL.
 *     @type string $style Style variant (blue, green, dark). Default 'blue'.
 * }
 * @return string Rendered HTML CTA band.
 */
function mobiris_shortcode_cta_band( $atts ) {
	$atts = shortcode_atts(
		array(
			'title'     => '',
			'subtitle'  => '',
			'cta_label' => __( 'Get Started', MOBIRIS_TEXT_DOMAIN ),
			'cta_url'   => '#',
			'style'     => 'blue',
		),
		$atts,
		'mobiris_cta_band'
	);

	$style = in_array( $atts['style'], array( 'blue', 'green', 'dark' ), true ) ? $atts['style'] : 'blue';

	$output = sprintf(
		'<div class="mobiris-cta-band mobiris-cta-band--%s"><div class="cta-content">',
		esc_attr( $style )
	);

	if ( ! empty( $atts['title'] ) ) {
		$output .= sprintf( '<h2 class="cta-title">%s</h2>', esc_html( $atts['title'] ) );
	}

	if ( ! empty( $atts['subtitle'] ) ) {
		$output .= sprintf( '<p class="cta-subtitle">%s</p>', wp_kses_post( $atts['subtitle'] ) );
	}

	if ( ! empty( $atts['cta_label'] ) && ! empty( $atts['cta_url'] ) ) {
		$output .= sprintf(
			'<a href="%s" class="button button-primary cta-button">%s</a>',
			esc_url( $atts['cta_url'] ),
			esc_html( $atts['cta_label'] )
		);
	}

	$output .= '</div></div>';

	return $output;
}
add_shortcode( 'mobiris_cta_band', 'mobiris_shortcode_cta_band' );

/**
 * Register app download buttons shortcode
 *
 * Renders inline app download buttons for iOS, Android, and Web
 * based on availability from customizer settings.
 *
 * @since 1.0.0
 * @param array $atts Shortcode attributes (unused).
 * @return string Rendered HTML app buttons.
 */
function mobiris_shortcode_app_buttons( $atts ) {
	$links = mobiris_get_platform_access_links();
	$output = '<div class="mobiris-app-buttons">';

	foreach ( $links as $link ) {
		if ( $link['available'] ) {
			$output .= sprintf(
				'<a href="%s" class="app-button app-button--%s" target="_blank" rel="noopener noreferrer">%s</a>',
				esc_url( $link['url'] ),
				esc_attr( $link['platform'] ),
				esc_html( $link['label'] )
			);
		}
	}

	$output .= '</div>';

	return $output;
}
add_shortcode( 'mobiris_app_buttons', 'mobiris_shortcode_app_buttons' );

/**
 * Add comment support and pagination hooks
 *
 * Enables comment feeds and post pagination if not already
 * configured in theme-setup.php.
 *
 * @since 1.0.0
 * @return void
 */
if ( ! function_exists( 'mobiris_add_comment_support' ) ) {
	function mobiris_add_comment_support() {
		add_theme_support( 'html5', array( 'comment-list', 'comment-form' ) );
		add_theme_support( 'post-thumbnails' );
	}
	add_action( 'after_setup_theme', 'mobiris_add_comment_support' );
}

/**
 * Filter excerpt length
 *
 * Sets excerpt length to 25 words.
 *
 * @since 1.0.0
 * @param int $length Excerpt length in words.
 * @return int Modified excerpt length.
 */
function mobiris_excerpt_length( $length ) {
	return 25;
}
add_filter( 'excerpt_length', 'mobiris_excerpt_length' );

/**
 * Filter excerpt more text
 *
 * Changes the excerpt "more" text to ellipsis.
 *
 * @since 1.0.0
 * @param string $more The excerpt more text.
 * @return string Modified more text.
 */
function mobiris_excerpt_more( $more ) {
	return '...';
}
add_filter( 'excerpt_more', 'mobiris_excerpt_more' );

/**
 * Custom login redirect
 *
 * Redirects non-admin users away from wp-admin to the Mobiris
 * web app URL after successful login.
 *
 * @since 1.0.0
 * @param string $redirect_to The redirect destination.
 * @param string $requested_redirect_to The originally requested redirect URL.
 * @param object $user The logged-in user object.
 * @return string The login redirect URL.
 */
function mobiris_login_redirect( $redirect_to, $requested_redirect_to, $user ) {
	// If there was an error, $user will be a WP_Error
	if ( is_wp_error( $user ) ) {
		return $redirect_to;
	}

	// Check if user has admin capabilities
	if ( user_can( $user, 'manage_options' ) ) {
		// Allow admins to access wp-admin
		return admin_url();
	}

	// For editors and other non-admin users, redirect to Mobiris web app
	$app_url = mobiris_get_customizer_value( 'mobiris_web_app_url', 'https://app.mobiris.ng' );

	return esc_url( $app_url );
}
add_filter( 'login_redirect', 'mobiris_login_redirect', 10, 3 );
