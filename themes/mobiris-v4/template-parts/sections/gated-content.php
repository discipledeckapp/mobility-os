<?php
$label       = get_theme_mod( 'mobiris_gated_label',       'Free Resource' );
$headline    = get_theme_mod( 'mobiris_gated_headline',    'Free Fleet Operations Guide' );
$description = get_theme_mod( 'mobiris_gated_description', 'Download our free guide: How to reduce remittance leakage and take control of your driver operations. Used by 200+ operators.' );
$bullet1     = get_theme_mod( 'mobiris_gated_bullet_1',    'How to structure daily remittance' );
$bullet2     = get_theme_mod( 'mobiris_gated_bullet_2',    'Driver identity verification checklist' );
$bullet3     = get_theme_mod( 'mobiris_gated_bullet_3',    'Guarantor agreement template' );
$cta_label   = get_theme_mod( 'mobiris_gated_cta_label',   'Send me the guide' );
$placeholder = get_theme_mod( 'mobiris_gated_placeholder', 'Enter your email address' );
$privacy     = get_theme_mod( 'mobiris_gated_privacy_note','No spam. We respect your privacy.' );
$resource_id = get_theme_mod( 'mobiris_gated_resource_id', 'fleet-guide-2026' );
$bullets = array_filter( [ $bullet1, $bullet2, $bullet3 ] );
?>
<section id="gated" class="gated" aria-labelledby="gated-headline">
    <div class="container">
        <div class="gated__grid">
            <!-- Left: description -->
            <div class="gated__content">
                <?php if ( $label ) : ?><p class="text-label gated__label"><?php echo esc_html( $label ); ?></p><?php endif; ?>
                <h2 id="gated-headline" class="heading heading--h2 gated__headline"><?php echo esc_html( $headline ); ?></h2>
                <?php if ( $description ) : ?><p class="gated__description"><?php echo esc_html( $description ); ?></p><?php endif; ?>
                <?php if ( $bullets ) : ?>
                    <ul class="gated__bullets">
                        <?php foreach ( $bullets as $b ) : ?>
                            <li class="gated__bullet">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                                <?php echo esc_html( $b ); ?>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
            </div>
            <!-- Right: form -->
            <div class="gated__form-wrap">
                <div class="gated__form-card">
                    <form class="gated__form" data-resource="<?php echo esc_attr( $resource_id ); ?>" novalidate>
                        <label class="gated__form-label" for="gated-email"><?php esc_html_e( 'Your email address', 'mobiris-v4' ); ?></label>
                        <input
                            type="email"
                            id="gated-email"
                            name="email"
                            class="gated__input"
                            placeholder="<?php echo esc_attr( $placeholder ); ?>"
                            required
                            autocomplete="email"
                        >
                        <p class="gated__error" role="alert" aria-live="polite" hidden></p>
                        <button type="submit" class="btn btn--primary gated__submit">
                            <?php echo esc_html( $cta_label ); ?>
                        </button>
                        <?php if ( $privacy ) : ?>
                            <p class="gated__privacy"><?php echo esc_html( $privacy ); ?></p>
                        <?php endif; ?>
                    </form>
                    <!-- Success state (shown by JS after submission) -->
                    <div class="gated__success" hidden>
                        <div class="gated__success-icon" aria-hidden="true">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <h3 class="gated__success-title"><?php esc_html_e( "You're in!", 'mobiris-v4' ); ?></h3>
                        <p class="gated__success-msg"><?php esc_html_e( 'Your download is ready below.', 'mobiris-v4' ); ?></p>
                        <a href="#" class="btn btn--primary gated__download-btn" style="display:none;" download>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <?php esc_html_e( 'Download the Guide', 'mobiris-v4' ); ?>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
