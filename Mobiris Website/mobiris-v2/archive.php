<?php
/**
 * Archive template — blog list, category, tag archives.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<div class="mv2-archive-wrapper">

	<!-- Archive Header -->
	<header class="mv2-archive-header mv2-section--sm mv2-section--dark-navy">
		<div class="mv2-container">
			<?php
			if ( is_home() && ! is_front_page() ) :
				echo '<h1 class="mv2-archive-header__title">' . esc_html__( 'Blog', 'mobiris-v2' ) . '</h1>';
				echo '<p class="mv2-archive-header__subtitle">' . esc_html__( 'Insights on transport operations, fleet management, and building profitable businesses in Nigeria and West Africa.', 'mobiris-v2' ) . '</p>';
			elseif ( is_category() ) :
				echo '<div class="mv2-archive-header__label">' . esc_html__( 'Category', 'mobiris-v2' ) . '</div>';
				echo '<h1 class="mv2-archive-header__title">' . single_cat_title( '', false ) . '</h1>';
				$desc = category_description();
				if ( $desc ) {
					echo '<p class="mv2-archive-header__subtitle">' . wp_kses_post( $desc ) . '</p>';
				}
			elseif ( is_tag() ) :
				echo '<div class="mv2-archive-header__label">' . esc_html__( 'Tag', 'mobiris-v2' ) . '</div>';
				echo '<h1 class="mv2-archive-header__title">' . single_tag_title( '', false ) . '</h1>';
			elseif ( is_author() ) :
				echo '<div class="mv2-archive-header__label">' . esc_html__( 'Author', 'mobiris-v2' ) . '</div>';
				echo '<h1 class="mv2-archive-header__title">' . esc_html( get_the_author() ) . '</h1>';
			elseif ( is_date() ) :
				echo '<div class="mv2-archive-header__label">' . esc_html__( 'Archive', 'mobiris-v2' ) . '</div>';
				echo '<h1 class="mv2-archive-header__title">' . esc_html( get_the_archive_title() ) . '</h1>';
			else :
				echo '<h1 class="mv2-archive-header__title">' . esc_html( get_the_archive_title() ) . '</h1>';
			endif;
			?>
		</div>
	</header>

	<!-- Archive Content -->
	<div class="mv2-container mv2-section mv2-archive-content">
		<?php if ( have_posts() ) : ?>

			<div class="mv2-archive-grid">
				<?php while ( have_posts() ) : the_post(); ?>
					<article id="post-<?php the_ID(); ?>" <?php post_class( 'mv2-card mv2-blog-card' ); ?>>
						<?php if ( has_post_thumbnail() ) : ?>
							<div class="mv2-blog-card__thumb">
								<a href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true">
									<?php the_post_thumbnail( 'mv2-card', array( 'alt' => '' ) ); ?>
								</a>
							</div>
						<?php endif; ?>
						<div class="mv2-blog-card__body">
							<div class="mv2-blog-card__meta">
								<?php
								$categories = get_the_category();
								if ( $categories ) :
									echo '<a href="' . esc_url( get_category_link( $categories[0]->term_id ) ) . '" class="mv2-badge mv2-badge--subtle">' . esc_html( $categories[0]->name ) . '</a>';
								endif;
								?>
								<time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>" class="mv2-blog-card__date">
									<?php echo esc_html( get_the_date() ); ?>
								</time>
							</div>
							<h2 class="mv2-blog-card__title">
								<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
							</h2>
							<div class="mv2-blog-card__excerpt">
								<?php the_excerpt(); ?>
							</div>
							<a href="<?php the_permalink(); ?>" class="mv2-btn mv2-btn--text">
								<?php esc_html_e( 'Read article', 'mobiris-v2' ); ?> &rarr;
							</a>
						</div>
					</article>
				<?php endwhile; ?>
			</div>

			<!-- Pagination -->
			<div class="mv2-pagination">
				<?php
				the_posts_pagination(
					array(
						'mid_size'  => 2,
						'prev_text' => '&larr; ' . __( 'Previous', 'mobiris-v2' ),
						'next_text' => __( 'Next', 'mobiris-v2' ) . ' &rarr;',
					)
				);
				?>
			</div>

		<?php else : ?>
			<div class="mv2-empty-state">
				<div class="mv2-empty-state__icon">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
				</div>
				<h2><?php esc_html_e( 'No posts found.', 'mobiris-v2' ); ?></h2>
				<p><?php esc_html_e( 'No articles have been published yet. Check back soon.', 'mobiris-v2' ); ?></p>
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="mv2-btn mv2-btn--primary">
					<?php esc_html_e( 'Back to Home', 'mobiris-v2' ); ?>
				</a>
			</div>
		<?php endif; ?>
	</div>
</div>

<?php get_template_part( 'parts/global/cta-band' ); ?>
<?php get_footer(); ?>
