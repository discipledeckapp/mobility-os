<?php
$video_url = get_post_meta( get_the_ID(), '_mobiris_video_url', true );
$type      = $video_url ? 'video' : 'guide';
?>
<article class="tutorial-card tutorial-card--<?php echo esc_attr( $type ); ?>">
    <?php if ( has_post_thumbnail() ) : ?>
        <a href="<?php the_permalink(); ?>" class="tutorial-card__thumb" tabindex="-1" aria-hidden="true">
            <?php the_post_thumbnail( 'medium_large', [ 'loading' => 'lazy', 'alt' => '' ] ); ?>
            <?php if ( $video_url ) : ?>
                <span class="tutorial-card__play" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </span>
            <?php endif; ?>
        </a>
    <?php endif; ?>
    <div class="tutorial-card__body">
        <div class="tutorial-card__type-badge tutorial-card__type-badge--<?php echo esc_attr( $type ); ?>">
            <?php echo $type === 'video' ? esc_html__( 'Video', 'mobiris-v5' ) : esc_html__( 'Guide', 'mobiris-v5' ); ?>
        </div>
        <h2 class="tutorial-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
        <p class="tutorial-card__excerpt"><?php echo esc_html( mobiris_get_excerpt( 18 ) ); ?></p>
        <a href="<?php the_permalink(); ?>" class="tutorial-card__cta">
            <?php echo $type === 'video' ? esc_html__( 'Watch tutorial', 'mobiris-v5' ) : esc_html__( 'Read guide', 'mobiris-v5' ); ?>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
    </div>
</article>
