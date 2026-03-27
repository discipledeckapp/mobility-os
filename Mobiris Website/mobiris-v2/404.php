<?php get_header(); ?>

<div class="mv2-container mv2-py-xl mv2-404-wrap">
  <div class="mv2-404-inner">
    <span class="mv2-404-code">404</span>
    <h1 class="mv2-404-title"
        data-lang-en="Page not found"
        data-lang-fr="Page introuvable">Page not found</h1>
    <p class="mv2-404-body"
       data-lang-en="That page doesn't exist or was moved. Let's get you back on track."
       data-lang-fr="Cette page n'existe pas ou a été déplacée. Retournons sur la bonne voie.">
      That page doesn't exist or was moved. Let's get you back on track.
    </p>
    <a href="<?php echo esc_url( home_url('/') ); ?>" class="mv2-btn mv2-btn--primary">
      <span data-lang-en="Back to home" data-lang-fr="Retour à l'accueil">Back to home</span>
    </a>
  </div>
</div>

<?php get_footer();
