<?php
$label    = get_theme_mod( 'mobiris_problem_label',   'Sound familiar?' );
$headline = get_theme_mod( 'mobiris_problem_headline', "Running a fleet shouldn't\nfeel like this." );
$bridge1  = get_theme_mod( 'mobiris_problem_bridge1',  'You built your business on trust and hard work.' );
$bridge2  = get_theme_mod( 'mobiris_problem_bridge2',  "It's time to back it up with structure." );

$pains = [];
for ( $i = 1; $i <= 6; $i++ ) {
    $text = get_theme_mod( "mobiris_problem_pain_{$i}", mobiris_default_pain( $i ) );
    if ( $text ) {
        $pains[] = $text;
    }
}

// SVG icon library keyed by index (0-based), maps to a simple metaphor
$icons = [
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="9" y1="12" x2="11" y2="14"/><line x1="15" y1="10" x2="11" y2="14"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
];
?>

<section class="problem" aria-labelledby="problem-headline">
    <div class="container">

        <div class="problem__header">
            <?php if ( $label ) : ?>
                <p class="text-label problem__label"><?php echo esc_html( $label ); ?></p>
            <?php endif; ?>
            <h2 id="problem-headline" class="heading heading--h2 problem__headline">
                <?php echo esc_html( $headline ); ?>
            </h2>
        </div>

        <div class="problem__grid">
            <?php foreach ( $pains as $index => $pain ) : ?>
                <div class="problem__card">
                    <div class="problem__icon" aria-hidden="true">
                        <?php echo $icons[ $index % count( $icons ) ]; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    </div>
                    <p class="problem__text"><?php echo esc_html( $pain ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>

        <?php if ( $bridge1 || $bridge2 ) : ?>
            <div class="problem__bridge">
                <?php if ( $bridge1 ) : ?>
                    <p class="problem__bridge-soft"><?php echo esc_html( $bridge1 ); ?></p>
                <?php endif; ?>
                <?php if ( $bridge2 ) : ?>
                    <p class="problem__bridge-bold"><?php echo esc_html( $bridge2 ); ?></p>
                <?php endif; ?>
            </div>
        <?php endif; ?>

    </div>
</section>
