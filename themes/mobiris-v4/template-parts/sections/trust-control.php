<?php
$label     = get_theme_mod( 'mobiris_trust_label',     'Built for trust' );
$headline  = get_theme_mod( 'mobiris_trust_headline',  "Control is not about distrust.\nIt's about running a proper business." );
$body      = get_theme_mod( 'mobiris_trust_body',      "When a driver knows their identity is verified and their guarantor is on file, they operate differently. When you have records, disputes disappear." );
$cta_label = get_theme_mod( 'mobiris_trust_cta_label', 'Talk to us about your fleet' );
$wa_url    = mobiris_whatsapp_url( 'mobiris_whatsapp_demo_message' );
$defaults  = [ 1 => [ 'Identity verification', 'Every driver goes through document and biometric checks before they touch your vehicles.' ], 2 => [ 'Guarantor system', 'Capture and verify guarantors before any assignment. If a driver disappears, you know who is responsible.' ], 3 => [ 'Signed assignments', 'Every driver-vehicle pairing is a formal record. Terms, dates, and agreement — documented and stored.' ], 4 => [ 'Full payment history', 'Every remittance logged with timestamps. No more disputes about who paid what, and when.' ] ];
$icons = [
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
];
?>
<section id="trust" class="trust" aria-labelledby="trust-headline">
    <div class="container">
        <div class="trust__grid">
            <div class="trust__editorial">
                <?php if ( $label ) : ?><p class="text-label trust__label"><?php echo esc_html( $label ); ?></p><?php endif; ?>
                <h2 id="trust-headline" class="heading heading--h2 trust__headline"><?php echo esc_html( $headline ); ?></h2>
                <?php if ( $body ) : ?><p class="trust__body"><?php echo esc_html( $body ); ?></p><?php endif; ?>
                <?php if ( $cta_label ) : ?>
                    <a href="<?php echo esc_url( $wa_url ); ?>" class="trust__link" target="_blank" rel="noopener noreferrer">
                        <?php echo esc_html( $cta_label ); ?>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </a>
                <?php endif; ?>
            </div>
            <div class="trust__cards">
                <?php for ( $i = 1; $i <= 4; $i++ ) :
                    $title = get_theme_mod( "mobiris_trust_item_{$i}_title", $defaults[$i][0] );
                    $desc  = get_theme_mod( "mobiris_trust_item_{$i}_body",  $defaults[$i][1] );
                ?>
                    <div class="trust__card">
                        <div class="trust__card-icon"><?php echo $icons[$i-1]; // phpcs:ignore ?></div>
                        <h3 class="trust__card-title"><?php echo esc_html( $title ); ?></h3>
                        <p class="trust__card-body"><?php echo esc_html( $desc ); ?></p>
                    </div>
                <?php endfor; ?>
            </div>
        </div>
    </div>
</section>
