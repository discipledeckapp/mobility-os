<?php
/**
 * Homepage template — calls all 13 section parts in order.
 * Each part can be toggled from Appearance → Customize → Section Visibility.
 */

get_header(); ?>

<?php mv2_part('home/hero'); ?>
<?php if ( mv2_opt('show_profit_opportunity', true) ) mv2_part('home/profit-opportunity'); ?>
<?php if ( mv2_opt('show_leakage_exposure', true) )  mv2_part('home/leakage-exposure'); ?>
<?php if ( mv2_opt('show_pain_amplification', true) ) mv2_part('home/pain-amplification'); ?>
<?php if ( mv2_opt('show_product_intro', true) )     mv2_part('home/product-intro'); ?>
<?php if ( mv2_opt('show_how_it_works', true) )      mv2_part('home/how-it-works'); ?>
<?php if ( mv2_opt('show_before_after', true) )      mv2_part('home/before-after'); ?>
<?php if ( mv2_opt('show_calculator', true) )        mv2_part('home/calculator'); ?>
<?php if ( mv2_opt('show_use_cases', true) )         mv2_part('home/use-cases'); ?>
<?php if ( mv2_opt('show_pricing', true) )           mv2_part('home/pricing'); ?>
<?php if ( mv2_opt('show_lead_capture', true) )      mv2_part('home/lead-capture'); ?>
<?php if ( mv2_opt('show_whatsapp_cta', true) )      mv2_part('home/whatsapp-cta'); ?>
<?php mv2_part('home/final-cta'); ?>

<?php get_footer();
