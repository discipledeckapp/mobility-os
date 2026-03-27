<?php get_header(); ?>

<div class="mv2-container mv2-py-xl">
  <?php if ( have_posts() ) : ?>
    <div class="mv2-post-grid">
      <?php while ( have_posts() ) : the_post(); ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class('mv2-post-card'); ?>>
          <?php if ( has_post_thumbnail() ) : ?>
            <a href="<?php the_permalink(); ?>" class="mv2-post-card__thumb">
              <?php the_post_thumbnail('mv2-card'); ?>
            </a>
          <?php endif; ?>
          <div class="mv2-post-card__body">
            <h2 class="mv2-post-card__title">
              <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
            </h2>
            <div class="mv2-post-card__excerpt"><?php the_excerpt(); ?></div>
            <a href="<?php the_permalink(); ?>" class="mv2-btn mv2-btn--ghost mv2-btn--sm">
              <?php esc_html_e( 'Read more', 'mobiris-v2' ); ?>
            </a>
          </div>
        </article>
      <?php endwhile; ?>
    </div>
    <?php the_posts_pagination( [ 'mid_size' => 2 ] ); ?>
  <?php else : ?>
    <p class="mv2-no-results"><?php esc_html_e( 'Nothing found yet. Check back soon.', 'mobiris-v2' ); ?></p>
  <?php endif; ?>
</div>

<?php get_footer();
