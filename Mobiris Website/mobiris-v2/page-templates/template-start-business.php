<?php /** Template Name: Start Transport Business */ ?>
<?php get_header(); ?>
<div class="mv2-inner-hero">
  <div class="mv2-container">
    <h1 data-lang-en="Starting a transport business in Nigeria: what operators need to know"
        data-lang-fr="Démarrer une entreprise de transport au Nigeria : ce que les opérateurs doivent savoir">
      Starting a transport business in Nigeria: what operators need to know
    </h1>
  </div>
</div>
<section class="mv2-section mv2-section--white">
  <div class="mv2-container mv2-prose mv2-prose--wide">
    <?php while (have_posts()) : the_post(); the_content(); endwhile; ?>
  </div>
</section>
<?php mv2_part('home/profit-opportunity'); ?>
<?php mv2_part('home/lead-capture'); ?>
<?php get_footer();
