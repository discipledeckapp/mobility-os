<?php
/**
 * Guides Preview Section Template Part
 *
 * Displays guide resources on the homepage.
 * Conditionally shown via theme customizer setting.
 *
 * @package Mobiris
 * @since 1.0.0
 */

$show_guides = get_theme_mod( 'mobiris_show_guides_home', '1' );

if ( ! $show_guides ) {
	return;
}

$guides_count = (int) get_theme_mod( 'mobiris_guides_home_count', 3 );
$guides_title = get_theme_mod( 'mobiris_guides_home_title', esc_html__( 'Implementation guides', 'mobiris' ) );

// Query guide custom post type
$guides_args = array(
	'post_type'      => 'guide',
	'posts_per_page' => $guides_count,
	'orderby'        => 'menu_order date',
	'order'          => 'ASC DESC',
);

$guides_query = new WP_Query( $guides_args );

if ( ! $guides_query->have_posts() ) {
	return;
}

// Get guides archive URL
$guides_archive_url = post_type_archive_link( 'guide' );
if ( ! $guides_archive_url ) {
	$guides_archive_url = get_home_url() . '/guides/';
}
?>

<section class="guides-section section" aria-label="<?php esc_attr_e( 'Implementation Guides', 'mobiris' ); ?>">
	<div class="container">
		<div class="section-header">
			<h2 class="section-title"><?php echo esc_html( $guides_title ); ?></h2>
			<p class="section-intro"><?php esc_html_e( 'Step-by-step instructions for getting the most from Mobiris.', 'mobiris' ); ?></p>
		</div>

		<div class="guides-grid">
			<?php
			while ( $guides_query->have_posts() ) {
				$guides_query->the_post();

				// Calculate reading time
				$word_count = str_word_count( wp_strip_all_tags( get_the_content() ) );
				$reading_time = ceil( $word_count / 200 );
				?>

				<article class="guide-card">
					<?php if ( has_post_thumbnail() ) : ?>
						<a href="<?php the_permalink(); ?>" class="guide-image">
							<?php the_post_thumbnail( 'medium', array( 'alt' => get_the_title() ) ); ?>
						</a>
					<?php else : ?>
						<!-- Guide icon placeholder -->
						<div class="guide-icon-placeholder" aria-hidden="true">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
								<polyline points="14 2 14 8 20 8"></polyline>
								<line x1="12" y1="11" x2="12" y2="17"></line>
								<polyline points="9 14 12 11 15 14"></polyline>
							</svg>
						</div>
					<?php endif; ?>

					<div class="guide-content">
						<?php
						$categories = get_the_terms( get_the_ID(), 'guide_category' );
						if ( ! empty( $categories ) && ! is_wp_error( $categories ) ) :
							?>
							<div class="guide-categories">
								<?php
								foreach ( array_slice( $categories, 0, 1 ) as $category ) {
									?>
									<a href="<?php echo esc_url( get_term_link( $category ) ); ?>" class="guide-category-badge">
										<?php echo esc_html( $category->name ); ?>
									</a>
									<?php
								}
								?>
							</div>
						<?php endif; ?>

						<h3 class="guide-title">
							<a href="<?php the_permalink(); ?>">
								<?php the_title(); ?>
							</a>
						</h3>

						<?php if ( has_excerpt() ) : ?>
							<p class="guide-excerpt">
								<?php
								$excerpt = wp_trim_words( get_the_excerpt(), 20, '...' );
								echo esc_html( $excerpt );
								?>
							</p>
						<?php endif; ?>

						<div class="guide-meta">
							<span class="guide-reading-time">
								<?php
								echo esc_html(
									sprintf(
										/* Translators: %d = number of minutes */
										_n( '%d min', '%d min', $reading_time, 'mobiris' ),
										$reading_time
									)
								);
								?>
							</span>
						</div>

						<a href="<?php the_permalink(); ?>" class="guide-link">
							<?php esc_html_e( 'Start guide', 'mobiris' ); ?> <span aria-hidden="true">→</span>
						</a>
					</div>
				</article>
				<?php
			}
			wp_reset_postdata();
			?>
		</div>

		<div class="guides-footer">
			<a href="<?php echo esc_url( $guides_archive_url ); ?>" class="btn btn-outline-primary">
				<?php esc_html_e( 'View all guides', 'mobiris' ); ?>
			</a>
		</div>
	</div>
</section>
