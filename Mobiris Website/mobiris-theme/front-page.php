<?php
/**
 * Front Page Template (Homepage)
 *
 * Displays the homepage with all hero, features, pricing, and content sections
 * for the Mobiris fleet operations platform.
 *
 * @package Mobiris
 * @since 1.0.0
 */

get_header();
?>

<main id="primary" class="site-main homepage-main">

	<?php
	/**
	 * Hero Section
	 * Main call-to-action and platform overview
	 */
	get_template_part( 'template-parts/home/hero' );
	?>

	<?php
	/**
	 * Statistics Section
	 * Key metrics and platform scale
	 */
	get_template_part( 'template-parts/home/stats' );
	?>

	<?php
	/**
	 * Problem Statement Section
	 * Positioning and market context
	 */
	get_template_part( 'template-parts/home/problem' );
	?>

	<?php
	/**
	 * Features Grid Section
	 * Core product capabilities
	 */
	get_template_part( 'template-parts/home/features' );
	?>

	<?php
	/**
	 * Intelligence Plane Section
	 * Key differentiator and network effects
	 */
	get_template_part( 'template-parts/home/intelligence' );
	?>

	<?php
	/**
	 * How It Works Section
	 * Implementation timeline and process
	 */
	get_template_part( 'template-parts/home/how-it-works' );
	?>

	<?php
	/**
	 * Testimonials Section
	 * Social proof from existing operators
	 */
	get_template_part( 'template-parts/home/testimonials' );
	?>

	<?php
	/**
	 * Pricing Section
	 * Subscription tiers and add-ons
	 */
	get_template_part( 'template-parts/home/pricing' );
	?>

	<?php
	/**
	 * App Download Section
	 * Mobile and web platform access
	 */
	get_template_part( 'template-parts/home/app-download' );
	?>

	<?php
	/**
	 * Blog Preview Section
	 * Latest articles and thought leadership
	 */
	get_template_part( 'template-parts/home/blog-preview' );
	?>

	<?php
	/**
	 * Guides Preview Section
	 * How-to and implementation resources
	 */
	get_template_part( 'template-parts/home/guides-preview' );
	?>

	<?php
	/**
	 * Bottom CTA Band
	 * Final conversion opportunity
	 */
	get_template_part( 'template-parts/home/cta-band' );
	?>

</main><!-- #primary -->

<?php
get_footer();
