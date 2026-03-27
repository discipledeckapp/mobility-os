<?php
/**
 * Blog Preview Section Template Part
 *
 * Displays latest blog posts on the homepage.
 * Conditionally shown via theme customizer setting.
 *
 * @package Mobiris
 * @since 1.0.0
 */

$show_blog = get_theme_mod( 'mobiris_show_blog_home', '1' );

if ( ! $show_blog ) {
	return;
}

$blog_count = (int) get_theme_mod( 'mobiris_blog_home_count', 3 );
$blog_title = get_theme_mod( 'mobiris_blog_home_title', esc_html__( 'Latest from the blog', 'mobiris' ) );

// Query latest posts
$blog_args = array(
	'post_type'      => 'post',
	'posts_per_page' => $blog_count,
	'orderby'        => 'date',
	'order'          => 'DESC',
);

$blog_query = new WP_Query( $blog_args );

if ( ! $blog_query->have_posts() ) {
	return;
}
?>

<section class="blog-section section" aria-label="<?php esc_attr_e( 'Latest Articles', 'mobiris' ); ?>">
	<div class="container">
		<div class="section-header">
			<h2 class="section-title"><?php echo esc_html( $blog_title ); ?></h2>
		</div>

		<div class="blog-grid">
			<?php
			while ( $blog_query->have_posts() ) {
				$blog_query->the_post();

				// Calculate reading time
				$word_count = str_word_count( wp_strip_all_tags( get_the_content() ) );
				$reading_time = ceil( $word_count / 200 );
				?>

				<article class="blog-card">
					<?php if ( has_post_thumbnail() ) : ?>
						<a href="<?php the_permalink(); ?>" class="blog-image">
							<?php the_post_thumbnail( 'medium', array( 'alt' => get_the_title() ) ); ?>
						</a>
					<?php endif; ?>

					<div class="blog-content">
						<?php
						$categories = get_the_category();
						if ( ! empty( $categories ) ) :
							?>
							<div class="blog-categories">
								<?php
								foreach ( $categories as $category ) {
									?>
									<a href="<?php echo esc_url( get_category_link( $category ) ); ?>" class="blog-category-badge">
										<?php echo esc_html( $category->name ); ?>
									</a>
									<?php
								}
								?>
							</div>
						<?php endif; ?>

						<h3 class="blog-title">
							<a href="<?php the_permalink(); ?>">
								<?php the_title(); ?>
							</a>
						</h3>

						<?php if ( has_excerpt() ) : ?>
							<p class="blog-excerpt">
								<?php
								$excerpt = wp_trim_words( get_the_excerpt(), 25, '...' );
								echo esc_html( $excerpt );
								?>
							</p>
						<?php endif; ?>

						<div class="blog-meta">
							<span class="blog-date">
								<?php
								echo esc_html(
									sprintf(
										/* Translators: %s = relative date (e.g., 2 days ago) */
										__( '%s ago', 'mobiris' ),
										human_time_diff( get_the_time( 'U' ), current_time( 'timestamp' ) )
									)
								);
								?>
							</span>

							<span class="blog-reading-time">
								<?php
								echo esc_html(
									sprintf(
										/* Translators: %d = number of minutes */
										_n( '%d min read', '%d min read', $reading_time, 'mobiris' ),
										$reading_time
									)
								);
								?>
							</span>
						</div>

						<a href="<?php the_permalink(); ?>" class="blog-link">
							<?php esc_html_e( 'Read article', 'mobiris' ); ?> <span aria-hidden="true">→</span>
						</a>
					</div>
				</article>
				<?php
			}
			wp_reset_postdata();
			?>
		</div>

		<div class="blog-footer">
			<a href="<?php echo esc_url( get_home_url() . '/blog/' ); ?>" class="btn btn-outline-primary">
				<?php esc_html_e( 'View all articles', 'mobiris' ); ?>
			</a>
		</div>
	</div>
</section>
