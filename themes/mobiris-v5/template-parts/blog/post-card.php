<article class="post-card" id="post-<?php the_ID(); ?>">
    <?php if ( has_post_thumbnail() ) : ?>
        <a href="<?php the_permalink(); ?>" class="post-card__thumb" tabindex="-1" aria-hidden="true">
            <?php the_post_thumbnail( 'medium_large', [ 'loading' => 'lazy', 'alt' => '' ] ); ?>
        </a>
    <?php endif; ?>
    <div class="post-card__body">
        <div class="post-card__meta">
            <time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>" class="post-card__date"><?php echo esc_html( get_the_date() ); ?></time>
            <?php $cats = get_the_category(); if ( $cats ) : ?>
                <span class="post-card__sep" aria-hidden="true">·</span>
                <span class="post-card__cat"><?php echo esc_html( $cats[0]->name ); ?></span>
            <?php endif; ?>
        </div>
        <h2 class="post-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
        <p class="post-card__excerpt"><?php echo esc_html( mobiris_get_excerpt( 22 ) ); ?></p>
        <a href="<?php the_permalink(); ?>" class="post-card__read-more">
            <?php esc_html_e( 'Read more', 'mobiris-v5' ); ?>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
    </div>
</article>
