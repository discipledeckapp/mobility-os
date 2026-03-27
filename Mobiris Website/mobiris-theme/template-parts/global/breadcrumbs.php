<?php
/**
 * Breadcrumbs Template Part
 *
 * Standalone breadcrumbs navigation component with schema.org markup.
 * Handles: singular posts, pages, CPTs, taxonomy archives, search, 404.
 *
 * @package Mobiris
 * @since 1.0.0
 */

// Build breadcrumb array
$breadcrumbs = array();

// Home
$breadcrumbs[] = array(
	'label' => esc_html__( 'Home', 'mobiris' ),
	'url'   => home_url( '/' ),
	'pos'   => 1,
);

// Get context
$queried_object = get_queried_object();
$post_type      = get_post_type();
$is_singular    = is_singular();
$is_archive     = is_archive();
$is_search      = is_search();
$is_404         = is_404();

// Singular post or page
if ( $is_singular && ! is_front_page() ) {
	// Get post type archive link (if CPT)
	if ( 'post' !== $post_type ) {
		$cpt_obj = get_post_type_object( $post_type );
		if ( $cpt_obj && $cpt_obj->has_archive ) {
			$breadcrumbs[] = array(
				'label' => esc_html( $cpt_obj->label ),
				'url'   => get_post_type_archive_link( $post_type ),
				'pos'   => 2,
			);
		}
	}

	// Get taxonomy terms for category or guide_category
	$taxonomies = get_object_taxonomies( $post_type );
	if ( ! empty( $taxonomies ) ) {
		$primary_tax = '';

		// Prefer 'category' or 'guide_category' as primary
		if ( in_array( 'category', $taxonomies, true ) ) {
			$primary_tax = 'category';
		} elseif ( in_array( 'guide_category', $taxonomies, true ) ) {
			$primary_tax = 'guide_category';
		} else {
			$primary_tax = $taxonomies[0];
		}

		$terms = wp_get_post_terms( get_the_ID(), $primary_tax );
		if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
			$primary_term = $terms[0];
			$breadcrumbs[] = array(
				'label' => esc_html( $primary_term->name ),
				'url'   => get_term_link( $primary_term ),
				'pos'   => count( $breadcrumbs ) + 1,
			);
		}
	}

	// Current post (no link)
	$pos = count( $breadcrumbs ) + 1;
	$breadcrumbs[] = array(
		'label' => wp_strip_all_tags( get_the_title() ),
		'url'   => '',
		'pos'   => $pos,
	);
}

// Taxonomy/Category archive
elseif ( $is_archive ) {
	if ( is_category() || is_tag() || is_tax() ) {
		// For post category/tag
		if ( is_category() || is_tag() ) {
			$breadcrumbs[] = array(
				'label' => get_the_archive_title(),
				'url'   => '',
				'pos'   => 2,
			);
		} else {
			// Custom taxonomy
			$breadcrumbs[] = array(
				'label' => get_the_archive_title(),
				'url'   => '',
				'pos'   => 2,
			);
		}
	}

	// Author archive
	elseif ( is_author() ) {
		$breadcrumbs[] = array(
			'label' => sprintf(
				esc_html__( 'Author: %s', 'mobiris' ),
				get_the_author()
			),
			'url'   => '',
			'pos'   => 2,
		);
	}

	// Date archive
	elseif ( is_date() ) {
		$breadcrumbs[] = array(
			'label' => get_the_archive_title(),
			'url'   => '',
			'pos'   => 2,
		);
	}

	// Post type archive
	elseif ( is_post_type_archive() ) {
		$cpt_obj = get_post_type_object( $post_type );
		if ( $cpt_obj ) {
			$breadcrumbs[] = array(
				'label' => esc_html( $cpt_obj->label ),
				'url'   => '',
				'pos'   => 2,
			);
		}
	}
}

// Search
elseif ( $is_search ) {
	$breadcrumbs[] = array(
		'label' => sprintf(
			esc_html__( 'Search results for: %s', 'mobiris' ),
			get_search_query()
		),
		'url'   => '',
		'pos'   => 2,
	);
}

// 404
elseif ( $is_404 ) {
	$breadcrumbs[] = array(
		'label' => esc_html__( 'Page not found', 'mobiris' ),
		'url'   => '',
		'pos'   => 2,
	);
}

// Output breadcrumbs
if ( ! empty( $breadcrumbs ) ) {
	?>
	<nav class="breadcrumbs" aria-label="<?php esc_attr_e( 'Breadcrumb', 'mobiris' ); ?>" itemscope itemtype="https://schema.org/BreadcrumbList">
		<ol class="breadcrumbs-list">
			<?php
			foreach ( $breadcrumbs as $breadcrumb ) {
				?>
				<li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
					<?php
					if ( ! empty( $breadcrumb['url'] ) ) {
						?>
						<a href="<?php echo esc_url( $breadcrumb['url'] ); ?>" itemprop="item">
							<span itemprop="name"><?php echo esc_html( $breadcrumb['label'] ); ?></span>
						</a>
						<?php
					} else {
						?>
						<span itemprop="name"><?php echo esc_html( $breadcrumb['label'] ); ?></span>
						<?php
					}
					?>
					<meta itemprop="position" content="<?php echo esc_attr( $breadcrumb['pos'] ); ?>">
				</li>
				<?php
			}
			?>
		</ol>
	</nav>
	<?php
}
