<?php
$label    = get_theme_mod( 'mobiris_solution_label',    'The solution' );
$headline = get_theme_mod( 'mobiris_solution_headline', "Everything you need to\nrun your fleet properly." );
$subtext  = get_theme_mod( 'mobiris_solution_subtext',  'Mobiris is built for operators who manage drivers, vehicles, and daily payments. Simple to use. Clear records. Full control.' );
$defaults = [ 1 => [ 'Know your drivers', 'Verified identity, documents, and guarantors — before a vehicle ever leaves your yard.' ], 2 => [ 'Track your money', 'Daily remittance records for every driver. See who paid, who owes, and how much — at a glance.' ], 3 => [ 'Assign with confidence', 'Every vehicle linked to a named driver. Formal records. No disputes. Clear accountability.' ], 4 => [ 'See your fleet', "One dashboard. Know what's active, what's overdue, and what needs your attention — right now." ] ];
$icons = [
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
];
?>
<section class="solution" aria-labelledby="solution-headline">
    <div class="container">
        <div class="solution__header">
            <?php if ( $label ) : ?><p class="text-label solution__label"><?php echo esc_html( $label ); ?></p><?php endif; ?>
            <h2 id="solution-headline" class="heading heading--h2 solution__headline"><?php echo esc_html( $headline ); ?></h2>
            <?php if ( $subtext ) : ?><p class="solution__subtext"><?php echo esc_html( $subtext ); ?></p><?php endif; ?>
        </div>
        <div class="solution__grid">
            <?php for ( $i = 1; $i <= 4; $i++ ) :
                $title = get_theme_mod( "mobiris_solution_feature_{$i}_title", $defaults[$i][0] );
                $body  = get_theme_mod( "mobiris_solution_feature_{$i}_body",  $defaults[$i][1] );
            ?>
                <div class="solution__card">
                    <div class="solution__card-inner">
                        <div class="solution__icon-wrap"><?php echo $icons[$i-1]; // phpcs:ignore ?></div>
                        <div>
                            <p class="solution__num"><?php echo sprintf( '%02d', $i ); ?></p>
                            <h3 class="solution__title"><?php echo esc_html( $title ); ?></h3>
                            <p class="solution__body"><?php echo esc_html( $body ); ?></p>
                        </div>
                    </div>
                </div>
            <?php endfor; ?>
        </div>
    </div>
</section>
