<?php
/**
 * Template Name: Product Overview
 */
get_header(); ?>

<div class="mv2-inner-hero mv2-inner-hero--product">
  <div class="mv2-container">
    <div class="mv2-badge mv2-badge--blue"
         data-lang-en="Platform" data-lang-fr="Plateforme">Platform</div>
    <h1 data-lang-en="Everything you need to run a serious fleet operation"
        data-lang-fr="Tout ce dont vous avez besoin pour gérer une exploitation de flotte sérieuse">
      Everything you need to run a serious fleet operation
    </h1>
    <p data-lang-en="Remittance. Drivers. Vehicles. Compliance. In one place."
       data-lang-fr="Remises. Conducteurs. Véhicules. Conformité. En un seul endroit.">
      Remittance. Drivers. Vehicles. Compliance. In one place.
    </p>
  </div>
</div>

<?php mv2_part('home/product-intro'); ?>
<?php mv2_part('home/how-it-works'); ?>
<?php mv2_part('home/before-after'); ?>
<?php mv2_global('cta-band'); ?>

<?php get_footer();
