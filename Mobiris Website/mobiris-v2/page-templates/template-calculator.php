<?php /** Template Name: Profit Calculator */ ?>
<?php get_header(); ?>
<div class="mv2-inner-hero mv2-inner-hero--dark">
  <div class="mv2-container">
    <h1 data-lang-en="Fleet profit &amp; leakage calculator"
        data-lang-fr="Calculateur de profit et de pertes de flotte">Fleet profit &amp; leakage calculator</h1>
    <p data-lang-en="Enter your fleet details and see how much you could be leaking — and how much you could recover."
       data-lang-fr="Saisissez les détails de votre flotte et voyez combien vous pourriez perdre — et combien vous pourriez récupérer.">
      Enter your fleet details and see how much you could be leaking — and how much you could recover.
    </p>
  </div>
</div>
<?php mv2_part('home/calculator'); ?>
<?php mv2_part('home/lead-capture'); ?>
<?php get_footer();
