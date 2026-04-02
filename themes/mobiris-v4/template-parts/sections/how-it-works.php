<?php
$label    = get_theme_mod( 'mobiris_hiw_label',    'How it works' );
$headline = get_theme_mod( 'mobiris_hiw_headline', 'Up and running in minutes.' );
$subtext  = get_theme_mod( 'mobiris_hiw_subtext',  'No long setup. No training required. Just start adding your drivers.' );
$cta      = get_theme_mod( 'mobiris_hiw_cta_label','Start for free' );
$app_url  = mobiris_app_url();
$defaults = [ 1 => [ 'Add your drivers', 'Enter their name, phone, and required documents. Build your verified driver roster.' ], 2 => [ 'Verify who they are', "Run identity checks and capture guarantor details. Know exactly who you're dealing with." ], 3 => [ 'Assign your vehicles', 'Link each driver to a vehicle with a formal agreement. Every assignment on record.' ], 4 => [ 'Track every payment', 'Log daily remittance. See who paid today, who owes, and the full history for any driver.' ] ];
?>
<section id="how-it-works" class="hiw" aria-labelledby="hiw-headline">
    <div class="container">
        <div class="hiw__header">
            <?php if ( $label ) : ?><p class="text-label hiw__label"><?php echo esc_html( $label ); ?></p><?php endif; ?>
            <h2 id="hiw-headline" class="heading heading--h2"><?php echo esc_html( $headline ); ?></h2>
            <?php if ( $subtext ) : ?><p class="hiw__subtext"><?php echo esc_html( $subtext ); ?></p><?php endif; ?>
        </div>
        <div class="hiw__steps">
            <?php for ( $i = 1; $i <= 4; $i++ ) :
                $title = get_theme_mod( "mobiris_hiw_step_{$i}_title", $defaults[$i][0] );
                $body  = get_theme_mod( "mobiris_hiw_step_{$i}_body",  $defaults[$i][1] );
            ?>
                <div class="hiw__step">
                    <div class="hiw__step-num" aria-hidden="true"><?php echo esc_html( $i ); ?></div>
                    <h3 class="hiw__step-title"><?php echo esc_html( $title ); ?></h3>
                    <p class="hiw__step-body"><?php echo esc_html( $body ); ?></p>
                </div>
            <?php endfor; ?>
        </div>
        <?php if ( $cta ) : ?>
            <div class="hiw__cta">
                <a href="<?php echo esc_url( $app_url ); ?>" class="btn btn--primary">
                    <?php echo esc_html( $cta ); ?>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
            </div>
        <?php endif; ?>
    </div>
</section>
