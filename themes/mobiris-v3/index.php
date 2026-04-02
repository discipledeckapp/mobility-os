<?php
/**
 * Mobiris v3 — Fallback index template.
 * WordPress requires this file. Real page rendering happens in front-page.php.
 *
 * @package mobiris-v3
 */

get_header();
?>
<main class="container" style="padding: 4rem 1.5rem; text-align: center;">
    <h1><?php bloginfo( 'name' ); ?></h1>
    <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
        <article><?php the_content(); ?></article>
    <?php endwhile; endif; ?>
</main>
<?php
get_footer();
