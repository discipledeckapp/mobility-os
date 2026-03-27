<?php get_header(); ?>

<div class="mv2-page-wrap">
  <div class="mv2-container mv2-py-xl">
    <?php while ( have_posts() ) : the_post(); ?>
      <article id="post-<?php the_ID(); ?>" <?php post_class('mv2-page-content'); ?>>
        <?php if ( ! is_front_page() ) : ?>
          <header class="mv2-page-header">
            <h1 class="mv2-page-title"><?php the_title(); ?></h1>
          </header>
        <?php endif; ?>
        <div class="mv2-prose">
          <?php the_content(); ?>
        </div>
      </article>
    <?php endwhile; ?>
  </div>
</div>

<?php get_footer();
