<?php get_header(); ?>
<main id="main" class="single-post" role="main">
    <?php while ( have_posts() ) : the_post(); ?>
    <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
        <div class="single-post__hero">
            <div class="container--narrow">
                <div class="single-post__meta">
                    <time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time>
                    <?php $cats = get_the_category(); if ( $cats ) : ?><span class="post-card__sep">·</span><span><?php echo esc_html( $cats[0]->name ); ?></span><?php endif; ?>
                </div>
                <h1 class="heading heading--h2 single-post__title"><?php the_title(); ?></h1>
                <?php if ( has_post_thumbnail() ) : ?>
                    <div class="single-post__thumb"><?php the_post_thumbnail( 'large', [ 'loading' => 'eager' ] ); ?></div>
                <?php endif; ?>
            </div>
        </div>
        <div class="container--narrow">
            <div class="single-post__content prose"><?php the_content(); ?></div>
            <div class="single-post__nav">
                <div><?php previous_post_link( '%link', '&larr; %title' ); ?></div>
                <div><?php next_post_link( '%link', '%title &rarr;' ); ?></div>
            </div>
        </div>
    </article>
    <?php endwhile; ?>
</main>
<?php get_footer();
