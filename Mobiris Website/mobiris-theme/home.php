<?php
/**
 * Blog Index Template
 *
 * Used when the Blog page is set in Settings > Reading.
 *
 * @package Mobiris
 * @since 1.0.0
 */

get_header();

// Get the posts page
$posts_page_id = get_option( 'page_for_posts' );
$posts_page = $posts_page_id ? get_post( $posts_page_id ) : null;
?>

<main id="main" class="site-main blog-index-main">
	<header class="page-header">
		<div class="container">
			<?php
			// Breadcrumbs
			mobiris_breadcrumbs();
			?>
			<h1 class="page-title">
				<?php
				if ( $posts_page ) {
					echo esc_html( $posts_page->post_title );
				} else {
					esc_html_e( 'Blog', 'mobiris' );
				}
				?>
			</h1>
			<p class="page-subtitle">
				<?php esc_html_e( 'Fleet management insights for Africa\'s transport operators', 'mobiris' ); ?>
			</p>
		</div>
	</header>

	<div class="container">
		<?php
		// Sticky/featured post
		$sticky_posts = get_option( 'sticky_posts' );
		if ( ! empty( $sticky_posts ) && have_posts() ) {
			$featured_post_id = $sticky_posts[0];

			// Check if featured post is in current query
			$featured_found = false;
			while ( have_posts() ) {
				the_post();
				if ( get_the_ID() === $featured_post_id ) {
					$featured_found = true;
					break;
				}
			}

			// Rewind for main loop
			rewind_posts();

			if ( $featured_found ) {
				?>
				<div class="featured-post-highlight">
					<div class="featured-post-content">
						<?php
						// Set up the featured post
						$GLOBALS['featured_post_shown'] = false;
						while ( have_posts() ) {
							the_post();
							if ( get_the_ID() === $featured_post_id ) {
								$GLOBALS['featured_post_shown'] = true;
								?>
								<div class="featured-badge"><?php esc_html_e( 'Featured', 'mobiris' ); ?></div>
								<h2 class="featured-post-title">
									<a href="<?php the_permalink(); ?>">
										<?php the_title(); ?>
									</a>
								</h2>
								<p class="featured-post-excerpt">
									<?php echo wp_kses_post( wp_trim_words( get_the_excerpt(), 30 ) ); ?>
								</p>
								<a href="<?php the_permalink(); ?>" class="btn btn-primary">
									<?php esc_html_e( 'Read article', 'mobiris' ); ?>
								</a>
								<?php
								break;
							}
						}
						?>
					</div>
					<?php
					if ( has_post_thumbnail() ) {
						?>
						<div class="featured-post-image">
							<?php the_post_thumbnail( 'large' ); ?>
						</div>
						<?php
					}
					?>
				</div>
				<?php
				rewind_posts();
			}
		}
		?>

		<?php
		if ( have_posts() ) {
			?>
			<div class="archive-grid">
				<?php
				while ( have_posts() ) {
					the_post();

					// Skip featured post in main grid
					if ( ! empty( $sticky_posts ) && get_the_ID() === $sticky_posts[0] && isset( $GLOBALS['featured_post_shown'] ) && $GLOBALS['featured_post_shown'] ) {
						continue;
					}

					get_template_part( 'template-parts/content/post' );
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
					'screen_reader_text' => esc_html__( 'Posts pagination', 'mobiris' ),
				)
			);
		} else {
			?>
			<div class="no-posts-message">
				<p><?php esc_html_e( 'No posts found.', 'mobiris' ); ?></p>
			</div>
			<?php
		}
		?>
	</div>

	<?php
	// Sidebar (if active)
	if ( is_active_sidebar( 'sidebar-blog' ) ) {
		?>
		<aside class="blog-sidebar">
			<div class="container">
				<?php dynamic_sidebar( 'sidebar-blog' ); ?>
			</div>
		</aside>
		<?php
	}
	?>
</main>

<?php get_footer();
