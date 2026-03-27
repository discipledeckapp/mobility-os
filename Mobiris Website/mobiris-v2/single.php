<?php get_header(); ?>

<div class="mv2-container mv2-py-xl">
  <div class="mv2-single-layout">
    <main class="mv2-single-main">
      <?php while ( have_posts() ) : the_post(); ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class('mv2-single-article'); ?>>
          <header class="mv2-single-header">
            <?php the_category( ' · ' ); ?>
            <h1 class="mv2-single-title"><?php the_title(); ?></h1>
            <div class="mv2-single-meta">
              <time datetime="<?php echo get_the_date('c'); ?>"><?php echo get_the_date(); ?></time>
              <span>·</span>
              <span><?php echo get_the_author(); ?></span>
            </div>
            <?php if ( has_post_thumbnail() ) : ?>
              <div class="mv2-single-thumb"><?php the_post_thumbnail('mv2-hero'); ?></div>
            <?php endif; ?>
          </header>
          <div class="mv2-prose mv2-single-body">
            <?php the_content(); ?>
          </div>
          <footer class="mv2-single-footer">
            <?php the_tags( '<div class="mv2-tag-list">', '', '</div>' ); ?>
            <?php the_post_navigation( [
              'prev_text' => '← %title',
              'next_text' => '%title →',
            ] ); ?>
          </footer>
        </article>
        <?php if ( comments_open() || get_comments_number() ) : ?>
          <?php comments_template(); ?>
        <?php endif; ?>
      <?php endwhile; ?>
    </main>
    <aside class="mv2-sidebar">
      <?php dynamic_sidebar('mv2-blog-sidebar'); ?>
    </aside>
  </div>
</div>

<?php get_footer();
