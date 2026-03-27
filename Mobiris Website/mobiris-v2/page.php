<?php
/**
 * Generic page template.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<div class="mv2-page-wrapper">
	<?php while ( have_posts() ) : the_post(); ?>
		<article id="post-<?php the_ID(); ?>" <?php post_class( 'mv2-page-content' ); ?>>
			<?php if ( ! is_front_page() ) : ?>
				<header class="mv2-page-header mv2-section--sm mv2-section--dark-navy">
					<div class="mv2-container">
						<h1 class="mv2-page-header__title"><?php the_title(); ?></h1>
					</div>
				</header>
			<?php endif; ?>
			<div class="mv2-container mv2-section">
				<div class="mv2-prose">
					<?php the_content(); ?>
				</div>
			</div>
		</article>
	<?php endwhile; ?>
</div>
<?php
get_footer();
