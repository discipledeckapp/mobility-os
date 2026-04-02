<?php get_header(); ?>
<main id="main" class="single-tutorial" role="main">
    <?php while ( have_posts() ) : the_post();
        $video_url = get_post_meta( get_the_ID(), '_mobiris_video_url', true );
        $tut_cats  = get_the_terms( get_the_ID(), 'tutorial_category' );
    ?>
    <article id="post-<?php the_ID(); ?>" <?php post_class( 'single-tutorial__article' ); ?>>
        <div class="page-hero">
            <div class="container--narrow">
                <div class="single-post__meta">
                    <?php if ( $tut_cats && ! is_wp_error( $tut_cats ) ) : ?>
                        <span class="post-card__cat"><?php echo esc_html( $tut_cats[0]->name ); ?></span>
                        <span class="post-card__sep">·</span>
                    <?php endif; ?>
                    <time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time>
                </div>
                <h1 class="heading heading--h2 single-post__title"><?php the_title(); ?></h1>
            </div>
        </div>
        <div class="container--narrow single-tutorial__body">
            <?php if ( $video_url ) : ?>
                <div class="single-tutorial__video">
                    <?php echo mobiris_get_video_embed( $video_url ); // phpcs:ignore ?>
                </div>
            <?php elseif ( has_post_thumbnail() ) : ?>
                <div class="single-post__thumb"><?php the_post_thumbnail( 'large' ); ?></div>
            <?php endif; ?>
            <div class="single-post__content prose"><?php the_content(); ?></div>
        </div>
    </article>
    <!-- Back to tutorials -->
    <div class="container--narrow" style="padding-bottom:3rem;">
        <a href="<?php echo esc_url( get_post_type_archive_link( 'mobiris_tutorial' ) ); ?>" class="trust__link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            <?php esc_html_e( 'Back to tutorials', 'mobiris-v4' ); ?>
        </a>
    </div>
    <?php endwhile; ?>
</main>
<?php get_footer();
