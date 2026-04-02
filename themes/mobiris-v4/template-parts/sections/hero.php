<?php
$label          = get_theme_mod( 'mobiris_hero_label',          'Fleet & Driver Operations Platform' );
$headline       = get_theme_mod( 'mobiris_hero_headline',       "Stop losing money\non your fleet." );
$subtext        = get_theme_mod( 'mobiris_hero_subtext',        "Mobiris gives you a clear record of every driver, every vehicle, and every payment. No more notebooks. No more guessing. Just structure." );
$cta1_label     = get_theme_mod( 'mobiris_hero_cta1_label',     'Get started free' );
$cta1_url       = get_theme_mod( 'mobiris_hero_cta1_url',       'https://app.mobiris.ng' );
$cta2_label     = get_theme_mod( 'mobiris_hero_cta2_label',     'Request a demo' );
$social_proof   = get_theme_mod( 'mobiris_hero_social_proof',   'Used by transport and logistics operators across Nigeria' );
$show_dashboard = get_theme_mod( 'mobiris_hero_show_dashboard', true );
$wa_url         = mobiris_whatsapp_url( 'mobiris_whatsapp_demo_message' );
?>
<section class="hero" aria-labelledby="hero-headline">
    <div class="container--narrow">
        <div class="hero__content">
            <?php if ( $label ) : ?>
                <div class="hero__label"><span class="pill pill--brand"><?php echo esc_html( $label ); ?></span></div>
            <?php endif; ?>
            <h1 id="hero-headline" class="heading heading--hero hero__headline"><?php echo esc_html( $headline ); ?></h1>
            <?php if ( $subtext ) : ?>
                <p class="hero__subtext"><?php echo esc_html( $subtext ); ?></p>
            <?php endif; ?>
            <div class="hero__ctas">
                <a href="<?php echo esc_url( $cta1_url ); ?>" class="btn btn--primary btn--full"><?php echo esc_html( $cta1_label ); ?></a>
                <a href="<?php echo esc_url( $wa_url ); ?>" class="btn btn--outline btn--full" target="_blank" rel="noopener noreferrer">
                    <svg class="btn__wa-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    <?php echo esc_html( $cta2_label ); ?>
                </a>
            </div>
            <?php if ( $social_proof ) : ?>
                <p class="hero__social-proof"><?php echo esc_html( $social_proof ); ?></p>
            <?php endif; ?>
        </div>
    </div>
    <?php if ( $show_dashboard ) : ?>
    <div class="container hero__dashboard-wrap">
        <div class="hero__browser" role="img" aria-label="Mobiris dashboard preview">
            <div class="hero__browser-bar" aria-hidden="true">
                <div class="hero__browser-dot"></div><div class="hero__browser-dot"></div><div class="hero__browser-dot"></div>
                <div class="hero__browser-url"></div>
            </div>
            <div class="hero__dashboard" aria-hidden="true">
                <div class="hero__stats-grid">
                    <div class="hero__stat-card"><p class="hero__stat-label">Active Drivers</p><p class="hero__stat-value">48</p></div>
                    <div class="hero__stat-card"><p class="hero__stat-label">Today's Remittance</p><p class="hero__stat-value">&#8358;384,000</p></div>
                    <div class="hero__stat-card"><p class="hero__stat-label">Vehicles Assigned</p><p class="hero__stat-value">43</p></div>
                    <div class="hero__stat-card"><p class="hero__stat-label">Overdue Payments</p><p class="hero__stat-value">5</p></div>
                </div>
                <div class="hero__table">
                    <div class="hero__table-header"><span class="hero__table-title">Recent activity</span><div class="hero__table-action"></div></div>
                    <div class="hero__table-row"><div class="hero__row-left"><div class="hero__avatar">C</div><p class="hero__row-name">Chukwuemeka O.</p></div><div class="hero__row-right"><span class="hero__row-amount">&#8358;8,000</span><span class="badge badge--paid">Paid</span></div></div>
                    <div class="hero__table-row"><div class="hero__row-left"><div class="hero__avatar">A</div><p class="hero__row-name">Adebayo M.</p></div><div class="hero__row-right"><span class="hero__row-amount">&#8358;8,000</span><span class="badge badge--pending">Pending</span></div></div>
                    <div class="hero__table-row"><div class="hero__row-left"><div class="hero__avatar">I</div><p class="hero__row-name">Ifeanyi N.</p></div><div class="hero__row-right"><span class="hero__row-amount">&#8358;8,000</span><span class="badge badge--paid">Paid</span></div></div>
                </div>
            </div>
        </div>
    </div>
    <?php endif; ?>
</section>
