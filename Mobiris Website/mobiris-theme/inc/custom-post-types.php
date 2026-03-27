<?php
/**
 * Custom Post Types and Taxonomies
 * Register post types for guides, FAQs, testimonials, solutions, and features.
 *
 * @package Mobiris
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register custom post types.
 *
 * @return void
 */
function mobiris_register_post_types() {
	// Guide post type.
	register_post_type(
		'guide',
		array(
			'labels'              => array(
				'name'               => __( 'Guides', 'mobiris' ),
				'singular_name'      => __( 'Guide', 'mobiris' ),
				'menu_name'          => __( 'Guides & Resources', 'mobiris' ),
				'all_items'          => __( 'All Guides', 'mobiris' ),
				'add_new'            => __( 'Add New Guide', 'mobiris' ),
				'add_new_item'       => __( 'Add New Guide', 'mobiris' ),
				'edit'               => __( 'Edit', 'mobiris' ),
				'edit_item'          => __( 'Edit Guide', 'mobiris' ),
				'new_item'           => __( 'New Guide', 'mobiris' ),
				'view'               => __( 'View Guide', 'mobiris' ),
				'view_item'          => __( 'View Guide', 'mobiris' ),
				'search_items'       => __( 'Search Guides', 'mobiris' ),
				'not_found'          => __( 'No guides found', 'mobiris' ),
				'not_found_in_trash' => __( 'No guides found in trash', 'mobiris' ),
			),
			'public'              => true,
			'hierarchical'        => false,
			'exclude_from_search' => false,
			'publicly_queryable'  => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => true,
			'rest_base'           => 'guides',
			'rest_controller_class' => 'WP_REST_Posts_Controller',
			'has_archive'         => true,
			'query_var'           => true,
			'can_export'          => true,
			'rewrite'             => array(
				'slug'       => 'guides',
				'with_front' => true,
			),
			'supports'            => array(
				'title',
				'editor',
				'thumbnail',
				'excerpt',
				'custom-fields',
				'author',
				'revisions',
				'comments',
			),
			'menu_icon'           => 'dashicons-book-alt',
			'taxonomies'          => array( 'guide_category', 'guide_tag' ),
		)
	);

	// FAQ post type.
	register_post_type(
		'faq',
		array(
			'labels'              => array(
				'name'               => __( 'FAQs', 'mobiris' ),
				'singular_name'      => __( 'FAQ', 'mobiris' ),
				'menu_name'          => __( 'Frequently Asked Questions', 'mobiris' ),
				'all_items'          => __( 'All FAQs', 'mobiris' ),
				'add_new'            => __( 'Add New FAQ', 'mobiris' ),
				'add_new_item'       => __( 'Add New FAQ', 'mobiris' ),
				'edit'               => __( 'Edit', 'mobiris' ),
				'edit_item'          => __( 'Edit FAQ', 'mobiris' ),
				'new_item'           => __( 'New FAQ', 'mobiris' ),
				'view'               => __( 'View FAQ', 'mobiris' ),
				'view_item'          => __( 'View FAQ', 'mobiris' ),
				'search_items'       => __( 'Search FAQs', 'mobiris' ),
				'not_found'          => __( 'No FAQs found', 'mobiris' ),
				'not_found_in_trash' => __( 'No FAQs found in trash', 'mobiris' ),
			),
			'public'              => true,
			'hierarchical'        => false,
			'exclude_from_search' => false,
			'publicly_queryable'  => false,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => true,
			'rest_base'           => 'faqs',
			'rest_controller_class' => 'WP_REST_Posts_Controller',
			'has_archive'         => false,
			'query_var'           => false,
			'can_export'          => true,
			'rewrite'             => false,
			'supports'            => array(
				'title',
				'editor',
				'custom-fields',
				'revisions',
			),
			'menu_icon'           => 'dashicons-editor-help',
			'taxonomies'          => array( 'faq_category' ),
		)
	);

	// Testimonial post type.
	register_post_type(
		'testimonial',
		array(
			'labels'              => array(
				'name'               => __( 'Testimonials', 'mobiris' ),
				'singular_name'      => __( 'Testimonial', 'mobiris' ),
				'menu_name'          => __( 'Testimonials', 'mobiris' ),
				'all_items'          => __( 'All Testimonials', 'mobiris' ),
				'add_new'            => __( 'Add New Testimonial', 'mobiris' ),
				'add_new_item'       => __( 'Add New Testimonial', 'mobiris' ),
				'edit'               => __( 'Edit', 'mobiris' ),
				'edit_item'          => __( 'Edit Testimonial', 'mobiris' ),
				'new_item'           => __( 'New Testimonial', 'mobiris' ),
				'view'               => __( 'View Testimonial', 'mobiris' ),
				'view_item'          => __( 'View Testimonial', 'mobiris' ),
				'search_items'       => __( 'Search Testimonials', 'mobiris' ),
				'not_found'          => __( 'No testimonials found', 'mobiris' ),
				'not_found_in_trash' => __( 'No testimonials found in trash', 'mobiris' ),
			),
			'public'              => true,
			'hierarchical'        => false,
			'exclude_from_search' => false,
			'publicly_queryable'  => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => true,
			'rest_base'           => 'testimonials',
			'rest_controller_class' => 'WP_REST_Posts_Controller',
			'has_archive'         => false,
			'query_var'           => false,
			'can_export'          => true,
			'rewrite'             => array(
				'slug'       => 'testimonials',
				'with_front' => false,
			),
			'supports'            => array(
				'title',
				'editor',
				'thumbnail',
				'custom-fields',
				'revisions',
			),
			'menu_icon'           => 'dashicons-format-quote',
		)
	);

	// Solution post type.
	register_post_type(
		'solution',
		array(
			'labels'              => array(
				'name'               => __( 'Solutions', 'mobiris' ),
				'singular_name'      => __( 'Solution', 'mobiris' ),
				'menu_name'          => __( 'Solutions & Use Cases', 'mobiris' ),
				'all_items'          => __( 'All Solutions', 'mobiris' ),
				'add_new'            => __( 'Add New Solution', 'mobiris' ),
				'add_new_item'       => __( 'Add New Solution', 'mobiris' ),
				'edit'               => __( 'Edit', 'mobiris' ),
				'edit_item'          => __( 'Edit Solution', 'mobiris' ),
				'new_item'           => __( 'New Solution', 'mobiris' ),
				'view'               => __( 'View Solution', 'mobiris' ),
				'view_item'          => __( 'View Solution', 'mobiris' ),
				'search_items'       => __( 'Search Solutions', 'mobiris' ),
				'not_found'          => __( 'No solutions found', 'mobiris' ),
				'not_found_in_trash' => __( 'No solutions found in trash', 'mobiris' ),
			),
			'public'              => true,
			'hierarchical'        => false,
			'exclude_from_search' => false,
			'publicly_queryable'  => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => true,
			'rest_base'           => 'solutions',
			'rest_controller_class' => 'WP_REST_Posts_Controller',
			'has_archive'         => true,
			'query_var'           => true,
			'can_export'          => true,
			'rewrite'             => array(
				'slug'       => 'solutions',
				'with_front' => true,
			),
			'supports'            => array(
				'title',
				'editor',
				'thumbnail',
				'excerpt',
				'custom-fields',
				'revisions',
				'comments',
			),
			'menu_icon'           => 'dashicons-clipboard',
			'taxonomies'          => array( 'solution_industry' ),
		)
	);

	// Feature post type.
	register_post_type(
		'mobiris_feature',
		array(
			'labels'              => array(
				'name'               => __( 'Features', 'mobiris' ),
				'singular_name'      => __( 'Feature', 'mobiris' ),
				'menu_name'          => __( 'Feature Highlights', 'mobiris' ),
				'all_items'          => __( 'All Features', 'mobiris' ),
				'add_new'            => __( 'Add New Feature', 'mobiris' ),
				'add_new_item'       => __( 'Add New Feature', 'mobiris' ),
				'edit'               => __( 'Edit', 'mobiris' ),
				'edit_item'          => __( 'Edit Feature', 'mobiris' ),
				'new_item'           => __( 'New Feature', 'mobiris' ),
				'view'               => __( 'View Feature', 'mobiris' ),
				'view_item'          => __( 'View Feature', 'mobiris' ),
				'search_items'       => __( 'Search Features', 'mobiris' ),
				'not_found'          => __( 'No features found', 'mobiris' ),
				'not_found_in_trash' => __( 'No features found in trash', 'mobiris' ),
			),
			'public'              => true,
			'hierarchical'        => false,
			'exclude_from_search' => false,
			'publicly_queryable'  => false,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => true,
			'rest_base'           => 'features',
			'rest_controller_class' => 'WP_REST_Posts_Controller',
			'has_archive'         => false,
			'query_var'           => false,
			'can_export'          => true,
			'rewrite'             => array(
				'slug'       => 'features',
				'with_front' => false,
			),
			'supports'            => array(
				'title',
				'editor',
				'thumbnail',
				'excerpt',
				'custom-fields',
				'revisions',
			),
			'menu_icon'           => 'dashicons-star-filled',
			'taxonomies'          => array( 'feature_module' ),
		)
	);

	// Lead Capture post type — stores website leads from the homepage form.
	register_post_type(
		'mobiris_lead',
		array(
			'labels'              => array(
				'name'               => __( 'Leads', 'mobiris' ),
				'singular_name'      => __( 'Lead', 'mobiris' ),
				'menu_name'          => __( 'Website Leads', 'mobiris' ),
				'all_items'          => __( 'All Leads', 'mobiris' ),
				'add_new'            => __( 'Add New Lead', 'mobiris' ),
				'add_new_item'       => __( 'Add New Lead', 'mobiris' ),
				'edit_item'          => __( 'View Lead', 'mobiris' ),
				'not_found'          => __( 'No leads yet', 'mobiris' ),
				'not_found_in_trash' => __( 'No leads in trash', 'mobiris' ),
			),
			'public'              => false,
			'publicly_queryable'  => false,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => false,
			'has_archive'         => false,
			'query_var'           => false,
			'can_export'          => true,
			'rewrite'             => false,
			'supports'            => array( 'title', 'custom-fields' ),
			'menu_icon'           => 'dashicons-businessman',
			'capabilities'        => array(
				'create_posts' => 'do_not_allow',
			),
			'map_meta_cap'        => true,
		)
	);
}
add_action( 'init', 'mobiris_register_post_types' );

/**
 * Register custom taxonomies.
 *
 * @return void
 */
function mobiris_register_taxonomies() {
	// Guide Category taxonomy.
	register_taxonomy(
		'guide_category',
		array( 'guide' ),
		array(
			'labels'            => array(
				'name'          => __( 'Resource Categories', 'mobiris' ),
				'singular_name' => __( 'Resource Category', 'mobiris' ),
			),
			'hierarchical'      => true,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'rest_base'         => 'resource-categories',
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'resource-category' ),
		)
	);

	// Guide Tag taxonomy.
	register_taxonomy(
		'guide_tag',
		array( 'guide' ),
		array(
			'labels'            => array(
				'name'          => __( 'Resource Tags', 'mobiris' ),
				'singular_name' => __( 'Resource Tag', 'mobiris' ),
			),
			'hierarchical'      => false,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'rest_base'         => 'resource-tags',
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'resource-tag' ),
		)
	);

	// FAQ Category taxonomy.
	register_taxonomy(
		'faq_category',
		array( 'faq' ),
		array(
			'labels'            => array(
				'name'          => __( 'FAQ Categories', 'mobiris' ),
				'singular_name' => __( 'FAQ Category', 'mobiris' ),
			),
			'hierarchical'      => true,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'rest_base'         => 'faq-categories',
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'faq-category' ),
		)
	);

	// Solution Industry taxonomy.
	register_taxonomy(
		'solution_industry',
		array( 'solution' ),
		array(
			'labels'            => array(
				'name'          => __( 'Industries', 'mobiris' ),
				'singular_name' => __( 'Industry', 'mobiris' ),
			),
			'hierarchical'      => true,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'rest_base'         => 'industries',
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'industry' ),
		)
	);

	// Feature Module taxonomy.
	register_taxonomy(
		'feature_module',
		array( 'mobiris_feature' ),
		array(
			'labels'            => array(
				'name'          => __( 'Modules', 'mobiris' ),
				'singular_name' => __( 'Module', 'mobiris' ),
			),
			'hierarchical'      => true,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'rest_base'         => 'modules',
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'module' ),
		)
	);
}
add_action( 'init', 'mobiris_register_taxonomies' );

/**
 * Flush rewrite rules on theme activation.
 *
 * @return void
 */
function mobiris_flush_rewrite_rules() {
	mobiris_register_post_types();
	mobiris_register_taxonomies();
	flush_rewrite_rules();
}
add_action( 'after_switch_theme', 'mobiris_flush_rewrite_rules' );

/**
 * Add custom columns to post type list tables.
 *
 * @param array $columns The default columns.
 * @return array Modified columns.
 */
function mobiris_testimonial_columns( $columns ) {
	// Add Company and Role columns.
	$new_columns = array();
	foreach ( $columns as $key => $value ) {
		if ( 'title' === $key ) {
			$new_columns[ $key ] = $value;
			$new_columns['company'] = __( 'Company', 'mobiris' );
			$new_columns['role'] = __( 'Role', 'mobiris' );
		} else {
			$new_columns[ $key ] = $value;
		}
	}
	return $new_columns;
}
add_filter( 'manage_testimonial_posts_columns', 'mobiris_testimonial_columns' );

/**
 * Populate custom testimonial columns with data.
 *
 * @param string $column The column name.
 * @param int    $post_id The post ID.
 * @return void
 */
function mobiris_testimonial_column_content( $column, $post_id ) {
	switch ( $column ) {
		case 'company':
			$company = get_post_meta( $post_id, '_testimonial_company', true );
			echo esc_html( $company ? $company : '—' );
			break;
		case 'role':
			$role = get_post_meta( $post_id, '_testimonial_role', true );
			echo esc_html( $role ? $role : '—' );
			break;
	}
}
add_action( 'manage_testimonial_posts_custom_column', 'mobiris_testimonial_column_content', 10, 2 );

/**
 * Add custom columns to guide post type list table.
 *
 * @param array $columns The default columns.
 * @return array Modified columns.
 */
function mobiris_guide_columns( $columns ) {
	$new_columns = array();
	foreach ( $columns as $key => $value ) {
		if ( 'date' === $key ) {
			$new_columns['category'] = __( 'Category', 'mobiris' );
			$new_columns['read-time'] = __( 'Read Time', 'mobiris' );
			$new_columns[ $key ] = $value;
		} else {
			$new_columns[ $key ] = $value;
		}
	}
	return $new_columns;
}
add_filter( 'manage_guide_posts_columns', 'mobiris_guide_columns' );

/**
 * Populate custom guide columns with data.
 *
 * @param string $column The column name.
 * @param int    $post_id The post ID.
 * @return void
 */
function mobiris_guide_column_content( $column, $post_id ) {
	switch ( $column ) {
		case 'category':
			$categories = get_the_terms( $post_id, 'guide_category' );
			if ( ! empty( $categories ) && ! is_wp_error( $categories ) ) {
				$cat_links = array_map(
					function( $term ) {
						return '<a href="' . esc_url(
							add_query_arg(
								array(
									'post_type'      => 'guide',
									'guide_category' => $term->slug,
								),
								admin_url( 'edit.php' )
							)
						) . '">' . esc_html( $term->name ) . '</a>';
					},
					$categories
				);
				echo wp_kses_post( implode( ', ', $cat_links ) );
			} else {
				echo '—';
			}
			break;
		case 'read-time':
			echo esc_html( mobiris_reading_time( $post_id ) );
			break;
	}
}
add_action( 'manage_guide_posts_custom_column', 'mobiris_guide_column_content', 10, 2 );

/**
 * Make custom columns sortable where appropriate.
 *
 * @param array $sortable Sortable columns.
 * @return array
 */
function mobiris_sortable_columns( $sortable ) {
	// Guide columns are typically not directly sortable by meta, but we can at least show they're columns.
	return $sortable;
}
add_filter( 'manage_edit-guide_sortable_columns', 'mobiris_sortable_columns' );
add_filter( 'manage_edit-testimonial_sortable_columns', 'mobiris_sortable_columns' );

/**
 * Custom columns for Lead list table.
 *
 * @param array $columns Default columns.
 * @return array Modified columns.
 */
function mobiris_lead_columns( $columns ) {
	return array(
		'cb'             => $columns['cb'],
		'title'          => __( 'Name / Phone', 'mobiris' ),
		'lead_vehicles'  => __( 'Vehicles', 'mobiris' ),
		'lead_country'   => __( 'Country', 'mobiris' ),
		'lead_email'     => __( 'Email', 'mobiris' ),
		'lead_whatsapp'  => __( 'WhatsApp', 'mobiris' ),
		'date'           => __( 'Date', 'mobiris' ),
	);
}
add_filter( 'manage_mobiris_lead_posts_columns', 'mobiris_lead_columns' );

/**
 * Populate lead list table custom columns.
 *
 * @param string $column Column name.
 * @param int    $post_id Post ID.
 * @return void
 */
function mobiris_lead_column_content( $column, $post_id ) {
	switch ( $column ) {
		case 'lead_vehicles':
			echo esc_html( get_post_meta( $post_id, '_lead_vehicles', true ) ?: '—' );
			break;
		case 'lead_country':
			echo esc_html( get_post_meta( $post_id, '_lead_country', true ) ?: '—' );
			break;
		case 'lead_email':
			$email = get_post_meta( $post_id, '_lead_email', true );
			echo $email ? '<a href="mailto:' . esc_attr( $email ) . '">' . esc_html( $email ) . '</a>' : '—';
			break;
		case 'lead_whatsapp':
			$phone = get_post_meta( $post_id, '_lead_phone', true );
			if ( $phone ) {
				$number = preg_replace( '/[^0-9]/', '', $phone );
				echo '<a href="https://wa.me/' . esc_attr( $number ) . '?text=' . rawurlencode( 'Hello, I am following up on your Mobiris enquiry.' ) . '" target="_blank" rel="noopener">WhatsApp</a>';
			} else {
				echo '—';
			}
			break;
	}
}
add_action( 'manage_mobiris_lead_posts_custom_column', 'mobiris_lead_column_content', 10, 2 );
