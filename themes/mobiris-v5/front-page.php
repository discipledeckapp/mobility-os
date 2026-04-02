<?php get_header(); ?>
<main id="main" role="main">
    <?php if ( get_theme_mod( 'mobiris_hero_show', true ) )      get_template_part( 'template-parts/sections/hero' ); ?>
    <?php if ( get_theme_mod( 'mobiris_problem_show', true ) )   get_template_part( 'template-parts/sections/problem' ); ?>
    <?php if ( get_theme_mod( 'mobiris_solution_show', true ) )  get_template_part( 'template-parts/sections/solution' ); ?>
    <?php if ( get_theme_mod( 'mobiris_hiw_show', true ) )       get_template_part( 'template-parts/sections/how-it-works' ); ?>
    <?php if ( get_theme_mod( 'mobiris_trust_show', true ) )     get_template_part( 'template-parts/sections/trust-control' ); ?>
    <?php if ( get_theme_mod( 'mobiris_usecases_show', true ) )  get_template_part( 'template-parts/sections/use-cases' ); ?>
    <?php if ( get_theme_mod( 'mobiris_app_show', true ) )       get_template_part( 'template-parts/sections/app-download' ); ?>
    <?php if ( get_theme_mod( 'mobiris_gated_show', true ) )     get_template_part( 'template-parts/sections/gated-content' ); ?>
    <?php if ( get_theme_mod( 'mobiris_cta_show', true ) )       get_template_part( 'template-parts/sections/cta-section' ); ?>
</main>
<?php get_footer();
