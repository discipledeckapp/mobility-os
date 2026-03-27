<?php
/**
 * SEO Support Functions
 * Provides baseline meta tags and structured data for improved search engine optimization.
 *
 * Note: For full SEO capability, install Yoast SEO or Rank Math.
 * These functions provide baseline meta tags and structured data.
 *
 * @package Mobiris
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Output Open Graph meta tags for social sharing.
 *
 * @return void
 */
function mobiris_output_og_tags() {
	global $post;

	// Get current page info.
	$current_url   = home_url( $_SERVER['REQUEST_URI'] ?? '' );
	$site_name     = mobiris_get_option( 'company_name', get_bloginfo( 'name' ) );
	$og_type       = is_singular() ? 'article' : 'website';

	// Build OG tags.
	?>
	<!-- Open Graph Tags -->
	<meta property="og:site_name" content="<?php echo esc_attr( $site_name ); ?>" />
	<meta property="og:type" content="<?php echo esc_attr( $og_type ); ?>" />
	<meta property="og:url" content="<?php echo esc_url( $current_url ); ?>" />

	<?php
	if ( is_singular() && isset( $post ) ) {
		// Post title and excerpt.
		?>
		<meta property="og:title" content="<?php echo esc_attr( get_the_title() ); ?>" />
		<meta property="og:description" content="<?php echo esc_attr( wp_strip_all_tags( get_the_excerpt() ) ); ?>" />

		<?php
		// Featured image.
		if ( has_post_thumbnail() ) {
			$image_url = wp_get_attachment_url( get_post_thumbnail_id() );
			$image_alt = get_post_meta( get_post_thumbnail_id(), '_wp_attachment_image_alt', true );
			?>
			<meta property="og:image" content="<?php echo esc_url( $image_url ); ?>" />
			<meta property="og:image:alt" content="<?php echo esc_attr( $image_alt ); ?>" />
			<?php
		}

		// Article-specific tags.
		?>
		<meta property="article:published_time" content="<?php echo esc_attr( get_the_date( 'c' ) ); ?>" />
		<meta property="article:modified_time" content="<?php echo esc_attr( get_the_modified_date( 'c' ) ); ?>" />
		<meta property="article:author" content="<?php echo esc_attr( get_the_author_meta( 'display_name' ) ); ?>" />
		<?php
	} else {
		// Homepage / archive defaults.
		?>
		<meta property="og:title" content="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>" />
		<meta property="og:description" content="<?php echo esc_attr( get_bloginfo( 'description' ) ); ?>" />

		<?php
		// Site logo if available.
		if ( has_custom_logo() ) {
			$logo_id = get_theme_mod( 'custom_logo' );
			if ( $logo_id ) {
				$logo_url = wp_get_attachment_url( $logo_id );
				?>
				<meta property="og:image" content="<?php echo esc_url( $logo_url ); ?>" />
				<?php
			}
		}
	}
}
add_action( 'wp_head', 'mobiris_output_og_tags' );

/**
 * Output Twitter Card meta tags.
 *
 * @return void
 */
function mobiris_output_twitter_tags() {
	global $post;

	$twitter_site = mobiris_get_option( 'social_twitter' );
	$twitter_site = ! empty( $twitter_site ) ? '@' . str_replace( 'https://twitter.com/', '', rtrim( $twitter_site, '/' ) ) : '@mobiris';

	?>
	<!-- Twitter Card Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="<?php echo esc_attr( $twitter_site ); ?>" />

	<?php
	if ( is_singular() && isset( $post ) ) {
		?>
		<meta name="twitter:title" content="<?php echo esc_attr( get_the_title() ); ?>" />
		<meta name="twitter:description" content="<?php echo esc_attr( wp_strip_all_tags( get_the_excerpt() ) ); ?>" />

		<?php
		if ( has_post_thumbnail() ) {
			$image_url = wp_get_attachment_url( get_post_thumbnail_id() );
			?>
			<meta name="twitter:image" content="<?php echo esc_url( $image_url ); ?>" />
			<?php
		}
	} else {
		?>
		<meta name="twitter:title" content="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>" />
		<meta name="twitter:description" content="<?php echo esc_attr( get_bloginfo( 'description' ) ); ?>" />

		<?php
		if ( has_custom_logo() ) {
			$logo_id = get_theme_mod( 'custom_logo' );
			if ( $logo_id ) {
				$logo_url = wp_get_attachment_url( $logo_id );
				?>
				<meta name="twitter:image" content="<?php echo esc_url( $logo_url ); ?>" />
				<?php
			}
		}
	}
}
add_action( 'wp_head', 'mobiris_output_twitter_tags' );

/**
 * Output JSON-LD Organization schema.
 *
 * Includes company name, URL, logo, contact point, and social profiles.
 *
 * @return string JSON-LD script tag.
 */
function mobiris_organization_schema() {
	$company_name = mobiris_get_option( 'company_name', 'Mobiris' );
	$company_url  = home_url();
	$contact_email = mobiris_get_option( 'contact_email', 'hello@mobiris.ng' );
	$contact_phone = mobiris_get_option( 'contact_phone', '+2348053108039' );

	// Build social profiles array.
	$social_links = mobiris_get_social_links();
	$social_urls  = array();

	foreach ( $social_links as $link ) {
		if ( ! empty( $link['url'] ) ) {
			$social_urls[] = $link['url'];
		}
	}

	// Organization schema.
	$schema = array(
		'@context'       => 'https://schema.org',
		'@type'          => 'Organization',
		'name'           => $company_name,
		'url'            => $company_url,
		'contactPoint'   => array(
			'@type'       => 'ContactPoint',
			'contactType' => 'Customer Service',
			'email'       => $contact_email,
			'telephone'   => $contact_phone,
		),
		'sameAs'         => $social_urls,
	);

	// Add logo if available.
	if ( has_custom_logo() ) {
		$logo_id = get_theme_mod( 'custom_logo' );
		if ( $logo_id ) {
			$logo_url = wp_get_attachment_url( $logo_id );
			$logo_obj = wp_get_attachment_metadata( $logo_id );

			$schema['logo'] = array(
				'@type'  => 'ImageObject',
				'url'    => $logo_url,
				'width'  => isset( $logo_obj['width'] ) ? $logo_obj['width'] : 350,
				'height' => isset( $logo_obj['height'] ) ? $logo_obj['height'] : 100,
			);
		}
	}

	return wp_json_encode( $schema );
}

/**
 * Output JSON-LD SoftwareApplication schema for the Mobiris app.
 *
 * @return string JSON-LD script tag.
 */
function mobiris_software_application_schema() {
	$app_links = mobiris_get_app_links();
	$app_name  = mobiris_get_option( 'company_name', 'Mobiris' );
	$app_description = __( 'Fleet operations platform for vehicle-for-hire operators in Africa', 'mobiris' );

	// Build offer array.
	$offers = array(
		array(
			'@type'         => 'Offer',
			'price'         => '0',
			'priceCurrency' => 'NGN',
			'name'          => __( 'Starter Plan', 'mobiris' ),
			'url'           => home_url( '/pricing#starter' ),
		),
		array(
			'@type'         => 'Offer',
			'price'         => '35000',
			'priceCurrency' => 'NGN',
			'name'          => __( 'Growth Plan', 'mobiris' ),
			'url'           => home_url( '/pricing#growth' ),
		),
		array(
			'@type'         => 'Offer',
			'name'          => __( 'Enterprise Plan', 'mobiris' ),
			'url'           => home_url( '/pricing#enterprise' ),
		),
	);

	$schema = array(
		'@context'             => 'https://schema.org',
		'@type'                => 'SoftwareApplication',
		'name'                 => $app_name,
		'description'          => $app_description,
		'applicationCategory'  => 'BusinessApplication',
		'operatingSystem'      => array( 'Web', 'iOS', 'Android' ),
		'offers'               => $offers,
	);

	// Add download URLs if available.
	if ( $app_links['ios']['available'] ) {
		$schema['downloadUrl'] = $app_links['ios']['url'];
	}

	return wp_json_encode( $schema );
}

/**
 * Output JSON-LD WebSite schema with SearchAction.
 *
 * @return string JSON-LD script tag.
 */
function mobiris_website_schema() {
	$site_name = get_bloginfo( 'name' );
	$site_url  = home_url();

	$schema = array(
		'@context'      => 'https://schema.org',
		'@type'         => 'WebSite',
		'name'          => $site_name,
		'url'           => $site_url,
		'potentialAction' => array(
			'@type'       => 'SearchAction',
			'target'      => array(
				'@type'       => 'EntryPoint',
				'urlTemplate' => $site_url . '/?s={search_term_string}',
			),
			'query-input'  => 'required name=search_term_string',
		),
	);

	return wp_json_encode( $schema );
}

/**
 * Output all schema markup in footer.
 *
 * @return void
 */
function mobiris_output_schema_markup() {
	// Always output Organization schema.
	?>
	<script type="application/ld+json">
	<?php echo wp_kses_post( mobiris_organization_schema() ); ?>
	</script>
	<?php

	// Output SoftwareApplication schema on homepage and app pages.
	if ( is_front_page() || is_page( 'app' ) ) {
		?>
		<script type="application/ld+json">
		<?php echo wp_kses_post( mobiris_software_application_schema() ); ?>
		</script>
		<?php
	}

	// Output WebSite schema on homepage.
	if ( is_front_page() ) {
		?>
		<script type="application/ld+json">
		<?php echo wp_kses_post( mobiris_website_schema() ); ?>
		</script>
		<?php
	}
}
add_action( 'wp_footer', 'mobiris_output_schema_markup' );

/**
 * Add canonical link to head.
 *
 * @return void
 */
function mobiris_add_canonical_link() {
	$canonical_url = '';

	if ( is_singular() ) {
		$canonical_url = get_permalink();
	} elseif ( is_home() || is_front_page() ) {
		$canonical_url = home_url();
	} elseif ( is_archive() ) {
		$canonical_url = get_the_archive_title();
		// For taxonomy archives.
		if ( is_category() || is_tag() || is_tax() ) {
			$canonical_url = get_term_link( get_queried_object() );
		}
	} elseif ( is_paged() ) {
		// For paginated content.
		$canonical_url = home_url( $_SERVER['REQUEST_URI'] ?? '' );
	}

	if ( ! empty( $canonical_url ) ) {
		echo '<link rel="canonical" href="' . esc_url( $canonical_url ) . '" />' . "\n";
	}
}
add_action( 'wp_head', 'mobiris_add_canonical_link', 20 );

/**
 * Set document title separator.
 *
 * @param string $sep The separator string.
 * @return string Modified separator.
 */
function mobiris_set_title_separator( $sep ) {
	return '|';
}
add_filter( 'document_title_separator', 'mobiris_set_title_separator' );

/**
 * Add noindex meta for search and 404 pages.
 *
 * @return void
 */
function mobiris_add_noindex_meta() {
	// Noindex search results.
	if ( is_search() ) {
		echo '<meta name="robots" content="noindex, follow" />' . "\n";
		return;
	}

	// Noindex 404 pages.
	if ( is_404() ) {
		echo '<meta name="robots" content="noindex, follow" />' . "\n";
		return;
	}

	// Option to noindex other pages via customizer or filter.
	if ( apply_filters( 'mobiris_add_noindex', false ) ) {
		echo '<meta name="robots" content="noindex, follow" />' . "\n";
	}
}
add_action( 'wp_head', 'mobiris_add_noindex_meta' );

/**
 * Remove WordPress version meta tag for security.
 *
 * @return void
 */
function mobiris_remove_wp_version() {
	// Remove from head.
	remove_action( 'wp_head', 'wp_generator' );

	// Also handle any remaining version headers.
	if ( ! is_admin() ) {
		error_reporting( 0 );
	}
}
add_action( 'init', 'mobiris_remove_wp_version' );

/**
 * Remove unnecessary header info.
 *
 * @param string $src The src attribute value.
 * @return string
 */
function mobiris_remove_script_version( $src ) {
	if ( strpos( $src, '?ver=' ) ) {
		$src = remove_query_arg( 'ver', $src );
	}
	return $src;
}
// Uncomment to minimize query strings on production.
// add_filter( 'script_loader_src', 'mobiris_remove_script_version', 15, 1 );
// add_filter( 'style_loader_src', 'mobiris_remove_script_version', 15, 1 );

/**
 * Redirect old URLs to prevent 404s and maintain SEO (optional).
 * Add redirect rules here if migrating from another site.
 *
 * @return void
 */
function mobiris_seo_redirects() {
	// Example redirect (uncomment and modify as needed):
	// if ( is_404() && ! is_admin() ) {
	//     wp_redirect( home_url( '/' ), 301 );
	//     exit;
	// }
}
// add_action( 'template_redirect', 'mobiris_seo_redirects' );

/**
 * Add breadcrumb schema markup (called from template-functions.php).
 * This is referenced in the template functions file and applied there.
 */
