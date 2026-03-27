<?php
/**
 * Single post template.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<div class="mv2-single-wrapper">
	<?php while ( have_posts() ) : the_post(); ?>

		<!-- Article Header -->
		<header class="mv2-single-header mv2-section--sm mv2-section--dark-navy">
			<div class="mv2-container mv2-single-header__inner">
				<div class="mv2-single-header__meta">
					<?php
					$categories = get_the_category();
					if ( $categories ) :
						foreach ( $categories as $cat ) :
							echo '<a href="' . esc_url( get_category_link( $cat->term_id ) ) . '" class="mv2-badge mv2-badge--primary">' . esc_html( $cat->name ) . '</a>';
						endforeach;
					endif;
					?>
					<time class="mv2-single-header__date" datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>">
						<?php echo esc_html( get_the_date() ); ?>
					</time>
					<span class="mv2-single-header__read-time">
						<?php
						$words       = str_word_count( wp_strip_all_tags( get_the_content() ) );
						$read_time   = max( 1, ceil( $words / 200 ) );
						/* translators: %d: read time in minutes */
						printf( esc_html( _n( '%d min read', '%d min read', $read_time, 'mobiris-v2' ) ), (int) $read_time );
						?>
					</span>
				</div>
				<h1 class="mv2-single-header__title"><?php the_title(); ?></h1>
				<?php if ( has_excerpt() ) : ?>
					<p class="mv2-single-header__excerpt"><?php the_excerpt(); ?></p>
				<?php endif; ?>
			</div>
		</header>

		<!-- Featured Image -->
		<?php if ( has_post_thumbnail() ) : ?>
			<div class="mv2-single-featured-image">
				<div class="mv2-container">
					<?php the_post_thumbnail( 'mv2-hero', array( 'class' => 'mv2-single-featured-image__img', 'alt' => get_the_title() ) ); ?>
				</div>
			</div>
		<?php endif; ?>

		<!-- Article Content -->
		<div class="mv2-container mv2-single-content-wrapper">
			<article class="mv2-single-content">
				<div class="mv2-prose">
					<?php the_content(); ?>
				</div>

				<?php
				wp_link_pages(
					array(
						'before' => '<nav class="mv2-page-links"><span class="mv2-page-links__label">' . __( 'Pages:', 'mobiris-v2' ) . '</span>',
						'after'  => '</nav>',
					)
				);
				?>

				<!-- Tags -->
				<?php
				$tags = get_the_tags();
				if ( $tags ) :
					?>
					<div class="mv2-single-tags">
						<?php foreach ( $tags as $tag ) : ?>
							<a href="<?php echo esc_url( get_tag_link( $tag->term_id ) ); ?>" class="mv2-tag"><?php echo esc_html( $tag->name ); ?></a>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>
			</article>

			<!-- Sidebar -->
			<aside class="mv2-single-sidebar">
				<!-- CTA Widget -->
				<div class="mv2-sidebar-cta mv2-card">
					<h3 class="mv2-sidebar-cta__title">
						<?php esc_html_e( 'Is your fleet leaking money?', 'mobiris-v2' ); ?>
					</h3>
					<p class="mv2-sidebar-cta__text">
						<?php esc_html_e( 'Use the Mobiris leakage calculator to estimate what you\'re losing every month.', 'mobiris-v2' ); ?>
					</p>
					<a href="<?php echo esc_url( get_permalink( get_page_by_path( 'profit-calculator' ) ) ); ?>" class="mv2-btn mv2-btn--primary mv2-btn--full">
						<?php esc_html_e( 'Calculate My Leakage', 'mobiris-v2' ); ?>
					</a>
					<a href="<?php echo esc_url( mv2_app_url() ); ?>" class="mv2-btn mv2-btn--outline mv2-btn--full mv2-mt-sm" target="_blank" rel="noopener noreferrer">
						<?php esc_html_e( 'Start Free Trial', 'mobiris-v2' ); ?>
					</a>
				</div>

				<?php if ( is_active_sidebar( 'mv2-sidebar-blog' ) ) : ?>
					<div class="mv2-sidebar-widgets">
						<?php dynamic_sidebar( 'mv2-sidebar-blog' ); ?>
					</div>
				<?php endif; ?>
			</aside>
		</div>

		<!-- Post Navigation -->
		<div class="mv2-container">
			<nav class="mv2-post-nav" aria-label="<?php esc_attr_e( 'Post navigation', 'mobiris-v2' ); ?>">
				<?php
				$prev = get_previous_post();
				$next = get_next_post();
				?>
				<?php if ( $prev ) : ?>
					<a href="<?php echo esc_url( get_permalink( $prev ) ); ?>" class="mv2-post-nav__item mv2-post-nav__item--prev">
						<span class="mv2-post-nav__label">&larr; <?php esc_html_e( 'Previous', 'mobiris-v2' ); ?></span>
						<span class="mv2-post-nav__title"><?php echo esc_html( get_the_title( $prev ) ); ?></span>
					</a>
				<?php endif; ?>
				<?php if ( $next ) : ?>
					<a href="<?php echo esc_url( get_permalink( $next ) ); ?>" class="mv2-post-nav__item mv2-post-nav__item--next">
						<span class="mv2-post-nav__label"><?php esc_html_e( 'Next', 'mobiris-v2' ); ?> &rarr;</span>
						<span class="mv2-post-nav__title"><?php echo esc_html( get_the_title( $next ) ); ?></span>
					</a>
				<?php endif; ?>
			</nav>
		</div>

	<?php endwhile; ?>
</div>

<!-- CTA Band -->
<?php get_template_part( 'parts/global/cta-band' ); ?>

<?php
get_footer();
