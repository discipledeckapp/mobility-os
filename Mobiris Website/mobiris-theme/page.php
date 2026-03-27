<?php
/**
 * Page Template
 *
 * Default template for pages that don't have a specific template assigned.
 *
 * @package Mobiris
 * @since 1.0.0
 */

get_header();
?>

<main id="main" class="site-main page-main">
	<?php
	if ( have_posts() ) {
		while ( have_posts() ) {
			the_post();

			// Page header section
			?>
			<header class="page-header">
				<div class="container">
					<?php
					// Breadcrumbs
					mobiris_breadcrumbs();
					?>
					<h1 class="page-title"><?php the_title(); ?></h1>
				</div>
			</header>

			<div class="page-wrapper">
				<?php
				// Determine if sidebar is active
				$sidebar_active = is_active_sidebar( 'sidebar-blog' );
				$container_class = $sidebar_active ? 'content-with-sidebar' : 'container-narrow';
				?>
				<div class="container <?php echo esc_attr( $container_class ); ?>">
					<div class="page-content-row">
						<article id="post-<?php the_ID(); ?>" <?php post_class( 'entry entry-page' ); ?> itemscope itemtype="https://schema.org/WebPage">
							<?php
							if ( has_post_thumbnail() ) {
								?>
								<div class="page-featured-image">
									<?php the_post_thumbnail( 'full' ); ?>
								</div>
								<?php
							}
							?>

							<div class="entry-content" itemprop="mainEntity">
								<?php
								the_content();

								// Pagination for multi-page posts/pages
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
							// Meta information
							?>
							<meta itemprop="headline" content="<?php echo esc_attr( get_the_title() ); ?>">
							<meta itemprop="datePublished" content="<?php echo esc_attr( get_the_date( 'c' ) ); ?>">
							<meta itemprop="dateModified" content="<?php echo esc_attr( get_the_modified_date( 'c' ) ); ?>">
							<?php
							if ( has_post_thumbnail() ) {
								$image_id = get_post_thumbnail_id();
								$image_url = wp_get_attachment_url( $image_id );
								?>
								<meta itemprop="image" content="<?php echo esc_attr( $image_url ); ?>">
								<?php
							}
							?>
						</article>

						<?php
						// Sidebar
						if ( $sidebar_active ) {
							?>
							<aside class="page-sidebar">
								<?php dynamic_sidebar( 'sidebar-blog' ); ?>
							</aside>
							<?php
						}
						?>
					</div>
				</div>
			</div>

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
