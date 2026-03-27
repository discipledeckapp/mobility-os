<?php
/**
 * Post Card Template Part
 *
 * Reusable post card component used in blog archives, home page, and search results.
 *
 * @package Mobiris
 * @since 1.0.0
 */

?>
<article id="post-<?php the_ID(); ?>" <?php post_class( 'post-card' ); ?>>
	<?php
	// Featured image
	if ( has_post_thumbnail() ) {
		?>
		<a href="<?php the_permalink(); ?>" class="post-card-img" tabindex="-1" aria-hidden="true">
			<?php the_post_thumbnail( 'post-thumb', array( 'loading' => 'lazy', 'class' => 'post-card-thumbnail' ) ); ?>
		</a>
		<?php
	}
	?>

	<div class="post-card-body">
		<?php
		// Categories
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

		<?php
		// Title
		?>
		<h2 class="post-card-title">
			<a href="<?php the_permalink(); ?>">
				<?php the_title(); ?>
			</a>
		</h2>

		<?php
		// Excerpt
		?>
		<p class="post-card-excerpt">
			<?php echo esc_html( wp_trim_words( get_the_excerpt(), 20 ) ); ?>
		</p>

		<?php
		// Meta (date and reading time)
		?>
		<div class="post-card-meta">
			<time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>" class="post-card-date">
				<?php echo esc_html( get_the_date() ); ?>
			</time>

			<?php
			$reading_time = mobiris_reading_time();
			if ( $reading_time ) {
				?>
				<span class="post-card-reading-time">
					<?php echo esc_html( $reading_time ); ?>
				</span>
				<?php
			}
			?>
		</div>

		<?php
		// Read more link
		?>
		<a href="<?php the_permalink(); ?>" class="post-card-link">
			<?php esc_html_e( 'Read article', 'mobiris' ); ?>
			<span aria-hidden="true">→</span>
		</a>
	</div>
</article>
