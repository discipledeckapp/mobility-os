<?php
/**
 * Template Name: For Fleet Owners
 */
get_header(); ?>

<div class="mv2-inner-hero mv2-inner-hero--fleet">
  <div class="mv2-container">
    <div class="mv2-badge mv2-badge--green"
         data-lang-en="For fleet owners" data-lang-fr="Pour les propriétaires de flotte">For fleet owners</div>
    <h1 data-lang-en="Your vehicles. Your money. Your records."
        data-lang-fr="Vos véhicules. Votre argent. Vos dossiers.">
      Your vehicles. Your money. Your records.
    </h1>
    <p data-lang-en="Mobiris gives you a complete picture of what your fleet is generating — so you can stop relying on word of mouth and start running numbers."
       data-lang-fr="Mobiris vous donne une image complète de ce que génère votre flotte — pour que vous puissiez arrêter de vous fier à la rumeur et commencer à analyser les chiffres.">
      Mobiris gives you a complete picture of what your fleet is generating — so you can stop relying on word of mouth and start running numbers.
    </p>
  </div>
</div>

<?php mv2_part('home/profit-opportunity'); ?>
<?php mv2_part('home/leakage-exposure'); ?>
<?php mv2_part('home/product-intro'); ?>
<?php mv2_part('home/pricing'); ?>
<?php mv2_part('home/lead-capture'); ?>

<?php get_footer();
