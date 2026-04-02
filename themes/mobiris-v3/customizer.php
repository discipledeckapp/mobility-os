<?php
/**
 * Mobiris v3 — WordPress Customizer Configuration
 *
 * Every piece of site content is editable here.
 * Panels → Sections → Settings + Controls.
 *
 * @package mobiris-v3
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'customize_register', 'mobiris_customizer_register' );

function mobiris_customizer_register( WP_Customize_Manager $wp_customize ): void {

    // ═══════════════════════════════════════════
    // PANEL: Mobiris Theme
    // ═══════════════════════════════════════════
    $wp_customize->add_panel( 'mobiris_panel', [
        'title'    => __( 'Mobiris Theme', 'mobiris-v3' ),
        'priority' => 30,
    ] );

    // ───────────────────────────────────────────
    // SECTION: Brand & General
    // ───────────────────────────────────────────
    $wp_customize->add_section( 'mobiris_general', [
        'title'    => __( 'Brand & General', 'mobiris-v3' ),
        'panel'    => 'mobiris_panel',
        'priority' => 10,
    ] );

    mobiris_color( $wp_customize, 'mobiris_brand_color', 'mobiris_general',
        __( 'Brand Color', 'mobiris-v3' ), '#2563eb' );

    mobiris_color( $wp_customize, 'mobiris_brand_color_dark', 'mobiris_general',
        __( 'Brand Color (Hover / Dark)', 'mobiris-v3' ), '#1d4ed8' );

    mobiris_text( $wp_customize, 'mobiris_app_url', 'mobiris_general',
        __( 'App URL (Sign in / Get Started)', 'mobiris-v3' ),
        'https://app.mobiris.ng', 'url' );

    mobiris_text( $wp_customize, 'mobiris_whatsapp_number', 'mobiris_general',
        __( 'WhatsApp Number (international, no +)', 'mobiris-v3' ),
        '2348053108039' );

    mobiris_text( $wp_customize, 'mobiris_whatsapp_demo_message', 'mobiris_general',
        __( 'WhatsApp Demo Request Message', 'mobiris-v3' ),
        "Hi, I'd like to request a demo of Mobiris" );

    mobiris_text( $wp_customize, 'mobiris_company_name', 'mobiris_general',
        __( 'Legal Company Name', 'mobiris-v3' ),
        'Growth Figures Limited' );

    // ───────────────────────────────────────────
    // SECTION: Navigation
    // ───────────────────────────────────────────
    $wp_customize->add_section( 'mobiris_nav', [
        'title'    => __( 'Navigation', 'mobiris-v3' ),
        'panel'    => 'mobiris_panel',
        'priority' => 20,
    ] );

    mobiris_text( $wp_customize, 'mobiris_nav_logo_text', 'mobiris_nav',
        __( 'Logo Text', 'mobiris-v3' ), 'Mobiris' );

    mobiris_text( $wp_customize, 'mobiris_nav_link1_label', 'mobiris_nav',
        __( 'Nav Link 1 — Label', 'mobiris-v3' ), 'How it works' );

    mobiris_text( $wp_customize, 'mobiris_nav_link1_anchor', 'mobiris_nav',
        __( 'Nav Link 1 — Anchor (e.g. #how-it-works)', 'mobiris-v3' ), '#how-it-works' );

    mobiris_text( $wp_customize, 'mobiris_nav_link2_label', 'mobiris_nav',
        __( 'Nav Link 2 — Label', 'mobiris-v3' ), "Who it's for" );

    mobiris_text( $wp_customize, 'mobiris_nav_link2_anchor', 'mobiris_nav',
        __( 'Nav Link 2 — Anchor', 'mobiris-v3' ), '#use-cases' );

    mobiris_text( $wp_customize, 'mobiris_nav_link3_label', 'mobiris_nav',
        __( 'Nav Link 3 — Label', 'mobiris-v3' ), 'Why trust us' );

    mobiris_text( $wp_customize, 'mobiris_nav_link3_anchor', 'mobiris_nav',
        __( 'Nav Link 3 — Anchor', 'mobiris-v3' ), '#trust' );

    mobiris_text( $wp_customize, 'mobiris_nav_signin_label', 'mobiris_nav',
        __( 'Sign In Label', 'mobiris-v3' ), 'Sign in' );

    mobiris_text( $wp_customize, 'mobiris_nav_cta_label', 'mobiris_nav',
        __( 'Nav CTA Button Label', 'mobiris-v3' ), 'Request a demo' );

    // ───────────────────────────────────────────
    // SECTION: Hero
    // ───────────────────────────────────────────
    $wp_customize->add_section( 'mobiris_hero', [
        'title'    => __( 'Hero Section', 'mobiris-v3' ),
        'panel'    => 'mobiris_panel',
        'priority' => 30,
    ] );

    mobiris_checkbox( $wp_customize, 'mobiris_hero_show', 'mobiris_hero',
        __( 'Show Hero Section', 'mobiris-v3' ), true );

    mobiris_text( $wp_customize, 'mobiris_hero_label', 'mobiris_hero',
        __( 'Label Pill Text', 'mobiris-v3' ), 'Fleet & Driver Operations Platform' );

    mobiris_text( $wp_customize, 'mobiris_hero_headline', 'mobiris_hero',
        __( 'Headline', 'mobiris-v3' ), "Stop losing money\non your fleet." );

    mobiris_textarea( $wp_customize, 'mobiris_hero_subtext', 'mobiris_hero',
        __( 'Subtext', 'mobiris-v3' ),
        "Mobiris gives you a clear record of every driver, every vehicle, and every payment. No more notebooks. No more guessing. Just structure." );

    mobiris_text( $wp_customize, 'mobiris_hero_cta1_label', 'mobiris_hero',
        __( 'Primary CTA Label', 'mobiris-v3' ), 'Get started free' );

    mobiris_text( $wp_customize, 'mobiris_hero_cta1_url', 'mobiris_hero',
        __( 'Primary CTA URL', 'mobiris-v3' ), 'https://app.mobiris.ng', 'url' );

    mobiris_text( $wp_customize, 'mobiris_hero_cta2_label', 'mobiris_hero',
        __( 'Secondary CTA Label', 'mobiris-v3' ), 'Request a demo' );

    mobiris_text( $wp_customize, 'mobiris_hero_social_proof', 'mobiris_hero',
        __( 'Social Proof Micro-text', 'mobiris-v3' ),
        'Used by transport and logistics operators across Nigeria' );

    mobiris_checkbox( $wp_customize, 'mobiris_hero_show_dashboard', 'mobiris_hero',
        __( 'Show Dashboard Preview', 'mobiris-v3' ), true );

    // ───────────────────────────────────────────
    // SECTION: Problem
    // ───────────────────────────────────────────
    $wp_customize->add_section( 'mobiris_problem', [
        'title'    => __( 'Problem Section', 'mobiris-v3' ),
        'panel'    => 'mobiris_panel',
        'priority' => 40,
    ] );

    mobiris_checkbox( $wp_customize, 'mobiris_problem_show', 'mobiris_problem',
        __( 'Show Problem Section', 'mobiris-v3' ), true );

    mobiris_text( $wp_customize, 'mobiris_problem_label', 'mobiris_problem',
        __( 'Section Label', 'mobiris-v3' ), 'Sound familiar?' );

    mobiris_text( $wp_customize, 'mobiris_problem_headline', 'mobiris_problem',
        __( 'Headline', 'mobiris-v3' ), "Running a fleet shouldn't\nfeel like this." );

    mobiris_text( $wp_customize, 'mobiris_problem_bridge1', 'mobiris_problem',
        __( 'Bridge Line 1 (bottom)', 'mobiris-v3' ),
        'You built your business on trust and hard work.' );

    mobiris_text( $wp_customize, 'mobiris_problem_bridge2', 'mobiris_problem',
        __( 'Bridge Line 2 (bottom, bold)', 'mobiris-v3' ),
        "It's time to back it up with structure." );

    for ( $i = 1; $i <= 6; $i++ ) {
        mobiris_textarea( $wp_customize, "mobiris_problem_pain_{$i}", 'mobiris_problem',
            sprintf( __( 'Pain Point %d', 'mobiris-v3' ), $i ),
            mobiris_default_pain( $i ) );
    }

    // ───────────────────────────────────────────
    // SECTION: Solution
    // ───────────────────────────────────────────
    $wp_customize->add_section( 'mobiris_solution', [
        'title'    => __( 'Solution Section', 'mobiris-v3' ),
        'panel'    => 'mobiris_panel',
        'priority' => 50,
    ] );

    mobiris_checkbox( $wp_customize, 'mobiris_solution_show', 'mobiris_solution',
        __( 'Show Solution Section', 'mobiris-v3' ), true );

    mobiris_text( $wp_customize, 'mobiris_solution_label', 'mobiris_solution',
        __( 'Section Label', 'mobiris-v3' ), 'The solution' );

    mobiris_text( $wp_customize, 'mobiris_solution_headline', 'mobiris_solution',
        __( 'Headline', 'mobiris-v3' ), "Everything you need to\nrun your fleet properly." );

    mobiris_textarea( $wp_customize, 'mobiris_solution_subtext', 'mobiris_solution',
        __( 'Subtext', 'mobiris-v3' ),
        'Mobiris is built for operators who manage drivers, vehicles, and daily payments. Simple to use. Clear records. Full control.' );

    $solution_defaults = [
        1 => [ 'Know your drivers', 'Verified identity, documents, and guarantors — before a vehicle ever leaves your yard.' ],
        2 => [ 'Track your money', 'Daily remittance records for every driver. See who paid, who owes, and how much — at a glance.' ],
        3 => [ 'Assign with confidence', 'Every vehicle linked to a named driver. Formal records. No disputes. Clear accountability.' ],
        4 => [ 'See your fleet', "One dashboard. Know what's active, what's overdue, and what needs your attention — right now." ],
    ];

    for ( $i = 1; $i <= 4; $i++ ) {
        mobiris_text( $wp_customize, "mobiris_solution_feature_{$i}_title", 'mobiris_solution',
            sprintf( __( 'Feature %d — Title', 'mobiris-v3' ), $i ),
            $solution_defaults[ $i ][0] );
        mobiris_textarea( $wp_customize, "mobiris_solution_feature_{$i}_body", 'mobiris_solution',
            sprintf( __( 'Feature %d — Body', 'mobiris-v3' ), $i ),
            $solution_defaults[ $i ][1] );
    }

    // ───────────────────────────────────────────
    // SECTION: How It Works
    // ───────────────────────────────────────────
    $wp_customize->add_section( 'mobiris_hiw', [
        'title'    => __( 'How It Works Section', 'mobiris-v3' ),
        'panel'    => 'mobiris_panel',
        'priority' => 60,
    ] );

    mobiris_checkbox( $wp_customize, 'mobiris_hiw_show', 'mobiris_hiw',
        __( 'Show Section', 'mobiris-v3' ), true );

    mobiris_text( $wp_customize, 'mobiris_hiw_label', 'mobiris_hiw',
        __( 'Section Label', 'mobiris-v3' ), 'How it works' );

    mobiris_text( $wp_customize, 'mobiris_hiw_headline', 'mobiris_hiw',
        __( 'Headline', 'mobiris-v3' ), 'Up and running in minutes.' );

    mobiris_text( $wp_customize, 'mobiris_hiw_subtext', 'mobiris_hiw',
        __( 'Subtext', 'mobiris-v3' ), 'No long setup. No training required. Just start adding your drivers.' );

    mobiris_text( $wp_customize, 'mobiris_hiw_cta_label', 'mobiris_hiw',
        __( 'CTA Button Label', 'mobiris-v3' ), 'Start for free' );

    $hiw_defaults = [
        1 => [ 'Add your drivers', 'Enter their name, phone, and required documents. Build your verified driver roster.' ],
        2 => [ 'Verify who they are', "Run identity checks and capture guarantor details. Know exactly who you're dealing with." ],
        3 => [ 'Assign your vehicles', 'Link each driver to a vehicle with a formal agreement. Every assignment on record.' ],
        4 => [ 'Track every payment', 'Log daily remittance. See who paid today, who owes, and the full history for any driver.' ],
    ];

    for ( $i = 1; $i <= 4; $i++ ) {
        mobiris_text( $wp_customize, "mobiris_hiw_step_{$i}_title", 'mobiris_hiw',
            sprintf( __( 'Step %d — Title', 'mobiris-v3' ), $i ),
            $hiw_defaults[ $i ][0] );
        mobiris_textarea( $wp_customize, "mobiris_hiw_step_{$i}_body", 'mobiris_hiw',
            sprintf( __( 'Step %d — Body', 'mobiris-v3' ), $i ),
            $hiw_defaults[ $i ][1] );
    }

    // ───────────────────────────────────────────
    // SECTION: Trust & Control
    // ───────────────────────────────────────────
    $wp_customize->add_section( 'mobiris_trust', [
        'title'    => __( 'Trust & Control Section', 'mobiris-v3' ),
        'panel'    => 'mobiris_panel',
        'priority' => 70,
    ] );

    mobiris_checkbox( $wp_customize, 'mobiris_trust_show', 'mobiris_trust',
        __( 'Show Section', 'mobiris-v3' ), true );

    mobiris_text( $wp_customize, 'mobiris_trust_label', 'mobiris_trust',
        __( 'Section Label', 'mobiris-v3' ), 'Built for trust' );

    mobiris_text( $wp_customize, 'mobiris_trust_headline', 'mobiris_trust',
        __( 'Headline', 'mobiris-v3' ),
        "Control is not about distrust.\nIt's about running a proper business." );

    mobiris_textarea( $wp_customize, 'mobiris_trust_body', 'mobiris_trust',
        __( 'Body Copy', 'mobiris-v3' ),
        "When a driver knows their identity is verified and their guarantor is on file, they operate differently. When you have records, disputes disappear." );

    mobiris_text( $wp_customize, 'mobiris_trust_cta_label', 'mobiris_trust',
        __( 'CTA Link Label', 'mobiris-v3' ), 'Talk to us about your fleet' );

    $trust_defaults = [
        1 => [ 'Identity verification', 'Every driver goes through document and biometric checks before they touch your vehicles. You know exactly who you hired.' ],
        2 => [ 'Guarantor system', 'Capture and verify guarantors before any assignment. If a driver disappears, you know who is responsible.' ],
        3 => [ 'Signed assignments', 'Every driver-vehicle pairing is a formal record. Terms, dates, and agreement — documented and stored.' ],
        4 => [ 'Full payment history', 'Every remittance logged with timestamps. No more disputes about who paid what, and when.' ],
    ];

    for ( $i = 1; $i <= 4; $i++ ) {
        mobiris_text( $wp_customize, "mobiris_trust_item_{$i}_title", 'mobiris_trust',
            sprintf( __( 'Trust Item %d — Title', 'mobiris-v3' ), $i ),
            $trust_defaults[ $i ][0] );
        mobiris_textarea( $wp_customize, "mobiris_trust_item_{$i}_body", 'mobiris_trust',
            sprintf( __( 'Trust Item %d — Body', 'mobiris-v3' ), $i ),
            $trust_defaults[ $i ][1] );
    }

    // ───────────────────────────────────────────
    // SECTION: Use Cases
    // ───────────────────────────────────────────
    $wp_customize->add_section( 'mobiris_usecases', [
        'title'    => __( 'Use Cases Section', 'mobiris-v3' ),
        'panel'    => 'mobiris_panel',
        'priority' => 80,
    ] );

    mobiris_checkbox( $wp_customize, 'mobiris_usecases_show', 'mobiris_usecases',
        __( 'Show Section', 'mobiris-v3' ), true );

    mobiris_text( $wp_customize, 'mobiris_usecases_label', 'mobiris_usecases',
        __( 'Section Label', 'mobiris-v3' ), "Who it's for" );

    mobiris_text( $wp_customize, 'mobiris_usecases_headline', 'mobiris_usecases',
        __( 'Headline', 'mobiris-v3' ), "Built for the way you\nactually operate." );

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

    for ( $i = 1; $i <= 3; $i++ ) {
        mobiris_text( $wp_customize, "mobiris_uc_{$i}_category", 'mobiris_usecases',
            sprintf( __( 'Use Case %d — Category', 'mobiris-v3' ), $i ), $uc_defaults[ $i ][0] );
        mobiris_text( $wp_customize, "mobiris_uc_{$i}_headline", 'mobiris_usecases',
            sprintf( __( 'Use Case %d — Headline', 'mobiris-v3' ), $i ), $uc_defaults[ $i ][1] );
        mobiris_textarea( $wp_customize, "mobiris_uc_{$i}_description", 'mobiris_usecases',
            sprintf( __( 'Use Case %d — Description', 'mobiris-v3' ), $i ), $uc_defaults[ $i ][2] );
        mobiris_text( $wp_customize, "mobiris_uc_{$i}_tags", 'mobiris_usecases',
            sprintf( __( 'Use Case %d — Tags (comma separated)', 'mobiris-v3' ), $i ), $uc_defaults[ $i ][3] );
    }

    // ───────────────────────────────────────────
    // SECTION: CTA Banner
    // ───────────────────────────────────────────
    $wp_customize->add_section( 'mobiris_cta', [
        'title'    => __( 'CTA Banner Section', 'mobiris-v3' ),
        'panel'    => 'mobiris_panel',
        'priority' => 90,
    ] );

    mobiris_checkbox( $wp_customize, 'mobiris_cta_show', 'mobiris_cta',
        __( 'Show Section', 'mobiris-v3' ), true );

    mobiris_text( $wp_customize, 'mobiris_cta_headline', 'mobiris_cta',
        __( 'Headline', 'mobiris-v3' ), "Start running your fleet\nthe right way." );

    mobiris_textarea( $wp_customize, 'mobiris_cta_subtext', 'mobiris_cta',
        __( 'Subtext', 'mobiris-v3' ),
        'Replace notebooks and WhatsApp groups with clear records, verified drivers, and full payment visibility.' );

    mobiris_text( $wp_customize, 'mobiris_cta_btn1_label', 'mobiris_cta',
        __( 'Primary Button Label', 'mobiris-v3' ), 'Get started free' );

    mobiris_text( $wp_customize, 'mobiris_cta_btn1_url', 'mobiris_cta',
        __( 'Primary Button URL', 'mobiris-v3' ), 'https://app.mobiris.ng', 'url' );

    mobiris_text( $wp_customize, 'mobiris_cta_btn2_label', 'mobiris_cta',
        __( 'WhatsApp Button Label', 'mobiris-v3' ), 'Chat on WhatsApp' );

    mobiris_text( $wp_customize, 'mobiris_cta_fine_print', 'mobiris_cta',
        __( 'Fine Print', 'mobiris-v3' ), 'No credit card required. Set up in under 10 minutes.' );

    mobiris_text( $wp_customize, 'mobiris_cta_whatsapp_message', 'mobiris_cta',
        __( 'WhatsApp Message', 'mobiris-v3' ),
        "Hi, I'd like to learn more about Mobiris for my fleet" );

    // ───────────────────────────────────────────
    // SECTION: Footer
    // ───────────────────────────────────────────
    $wp_customize->add_section( 'mobiris_footer', [
        'title'    => __( 'Footer', 'mobiris-v3' ),
        'panel'    => 'mobiris_panel',
        'priority' => 100,
    ] );

    mobiris_text( $wp_customize, 'mobiris_footer_logo_text', 'mobiris_footer',
        __( 'Logo Text', 'mobiris-v3' ), 'Mobiris' );

    mobiris_text( $wp_customize, 'mobiris_footer_tagline', 'mobiris_footer',
        __( 'Tagline', 'mobiris-v3' ), "Fleet & Driver Operations Platform.\nBuilt for transport operators in Nigeria." );

    mobiris_text( $wp_customize, 'mobiris_footer_domain', 'mobiris_footer',
        __( 'Domain (shown in bottom bar)', 'mobiris-v3' ), 'mobiris.ng' );

    mobiris_text( $wp_customize, 'mobiris_footer_support_label', 'mobiris_footer',
        __( 'Support Link Label', 'mobiris-v3' ), 'Support' );

    mobiris_text( $wp_customize, 'mobiris_footer_copyright', 'mobiris_footer',
        __( 'Copyright Prefix (year is added automatically)', 'mobiris-v3' ),
        'Growth Figures Limited. All rights reserved.' );

    // ───────────────────────────────────────────
    // Customizer preview live JS
    // ───────────────────────────────────────────
    $wp_customize->selective_refresh->add_partial( 'mobiris_hero_headline', [
        'selector'        => '.hero__headline',
        'render_callback' => fn() => get_theme_mod( 'mobiris_hero_headline', "Stop losing money\non your fleet." ),
    ] );
}

// ═══════════════════════════════════════════════
// Customizer JS for live preview
// ═══════════════════════════════════════════════
add_action( 'customize_preview_init', function() {
    wp_enqueue_script(
        'mobiris-customizer-preview',
        get_template_directory_uri() . '/assets/js/customizer-preview.js',
        [ 'customize-preview', 'jquery' ],
        wp_get_theme()->get( 'Version' ),
        true
    );
} );

// ═══════════════════════════════════════════════
// Helper: register setting + control in one call
// ═══════════════════════════════════════════════
function mobiris_text(
    WP_Customize_Manager $wpc,
    string $id,
    string $section,
    string $label,
    string $default = '',
    string $type = 'text'
): void {
    $wpc->add_setting( $id, [
        'default'           => $default,
        'transport'         => 'postMessage',
        'sanitize_callback' => 'mobiris_sanitize_text',
    ] );
    $wpc->add_control( $id, [
        'label'   => $label,
        'section' => $section,
        'type'    => $type,
    ] );
}

function mobiris_textarea(
    WP_Customize_Manager $wpc,
    string $id,
    string $section,
    string $label,
    string $default = ''
): void {
    $wpc->add_setting( $id, [
        'default'           => $default,
        'transport'         => 'postMessage',
        'sanitize_callback' => 'mobiris_sanitize_text',
    ] );
    $wpc->add_control( $id, [
        'label'   => $label,
        'section' => $section,
        'type'    => 'textarea',
    ] );
}

function mobiris_color(
    WP_Customize_Manager $wpc,
    string $id,
    string $section,
    string $label,
    string $default = '#2563eb'
): void {
    $wpc->add_setting( $id, [
        'default'           => $default,
        'transport'         => 'postMessage',
        'sanitize_callback' => 'mobiris_sanitize_color',
    ] );
    $wpc->add_control( new WP_Customize_Color_Control( $wpc, $id, [
        'label'   => $label,
        'section' => $section,
    ] ) );
}

function mobiris_checkbox(
    WP_Customize_Manager $wpc,
    string $id,
    string $section,
    string $label,
    bool $default = true
): void {
    $wpc->add_setting( $id, [
        'default'           => $default,
        'transport'         => 'refresh',
        'sanitize_callback' => 'mobiris_sanitize_checkbox',
    ] );
    $wpc->add_control( $id, [
        'label'   => $label,
        'section' => $section,
        'type'    => 'checkbox',
    ] );
}

// ═══════════════════════════════════════════════
// Default copy helpers
// ═══════════════════════════════════════════════
function mobiris_default_pain( int $n ): string {
    return [
        1 => "You don't know who has paid today.",
        2 => 'Drivers move between fleets with no record.',
        3 => 'Everything is tracked in notebooks and WhatsApp.',
        4 => "You can't tell which vehicle belongs to whom.",
        5 => 'Your guarantors are unverified. Your risk is invisible.',
        6 => 'You lose money because there is no structure.',
    ][ $n ] ?? '';
}

// ═══════════════════════════════════════════════
// Utility: build a WhatsApp URL from Customizer settings
// ═══════════════════════════════════════════════
function mobiris_whatsapp_url( string $setting_key = 'mobiris_whatsapp_demo_message' ): string {
    $number  = get_theme_mod( 'mobiris_whatsapp_number', '2348053108039' );
    $message = get_theme_mod( $setting_key, "Hi, I'd like to request a demo of Mobiris" );
    return 'https://wa.me/' . rawurlencode( $number ) . '?text=' . rawurlencode( $message );
}

function mobiris_app_url(): string {
    return get_theme_mod( 'mobiris_app_url', 'https://app.mobiris.ng' );
}
