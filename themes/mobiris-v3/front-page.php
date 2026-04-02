<?php
/**
 * Mobiris v3 — Front Page Template
 * This is the main marketing landing page.
 *
 * @package mobiris-v3
 */

get_header();
?>

<main id="main" role="main">

    <?php if ( get_theme_mod( 'mobiris_hero_show', true ) ) : ?>
        <?php get_template_part( 'template-parts/sections/hero' ); ?>
    <?php endif; ?>

    <?php if ( get_theme_mod( 'mobiris_problem_show', true ) ) : ?>
        <?php get_template_part( 'template-parts/sections/problem' ); ?>
    <?php endif; ?>

    <?php if ( get_theme_mod( 'mobiris_solution_show', true ) ) : ?>
        <?php get_template_part( 'template-parts/sections/solution' ); ?>
    <?php endif; ?>

    <?php if ( get_theme_mod( 'mobiris_hiw_show', true ) ) : ?>
        <?php get_template_part( 'template-parts/sections/how-it-works' ); ?>
    <?php endif; ?>

    <?php if ( get_theme_mod( 'mobiris_trust_show', true ) ) : ?>
        <?php get_template_part( 'template-parts/sections/trust-control' ); ?>
    <?php endif; ?>

    <?php if ( get_theme_mod( 'mobiris_usecases_show', true ) ) : ?>
        <?php get_template_part( 'template-parts/sections/use-cases' ); ?>
    <?php endif; ?>

    <?php if ( get_theme_mod( 'mobiris_cta_show', true ) ) : ?>
        <?php get_template_part( 'template-parts/sections/cta-section' ); ?>
    <?php endif; ?>

</main>

<?php
get_footer();
