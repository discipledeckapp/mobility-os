<?php
/**
 * Guide Card Template Part
 *
 * Reusable guide card component used in guide archives and related guides sections.
 *
 * @package Mobiris
 * @since 1.0.0
 */

?>
<article id="post-<?php the_ID(); ?>" <?php post_class( 'guide-card' ); ?>>
	<?php
	// Featured image
	if ( has_post_thumbnail() ) {
		?>
		<a href="<?php the_permalink(); ?>" class="guide-card-img" tabindex="-1" aria-hidden="true">
			<?php the_post_thumbnail( 'post-thumb', array( 'loading' => 'lazy', 'class' => 'guide-card-thumbnail' ) ); ?>
		</a>
		<?php
	}
	?>

	<div class="guide-card-body">
		<?php
		// Guide category
		$guide_categories = get_the_terms( get_the_ID(), 'guide_category' );
		if ( ! empty( $guide_categories ) && ! is_wp_error( $guide_categories ) ) {
			?>
			<div class="guide-card-categories">
				<?php
				$primary_category = $guide_categories[0];
				?>
				<a href="<?php echo esc_url( get_term_link( $primary_category ) ); ?>" class="guide-category-badge">
					<?php echo esc_html( $primary_category->name ); ?>
				</a>
			</div>
			<?php
		}
		?>

		<?php
		// Title
		?>
		<h2 class="guide-card-title">
			<a href="<?php the_permalink(); ?>">
				<?php the_title(); ?>
			</a>
		</h2>

		<?php
		// Excerpt
		?>
		<p class="guide-card-excerpt">
			<?php echo esc_html( wp_trim_words( get_the_excerpt(), 20 ) ); ?>
		</p>

		<?php
		// Meta (date and reading time)
		?>
		<div class="guide-card-meta">
			<time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>" class="guide-card-date">
				<?php echo esc_html( get_the_date() ); ?>
			</time>

			<?php
			$reading_time = mobiris_reading_time();
			if ( $reading_time ) {
				?>
				<span class="guide-card-reading-time">
					<?php echo esc_html( $reading_time ); ?>
				</span>
				<?php
			}
			?>
		</div>

		<?php
		// Read guide link
		?>
		<a href="<?php the_permalink(); ?>" class="guide-card-link">
			<?php esc_html_e( 'Read guide', 'mobiris' ); ?>
			<span aria-hidden="true">→</span>
		</a>
	</div>
</article>
