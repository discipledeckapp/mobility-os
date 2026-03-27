<?php
/**
 * Single Post Template
 *
 * Template for displaying a single blog post.
 *
 * @package Mobiris
 * @since 1.0.0
 */

get_header();
?>

<main id="main" class="site-main single-post-main">
	<?php
	if ( have_posts() ) {
		while ( have_posts() ) {
			the_post();

			// Featured image full width
			if ( has_post_thumbnail() ) {
				?>
				<div class="post-featured-image-wrapper">
					<?php the_post_thumbnail( 'full' ); ?>
				</div>
				<?php
			}
			?>

			<article id="post-<?php the_ID(); ?>" <?php post_class( 'single-post entry' ); ?> itemscope itemtype="https://schema.org/BlogPosting">
				<div class="container container-narrow">
					<?php
					// Breadcrumbs
					mobiris_breadcrumbs();
					?>

					<header class="post-header">
						<?php
						// Post categories
						$categories = get_the_category();
						if ( ! empty( $categories ) ) {
							?>
							<div class="post-categories">
								<?php
								foreach ( $categories as $category ) {
									?>
									<a href="<?php echo esc_url( get_category_link( $category->term_id ) ); ?>" class="post-category-badge">
										<?php echo esc_html( $category->name ); ?>
									</a>
									<?php
								}
								?>
							</div>
							<?php
						}
						?>

						<h1 class="post-title" itemprop="headline"><?php the_title(); ?></h1>

						<div class="post-meta">
							<?php
							// Author
							$author_id = get_the_author_meta( 'ID' );
							?>
							<span class="post-meta-item post-meta-author" itemprop="author" itemscope itemtype="https://schema.org/Person">
								<span><?php esc_html_e( 'By', 'mobiris' ); ?></span>
								<a href="<?php echo esc_url( get_author_posts_url( $author_id ) ); ?>" itemprop="url">
									<span itemprop="name"><?php the_author(); ?></span>
								</a>
							</span>

							<?php
							// Date
							?>
							<span class="post-meta-item post-meta-date">
								<time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>" itemprop="datePublished">
									<?php echo esc_html( get_the_date() ); ?>
								</time>
							</span>

							<?php
							// Modified date (hidden from view but in schema)
							?>
							<meta itemprop="dateModified" content="<?php echo esc_attr( get_the_modified_date( 'c' ) ); ?>">

							<?php
							// Reading time
							$reading_time = mobiris_reading_time();
							if ( $reading_time ) {
								?>
								<span class="post-meta-item post-meta-reading-time">
									<?php echo esc_html( $reading_time ); ?>
								</span>
								<?php
							}
							?>
						</div>
					</header>

					<div class="post-content-wrapper">
						<?php
						// Featured image meta for schema
						if ( has_post_thumbnail() ) {
							$image_id = get_post_thumbnail_id();
							$image_url = wp_get_attachment_url( $image_id );
							?>
							<meta itemprop="image" content="<?php echo esc_attr( $image_url ); ?>">
							<?php
						}
						?>

						<div class="entry-content" itemprop="articleBody">
							<?php
							the_content();

							// Pagination for multi-page posts
							wp_link_pages(
								array(
									'before'      => '<div class="page-links">' . esc_html__( 'Pages:', 'mobiris' ),
									'after'       => '</div>',
									'link_before' => '<span>',
									'link_after'  => '</span>',
								)
							);
							?>
						</div>

						<?php
						// Post tags
						$tags = get_the_tags();
						if ( ! empty( $tags ) ) {
							?>
							<footer class="post-tags">
								<?php
								foreach ( $tags as $tag ) {
									?>
									<a href="<?php echo esc_url( get_tag_link( $tag->term_id ) ); ?>" class="post-tag">
										#<?php echo esc_html( $tag->name ); ?>
									</a>
									<?php
								}
								?>
							</footer>
							<?php
						}
						?>
					</div>

					<?php
					// Social share
					get_template_part( 'template-parts/global/social-share' );
					?>
				</div>
			</article>

			<?php
			// Author box
			$author_bio = get_the_author_meta( 'description' );
			if ( $author_bio ) {
				?>
				<div class="author-box-wrapper">
					<div class="container container-narrow">
						<section class="author-box">
							<div class="author-box-avatar">
								<?php echo wp_kses_post( get_avatar( $author_id, 80 ) ); ?>
							</div>
							<div class="author-box-content">
								<h3 class="author-box-name">
									<a href="<?php echo esc_url( get_author_posts_url( $author_id ) ); ?>">
										<?php the_author(); ?>
									</a>
								</h3>
								<p class="author-box-bio"><?php echo wp_kses_post( $author_bio ); ?></p>
								<a href="<?php echo esc_url( get_author_posts_url( $author_id ) ); ?>" class="author-box-link">
									<?php esc_html_e( 'View all posts', 'mobiris' ); ?> <span aria-hidden="true">→</span>
								</a>
							</div>
						</section>
					</div>
				</div>
				<?php
			}
			?>

			<?php
			// Related posts
			$categories = wp_get_post_categories( get_the_ID() );
			if ( ! empty( $categories ) ) {
				$related_args = array(
					'category__in'    => $categories,
					'post__not_in'    => array( get_the_ID() ),
					'posts_per_page'  => 3,
					'orderby'         => 'date',
					'order'           => 'DESC',
					'suppress_filters' => false,
				);
				$related_posts = new WP_Query( $related_args );

				if ( $related_posts->have_posts() ) {
					?>
					<div class="related-posts-wrapper">
						<div class="container">
							<h2 class="related-posts-title"><?php esc_html_e( 'More from our blog', 'mobiris' ); ?></h2>
							<div class="related-posts-grid">
								<?php
								while ( $related_posts->have_posts() ) {
									$related_posts->the_post();
									get_template_part( 'template-parts/content/post' );
								}
								?>
							</div>
						</div>
					</div>
					<?php
					wp_reset_postdata();
				}
			}
			?>

			<?php
			// Comments section
			if ( comments_open() || get_comments_number() ) {
				?>
				<div class="comments-wrapper">
					<div class="container container-narrow">
						<?php comments_template(); ?>
					</div>
				</div>
				<?php
			}
		}
	}
	?>
</main>

<?php get_footer();
