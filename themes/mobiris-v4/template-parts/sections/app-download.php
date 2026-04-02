<?php
$label       = get_theme_mod( 'mobiris_app_label',        'Mobile App' );
$headline    = get_theme_mod( 'mobiris_app_headline',     "Manage your fleet\nfrom your phone." );
$subtext     = get_theme_mod( 'mobiris_app_subtext',      "The Mobiris app lets you check driver payments, assign vehicles, and see your fleet activity on the go. Available on iOS and Android." );
$ios_url     = get_theme_mod( 'mobiris_app_ios_url',      '#' );
$android_url = get_theme_mod( 'mobiris_app_android_url',  '#' );
$ios_label   = get_theme_mod( 'mobiris_app_ios_label',    'Download on App Store' );
$and_label   = get_theme_mod( 'mobiris_app_android_label','Get it on Google Play' );
$rating      = get_theme_mod( 'mobiris_app_rating_text',  'Rated 4.8 ★ · Available on iOS & Android' );
?>
<section class="app-section" aria-labelledby="app-headline">
    <div class="container">
        <div class="app-section__grid">
            <!-- Text + buttons -->
            <div class="app-section__content">
                <?php if ( $label ) : ?><p class="text-label app-section__label"><?php echo esc_html( $label ); ?></p><?php endif; ?>
                <h2 id="app-headline" class="heading heading--h2 app-section__headline"><?php echo esc_html( $headline ); ?></h2>
                <?php if ( $subtext ) : ?><p class="app-section__subtext"><?php echo esc_html( $subtext ); ?></p><?php endif; ?>
                <div class="app-section__buttons">
                    <?php if ( $ios_url ) : ?>
                        <a href="<?php echo esc_url( $ios_url ); ?>" class="btn-store btn-store--ios" target="_blank" rel="noopener noreferrer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                            <div><span class="btn-store__sub">Download on the</span><span class="btn-store__main"><?php echo esc_html( $ios_label ); ?></span></div>
                        </a>
                    <?php endif; ?>
                    <?php if ( $android_url ) : ?>
                        <a href="<?php echo esc_url( $android_url ); ?>" class="btn-store btn-store--android" target="_blank" rel="noopener noreferrer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.18 23.76c.34.19.72.24 1.09.15l12.16-7.02-2.59-2.59-10.66 9.46zm-1.1-1.33c-.07-.2-.08-.42-.08-.65V2.22c0-.23.01-.45.08-.65L13.7 12 2.08 22.43zm19.94-11.16L18.97 9.3l-2.88 2.7 2.88 2.7 3.05-1.97c.87-.5.87-1.71 0-2.21zM4.27.24C3.9.14 3.52.2 3.18.39L13.7 10.98 16.3 8.4 4.27.24z"/></svg>
                            <div><span class="btn-store__sub">Get it on</span><span class="btn-store__main"><?php echo esc_html( $and_label ); ?></span></div>
                        </a>
                    <?php endif; ?>
                </div>
                <?php if ( $rating ) : ?><p class="app-section__rating"><?php echo esc_html( $rating ); ?></p><?php endif; ?>
            </div>
            <!-- Phone mockup -->
            <div class="app-section__visual" aria-hidden="true">
                <div class="app-section__phone">
                    <div class="app-section__phone-notch"></div>
                    <div class="app-section__phone-screen">
                        <div class="app-section__screen-row app-section__screen-row--header"></div>
                        <div class="app-section__screen-stat"></div>
                        <div class="app-section__screen-stat app-section__screen-stat--sm"></div>
                        <div class="app-section__screen-list">
                            <div class="app-section__screen-item"></div>
                            <div class="app-section__screen-item"></div>
                            <div class="app-section__screen-item"></div>
                        </div>
                    </div>
                    <div class="app-section__phone-home"></div>
                </div>
            </div>
        </div>
    </div>
</section>
