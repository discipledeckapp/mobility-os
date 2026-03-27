<?php
/**
 * Single Guide Template
 *
 * Template for displaying a single guide post with sidebar, table of contents, and CTAs.
 *
 * @package Mobiris
 * @since 1.0.0
 */

get_header();
?>

<main id="main" class="site-main single-guide-main">
	<?php
	if ( have_posts() ) {
		while ( have_posts() ) {
			the_post();

			// Featured image full width
			if ( has_post_thumbnail() ) {
				?>
				<div class="guide-featured-image-wrapper">
					<?php the_post_thumbnail( 'full' ); ?>
				</div>
				<?php
			}
			?>

			<article id="post-<?php the_ID(); ?>" <?php post_class( 'single-guide entry' ); ?> itemscope itemtype="https://schema.org/Article">
				<div class="container">
					<?php
					// Breadcrumbs
					mobiris_breadcrumbs();
					?>

					<div class="guide-content-wrapper">
						<div class="guide-content">
							<header class="guide-header">
								<?php
								// Guide category
								$guide_categories = get_the_terms( get_the_ID(), 'guide_category' );
								if ( ! empty( $guide_categories ) && ! is_wp_error( $guide_categories ) ) {
									?>
									<div class="guide-categories">
										<?php
										foreach ( $guide_categories as $category ) {
											?>
											<a href="<?php echo esc_url( get_term_link( $category ) ); ?>" class="guide-category-badge">
												<?php echo esc_html( $category->name ); ?>
											</a>
											<?php
										}
										?>
									</div>
									<?php
								}
								?>

								<h1 class="guide-title" itemprop="headline"><?php the_title(); ?></h1>

								<div class="guide-meta">
									<?php
									// Author
									$author_id = get_the_author_meta( 'ID' );
									?>
									<span class="guide-meta-item guide-meta-author" itemprop="author" itemscope itemtype="https://schema.org/Person">
										<span><?php esc_html_e( 'By', 'mobiris' ); ?></span>
										<a href="<?php echo esc_url( get_author_posts_url( $author_id ) ); ?>" itemprop="url">
											<span itemprop="name"><?php the_author(); ?></span>
										</a>
									</span>

									<?php
									// Date
									?>
									<span class="guide-meta-item guide-meta-date">
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
										<span class="guide-meta-item guide-meta-reading-time">
											<?php echo esc_html( $reading_time ); ?>
										</span>
										<?php
									}
									?>
								</div>
							</header>

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

							<div class="guide-entry-content" itemprop="articleBody">
								<?php the_content(); ?>
							</div>

							<?php
							// Share links
							get_template_part( 'template-parts/global/social-share' );
							?>

							<?php
							// Related guides
							$guide_categories = wp_get_post_terms( get_the_ID(), 'guide_category', array( 'fields' => 'ids' ) );
							if ( ! empty( $guide_categories ) ) {
								$related_args = array(
									'post_type'      => 'guide',
									'tax_query'      => array(
										array(
											'taxonomy' => 'guide_category',
											'field'    => 'id',
											'terms'    => $guide_categories,
										),
									),
									'post__not_in'   => array( get_the_ID() ),
									'posts_per_page' => 3,
									'orderby'        => 'date',
									'order'          => 'DESC',
								);
								$related_guides = new WP_Query( $related_args );

								if ( $related_guides->have_posts() ) {
									?>
									<div class="related-guides-section">
										<h3><?php esc_html_e( 'Related Guides', 'mobiris' ); ?></h3>
										<div class="related-guides-list">
											<?php
											while ( $related_guides->have_posts() ) {
												$related_guides->the_post();
												?>
												<div class="related-guide-item">
													<h4>
														<a href="<?php the_permalink(); ?>">
															<?php the_title(); ?>
														</a>
													</h4>
													<p><?php echo wp_kses_post( wp_trim_words( get_the_excerpt(), 15 ) ); ?></p>
													<a href="<?php the_permalink(); ?>" class="related-guide-link">
														<?php esc_html_e( 'Read guide', 'mobiris' ); ?> <span aria-hidden="true">→</span>
													</a>
												</div>
												<?php
											}
											?>
										</div>
									</div>
									<?php
									wp_reset_postdata();
								}
							}
							?>
						</div>

						<aside class="guide-sidebar">
							<?php
							// Table of contents
							$content = get_the_content();
							$toc = mobiris_generate_guide_toc( $content );

							if ( ! empty( $toc['items'] ) ) {
								?>
								<nav class="guide-toc" aria-label="<?php esc_attr_e( 'Table of contents', 'mobiris' ); ?>">
									<h3><?php esc_html_e( 'In this guide', 'mobiris' ); ?></h3>
									<ul class="toc-list">
										<?php
										foreach ( $toc['items'] as $item ) {
											$indent_class = 'level-' . $item['level'];
											?>
											<li class="toc-item <?php echo esc_attr( $indent_class ); ?>">
												<a href="<?php echo esc_url( '#' . $item['id'] ); ?>">
													<?php echo esc_html( $item['text'] ); ?>
												</a>
											</li>
											<?php
										}
										?>
									</ul>
								</nav>
								<?php
							}
							?>

							<?php
							// Was this helpful widget placeholder
							?>
							<div class="guide-helpful-widget">
								<h4><?php esc_html_e( 'Was this helpful?', 'mobiris' ); ?></h4>
								<div class="helpful-buttons">
									<button class="helpful-btn helpful-yes" data-guide-id="<?php echo esc_attr( get_the_ID() ); ?>" data-helpful="yes">
										<?php esc_html_e( 'Yes', 'mobiris' ); ?>
									</button>
									<button class="helpful-btn helpful-no" data-guide-id="<?php echo esc_attr( get_the_ID() ); ?>" data-helpful="no">
										<?php esc_html_e( 'No', 'mobiris' ); ?>
									</button>
								</div>
							</div>

							<?php
							// CTA widget
							?>
							<div class="guide-cta-widget">
								<div class="cta-widget-content">
									<h4><?php esc_html_e( 'Need help getting started?', 'mobiris' ); ?></h4>
									<p><?php esc_html_e( 'Our team is here to help you succeed.', 'mobiris' ); ?></p>
									<a href="https://wa.me/234901234567" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
										<?php esc_html_e( 'Chat on WhatsApp', 'mobiris' ); ?>
									</a>
								</div>
							</div>
						</aside>
					</div>
				</div>
			</article>
		}
	}
	?>
</main>

<?php get_footer();
