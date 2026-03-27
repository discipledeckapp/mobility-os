<?php
/**
 * Front Page Template (Homepage)
 *
 * High-conversion homepage targeting transport operators in West Africa.
 * Sections: Hero → Problem → How It Works → Profit Calculator → Features →
 *           Intelligence → Pricing → Testimonials → Lead Capture → App Download → Blog → CTA
 *
 * @package Mobiris
 * @since 1.0.0
 */

get_header();
?>

<main id="primary" class="site-main homepage-main">

	<?php get_template_part( 'template-parts/home/hero' ); ?>

	<?php get_template_part( 'template-parts/home/stats' ); ?>

	<?php get_template_part( 'template-parts/home/problem' ); ?>

	<?php get_template_part( 'template-parts/home/profit-calculator' ); ?>

	<?php get_template_part( 'template-parts/home/how-it-works' ); ?>

	<?php get_template_part( 'template-parts/home/features' ); ?>

	<?php get_template_part( 'template-parts/home/intelligence' ); ?>

	<?php get_template_part( 'template-parts/home/pricing' ); ?>

	<?php get_template_part( 'template-parts/home/testimonials' ); ?>

	<?php get_template_part( 'template-parts/home/lead-capture' ); ?>

	<?php get_template_part( 'template-parts/home/app-download' ); ?>

	<?php get_template_part( 'template-parts/home/blog-preview' ); ?>

	<?php get_template_part( 'template-parts/home/cta-band' ); ?>

</main><!-- #primary -->

<?php
get_footer();
