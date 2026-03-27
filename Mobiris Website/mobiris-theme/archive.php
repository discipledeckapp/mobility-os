<?php
/**
 * Archive Template
 *
 * Generic archive template for categories, tags, authors, dates, and custom taxonomies.
 *
 * @package Mobiris
 * @since 1.0.0
 */

get_header();
?>

<main id="main" class="site-main archive-main">
	<header class="page-header">
		<div class="container">
			<?php
			// Breadcrumbs
			mobiris_breadcrumbs();
			?>

			<div class="archive-header-content">
				<?php
				// Archive title
				the_archive_title( '<h1 class="page-title">', '</h1>' );

				// Archive description
				the_archive_description( '<div class="archive-description">', '</div>' );
				?>
			</div>
		</div>
	</header>

	<div class="container">
		<?php
		if ( have_posts() ) {
			?>
			<div class="archive-grid">
				<?php
				while ( have_posts() ) {
					the_post();

					// Check post type and render appropriate template part
					$post_type = get_post_type();

					if ( 'guide' === $post_type ) {
						get_template_part( 'template-parts/content/guide' );
					} else {
						get_template_part( 'template-parts/content/post' );
					}
				}
				?>
			</div>

			<?php
			// Pagination
			the_posts_pagination(
				array(
					'mid_size'           => 2,
					'prev_text'          => esc_html__( '← Previous', 'mobiris' ),
					'next_text'          => esc_html__( 'Next →', 'mobiris' ),
					'screen_reader_text' => esc_html__( 'Archive pagination', 'mobiris' ),
				)
			);
		} else {
			?>
			<div class="no-posts-message">
				<p><?php esc_html_e( 'No posts found in this archive.', 'mobiris' ); ?></p>
			</div>
			<?php
		}
		?>
	</div>

	<?php
	// Sidebar (if active)
	if ( is_active_sidebar( 'sidebar-blog' ) ) {
		?>
		<aside class="archive-sidebar">
			<div class="container">
				<?php dynamic_sidebar( 'sidebar-blog' ); ?>
			</div>
		</aside>
		<?php
	}
	?>
</main>

<?php get_footer();
