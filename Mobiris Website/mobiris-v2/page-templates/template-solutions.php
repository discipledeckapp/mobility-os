<?php
/**
 * Template Name: Solutions
 */
get_header(); ?>

<div class="mv2-inner-hero">
  <div class="mv2-container">
    <div class="mv2-badge mv2-badge--blue"
         data-lang-en="Solutions" data-lang-fr="Solutions">Solutions</div>
    <h1 data-lang-en="Built for how African transport actually works"
        data-lang-fr="Conçu pour le transport africain tel qu'il fonctionne réellement">
      Built for how African transport actually works
    </h1>
  </div>
</div>

<?php mv2_part('home/use-cases'); ?>
<?php mv2_part('home/leakage-exposure'); ?>
<?php mv2_global('cta-band'); ?>

<?php get_footer();
