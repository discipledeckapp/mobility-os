<?php
$label    = get_theme_mod( 'mobiris_usecases_label',    "Who it's for" );
$headline = get_theme_mod( 'mobiris_usecases_headline', "Built for the way you\nactually operate." );

$uc_defaults = [
    1 => [
        'Transport operators',
        'Keke, taxi, and hire purchase fleets',
        'You manage dozens of drivers on daily remittance. Mobiris gives you a clear record of every assignment, every payment, and every driver — without the WhatsApp chaos.',
        'Daily remittance, Driver assignments, Identity verification',
    ],
    2 => [
        'Delivery fleets',
        'Logistics and last-mile operators',
        'Keep your delivery assets accountable. Verify every rider or driver, track their daily targets, and know exactly which vehicle is where.',
        'Asset accountability, Driver verification, Performance tracking',
    ],
    3 => [
        'Asset financing',
        'Hire purchase and leasing operators',
        'Structure your repayment tracking from day one. Verified identities, signed agreements, and a full audit trail of what was paid and what is outstanding.',
        'Repayment tracking, Guarantor records, Signed agreements',
    ],
];

$use_cases = [];
for ( $i = 1; $i <= 3; $i++ ) {
    $use_cases[] = [
        'category'    => get_theme_mod( "mobiris_uc_{$i}_category",    $uc_defaults[ $i ][0] ),
        'headline'    => get_theme_mod( "mobiris_uc_{$i}_headline",    $uc_defaults[ $i ][1] ),
        'description' => get_theme_mod( "mobiris_uc_{$i}_description", $uc_defaults[ $i ][2] ),
        'tags'        => get_theme_mod( "mobiris_uc_{$i}_tags",        $uc_defaults[ $i ][3] ),
    ];
}

$icons = [
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
];
?>

<section id="use-cases" class="usecases" aria-labelledby="usecases-headline">
    <div class="container">

        <div class="usecases__header">
            <?php if ( $label ) : ?>
                <p class="text-label usecases__label"><?php echo esc_html( $label ); ?></p>
            <?php endif; ?>
            <h2 id="usecases-headline" class="heading heading--h2 usecases__headline">
                <?php echo esc_html( $headline ); ?>
            </h2>
        </div>

        <div class="usecases__grid">
            <?php foreach ( $use_cases as $index => $uc ) :
                $card_num = $index + 1;
                $tags     = array_filter( array_map( 'trim', explode( ',', $uc['tags'] ) ) );
            ?>
                <div class="usecase-card usecase-card--<?php echo esc_attr( $card_num ); ?>">
                    <div class="usecase__icon-wrap usecase__icon-wrap--<?php echo esc_attr( $card_num ); ?>" aria-hidden="true">
                        <?php echo $icons[ $index % count( $icons ) ]; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    </div>
                    <div>
                        <?php if ( $uc['category'] ) : ?>
                            <p class="usecase__category"><?php echo esc_html( $uc['category'] ); ?></p>
                        <?php endif; ?>
                        <h3 class="usecase__headline"><?php echo esc_html( $uc['headline'] ); ?></h3>
                        <p class="usecase__description"><?php echo esc_html( $uc['description'] ); ?></p>
                    </div>
                    <?php if ( $tags ) : ?>
                        <div class="usecase__tags">
                            <?php foreach ( $tags as $tag ) : ?>
                                <span class="usecase__tag"><?php echo esc_html( $tag ); ?></span>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>

    </div>
</section>
