<?php
get_header();
$blog_headline = get_theme_mod( 'mobiris_blog_headline', 'Fleet operations insights' );
$blog_subtext  = get_theme_mod( 'mobiris_blog_subtext',  'Practical tips, operator stories, and product updates from the Mobiris team.' );
?>
<main id="main" class="blog-archive" role="main">
    <div class="page-hero page-hero--light">
        <div class="container--narrow">
            <h1 class="heading heading--h2"><?php echo esc_html( $blog_headline ); ?></h1>
            <?php if ( $blog_subtext ) : ?><p class="page-hero__sub"><?php echo esc_html( $blog_subtext ); ?></p><?php endif; ?>
        </div>
    </div>
    <div class="container blog-archive__content">
        <?php if ( have_posts() ) : ?>
            <div class="post-grid">
                <?php while ( have_posts() ) : the_post(); get_template_part( 'template-parts/blog/post-card' ); endwhile; ?>
            </div>
            <?php mobiris_pagination(); ?>
        <?php else : ?>
            <p class="empty-state"><?php esc_html_e( 'No posts yet. Check back soon.', 'mobiris-v4' ); ?></p>
        <?php endif; ?>
    </div>
</main>
<?php get_footer();
