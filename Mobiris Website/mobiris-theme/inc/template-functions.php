<?php
/**
 * Template Helper Functions
 * Utility functions for use in theme templates and components.
 *
 * @package Mobiris
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Get theme option with fallback default.
 *
 * @param string $key     The option key (stored in customizer with prefix mobiris_).
 * @param string $default Fallback default value.
 * @return mixed The option value or default.
 */
function mobiris_get_option( $key, $default = '' ) {
	// If key doesn't start with prefix, add it.
	if ( strpos( $key, 'mobiris_' ) !== 0 ) {
		$key = 'mobiris_' . $key;
	}

	$value = get_theme_mod( $key, $default );

	return ! empty( $value ) ? $value : $default;
}

/**
 * Render a button or link element.
 *
 * Styles:
 * - primary: filled blue button
 * - secondary: outlined button
 * - ghost: text link with arrow
 * - dark: navy filled button
 *
 * @param string $label Label text.
 * @param string $url   Target URL.
 * @param string $style Button style. Default: 'primary'.
 * @param array  $attrs Additional HTML attributes (class, id, data-*, etc.).
 * @return string HTML button/link element.
 */
function mobiris_render_button( $label, $url, $style = 'primary', $attrs = array() ) {
	if ( empty( $label ) || empty( $url ) ) {
		return '';
	}

	// Build base classes.
	$classes = array( 'btn', 'btn-' . sanitize_html_class( $style ) );

	// Add custom classes from attrs if provided.
	if ( ! empty( $attrs['class'] ) ) {
		$classes[] = $attrs['class'];
		unset( $attrs['class'] );
	}

	// Build class string.
	$class_string = implode( ' ', $classes );

	// Build remaining attributes.
	$attr_string = '';
	foreach ( $attrs as $key => $value ) {
		if ( ! empty( $value ) ) {
			$attr_string .= ' ' . sanitize_key( $key ) . '="' . esc_attr( $value ) . '"';
		}
	}

	// Determine tag (link or button).
	$tag = 'a';
	$href = ' href="' . esc_url( $url ) . '"';
	$target = '';

	// Check if URL is external (opens in new tab).
	if ( ! empty( $attrs['target'] ) && '_blank' === $attrs['target'] ) {
		$target = ' target="_blank" rel="noopener noreferrer"';
	}

	// Build HTML.
	$html = '<' . $tag . ' class="' . esc_attr( $class_string ) . '"' . $href . $target . $attr_string . '>';
	$html .= esc_html( $label );

	// Add arrow for ghost style.
	if ( 'ghost' === $style ) {
		$html .= ' <svg class="btn-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
	}

	$html .= '</' . $tag . '>';

	return $html;
}

/**
 * Render a badge or pill element.
 *
 * Types: default, success, warning, error, info.
 *
 * @param string $text Text content of the badge.
 * @param string $type Badge type/color. Default: 'default'.
 * @return string HTML badge element.
 */
function mobiris_render_badge( $text, $type = 'default' ) {
	if ( empty( $text ) ) {
		return '';
	}

	$allowed_types = array( 'default', 'success', 'warning', 'error', 'info' );
	$type          = in_array( $type, $allowed_types, true ) ? $type : 'default';

	return '<span class="badge badge-' . esc_attr( $type ) . '">' . esc_html( $text ) . '</span>';
}

/**
 * Get social media links from customizer settings.
 *
 * @return array Array of ['platform' => 'twitter', 'url' => '...', 'icon' => '<svg>...'] for each active social link.
 */
function mobiris_get_social_links() {
	$platforms = array(
		'twitter'   => __( 'Twitter / X', 'mobiris' ),
		'linkedin'  => __( 'LinkedIn', 'mobiris' ),
		'facebook'  => __( 'Facebook', 'mobiris' ),
		'instagram' => __( 'Instagram', 'mobiris' ),
		'youtube'   => __( 'YouTube', 'mobiris' ),
	);

	$social_links = array();

	foreach ( $platforms as $platform => $label ) {
		$url = mobiris_get_option( 'social_' . $platform );

		if ( ! empty( $url ) ) {
			$social_links[] = array(
				'platform' => $platform,
				'label'    => $label,
				'url'      => esc_url( $url ),
				'icon'     => mobiris_get_social_icon( $platform ),
			);
		}
	}

	return $social_links;
}

/**
 * Get SVG icon for social platform.
 *
 * @param string $platform Platform slug (twitter, linkedin, facebook, instagram, youtube).
 * @return string SVG HTML for the icon.
 */
function mobiris_get_social_icon( $platform ) {
	$icons = array(
		'twitter'   => '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75-2.25 8-7 8-7"/></svg>',
		'linkedin'  => '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>',
		'facebook'  => '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a6 6 0 00-6 6v9h-2v4h2v1h4v-1h3v-4h-3V8a2 2 0 012-2h3V2z"/></svg>',
		'instagram' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>',
		'youtube'   => '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
	);

	return isset( $icons[ $platform ] ) ? $icons[ $platform ] : '';
}

/**
 * Get app download links from customizer settings.
 *
 * @return array Array with 'ios_url', 'android_url', 'web_url', and 'available' flag.
 */
function mobiris_get_app_links() {
	$ios_url     = mobiris_get_option( 'app_ios_url' );
	$android_url = mobiris_get_option( 'app_android_url' );
	$web_url     = mobiris_get_option( 'app_web_url', home_url( '/app' ) );

	// Mark as placeholder if empty.
	$ios_available     = ! empty( $ios_url );
	$android_available = ! empty( $android_url );
	$web_available     = ! empty( $web_url );

	return array(
		'ios'           => array(
			'url'       => esc_url( $ios_url ),
			'available' => $ios_available,
		),
		'android'       => array(
			'url'       => esc_url( $android_url ),
			'available' => $android_available,
		),
		'web'           => array(
			'url'       => esc_url( $web_url ),
			'available' => $web_available,
		),
	);
}

/**
 * Output accessible breadcrumb navigation with schema.org markup.
 *
 * Displays: Home > Category > Post Title
 *
 * @return void
 */
function mobiris_breadcrumbs() {
	// Skip on homepage.
	if ( is_front_page() ) {
		return;
	}

	$breadcrumbs = array();
	$schema_items = array();

	// Home link.
	$breadcrumbs[] = '<a href="' . esc_url( home_url() ) . '">' . esc_html__( 'Home', 'mobiris' ) . '</a>';
	$schema_items[] = array(
		'@type'    => 'ListItem',
		'position' => 1,
		'name'     => __( 'Home', 'mobiris' ),
		'item'     => home_url(),
	);

	$position = 2;

	// Category/Taxonomy term.
	if ( is_category() || is_tax() ) {
		$term = get_queried_object();
		if ( $term ) {
			$breadcrumbs[] = esc_html( $term->name );
			$schema_items[] = array(
				'@type'    => 'ListItem',
				'position' => $position++,
				'name'     => $term->name,
				'item'     => get_term_link( $term ),
			);
		}
	} elseif ( is_singular() ) {
		// Post's parent category if exists.
		$post_type = get_post_type();
		$taxonomies = get_object_taxonomies( $post_type );

		if ( ! empty( $taxonomies ) ) {
			$terms = get_the_terms( get_the_ID(), $taxonomies[0] );
			if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
				$term = $terms[0];
				$breadcrumbs[] = '<a href="' . esc_url( get_term_link( $term ) ) . '">' . esc_html( $term->name ) . '</a>';
				$schema_items[] = array(
					'@type'    => 'ListItem',
					'position' => $position++,
					'name'     => $term->name,
					'item'     => get_term_link( $term ),
				);
			}
		}

		// Current post.
		$breadcrumbs[] = esc_html( get_the_title() );
		$schema_items[] = array(
			'@type'    => 'ListItem',
			'position' => $position,
			'name'     => get_the_title(),
			'item'     => get_permalink(),
		);
	}

	// Output HTML.
	?>
	<nav class="breadcrumbs" aria-label="<?php esc_attr_e( 'Breadcrumb', 'mobiris' ); ?>">
		<?php echo wp_kses_post( implode( ' <span class="sep">/</span> ', $breadcrumbs ) ); ?>
	</nav>

	<?php
	// Output JSON-LD schema.
	$schema = array(
		'@context' => 'https://schema.org',
		'@type'    => 'BreadcrumbList',
		'itemListElement' => $schema_items,
	);

	echo '<script type="application/ld+json">' . wp_json_encode( $schema ) . '</script>' . "\n";
}

/**
 * Calculate estimated reading time for post content.
 *
 * Assumes average reading speed of 200 words per minute.
 *
 * @param int|null $post_id Post ID. If null, uses current post.
 * @return string Reading time string (e.g., "5 min read").
 */
function mobiris_reading_time( $post_id = null ) {
	if ( null === $post_id ) {
		$post_id = get_the_ID();
	}

	$post = get_post( $post_id );
	if ( ! $post ) {
		return '';
	}

	// Extract text and count words.
	$content     = wp_strip_all_tags( $post->post_content );
	$word_count  = str_word_count( $content );
	$reading_time = max( 1, ceil( $word_count / 200 ) ); // 200 words per minute.

	return sprintf(
		/* translators: %d is the reading time in minutes */
		esc_html( _n( '%d min read', '%d min read', $reading_time, 'mobiris' ) ),
		$reading_time
	);
}

/**
 * Get latest posts or custom post types.
 *
 * @param string $post_type Post type. Default: 'post'.
 * @param int    $count     Number of posts to retrieve. Default: 3.
 * @param string $category  Optional taxonomy/category slug to filter by.
 * @return WP_Query Query object with posts.
 */
function mobiris_get_latest_posts( $post_type = 'post', $count = 3, $category = null ) {
	$args = array(
		'post_type'      => $post_type,
		'posts_per_page' => (int) $count,
		'orderby'        => 'date',
		'order'          => 'DESC',
		'post_status'    => 'publish',
	);

	// Add category filter if provided.
	if ( ! empty( $category ) ) {
		// Determine taxonomy based on post type.
		$tax_map = array(
			'guide'       => 'guide_category',
			'solution'    => 'solution_industry',
			'mobiris_feature' => 'feature_module',
			'faq'         => 'faq_category',
		);

		$taxonomy = isset( $tax_map[ $post_type ] ) ? $tax_map[ $post_type ] : 'category';

		$args['tax_query'] = array(
			array(
				'taxonomy' => $taxonomy,
				'field'    => 'slug',
				'terms'    => $category,
			),
		);
	}

	return new WP_Query( $args );
}

/**
 * Output JSON-LD FAQPage schema for a set of FAQs.
 *
 * @param array $faqs Array of FAQ items. Each item should have 'question' and 'answer' keys.
 * @return void
 */
function mobiris_faq_schema( $faqs ) {
	if ( empty( $faqs ) || ! is_array( $faqs ) ) {
		return;
	}

	$main_entity = array();

	foreach ( $faqs as $faq ) {
		if ( ! isset( $faq['question'] ) || ! isset( $faq['answer'] ) ) {
			continue;
		}

		$main_entity[] = array(
			'@type'          => 'Question',
			'name'           => sanitize_text_field( $faq['question'] ),
			'acceptedAnswer' => array(
				'@type' => 'Answer',
				'text'  => wp_strip_all_tags( $faq['answer'] ),
			),
		);
	}

	if ( empty( $main_entity ) ) {
		return;
	}

	$schema = array(
		'@context'    => 'https://schema.org',
		'@type'       => 'FAQPage',
		'mainEntity'  => $main_entity,
	);

	echo '<script type="application/ld+json">' . wp_json_encode( $schema ) . '</script>' . "\n";
}

/**
 * Get trimmed excerpt with custom word length.
 *
 * @param int|null $length Number of words. Default: 25.
 * @param int|null $post   Post ID or null for current post.
 * @return string Trimmed excerpt text.
 */
function mobiris_excerpt( $length = 25, $post = null ) {
	if ( null === $post ) {
		$post = get_the_ID();
	}

	$post_obj = get_post( $post );
	if ( ! $post_obj ) {
		return '';
	}

	// Use custom excerpt if available.
	if ( ! empty( $post_obj->post_excerpt ) ) {
		$text = $post_obj->post_excerpt;
	} else {
		// Use post content.
		$text = $post_obj->post_content;
	}

	// Strip tags.
	$text = wp_strip_all_tags( $text );

	// Trim to word count.
	$words = explode( ' ', $text );
	$words = array_slice( $words, 0, (int) $length );
	$text  = implode( ' ', $words );

	// Add ellipsis if truncated.
	if ( count( explode( ' ', $post_obj->post_content ) ) > (int) $length ) {
		$text .= '...';
	}

	return $text;
}

/**
 * Format amount as Nigerian Naira currency.
 *
 * @param float|int $amount Amount to format.
 * @return string Formatted currency string (e.g., "₦15,000").
 */
function mobiris_format_naira( $amount ) {
	if ( ! is_numeric( $amount ) ) {
		return '';
	}

	return '₦' . number_format( (float) $amount, 0, '.', ',' );
}

/**
 * Generate WhatsApp click-to-chat URL.
 *
 * @param string $message Optional message to pre-fill in WhatsApp.
 * @return string WhatsApp URL.
 */
function mobiris_whatsapp_link( $message = '' ) {
	// Default WhatsApp number from brand context.
	$whatsapp_number = mobiris_get_option( 'whatsapp_number', '+2348053108039' );

	// Ensure number is clean (no spaces, special chars except +).
	$whatsapp_number = preg_replace( '/[^0-9+]/', '', $whatsapp_number );

	if ( empty( $message ) ) {
		$message = __( 'Hi Mobiris, I have a question about your fleet operations platform.', 'mobiris' );
	}

	// Build WhatsApp URL.
	$url = 'https://wa.me/' . esc_attr( str_replace( '+', '', $whatsapp_number ) ) . '?text=' . urlencode( $message );

	return $url;
}

/**
 * Output responsive hero image with srcset and lazy loading.
 *
 * Hero images are above-fold, so lazy loading is disabled.
 *
 * @param int    $image_id Image attachment ID.
 * @param string $alt      Alt text for image.
 * @return void
 */
function mobiris_output_hero_image( $image_id, $alt = '' ) {
	if ( empty( $image_id ) ) {
		return;
	}

	// Get image data.
	$src = wp_get_attachment_image_src( $image_id, 'hero-image' );
	if ( ! $src ) {
		return;
	}

	// Get alt text.
	if ( empty( $alt ) ) {
		$alt = get_post_meta( $image_id, '_wp_attachment_image_alt', true );
	}

	// Get image srcset for responsive images.
	$srcset = wp_get_attachment_image_srcset( $image_id, 'hero-image' );
	$sizes  = wp_get_attachment_image_sizes( $image_id, 'hero-image' );

	?>
	<img
		src="<?php echo esc_url( $src[0] ); ?>"
		<?php echo ! empty( $srcset ) ? 'srcset="' . esc_attr( $srcset ) . '"' : ''; ?>
		<?php echo ! empty( $sizes ) ? 'sizes="' . esc_attr( $sizes ) . '"' : ''; ?>
		alt="<?php echo esc_attr( $alt ); ?>"
		width="<?php echo esc_attr( $src[1] ); ?>"
		height="<?php echo esc_attr( $src[2] ); ?>"
		class="hero-image"
		loading="eager"
	/>
	<?php
}

/**
 * Output post meta information row (date, author, reading time, category).
 *
 * Includes schema.org markup for proper SEO.
 *
 * @param int|null $post_id Post ID. If null, uses current post.
 * @return void
 */
function mobiris_post_meta_row( $post_id = null ) {
	if ( null === $post_id ) {
		$post_id = get_the_ID();
	}

	$post = get_post( $post_id );
	if ( ! $post ) {
		return;
	}

	$post_type = get_post_type( $post_id );
	?>

	<div class="post-meta-row" data-post-id="<?php echo esc_attr( $post_id ); ?>">
		<?php
		// Published date.
		if ( 'faq' !== $post_type && 'testimonial' !== $post_type ) {
			?>
			<time class="post-date" datetime="<?php echo esc_attr( get_the_date( 'c', $post_id ) ); ?>" itemprop="datePublished">
				<?php echo esc_html( get_the_date( 'F j, Y', $post_id ) ); ?>
			</time>
			<?php
		}

		// Author (skip for testimonials).
		if ( 'testimonial' !== $post_type ) {
			$author_name = get_the_author_meta( 'display_name', $post->post_author );
			$author_url  = get_author_posts_url( $post->post_author );
			?>
			<span class="separator">•</span>
			<a href="<?php echo esc_url( $author_url ); ?>" class="post-author" itemprop="author">
				<?php echo esc_html( $author_name ); ?>
			</a>
			<?php
		}

		// Reading time.
		if ( in_array( $post_type, array( 'post', 'guide', 'solution' ), true ) ) {
			?>
			<span class="separator">•</span>
			<span class="reading-time"><?php echo esc_html( mobiris_reading_time( $post_id ) ); ?></span>
			<?php
		}

		// Category/Taxonomy.
		$taxonomies = get_object_taxonomies( $post_type );
		if ( ! empty( $taxonomies ) ) {
			$terms = get_the_terms( $post_id, $taxonomies[0] );
			if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
				$term = $terms[0];
				?>
				<span class="separator">•</span>
				<a href="<?php echo esc_url( get_term_link( $term ) ); ?>" class="post-category">
					<?php echo esc_html( $term->name ); ?>
				</a>
				<?php
			}
		}
		?>
	</div>

	<?php
	// Output schema.org metadata.
	$schema_data = array(
		'@context'      => 'https://schema.org',
		'@type'         => 'Article',
		'headline'      => get_the_title( $post_id ),
		'description'   => wp_strip_all_tags( get_the_excerpt( $post_id ) ),
		'image'         => wp_get_attachment_url( get_post_thumbnail_id( $post_id ) ),
		'datePublished' => get_the_date( 'c', $post_id ),
		'dateModified'  => get_the_modified_date( 'c', $post_id ),
		'author'        => array(
			'@type' => 'Person',
			'name'  => get_the_author_meta( 'display_name', $post->post_author ),
		),
	);

	echo '<script type="application/ld+json">' . wp_json_encode( $schema_data ) . '</script>' . "\n";
}
