<?php
/**
 * Mobiris v4 — Full Customizer Configuration
 *
 * @package mobiris-v5
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'customize_register', 'mobiris_customizer_register' );

function mobiris_customizer_register( WP_Customize_Manager $wpc ): void {

    $wpc->add_panel( 'mobiris_panel', [
        'title'    => __( 'Mobiris Theme', 'mobiris-v5' ),
        'priority' => 30,
    ] );

    // ═══════════════════════════════════════════
    // BRAND & GENERAL
    // ═══════════════════════════════════════════
    $wpc->add_section( 'mobiris_general', [ 'title' => __( 'Brand & General', 'mobiris-v5' ), 'panel' => 'mobiris_panel', 'priority' => 5 ] );
    mobiris_color ( $wpc, 'mobiris_brand_color',           'mobiris_general', __( 'Brand Color', 'mobiris-v5' ),                    '#2563eb' );
    mobiris_color ( $wpc, 'mobiris_brand_color_dark',      'mobiris_general', __( 'Brand Color (Hover)', 'mobiris-v5' ),            '#1d4ed8' );
    mobiris_text  ( $wpc, 'mobiris_app_url',               'mobiris_general', __( 'App URL', 'mobiris-v5' ),                        'https://app.mobiris.ng', 'url' );
    mobiris_text  ( $wpc, 'mobiris_whatsapp_number',       'mobiris_general', __( 'WhatsApp Number (no +)', 'mobiris-v5' ),         '2348053108039' );
    mobiris_text  ( $wpc, 'mobiris_whatsapp_demo_message', 'mobiris_general', __( 'WhatsApp Demo Message', 'mobiris-v5' ),          "Hi, I'd like to request a demo of Mobiris" );
    mobiris_text  ( $wpc, 'mobiris_company_name',          'mobiris_general', __( 'Company Name', 'mobiris-v5' ),                   'Growth Figures Limited' );
    mobiris_text  ( $wpc, 'mobiris_support_email',         'mobiris_general', __( 'Support Email', 'mobiris-v5' ),                  'support@mobiris.ng', 'email' );
    mobiris_text  ( $wpc, 'mobiris_address_line1',         'mobiris_general', __( 'Address Line 1', 'mobiris-v5' ),                 '6, Addo-Badore Road' );
    mobiris_text  ( $wpc, 'mobiris_address_line2',         'mobiris_general', __( 'Address Line 2 (City)', 'mobiris-v5' ),          'Ajah, Lagos' );
    mobiris_text  ( $wpc, 'mobiris_address_country',       'mobiris_general', __( 'Country', 'mobiris-v5' ),                        'Nigeria' );

    // ═══════════════════════════════════════════
    // NAVIGATION
    // ═══════════════════════════════════════════
    $wpc->add_section( 'mobiris_nav', [ 'title' => __( 'Navigation', 'mobiris-v5' ), 'panel' => 'mobiris_panel', 'priority' => 10 ] );
    mobiris_text( $wpc, 'mobiris_nav_logo_text',      'mobiris_nav', __( 'Logo Text', 'mobiris-v5' ),                    'Mobiris' );
    mobiris_text( $wpc, 'mobiris_nav_link1_label',    'mobiris_nav', __( 'Nav Link 1 — Label', 'mobiris-v5' ),           'Product' );
    mobiris_text( $wpc, 'mobiris_nav_link1_anchor',   'mobiris_nav', __( 'Nav Link 1 — URL/Anchor', 'mobiris-v5' ),      '#how-it-works' );
    mobiris_text( $wpc, 'mobiris_nav_link2_label',    'mobiris_nav', __( 'Nav Link 2 — Label', 'mobiris-v5' ),           'Tutorials' );
    mobiris_text( $wpc, 'mobiris_nav_link2_anchor',   'mobiris_nav', __( 'Nav Link 2 — URL/Anchor', 'mobiris-v5' ),      '/tutorials' );
    mobiris_text( $wpc, 'mobiris_nav_link3_label',    'mobiris_nav', __( 'Nav Link 3 — Label', 'mobiris-v5' ),           'Blog' );
    mobiris_text( $wpc, 'mobiris_nav_link3_anchor',   'mobiris_nav', __( 'Nav Link 3 — URL/Anchor', 'mobiris-v5' ),      '/blog' );
    mobiris_text( $wpc, 'mobiris_nav_link4_label',    'mobiris_nav', __( 'Nav Link 4 — Label', 'mobiris-v5' ),           'Contact' );
    mobiris_text( $wpc, 'mobiris_nav_link4_anchor',   'mobiris_nav', __( 'Nav Link 4 — URL/Anchor', 'mobiris-v5' ),      '/contact' );
    mobiris_text( $wpc, 'mobiris_nav_signin_label',   'mobiris_nav', __( 'Sign In Label', 'mobiris-v5' ),                'Sign in' );
    mobiris_text( $wpc, 'mobiris_nav_cta_label',      'mobiris_nav', __( 'Nav CTA Label', 'mobiris-v5' ),                'Get started' );

    // ═══════════════════════════════════════════
    // HERO
    // ═══════════════════════════════════════════
    $wpc->add_section( 'mobiris_hero', [ 'title' => __( 'Hero Section', 'mobiris-v5' ), 'panel' => 'mobiris_panel', 'priority' => 20 ] );
    mobiris_checkbox ( $wpc, 'mobiris_hero_show',           'mobiris_hero', __( 'Show Hero', 'mobiris-v5' ),                       true );
    mobiris_text     ( $wpc, 'mobiris_hero_label',          'mobiris_hero', __( 'Label Pill', 'mobiris-v5' ),                      'Fleet & Driver Operations Platform' );
    mobiris_text     ( $wpc, 'mobiris_hero_headline',       'mobiris_hero', __( 'Headline', 'mobiris-v5' ),                        "Stop losing money\non your fleet." );
    mobiris_textarea ( $wpc, 'mobiris_hero_subtext',        'mobiris_hero', __( 'Subtext', 'mobiris-v5' ),                         "Mobiris gives you a clear record of every driver, every vehicle, and every payment. No more notebooks. No more guessing. Just structure." );
    mobiris_text     ( $wpc, 'mobiris_hero_cta1_label',     'mobiris_hero', __( 'Primary CTA Label', 'mobiris-v5' ),               'Get started free' );
    mobiris_text     ( $wpc, 'mobiris_hero_cta1_url',       'mobiris_hero', __( 'Primary CTA URL', 'mobiris-v5' ),                 'https://app.mobiris.ng', 'url' );
    mobiris_text     ( $wpc, 'mobiris_hero_cta2_label',     'mobiris_hero', __( 'Secondary CTA Label', 'mobiris-v5' ),             'Request a demo' );
    mobiris_text     ( $wpc, 'mobiris_hero_social_proof',   'mobiris_hero', __( 'Social Proof Text', 'mobiris-v5' ),               'Used by transport and logistics operators across Nigeria' );
    mobiris_checkbox ( $wpc, 'mobiris_hero_show_dashboard', 'mobiris_hero', __( 'Show Dashboard Preview', 'mobiris-v5' ),          true );

    // ═══════════════════════════════════════════
    // PROBLEM
    // ═══════════════════════════════════════════
    $wpc->add_section( 'mobiris_problem', [ 'title' => __( 'Problem Section', 'mobiris-v5' ), 'panel' => 'mobiris_panel', 'priority' => 30 ] );
    mobiris_checkbox ( $wpc, 'mobiris_problem_show',     'mobiris_problem', __( 'Show Section', 'mobiris-v5' ), true );
    mobiris_text     ( $wpc, 'mobiris_problem_label',    'mobiris_problem', __( 'Section Label', 'mobiris-v5' ), 'Sound familiar?' );
    mobiris_text     ( $wpc, 'mobiris_problem_headline', 'mobiris_problem', __( 'Headline', 'mobiris-v5' ), "Running a fleet shouldn't\nfeel like this." );
    mobiris_text     ( $wpc, 'mobiris_problem_bridge1',  'mobiris_problem', __( 'Bridge Line 1', 'mobiris-v5' ), 'You built your business on trust and hard work.' );
    mobiris_text     ( $wpc, 'mobiris_problem_bridge2',  'mobiris_problem', __( 'Bridge Line 2 (bold)', 'mobiris-v5' ), "It's time to back it up with structure." );
    for ( $i = 1; $i <= 6; $i++ ) {
        mobiris_textarea( $wpc, "mobiris_problem_pain_{$i}", 'mobiris_problem', sprintf( __( 'Pain Point %d', 'mobiris-v5' ), $i ), mobiris_default_pain( $i ) );
    }

    // ═══════════════════════════════════════════
    // SOLUTION
    // ═══════════════════════════════════════════
    $wpc->add_section( 'mobiris_solution', [ 'title' => __( 'Solution Section', 'mobiris-v5' ), 'panel' => 'mobiris_panel', 'priority' => 40 ] );
    mobiris_checkbox ( $wpc, 'mobiris_solution_show',     'mobiris_solution', __( 'Show Section', 'mobiris-v5' ), true );
    mobiris_text     ( $wpc, 'mobiris_solution_label',    'mobiris_solution', __( 'Section Label', 'mobiris-v5' ), 'The solution' );
    mobiris_text     ( $wpc, 'mobiris_solution_headline', 'mobiris_solution', __( 'Headline', 'mobiris-v5' ), "Everything you need to\nrun your fleet properly." );
    mobiris_textarea ( $wpc, 'mobiris_solution_subtext',  'mobiris_solution', __( 'Subtext', 'mobiris-v5' ), 'Mobiris is built for operators who manage drivers, vehicles, and daily payments. Simple to use. Clear records. Full control.' );
    $sol = [ 1 => [ 'Know your drivers', 'Verified identity, documents, and guarantors — before a vehicle ever leaves your yard.' ], 2 => [ 'Track your money', 'Daily remittance records for every driver. See who paid, who owes, and how much — at a glance.' ], 3 => [ 'Assign with confidence', 'Every vehicle linked to a named driver. Formal records. No disputes. Clear accountability.' ], 4 => [ 'See your fleet', "One dashboard. Know what's active, what's overdue, and what needs your attention — right now." ] ];
    for ( $i = 1; $i <= 4; $i++ ) {
        mobiris_text    ( $wpc, "mobiris_solution_feature_{$i}_title", 'mobiris_solution', sprintf( __( 'Feature %d Title', 'mobiris-v5' ), $i ), $sol[$i][0] );
        mobiris_textarea( $wpc, "mobiris_solution_feature_{$i}_body",  'mobiris_solution', sprintf( __( 'Feature %d Body', 'mobiris-v5' ), $i ),  $sol[$i][1] );
    }

    // ═══════════════════════════════════════════
    // HOW IT WORKS
    // ═══════════════════════════════════════════
    $wpc->add_section( 'mobiris_hiw', [ 'title' => __( 'How It Works Section', 'mobiris-v5' ), 'panel' => 'mobiris_panel', 'priority' => 50 ] );
    mobiris_checkbox ( $wpc, 'mobiris_hiw_show',      'mobiris_hiw', __( 'Show Section', 'mobiris-v5' ),    true );
    mobiris_text     ( $wpc, 'mobiris_hiw_label',     'mobiris_hiw', __( 'Section Label', 'mobiris-v5' ),   'How it works' );
    mobiris_text     ( $wpc, 'mobiris_hiw_headline',  'mobiris_hiw', __( 'Headline', 'mobiris-v5' ),        'Up and running in minutes.' );
    mobiris_text     ( $wpc, 'mobiris_hiw_subtext',   'mobiris_hiw', __( 'Subtext', 'mobiris-v5' ),         'No long setup. No training required. Just start adding your drivers.' );
    mobiris_text     ( $wpc, 'mobiris_hiw_cta_label', 'mobiris_hiw', __( 'CTA Button Label', 'mobiris-v5' ), 'Start for free' );
    $hiw = [ 1 => [ 'Add your drivers', 'Enter their name, phone, and required documents. Build your verified driver roster.' ], 2 => [ 'Verify who they are', "Run identity checks and capture guarantor details. Know exactly who you're dealing with." ], 3 => [ 'Assign your vehicles', 'Link each driver to a vehicle with a formal agreement. Every assignment on record.' ], 4 => [ 'Track every payment', 'Log daily remittance. See who paid today, who owes, and the full history for any driver.' ] ];
    for ( $i = 1; $i <= 4; $i++ ) {
        mobiris_text    ( $wpc, "mobiris_hiw_step_{$i}_title", 'mobiris_hiw', sprintf( __( 'Step %d Title', 'mobiris-v5' ), $i ), $hiw[$i][0] );
        mobiris_textarea( $wpc, "mobiris_hiw_step_{$i}_body",  'mobiris_hiw', sprintf( __( 'Step %d Body', 'mobiris-v5' ), $i ),  $hiw[$i][1] );
    }

    // ═══════════════════════════════════════════
    // TRUST & CONTROL
    // ═══════════════════════════════════════════
    $wpc->add_section( 'mobiris_trust', [ 'title' => __( 'Trust & Control Section', 'mobiris-v5' ), 'panel' => 'mobiris_panel', 'priority' => 60 ] );
    mobiris_checkbox ( $wpc, 'mobiris_trust_show',      'mobiris_trust', __( 'Show Section', 'mobiris-v5' ), true );
    mobiris_text     ( $wpc, 'mobiris_trust_label',     'mobiris_trust', __( 'Section Label', 'mobiris-v5' ), 'Built for trust' );
    mobiris_text     ( $wpc, 'mobiris_trust_headline',  'mobiris_trust', __( 'Headline', 'mobiris-v5' ), "Control is not about distrust.\nIt's about running a proper business." );
    mobiris_textarea ( $wpc, 'mobiris_trust_body',      'mobiris_trust', __( 'Body Copy', 'mobiris-v5' ), "When a driver knows their identity is verified and their guarantor is on file, they operate differently. When you have records, disputes disappear." );
    mobiris_text     ( $wpc, 'mobiris_trust_cta_label', 'mobiris_trust', __( 'CTA Link Label', 'mobiris-v5' ), 'Talk to us about your fleet' );
    $trust = [ 1 => [ 'Identity verification', 'Every driver goes through document and biometric checks before they touch your vehicles.' ], 2 => [ 'Guarantor system', 'Capture and verify guarantors before any assignment. If a driver disappears, you know who is responsible.' ], 3 => [ 'Signed assignments', 'Every driver-vehicle pairing is a formal record. Terms, dates, and agreement — documented and stored.' ], 4 => [ 'Full payment history', 'Every remittance logged with timestamps. No more disputes about who paid what, and when.' ] ];
    for ( $i = 1; $i <= 4; $i++ ) {
        mobiris_text    ( $wpc, "mobiris_trust_item_{$i}_title", 'mobiris_trust', sprintf( __( 'Trust Item %d Title', 'mobiris-v5' ), $i ), $trust[$i][0] );
        mobiris_textarea( $wpc, "mobiris_trust_item_{$i}_body",  'mobiris_trust', sprintf( __( 'Trust Item %d Body', 'mobiris-v5' ), $i ),  $trust[$i][1] );
    }

    // ═══════════════════════════════════════════
    // USE CASES
    // ═══════════════════════════════════════════
    $wpc->add_section( 'mobiris_usecases', [ 'title' => __( 'Use Cases Section', 'mobiris-v5' ), 'panel' => 'mobiris_panel', 'priority' => 70 ] );
    mobiris_checkbox ( $wpc, 'mobiris_usecases_show',     'mobiris_usecases', __( 'Show Section', 'mobiris-v5' ), true );
    mobiris_text     ( $wpc, 'mobiris_usecases_label',    'mobiris_usecases', __( 'Section Label', 'mobiris-v5' ), "Who it's for" );
    mobiris_text     ( $wpc, 'mobiris_usecases_headline', 'mobiris_usecases', __( 'Headline', 'mobiris-v5' ), "Built for the way you\nactually operate." );
    $uc = [ 1 => [ 'Transport operators', 'Keke, taxi, and hire purchase fleets', 'You manage dozens of drivers on daily remittance. Mobiris gives you a clear record of every assignment, every payment, and every driver — without the WhatsApp chaos.', 'Daily remittance, Driver assignments, Identity verification' ], 2 => [ 'Delivery fleets', 'Logistics and last-mile operators', 'Keep your delivery assets accountable. Verify every rider or driver, track their daily targets, and know exactly which vehicle is where.', 'Asset accountability, Driver verification, Performance tracking' ], 3 => [ 'Asset financing', 'Hire purchase and leasing operators', 'Structure your repayment tracking from day one. Verified identities, signed agreements, and a full audit trail of what was paid and what is outstanding.', 'Repayment tracking, Guarantor records, Signed agreements' ] ];
    for ( $i = 1; $i <= 3; $i++ ) {
        mobiris_text    ( $wpc, "mobiris_uc_{$i}_category",    'mobiris_usecases', sprintf( __( 'Use Case %d Category', 'mobiris-v5' ), $i ),    $uc[$i][0] );
        mobiris_text    ( $wpc, "mobiris_uc_{$i}_headline",    'mobiris_usecases', sprintf( __( 'Use Case %d Headline', 'mobiris-v5' ), $i ),    $uc[$i][1] );
        mobiris_textarea( $wpc, "mobiris_uc_{$i}_description", 'mobiris_usecases', sprintf( __( 'Use Case %d Description', 'mobiris-v5' ), $i ), $uc[$i][2] );
        mobiris_text    ( $wpc, "mobiris_uc_{$i}_tags",        'mobiris_usecases', sprintf( __( 'Use Case %d Tags (comma separated)', 'mobiris-v5' ), $i ), $uc[$i][3] );
    }

    // ═══════════════════════════════════════════
    // APP DOWNLOAD  (NEW)
    // ═══════════════════════════════════════════
    $wpc->add_section( 'mobiris_app', [ 'title' => __( 'App Download Section', 'mobiris-v5' ), 'panel' => 'mobiris_panel', 'priority' => 75 ] );
    mobiris_checkbox ( $wpc, 'mobiris_app_show',            'mobiris_app', __( 'Show Section', 'mobiris-v5' ),              true );
    mobiris_text     ( $wpc, 'mobiris_app_label',           'mobiris_app', __( 'Section Label', 'mobiris-v5' ),             'Mobile App' );
    mobiris_text     ( $wpc, 'mobiris_app_headline',        'mobiris_app', __( 'Headline', 'mobiris-v5' ),                  "Manage your fleet\nfrom your phone." );
    mobiris_textarea ( $wpc, 'mobiris_app_subtext',         'mobiris_app', __( 'Subtext', 'mobiris-v5' ),                   "The Mobiris app lets you check driver payments, assign vehicles, and see your fleet activity on the go. Available on iOS and Android." );
    mobiris_text     ( $wpc, 'mobiris_app_ios_url',         'mobiris_app', __( 'iOS App Store URL', 'mobiris-v5' ),         '#', 'url' );
    mobiris_text     ( $wpc, 'mobiris_app_android_url',     'mobiris_app', __( 'Google Play URL', 'mobiris-v5' ),           '#', 'url' );
    mobiris_text     ( $wpc, 'mobiris_app_ios_label',       'mobiris_app', __( 'iOS Button Label', 'mobiris-v5' ),          'Download on App Store' );
    mobiris_text     ( $wpc, 'mobiris_app_android_label',   'mobiris_app', __( 'Android Button Label', 'mobiris-v5' ),      'Get it on Google Play' );
    mobiris_text     ( $wpc, 'mobiris_app_rating_text',     'mobiris_app', __( 'Rating / Social Proof Text', 'mobiris-v5' ), 'Rated 4.8 ★ · Available on iOS & Android' );

    // ═══════════════════════════════════════════
    // GATED CONTENT  (NEW)
    // ═══════════════════════════════════════════
    $wpc->add_section( 'mobiris_gated', [ 'title' => __( 'Gated Content / Lead Magnet', 'mobiris-v5' ), 'panel' => 'mobiris_panel', 'priority' => 78 ] );
    mobiris_checkbox ( $wpc, 'mobiris_gated_show',           'mobiris_gated', __( 'Show Section', 'mobiris-v5' ),              true );
    mobiris_text     ( $wpc, 'mobiris_gated_label',          'mobiris_gated', __( 'Section Label', 'mobiris-v5' ),             'Free Resource' );
    mobiris_text     ( $wpc, 'mobiris_gated_headline',       'mobiris_gated', __( 'Headline', 'mobiris-v5' ),                  'Free Fleet Operations Guide' );
    mobiris_textarea ( $wpc, 'mobiris_gated_description',    'mobiris_gated', __( 'Description', 'mobiris-v5' ),               'Download our free guide: How to reduce remittance leakage and take control of your driver operations. Used by 200+ operators.' );
    mobiris_text     ( $wpc, 'mobiris_gated_resource_id',    'mobiris_gated', __( 'Resource ID (sent with lead)', 'mobiris-v5' ), 'fleet-guide-2026' );
    mobiris_text     ( $wpc, 'mobiris_gated_download_url',   'mobiris_gated', __( 'Download URL (revealed after email)', 'mobiris-v5' ), '', 'url' );
    mobiris_text     ( $wpc, 'mobiris_gated_download_label', 'mobiris_gated', __( 'Download Button Label', 'mobiris-v5' ),     'Download the Free Guide' );
    mobiris_text     ( $wpc, 'mobiris_gated_cta_label',      'mobiris_gated', __( 'Form Submit Label', 'mobiris-v5' ),         'Send me the guide' );
    mobiris_text     ( $wpc, 'mobiris_gated_placeholder',    'mobiris_gated', __( 'Email Placeholder Text', 'mobiris-v5' ),    'Enter your email address' );
    mobiris_text     ( $wpc, 'mobiris_gated_privacy_note',   'mobiris_gated', __( 'Privacy Note', 'mobiris-v5' ),              'No spam. We respect your privacy.' );
    mobiris_text     ( $wpc, 'mobiris_gated_bullet_1',       'mobiris_gated', __( 'Bullet Point 1', 'mobiris-v5' ),            'How to structure daily remittance' );
    mobiris_text     ( $wpc, 'mobiris_gated_bullet_2',       'mobiris_gated', __( 'Bullet Point 2', 'mobiris-v5' ),            'Driver identity verification checklist' );
    mobiris_text     ( $wpc, 'mobiris_gated_bullet_3',       'mobiris_gated', __( 'Bullet Point 3', 'mobiris-v5' ),            'Guarantor agreement template' );

    // ═══════════════════════════════════════════
    // CTA BANNER
    // ═══════════════════════════════════════════
    $wpc->add_section( 'mobiris_cta', [ 'title' => __( 'CTA Banner Section', 'mobiris-v5' ), 'panel' => 'mobiris_panel', 'priority' => 80 ] );
    mobiris_checkbox ( $wpc, 'mobiris_cta_show',              'mobiris_cta', __( 'Show Section', 'mobiris-v5' ),                 true );
    mobiris_text     ( $wpc, 'mobiris_cta_headline',          'mobiris_cta', __( 'Headline', 'mobiris-v5' ),                     "Start running your fleet\nthe right way." );
    mobiris_textarea ( $wpc, 'mobiris_cta_subtext',           'mobiris_cta', __( 'Subtext', 'mobiris-v5' ),                     'Replace notebooks and WhatsApp groups with clear records, verified drivers, and full payment visibility.' );
    mobiris_text     ( $wpc, 'mobiris_cta_btn1_label',        'mobiris_cta', __( 'Primary Button Label', 'mobiris-v5' ),         'Get started free' );
    mobiris_text     ( $wpc, 'mobiris_cta_btn1_url',          'mobiris_cta', __( 'Primary Button URL', 'mobiris-v5' ),           'https://app.mobiris.ng', 'url' );
    mobiris_text     ( $wpc, 'mobiris_cta_btn2_label',        'mobiris_cta', __( 'WhatsApp Button Label', 'mobiris-v5' ),        'Chat on WhatsApp' );
    mobiris_text     ( $wpc, 'mobiris_cta_fine_print',        'mobiris_cta', __( 'Fine Print', 'mobiris-v5' ),                   'No credit card required. Set up in under 10 minutes.' );
    mobiris_text     ( $wpc, 'mobiris_cta_whatsapp_message',  'mobiris_cta', __( 'WhatsApp Message', 'mobiris-v5' ),             "Hi, I'd like to learn more about Mobiris for my fleet" );

    // ═══════════════════════════════════════════
    // CONTACT PAGE  (NEW)
    // ═══════════════════════════════════════════
    $wpc->add_section( 'mobiris_contact', [ 'title' => __( 'Contact Page', 'mobiris-v5' ), 'panel' => 'mobiris_panel', 'priority' => 85 ] );
    mobiris_text     ( $wpc, 'mobiris_contact_headline',         'mobiris_contact', __( 'Page Headline', 'mobiris-v5' ),            "Let's talk." );
    mobiris_textarea ( $wpc, 'mobiris_contact_subtext',          'mobiris_contact', __( 'Subtext', 'mobiris-v5' ),                  "Whether you want a demo, have a question, or just want to see how Mobiris can work for your fleet — we're here." );
    mobiris_text     ( $wpc, 'mobiris_contact_calendly_url',     'mobiris_contact', __( 'Calendly URL', 'mobiris-v5' ),             'https://calendly.com/mobiris', 'url' );
    mobiris_text     ( $wpc, 'mobiris_contact_calendly_label',   'mobiris_contact', __( 'Calendly Section Label', 'mobiris-v5' ),   'Book a 20-minute demo' );
    mobiris_text     ( $wpc, 'mobiris_contact_calendly_caption', 'mobiris_contact', __( 'Calendly Caption', 'mobiris-v5' ),         "Pick a time that works for you. We'll show you exactly how Mobiris works for your fleet." );
    mobiris_text     ( $wpc, 'mobiris_contact_wa_label',         'mobiris_contact', __( 'WhatsApp Button Label', 'mobiris-v5' ),    'Chat with us on WhatsApp' );
    mobiris_text     ( $wpc, 'mobiris_contact_wa_message',       'mobiris_contact', __( 'WhatsApp Contact Message', 'mobiris-v5' ), "Hi, I have a question about Mobiris" );
    mobiris_text     ( $wpc, 'mobiris_contact_email_label',      'mobiris_contact', __( 'Email Label', 'mobiris-v5' ),              'Email support' );
    mobiris_text     ( $wpc, 'mobiris_contact_address_label',    'mobiris_contact', __( 'Address Label', 'mobiris-v5' ),            'Our office' );
    mobiris_text     ( $wpc, 'mobiris_contact_hours_label',      'mobiris_contact', __( 'Hours Label', 'mobiris-v5' ),              'Office hours' );
    mobiris_text     ( $wpc, 'mobiris_contact_hours',            'mobiris_contact', __( 'Office Hours', 'mobiris-v5' ),             'Mon – Fri, 9am – 6pm WAT' );

    // ═══════════════════════════════════════════
    // TUTORIALS PAGE  (NEW)
    // ═══════════════════════════════════════════
    $wpc->add_section( 'mobiris_tutorials', [ 'title' => __( 'Tutorials Page', 'mobiris-v5' ), 'panel' => 'mobiris_panel', 'priority' => 87 ] );
    mobiris_text     ( $wpc, 'mobiris_tutorials_headline',   'mobiris_tutorials', __( 'Page Headline', 'mobiris-v5' ),  'Learn how to use Mobiris' );
    mobiris_textarea ( $wpc, 'mobiris_tutorials_subtext',    'mobiris_tutorials', __( 'Page Subtext', 'mobiris-v5' ),   'Step-by-step guides and video walkthroughs. Get up and running — and get the most out of your fleet operations platform.' );
    mobiris_text     ( $wpc, 'mobiris_tutorials_empty_text', 'mobiris_tutorials', __( 'Empty State Text', 'mobiris-v5' ), 'Tutorials are coming soon. Check back shortly.' );

    // ═══════════════════════════════════════════
    // BLOG  (NEW)
    // ═══════════════════════════════════════════
    $wpc->add_section( 'mobiris_blog', [ 'title' => __( 'Blog', 'mobiris-v5' ), 'panel' => 'mobiris_panel', 'priority' => 88 ] );
    mobiris_text     ( $wpc, 'mobiris_blog_headline',    'mobiris_blog', __( 'Blog Archive Headline', 'mobiris-v5' ), 'Fleet operations insights' );
    mobiris_textarea ( $wpc, 'mobiris_blog_subtext',     'mobiris_blog', __( 'Blog Archive Subtext', 'mobiris-v5' ),  'Practical tips, operator stories, and product updates from the Mobiris team.' );

    // ═══════════════════════════════════════════
    // FLOATING CHAT  (NEW)
    // ═══════════════════════════════════════════
    $wpc->add_section( 'mobiris_float', [ 'title' => __( 'Floating Chat Widget', 'mobiris-v5' ), 'panel' => 'mobiris_panel', 'priority' => 90 ] );
    mobiris_checkbox ( $wpc, 'mobiris_float_show',       'mobiris_float', __( 'Show Floating WhatsApp Button', 'mobiris-v5' ), true );
    mobiris_text     ( $wpc, 'mobiris_float_message',    'mobiris_float', __( 'WhatsApp Message', 'mobiris-v5' ),              "Hi, I need help with Mobiris" );
    mobiris_text     ( $wpc, 'mobiris_float_tooltip',    'mobiris_float', __( 'Tooltip Text', 'mobiris-v5' ),                  'Chat with us' );

    // ═══════════════════════════════════════════
    // FOOTER
    // ═══════════════════════════════════════════
    $wpc->add_section( 'mobiris_footer', [ 'title' => __( 'Footer', 'mobiris-v5' ), 'panel' => 'mobiris_panel', 'priority' => 95 ] );
    mobiris_text ( $wpc, 'mobiris_footer_logo_text',  'mobiris_footer', __( 'Logo Text', 'mobiris-v5' ),            'Mobiris' );
    mobiris_text ( $wpc, 'mobiris_footer_tagline',    'mobiris_footer', __( 'Tagline', 'mobiris-v5' ),              "Fleet & Driver Operations Platform.\nBuilt for transport operators in Nigeria." );
    mobiris_text ( $wpc, 'mobiris_footer_domain',     'mobiris_footer', __( 'Domain', 'mobiris-v5' ),              'mobiris.ng' );
    mobiris_text ( $wpc, 'mobiris_footer_copyright',  'mobiris_footer', __( 'Copyright Suffix', 'mobiris-v5' ),    'Growth Figures Limited. All rights reserved.' );

    // Customizer live preview JS
    add_action( 'customize_preview_init', function() {
        wp_enqueue_script( 'mobiris-customizer-preview', get_template_directory_uri() . '/assets/js/customizer-preview.js', [ 'customize-preview', 'jquery' ], wp_get_theme()->get( 'Version' ), true );
    } );
}

// ═══════════════════════════════════════════════
// Customizer helper functions
// ═══════════════════════════════════════════════
function mobiris_text( WP_Customize_Manager $wpc, string $id, string $section, string $label, string $default = '', string $type = 'text' ): void {
    $wpc->add_setting( $id, [ 'default' => $default, 'transport' => 'postMessage', 'sanitize_callback' => 'mobiris_sanitize_text' ] );
    $wpc->add_control( $id, [ 'label' => $label, 'section' => $section, 'type' => $type ] );
}
function mobiris_textarea( WP_Customize_Manager $wpc, string $id, string $section, string $label, string $default = '' ): void {
    $wpc->add_setting( $id, [ 'default' => $default, 'transport' => 'postMessage', 'sanitize_callback' => 'mobiris_sanitize_text' ] );
    $wpc->add_control( $id, [ 'label' => $label, 'section' => $section, 'type' => 'textarea' ] );
}
function mobiris_color( WP_Customize_Manager $wpc, string $id, string $section, string $label, string $default = '#2563eb' ): void {
    $wpc->add_setting( $id, [ 'default' => $default, 'transport' => 'postMessage', 'sanitize_callback' => 'mobiris_sanitize_color' ] );
    $wpc->add_control( new WP_Customize_Color_Control( $wpc, $id, [ 'label' => $label, 'section' => $section ] ) );
}
function mobiris_checkbox( WP_Customize_Manager $wpc, string $id, string $section, string $label, bool $default = true ): void {
    $wpc->add_setting( $id, [ 'default' => $default, 'transport' => 'refresh', 'sanitize_callback' => 'mobiris_sanitize_checkbox' ] );
    $wpc->add_control( $id, [ 'label' => $label, 'section' => $section, 'type' => 'checkbox' ] );
}

// ═══════════════════════════════════════════════
// Default copy
// ═══════════════════════════════════════════════
function mobiris_default_pain( int $n ): string {
    return [ 1 => "You don't know who has paid today.", 2 => 'Drivers move between fleets with no record.', 3 => 'Everything is tracked in notebooks and WhatsApp.', 4 => "You can't tell which vehicle belongs to whom.", 5 => 'Your guarantors are unverified. Your risk is invisible.', 6 => 'You lose money because there is no structure.' ][ $n ] ?? '';
}
