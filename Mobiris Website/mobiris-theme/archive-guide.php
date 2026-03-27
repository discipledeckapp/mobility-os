<?php
/**
 * Guide Archive Template
 *
 * Archive template for the 'guide' custom post type.
 * Used for /guides/ archive pages.
 *
 * @package Mobiris
 * @since 1.0.0
 */

get_header();
?>

<main id="main" class="site-main guide-archive-main">
	<header class="page-header guide-archive-header">
		<div class="container">
			<?php
			// Breadcrumbs
			mobiris_breadcrumbs();
			?>
			<h1 class="page-title"><?php esc_html_e( 'Guides & Resources', 'mobiris' ); ?></h1>
			<p class="page-subtitle">
				<?php esc_html_e( 'Practical guides for fleet operators in Africa', 'mobiris' ); ?>
			</p>
		</div>
	</header>

	<div class="container">
		<?php
		// Filter section by guide_category taxonomy
		$guide_categories = get_terms(
			array(
				'taxonomy'   => 'guide_category',
				'hide_empty' => true,
			)
		);

		if ( ! empty( $guide_categories ) && ! is_wp_error( $guide_categories ) ) {
			$current_cat = get_queried_object();
			?>
			<div class="guide-filters">
				<div class="filter-buttons">
					<a href="<?php echo esc_url( get_post_type_archive_link( 'guide' ) ); ?>"
					   class="filter-btn <?php echo ( ! is_tax( 'guide_category' ) ) ? 'active' : ''; ?>">
						<?php esc_html_e( 'All Guides', 'mobiris' ); ?>
					</a>
					<?php
					foreach ( $guide_categories as $category ) {
						$is_active = ( is_tax( 'guide_category' ) && $current_cat->term_id === $category->term_id ) ? 'active' : '';
						?>
						<a href="<?php echo esc_url( get_term_link( $category ) ); ?>"
						   class="filter-btn <?php echo esc_attr( $is_active ); ?>">
							<?php echo esc_html( $category->name ); ?>
						</a>
						<?php
					}
					?>
				</div>
			</div>
			<?php
		}
		?>

		<?php
		if ( have_posts() ) {
			?>
			<div class="archive-grid guides-grid">
				<?php
				while ( have_posts() ) {
					the_post();
					get_template_part( 'template-parts/content/guide' );
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
					'screen_reader_text' => esc_html__( 'Guides pagination', 'mobiris' ),
				)
			);
		} else {
			?>
			<div class="no-posts-message">
				<p><?php esc_html_e( 'No guides found in this category.', 'mobiris' ); ?></p>
			</div>
			<?php
		}
		?>
	</div>

	<?php
	// CTA Band at bottom
	?>
	<section class="guides-cta-band">
		<div class="container">
			<div class="cta-content">
				<h2><?php esc_html_e( 'Get started with Mobiris today', 'mobiris' ); ?></h2>
				<p>
					<?php esc_html_e( 'Streamline your fleet operations with the platform trusted by transport companies across Africa.', 'mobiris' ); ?>
				</p>
				<div class="cta-buttons">
					<a href="<?php echo esc_url( home_url( '/request-demo/' ) ); ?>" class="btn btn-primary">
						<?php esc_html_e( 'Request a Demo', 'mobiris' ); ?>
					</a>
					<a href="https://wa.me/234901234567" target="_blank" rel="noopener" class="btn btn-outline">
						<?php esc_html_e( 'Chat on WhatsApp', 'mobiris' ); ?>
					</a>
				</div>
			</div>
		</div>
	</section>
</main>

<?php get_footer();
