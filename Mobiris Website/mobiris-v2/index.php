<?php
/**
 * Index — fallback template.
 * WordPress requires this file.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<div class="mv2-container mv2-section">
	<?php if ( have_posts() ) : ?>
		<div class="mv2-archive-grid">
			<?php while ( have_posts() ) : the_post(); ?>
				<article id="post-<?php the_ID(); ?>" <?php post_class( 'mv2-card mv2-blog-card' ); ?>>
					<?php if ( has_post_thumbnail() ) : ?>
						<div class="mv2-blog-card__thumb">
							<a href="<?php the_permalink(); ?>">
								<?php the_post_thumbnail( 'mv2-card', array( 'alt' => get_the_title() ) ); ?>
							</a>
						</div>
					<?php endif; ?>
					<div class="mv2-blog-card__body">
						<div class="mv2-blog-card__meta">
							<time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time>
						</div>
						<h2 class="mv2-blog-card__title">
							<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
						</h2>
						<div class="mv2-blog-card__excerpt">
							<?php the_excerpt(); ?>
						</div>
						<a href="<?php the_permalink(); ?>" class="mv2-btn mv2-btn--outline mv2-btn--sm">
							<?php esc_html_e( 'Read more', 'mobiris-v2' ); ?>
						</a>
					</div>
				</article>
			<?php endwhile; ?>
		</div>

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
			<h2><?php esc_html_e( 'Nothing found.', 'mobiris-v2' ); ?></h2>
			<p><?php esc_html_e( 'It looks like nothing was found here. Try a search.', 'mobiris-v2' ); ?></p>
			<?php get_search_form(); ?>
		</div>
	<?php endif; ?>
</div>
<?php
get_footer();
