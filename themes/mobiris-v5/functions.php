<?php
/**
 * Mobiris v5 — Theme Functions
 *
 * @package mobiris-v5
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ─────────────────────────────────────────────
// Theme Setup
// ─────────────────────────────────────────────
function mobiris_setup(): void {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'html5', [ 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ] );
    add_theme_support( 'customize-selective-refresh-widgets' );
    add_theme_support( 'automatic-feed-links' );

    register_nav_menus( [
        'primary' => __( 'Primary Navigation', 'mobiris-v5' ),
        'footer'  => __( 'Footer Navigation', 'mobiris-v5' ),
    ] );
}
add_action( 'after_setup_theme', 'mobiris_setup' );

// ─────────────────────────────────────────────
// Custom Post Type: Tutorial
// ─────────────────────────────────────────────
function mobiris_register_cpts(): void {
    register_post_type( 'mobiris_tutorial', [
        'labels' => [
            'name'               => __( 'Tutorials', 'mobiris-v5' ),
            'singular_name'      => __( 'Tutorial', 'mobiris-v5' ),
            'add_new_item'       => __( 'Add New Tutorial', 'mobiris-v5' ),
            'edit_item'          => __( 'Edit Tutorial', 'mobiris-v5' ),
            'new_item'           => __( 'New Tutorial', 'mobiris-v5' ),
            'view_item'          => __( 'View Tutorial', 'mobiris-v5' ),
            'search_items'       => __( 'Search Tutorials', 'mobiris-v5' ),
            'not_found'          => __( 'No tutorials found', 'mobiris-v5' ),
            'not_found_in_trash' => __( 'No tutorials found in trash', 'mobiris-v5' ),
            'menu_name'          => __( 'Tutorials', 'mobiris-v5' ),
        ],
        'public'        => true,
        'has_archive'   => 'tutorials',
        'rewrite'       => [ 'slug' => 'tutorials' ],
        'supports'      => [ 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ],
        'menu_icon'     => 'dashicons-book-alt',
        'show_in_rest'  => true,
    ] );

    register_taxonomy( 'tutorial_category', 'mobiris_tutorial', [
        'labels' => [
            'name'          => __( 'Tutorial Categories', 'mobiris-v5' ),
            'singular_name' => __( 'Tutorial Category', 'mobiris-v5' ),
            'add_new_item'  => __( 'Add New Category', 'mobiris-v5' ),
            'edit_item'     => __( 'Edit Category', 'mobiris-v5' ),
        ],
        'hierarchical' => true,
        'public'       => true,
        'rewrite'      => [ 'slug' => 'tutorial-category' ],
        'show_in_rest' => true,
    ] );
}
add_action( 'init', 'mobiris_register_cpts' );

// ─────────────────────────────────────────────
// Theme Activation: flush rewrites + seed content
// ─────────────────────────────────────────────
add_action( 'after_switch_theme', function() {
    mobiris_register_cpts();
    flush_rewrite_rules();
    mobiris_seed_sample_content();
} );

// ─────────────────────────────────────────────
// Sample Content Installer
// Runs once on theme activation. Creates 5 blog posts
// and 5 tutorials so the blog and tutorials pages
// are populated immediately after install.
// ─────────────────────────────────────────────
function mobiris_seed_sample_content(): void {
    // Guard: only run once
    if ( get_option( 'mobiris_v5_seeded' ) ) return;

    // --- Tutorial categories ---
    $cat_getting_started = wp_insert_term( 'Getting Started',   'tutorial_category', [ 'slug' => 'getting-started' ] );
    $cat_drivers         = wp_insert_term( 'Driver Management', 'tutorial_category', [ 'slug' => 'driver-management' ] );
    $cat_remittance      = wp_insert_term( 'Remittance',        'tutorial_category', [ 'slug' => 'remittance' ] );
    $cat_reporting       = wp_insert_term( 'Reporting',         'tutorial_category', [ 'slug' => 'reporting' ] );

    $cat_gs_id  = is_wp_error( $cat_getting_started ) ? $cat_getting_started->error_data['term_exists'] : $cat_getting_started['term_id'];
    $cat_dr_id  = is_wp_error( $cat_drivers )         ? $cat_drivers->error_data['term_exists']         : $cat_drivers['term_id'];
    $cat_rem_id = is_wp_error( $cat_remittance )      ? $cat_remittance->error_data['term_exists']       : $cat_remittance['term_id'];
    $cat_rep_id = is_wp_error( $cat_reporting )       ? $cat_reporting->error_data['term_exists']        : $cat_reporting['term_id'];

    // --- Tutorials ---
    $tutorials = [
        [
            'title'    => 'Getting Started: Setting Up Your Fleet',
            'type'     => 'guide',
            'category' => $cat_gs_id,
            'excerpt'  => 'Everything you need to do in your first 30 minutes on Mobiris — from creating your account to adding your first vehicle.',
            'content'  => '<h2>Before you begin</h2>
<p>Setting up Mobiris takes about 30 minutes for a fleet of any size. You\'ll need your vehicle registration details, and the phone numbers of at least two drivers you want to add first.</p>

<h2>Step 1: Create your account</h2>
<p>Go to <a href="https://app.mobiris.ng">app.mobiris.ng</a> and click <strong>Get started</strong>. Enter your name, email address, and a password. You\'ll receive a verification email — click the link to confirm your account.</p>

<h2>Step 2: Set up your business profile</h2>
<p>After signing in, you\'ll be taken to your fleet setup screen. Fill in:</p>
<ul>
<li><strong>Business name</strong> — the name your drivers will see on remittance receipts</li>
<li><strong>Fleet type</strong> — minibus, sedan, motorcycle, or mixed fleet</li>
<li><strong>Operating state</strong> — your primary state of operation</li>
<li><strong>Default daily remittance target</strong> — the amount each vehicle is expected to generate per day. You can override this per vehicle later.</li>
</ul>

<h2>Step 3: Add your first vehicle</h2>
<p>Go to <strong>Vehicles → Add Vehicle</strong>. You\'ll need the vehicle\'s registration number, make, model, and year. Optionally, upload the vehicle registration document — this goes into the compliance store.</p>

<h2>Step 4: Add your operating units</h2>
<p>Operating units are how you group vehicles — by route, garage, or team. If you have vehicles running different routes (e.g. Ajah–CMS and Ajah–Lekki), create a separate operating unit for each. You can always change this later.</p>

<h2>Step 5: Invite your first driver</h2>
<p>Go to <strong>Drivers → Add Driver</strong> and enter the driver\'s phone number. They\'ll receive an SMS with a link to complete their own onboarding — submitting their NIN, licence, and guarantor details from their phone. You\'ll get a notification when onboarding is complete.</p>

<h2>You\'re ready</h2>
<p>Once you\'ve added at least one vehicle and one driver, you can start recording remittances. The dashboard will begin showing you daily collection status, outstanding remittances, and fleet activity in real time.</p>',
        ],
        [
            'title'    => 'How to Add and Verify a Driver',
            'type'     => 'guide',
            'category' => $cat_dr_id,
            'excerpt'  => 'The complete driver onboarding flow — from initial invite to verified identity, document capture, and guarantor setup.',
            'content'  => '<h2>Starting the onboarding process</h2>
<p>Go to <strong>Drivers → Add Driver</strong> in your Mobiris dashboard. Enter the driver\'s phone number and click <strong>Send Invite</strong>. The driver will receive an SMS with a link to the driver self-service onboarding portal.</p>
<p>You do not need to be present when the driver completes onboarding — they complete it on their own phone, at their own pace.</p>

<h2>What the driver submits</h2>
<p>The driver portal walks the driver through:</p>
<ol>
<li><strong>Personal details</strong> — full name, date of birth, home address</li>
<li><strong>NIN verification</strong> — the driver enters their National Identification Number. Mobiris verifies it against the NIMC database and confirms the name match.</li>
<li><strong>Driver\'s licence</strong> — the driver photographs their licence. The licence number and expiry date are captured and stored.</li>
<li><strong>Selfie / face match</strong> — the driver takes a selfie, which is matched against the NIN photo to confirm identity.</li>
<li><strong>Guarantor details</strong> — the driver enters their guarantor\'s name, phone number, NIN, and relationship.</li>
</ol>

<h2>Reviewing and approving</h2>
<p>Once the driver completes onboarding, you\'ll see them in your <strong>Drivers</strong> list with a status of <em>Pending Review</em>. Click the driver\'s name to review their submitted documents and verification results.</p>
<p>If everything checks out, click <strong>Approve Driver</strong>. The driver\'s status changes to <em>Active</em> and they can now be assigned to vehicles and remittances.</p>
<p>If you need more information, click <strong>Request Resubmission</strong> and add a note — the driver will be prompted to correct the specific item.</p>

<h2>Monitoring document expiry</h2>
<p>Mobiris automatically tracks the expiry dates of every document submitted at onboarding. Go to <strong>Reports → Compliance</strong> to see a list of documents expiring in the next 30, 60, or 90 days across your entire fleet.</p>',
        ],
        [
            'title'    => 'Recording a Daily Remittance',
            'type'     => 'guide',
            'category' => $cat_rem_id,
            'excerpt'  => 'How to confirm, dispute, and waive remittances. Keep a clean record of every driver payment without paper.',
            'content'  => '<h2>How remittance works in Mobiris</h2>
<p>Each morning, when a driver pays their daily remittance, the record is created in Mobiris — either by you, your operations manager, or the driver via the mobile app. Every record has a status: <strong>Confirmed</strong>, <strong>Disputed</strong>, <strong>Waived</strong>, or <strong>Outstanding</strong>.</p>

<h2>To confirm a remittance (full payment)</h2>
<ol>
<li>Go to <strong>Remittance → Today</strong></li>
<li>Find the driver or vehicle in the list</li>
<li>Click <strong>Confirm Payment</strong></li>
<li>Enter the amount received (defaults to the vehicle\'s daily target)</li>
<li>Click <strong>Save</strong></li>
</ol>
<p>A timestamped record is created and the driver\'s status for the day moves to <em>Confirmed</em>.</p>

<h2>To record a shortfall (disputed amount)</h2>
<ol>
<li>Click <strong>Record Shortfall</strong> next to the driver\'s entry</li>
<li>Enter the amount actually received</li>
<li>Select a reason: <em>Road was slow</em>, <em>Vehicle breakdown</em>, <em>Driver dispute</em>, or <em>Other</em></li>
<li>Add an optional note for your records</li>
<li>Click <strong>Save</strong></li>
</ol>
<p>The shortfall amount is recorded and the driver\'s balance for the day shows the difference owed.</p>

<h2>To waive a remittance</h2>
<p>If a driver had a genuine reason you choose to waive (e.g. a verified breakdown), open the remittance record, click <strong>Waive Outstanding</strong>, add a reason, and save. The record shows <em>Waived</em> with your note — it does not carry forward as debt.</p>

<h2>Chasing outstanding remittances</h2>
<p>Go to <strong>Remittance → Outstanding</strong> to see every driver with unpaid or disputed remittances from previous days. You can filter by driver, vehicle, or date range. Click any entry to see the full history for that driver.</p>',
        ],
        [
            'title'    => 'Setting Up a Guarantor for a New Driver',
            'type'     => 'guide',
            'category' => $cat_dr_id,
            'excerpt'  => 'How guarantors are captured, verified, and stored in Mobiris — and what happens when you need to activate one.',
            'content'  => '<h2>What Mobiris captures for each guarantor</h2>
<p>When a driver completes self-service onboarding, they submit their guarantor\'s details directly. Mobiris captures:</p>
<ul>
<li>Full name and relationship to the driver</li>
<li>Phone number (verified by SMS)</li>
<li>National Identification Number (NIN) — verified against the NIMC database</li>
<li>Home address</li>
<li>Signed digital guarantee (the driver confirms the guarantor has consented to the arrangement)</li>
</ul>

<h2>Reviewing a guarantor record</h2>
<p>Go to <strong>Drivers → [Driver Name] → Guarantor</strong>. You\'ll see the full guarantor profile: verified identity, contact details, and the date the guarantee was recorded.</p>

<h2>If the guarantor\'s NIN verification fails</h2>
<p>If the NIN entered does not match a valid record in the NIMC database, the driver\'s onboarding status will show a <em>Guarantor Verification Required</em> flag. You can either:</p>
<ul>
<li>Request resubmission — ask the driver to re-enter their guarantor\'s details</li>
<li>Override and approve manually — if you\'ve independently confirmed the guarantor, you can approve the record and add a note</li>
</ul>

<h2>When a guarantor needs to be contacted</h2>
<p>In the event of a driver absconding or a serious dispute, go to <strong>Drivers → [Driver Name] → Guarantor</strong> and click <strong>Download Guarantor Record</strong>. This generates a PDF with the full verified record — name, NIN confirmation, contact details, and the signed digital guarantee. This is the document you\'ll give to your solicitor or present to the police.</p>

<h2>Keeping guarantor records current</h2>
<p>Mobiris will alert you if a driver has not had guarantor contact confirmed in more than 6 months. Use the <strong>Compliance → Guarantors</strong> report to see all guarantor records and their last-verified dates across your fleet.</p>',
        ],
        [
            'title'    => 'Understanding Your Fleet Dashboard',
            'type'     => 'guide',
            'category' => $cat_rep_id,
            'excerpt'  => 'A walkthrough of every panel on the Mobiris fleet dashboard — what the numbers mean and what to act on each morning.',
            'content'  => '<h2>The morning dashboard routine</h2>
<p>The Mobiris dashboard is designed to answer one question each morning: <em>What do I need to deal with today?</em> Here\'s what each section shows and what actions it\'s prompting you to take.</p>

<h2>Today\'s Remittance Summary</h2>
<p>At the top of the dashboard you\'ll see three numbers:</p>
<ul>
<li><strong>Expected</strong> — the total remittance target for all active vehicles today</li>
<li><strong>Confirmed</strong> — what has already been recorded as paid</li>
<li><strong>Outstanding</strong> — the gap between expected and confirmed</li>
</ul>
<p>As the day progresses and your operations team records payments, the Confirmed number goes up and Outstanding goes down. By end of day, you want Outstanding to be either zero or a list of known shortfalls with reasons attached.</p>

<h2>Fleet Activity Feed</h2>
<p>The activity feed in the centre of the dashboard shows every recent action across your fleet in reverse chronological order: remittance confirmations, driver onboarding completions, assignment updates, document expirations, and dispute flags.</p>
<p>This is your audit trail. Every entry has a timestamp and the name of the person who recorded it.</p>

<h2>Driver Status Panel</h2>
<p>The driver panel shows a status for every active driver: <em>Remitted</em>, <em>Shortfall</em>, <em>Outstanding</em>, or <em>Not yet recorded</em>. You can click any driver to jump to their full profile and remittance history.</p>
<p>Drivers shown in orange or red need your attention: they have outstanding remittances or flagged documents.</p>

<h2>Compliance Alerts</h2>
<p>The bottom of the dashboard shows compliance alerts — documents expiring in the next 30 days, guarantors not yet verified, and any drivers with open identity flags. These are not urgent on any single day, but ignoring them for weeks creates the compliance exposure that causes problems later.</p>
<p>Set aside 15 minutes each Friday to work through open compliance alerts. With Mobiris, it takes 15 minutes because the records are already there — you\'re just reviewing and confirming, not chasing paperwork.</p>',
        ],
    ];

    foreach ( $tutorials as $data ) {
        $post_id = wp_insert_post( [
            'post_title'   => $data['title'],
            'post_content' => $data['content'],
            'post_excerpt' => $data['excerpt'],
            'post_status'  => 'publish',
            'post_type'    => 'mobiris_tutorial',
        ] );
        if ( $post_id && ! is_wp_error( $post_id ) ) {
            wp_set_object_terms( $post_id, [ (int) $data['category'] ], 'tutorial_category' );
            update_post_meta( $post_id, '_mobiris_tutorial_type', $data['type'] );
        }
    }

    // --- Blog posts ---
    $blog_posts = [
        [
            'title'   => 'How Much Remittance Are You Actually Losing Every Month?',
            'excerpt' => 'Most fleet operators know they\'re not collecting everything they should. Here\'s how to put a ₦ number on the gap — and what closes it.',
            'content' => '<p>Most fleet operators know, in their gut, that they\'re not collecting everything they should. The driver says he paid. Your record says something different. Nobody can prove either way. And the next morning you\'re chasing the same argument again.</p>
<p>The money leaving through that gap is real. It\'s just hard to put a number on it — until you do the maths.</p>

<h2>Start with the numbers you already know</h2>
<p>Let\'s say you\'re running 40 vehicles. Each vehicle is supposed to remit ₦10,000 a day. Over 26 operating days in a month, that\'s ₦260,000 per vehicle, or <strong>₦10.4 million</strong> across the fleet. That\'s what the whiteboard says. Now ask yourself honestly: what actually lands in your hand?</p>

<h2>The four places money disappears</h2>
<p><strong>1. Shortfalls that go unrecorded.</strong> The driver pays ₦7,000 instead of ₦10,000. He says the road was slow. You wave him through, thinking you\'ll "sort it later." Later never comes. Over a month, at just ₦1,500 per vehicle per day average shortfall — you\'re losing ₦1.56 million on 40 vehicles.</p>
<p><strong>2. Disputes with no evidence.</strong> The driver says he paid yesterday. You say he didn\'t. Without a timestamped record at the point of payment, disputes default to whoever is more confident. Usually the driver.</p>
<p><strong>3. Absent entries that don\'t get chased.</strong> If your remittance record is a notebook or WhatsApp, what happens when a driver simply doesn\'t show? Three days pass. By day four, the outstanding amount has grown and he avoids your calls.</p>
<p><strong>4. Assignment ghost payments.</strong> A driver does two trips and remits for one. The second assignment was verbal, dispatched on WhatsApp, and no one followed up.</p>

<h2>What 15% leakage looks like in naira</h2>
<p>Industry estimates put remittance leakage in manual fleets at 10–20% per month. Take the middle ground — 15%:</p>
<ul>
<li>Expected monthly: ₦10.4 million</li>
<li>Leakage at 15%: <strong>₦1.56 million per month</strong></li>
<li>Per year: <strong>₦18.72 million</strong></li>
</ul>
<p>That\'s not a rounding error. That\'s a vehicle purchase. That\'s six months of payroll.</p>

<h2>The harder truth: you can\'t fix what you can\'t see</h2>
<p>Manual systems don\'t just lose money — they hide the losses. When every dispute is resolved by memory, you can\'t tell which drivers are systematically underpaying, which routes are consistently short, or which days of the week your collection drops.</p>
<p>The operators who close the gap fastest aren\'t necessarily the ones who collect harder. They\'re the ones who built a system where the record exists before the argument starts.</p>
<p>When drivers know that every payment is timestamped and every dispute is in the system, the calculation changes. It\'s not about catching people — it\'s about making the system clear enough that shortchanging it isn\'t worth the risk.</p>',
        ],
        [
            'title'   => 'How to Verify a Driver Before You Hand Over the Keys',
            'excerpt' => 'Photocopies and phone calls aren\'t enough. Here\'s what a proper driver verification process looks like — and why each step matters.',
            'content' => '<p>Every experienced fleet operator has a version of the same story. A driver shows up with a reference. You call the number — it rings, someone vouches for them. The documents look right. You hand over the keys. Three weeks later, the vehicle is in Delta State and the driver isn\'t answering his phone.</p>
<p>You didn\'t do anything obviously wrong. You just didn\'t have a system that could tell you what you couldn\'t see.</p>

<h2>Step 1: Capture identity before anything else</h2>
<p>The first thing you need is a verified identity record — not a photocopy of an ID card, but a confirmed match between the person standing in front of you and the document they\'re presenting.</p>
<p>Documents to collect at minimum:</p>
<ul>
<li><strong>National Identification Number (NIN)</strong> — verified against the NIMC database to confirm name, date of birth, and photo.</li>
<li><strong>Driver\'s Licence</strong> — verify the licence number and expiry date.</li>
<li><strong>BVN</strong> — ties to a bank account and a real identity in the banking system.</li>
</ul>

<h2>Step 2: Get a face match</h2>
<p>A document is not enough on its own. When a driver takes a selfie during onboarding, that image is compared against the photo on file for their NIN or licence. A mismatch is an immediate red flag. Drivers with a record at another operator sometimes reapply under a different name or with a borrowed NIN. Without a face check, there\'s no way to catch this.</p>

<h2>Step 3: Check the guarantor — properly</h2>
<p>A guarantor capture that actually functions requires:</p>
<ul>
<li>The guarantor\'s own verified identity (NIN at minimum)</li>
<li>A signed, dated document making clear what they\'re liable for</li>
<li>Contact details independently verified — not just provided by the driver</li>
<li>A record that exists in a system, not a folder that can be lost</li>
</ul>

<h2>Step 4: Check for cross-operator history</h2>
<p>A driver who absconded with a vehicle from another operator last year isn\'t going to list that employer as a reference. The only way to catch this is through a shared intelligence layer — a network that flags known incidents. When a new driver is onboarded, a search runs against that database. A match surfaces a risk signal that prompts you to investigate further.</p>

<h2>Step 5: Set up expiry tracking from day one</h2>
<p>A driver whose licence is valid today will have an expired licence in two years. When you onboard a driver, the expiry dates on every captured document should go straight into a tracking system. You should receive an alert when something is 60 days from expiry — not when you discover it at an FRSC checkpoint.</p>',
        ],
        [
            'title'   => 'What to Do When a Driver Absconds With Your Vehicle',
            'excerpt' => 'One of the worst calls a fleet operator can receive. Here\'s exactly what to do in the first 24 hours — and the gaps that made it possible.',
            'content' => '<p>It\'s one of the worst calls a fleet operator can receive. A driver who was working normally yesterday hasn\'t shown up today. His phone is off. The vehicle is gone. The guarantor\'s number rings out. You\'re left standing in your yard, wondering what to do now.</p>

<h2>First 24 hours: what to do right now</h2>
<p><strong>1. Call the next contact in the chain.</strong> If the driver doesn\'t answer, go to the guarantor. If the guarantor doesn\'t answer, try any family contact captured at onboarding. Rule out the benign explanations first — sometimes there\'s a medical emergency.</p>
<p><strong>2. Check your last known location.</strong> If you have any GPS or tracking on the vehicle, pull the last recorded position. If you\'ve been dispatching digitally, when was the last assignment completed and where?</p>
<p><strong>3. File a police report within 24 hours.</strong> This is the step most operators delay, and it costs them. Go with: vehicle registration documents, the driver\'s NIN and ID documents, the guarantor\'s details, and any digital records of assignments and communications. The police report creates a formal record of the vehicle as stolen — critical for insurance and recovery.</p>
<p><strong>4. Alert your industry network.</strong> Call other fleet operators you know. The informal network moves fast — a driver trying to sell a vehicle or find new work often surfaces within days.</p>

<h2>What to do in the first week</h2>
<p><strong>5. Contact your insurance provider.</strong> The claim process begins with the police report. Follow up with your insurer and understand what documentation they need.</p>
<p><strong>6. Pursue the guarantor formally.</strong> If you captured the guarantor properly — with a signed document, verified identity, and valid contact details — this is the moment that paperwork earns its value. If you didn\'t capture the guarantor properly, you\'ll need a lawyer to have any formal standing.</p>

<h2>The harder conversation: how did this happen?</h2>
<p>Most driver absconding incidents follow a recognisable pattern in hindsight:</p>
<ul>
<li>The driver had been submitting short remittances for weeks without a clear dispute record</li>
<li>The guarantor\'s details were never properly verified</li>
<li>There was no face-match verification at onboarding — someone else\'s NIN may have been used</li>
<li>The driver had a prior incident at another operator that you had no way to know about</li>
</ul>
<p>None of this means you were negligent. It means you were operating without the infrastructure to catch these signals — which is where most of the industry has been.</p>',
        ],
        [
            'title'   => 'The Guarantor Problem: Why It Fails (And How to Fix It)',
            'excerpt' => 'Almost every Nigerian fleet operator uses guarantors. Almost every one who has had a driver abscond found the guarantor useless. Here\'s why — and what actually works.',
            'content' => '<p>Almost every vehicle-for-hire operator in Nigeria uses guarantors. Almost every operator who has had a driver abscond has found that the guarantor was useless when it mattered. This isn\'t a coincidence. The guarantor system, as most fleets run it today, is designed to feel like a safeguard while functioning like a formality.</p>

<h2>Why the standard approach fails</h2>
<p><strong>The guarantor is chosen by the driver.</strong> The driver picks someone he knows, someone who will say yes, and — if he\'s planning ahead — someone who will be difficult to reach or who has nothing material to lose. A guarantor nominated and controlled by the person they\'re supposed to hold accountable isn\'t really a guarantor — it\'s a reference.</p>
<p><strong>The guarantor\'s identity is never verified.</strong> You take a phone number, maybe a photocopy of an ID that you file away. You never independently check that the name on the ID matches a real person with real contact details. This means a driver can nominate a fictional guarantor.</p>
<p><strong>The document doesn\'t create real liability.</strong> A paper form with no clear financial amount, no witness, and no legal structure isn\'t enforceable. When the guarantor disappears and you want to take action, your solicitor will tell you the paperwork you have is difficult to use.</p>

<h2>What a guarantor system that works actually looks like</h2>
<p><strong>1. Verify the guarantor\'s identity independently.</strong> The guarantor should go through the same basic identity check as the driver — NIN verification against the NIMC database, plus a photo match. This eliminates fictional guarantors and borrowed identities.</p>
<p><strong>2. Capture BVN if the risk warrants it.</strong> BVN ties to a live bank account. When a guarantor knows you have their BVN on file, the calculus of becoming unreachable changes.</p>
<p><strong>3. Make the liability explicit and documented.</strong> The guarantor agreement should state the vehicle being guaranteed, the amount of liability, the conditions under which that liability is triggered, and be witnessed and stored digitally.</p>
<p><strong>4. Build in a mid-tenure check-in.</strong> Six months into a driver\'s tenure, confirm the guarantor\'s contact details are still valid. This confirms reachability before you need it.</p>

<h2>The purpose of a good guarantor process</h2>
<p>A driver who knows you have a real paper trail is significantly less likely to test it. The purpose of a good guarantor process isn\'t just recovery — it\'s deterrence. Make the system serious and most drivers will respect it. That\'s far cheaper than chasing a vehicle after the fact.</p>',
        ],
        [
            'title'   => 'Is Your Fleet Actually Profitable? How to Calculate Per-Vehicle Economics',
            'excerpt' => 'Most operators know if the business is making money. Few know which vehicles are making money — and which are running at a loss while the profitable ones carry them.',
            'content' => '<p>Most fleet operators know whether the business overall is making money. What most don\'t know is <em>which vehicles</em> are making money — and which are quietly running at a loss while the profitable units carry them.</p>
<p>When you average out fleet performance, the strong units hide the weak ones. A fleet of 50 vehicles where 35 are profitable and 15 are losing money can still show a positive bottom line — right up until a market shift or a few bad months push you into trouble.</p>

<h2>The per-vehicle P&amp;L</h2>
<p>For each vehicle in your fleet, you need three numbers:</p>
<ul>
<li><strong>Revenue:</strong> What the vehicle is supposed to generate in remittance per month. (Target rate × operating days)</li>
<li><strong>Collected:</strong> What the vehicle actually generated — confirmed remittances minus write-offs.</li>
<li><strong>Cost:</strong> Direct costs attributable to that vehicle — financing or depreciation, insurance, maintenance reserve.</li>
</ul>
<p>The difference between Collected and Cost is your per-vehicle contribution margin.</p>

<h2>A realistic worked example</h2>
<p>Vehicle A: 2019 Hiace bus, Lagos.</p>
<ul>
<li>Monthly target remittance: ₦260,000 (₦10,000 × 26 days)</li>
<li>Average monthly collected (last 3 months): ₦218,000 — a 16% shortfall</li>
<li>Monthly costs (loan + insurance + maintenance): ₦123,000</li>
<li><strong>Contribution margin: ₦95,000/month</strong></li>
</ul>
<p>Now run the same number assuming you closed the collection gap to 98%:</p>
<ul>
<li>Monthly collected: ₦254,800</li>
<li><strong>Contribution margin: ₦131,800/month</strong></li>
</ul>
<p>That\'s ₦36,800 more per vehicle, per month — from the same vehicle, same driver, same route. On 40 vehicles, that\'s ₦1.47 million per month sitting in the gap between target and actual.</p>

<h2>The management habit that changes everything</h2>
<p>The operators who run tightest on margin have a weekly habit: they look at last week\'s remittance against target for every vehicle, flag any vehicle below 90% of expected, and investigate within 48 hours. When remittance is tracked at the point of collection — confirmed or disputed in real time — this weekly review takes ten minutes instead of three hours.</p>
<p>That\'s the operational difference between a fleet that grows and one that plateaus.</p>',
        ],
    ];

    foreach ( $blog_posts as $data ) {
        wp_insert_post( [
            'post_title'   => $data['title'],
            'post_content' => $data['content'],
            'post_excerpt' => $data['excerpt'],
            'post_status'  => 'publish',
            'post_type'    => 'post',
        ] );
    }

    // Mark as seeded
    update_option( 'mobiris_v5_seeded', true );
}

// ─────────────────────────────────────────────
// Enqueue Assets
// ─────────────────────────────────────────────
function mobiris_enqueue_assets(): void {
    wp_enqueue_style(
        'mobiris-fonts',
        'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap',
        [], null
    );

    wp_enqueue_style(
        'mobiris-main',
        get_template_directory_uri() . '/assets/css/main.css',
        [ 'mobiris-fonts' ],
        wp_get_theme()->get( 'Version' )
    );

    $brand      = get_theme_mod( 'mobiris_brand_color',      '#2563eb' );
    $brand_dark = get_theme_mod( 'mobiris_brand_color_dark', '#1d4ed8' );
    wp_add_inline_style( 'mobiris-main', mobiris_build_css_vars( $brand, $brand_dark ) );

    wp_enqueue_script(
        'mobiris-main',
        get_template_directory_uri() . '/assets/js/main.js',
        [], wp_get_theme()->get( 'Version' ), true
    );

    // Gated content JS
    if ( is_front_page() ) {
        wp_enqueue_script(
            'mobiris-gated',
            get_template_directory_uri() . '/assets/js/gated-content.js',
            [], wp_get_theme()->get( 'Version' ), true
        );
        wp_localize_script( 'mobiris-gated', 'MobirisGated', [
            'ajaxUrl' => admin_url( 'admin-ajax.php' ),
            'nonce'   => wp_create_nonce( 'mobiris_gated_nonce' ),
        ] );
    }

    // Contact form JS — load on contact page template
    if ( is_page_template( 'page-templates/page-contact.php' ) ) {
        wp_enqueue_script(
            'mobiris-contact',
            get_template_directory_uri() . '/assets/js/contact-form.js',
            [], wp_get_theme()->get( 'Version' ), true
        );
        wp_localize_script( 'mobiris-contact', 'MobirisContact', [
            'ajaxUrl' => admin_url( 'admin-ajax.php' ),
            'nonce'   => wp_create_nonce( 'mobiris_contact_nonce' ),
        ] );
    }
}
add_action( 'wp_enqueue_scripts', 'mobiris_enqueue_assets' );

// ─────────────────────────────────────────────
// AJAX: Contact Form — emails support@mobiris.ng
// ─────────────────────────────────────────────
add_action( 'wp_ajax_mobiris_contact_form',        'mobiris_handle_contact_form' );
add_action( 'wp_ajax_nopriv_mobiris_contact_form', 'mobiris_handle_contact_form' );

function mobiris_handle_contact_form(): void {
    check_ajax_referer( 'mobiris_contact_nonce', 'nonce' );

    $name    = sanitize_text_field( wp_unslash( $_POST['name']    ?? '' ) );
    $email   = sanitize_email(      wp_unslash( $_POST['email']   ?? '' ) );
    $phone   = sanitize_text_field( wp_unslash( $_POST['phone']   ?? '' ) );
    $fleet   = sanitize_text_field( wp_unslash( $_POST['fleet']   ?? '' ) );
    $subject = sanitize_text_field( wp_unslash( $_POST['subject'] ?? '' ) );
    $message = sanitize_textarea_field( wp_unslash( $_POST['message'] ?? '' ) );

    if ( empty( $name ) ) {
        wp_send_json_error( [ 'message' => __( 'Please enter your name.', 'mobiris-v5' ) ] );
    }
    if ( ! is_email( $email ) ) {
        wp_send_json_error( [ 'message' => __( 'Please enter a valid email address.', 'mobiris-v5' ) ] );
    }
    if ( empty( $message ) ) {
        wp_send_json_error( [ 'message' => __( 'Please enter a message.', 'mobiris-v5' ) ] );
    }

    $to          = get_theme_mod( 'mobiris_support_email', 'support@mobiris.ng' );
    $mail_subject = sprintf( '[Mobiris Contact] %s — %s', $subject ?: 'New enquiry', $name );

    $body  = "You have a new contact form submission on mobiris.ng.\n\n";
    $body .= "Name:       {$name}\n";
    $body .= "Email:      {$email}\n";
    $body .= "Phone:      " . ( $phone ?: 'Not provided' ) . "\n";
    $body .= "Fleet size: " . ( $fleet ?: 'Not provided' ) . "\n";
    $body .= "Subject:    " . ( $subject ?: 'General enquiry' ) . "\n\n";
    $body .= "Message:\n{$message}\n\n";
    $body .= "---\nSent from mobiris.ng contact form\n" . gmdate( 'Y-m-d H:i:s' ) . " UTC";

    $headers = [
        'Content-Type: text/plain; charset=UTF-8',
        "Reply-To: {$name} <{$email}>",
    ];

    $sent = wp_mail( $to, $mail_subject, $body, $headers );

    // Store submission regardless of mail result
    $submissions   = get_option( 'mobiris_contact_submissions', [] );
    $submissions[] = [
        'name'    => $name,
        'email'   => $email,
        'phone'   => $phone,
        'fleet'   => $fleet,
        'subject' => $subject,
        'message' => $message,
        'date'    => gmdate( 'Y-m-d H:i:s' ),
        'ip'      => sanitize_text_field( $_SERVER['REMOTE_ADDR'] ?? '' ),
    ];
    update_option( 'mobiris_contact_submissions', $submissions );

    if ( $sent ) {
        /* translators: %s: visitor's first name */
        wp_send_json_success( [
            'message' => sprintf(
                /* translators: %s: name */
                __( "Thanks %s — we've received your message and will respond within 24 hours. Check your inbox.", 'mobiris-v5' ),
                esc_html( $name )
            ),
        ] );
    } else {
        // Mail failed but submission was saved — give the user a WhatsApp fallback
        $wa_url = mobiris_whatsapp_url( 'mobiris_contact_wa_message' );
        wp_send_json_success( [
            'message' => __( "We've received your message — though our email system had a hiccup. We'll follow up with you. You can also reach us on WhatsApp for a faster response.", 'mobiris-v5' ),
            'waUrl'   => esc_url( $wa_url ),
        ] );
    }
}

// ─────────────────────────────────────────────
// AJAX: Gated content email capture
// ─────────────────────────────────────────────
add_action( 'wp_ajax_mobiris_capture_email',        'mobiris_handle_email_capture' );
add_action( 'wp_ajax_nopriv_mobiris_capture_email', 'mobiris_handle_email_capture' );

function mobiris_handle_email_capture(): void {
    check_ajax_referer( 'mobiris_gated_nonce', 'nonce' );

    $email    = sanitize_email( wp_unslash( $_POST['email'] ?? '' ) );
    $resource = sanitize_text_field( wp_unslash( $_POST['resource'] ?? 'download' ) );

    if ( ! is_email( $email ) ) {
        wp_send_json_error( [ 'message' => __( 'Please enter a valid email address.', 'mobiris-v5' ) ] );
    }

    $leads   = get_option( 'mobiris_email_leads', [] );
    $leads[] = [
        'email'    => $email,
        'resource' => $resource,
        'date'     => gmdate( 'Y-m-d H:i:s' ),
        'ip'       => sanitize_text_field( $_SERVER['REMOTE_ADDR'] ?? '' ),
    ];
    update_option( 'mobiris_email_leads', $leads );

    do_action( 'mobiris_email_captured', $email, $resource );

    $download_url = get_theme_mod( 'mobiris_gated_download_url', '' );

    wp_send_json_success( [
        'message'       => __( 'Thanks! Your download is ready.', 'mobiris-v5' ),
        'downloadUrl'   => esc_url( $download_url ),
        'downloadLabel' => get_theme_mod( 'mobiris_gated_download_label', 'Download Now' ),
    ] );
}

// ─────────────────────────────────────────────
// Admin: Contact Submissions inbox
// ─────────────────────────────────────────────
add_action( 'admin_menu', function() {
    add_submenu_page(
        'themes.php',
        __( 'Contact Submissions', 'mobiris-v5' ),
        __( 'Contact Inbox', 'mobiris-v5' ),
        'manage_options',
        'mobiris-contact-inbox',
        'mobiris_contact_inbox_page'
    );
    add_submenu_page(
        'themes.php',
        __( 'Mobiris Email Leads', 'mobiris-v5' ),
        __( 'Email Leads', 'mobiris-v5' ),
        'manage_options',
        'mobiris-leads',
        'mobiris_leads_page'
    );
} );

function mobiris_contact_inbox_page(): void {
    if ( isset( $_GET['export'] ) && current_user_can( 'manage_options' ) ) {
        check_admin_referer( 'mobiris_export_contact' );
        $rows = get_option( 'mobiris_contact_submissions', [] );
        header( 'Content-Type: text/csv' );
        header( 'Content-Disposition: attachment; filename="mobiris-contact-' . gmdate( 'Y-m-d' ) . '.csv"' );
        $out = fopen( 'php://output', 'w' );
        fputcsv( $out, [ 'Name', 'Email', 'Phone', 'Fleet Size', 'Subject', 'Message', 'Date' ] );
        foreach ( $rows as $row ) {
            fputcsv( $out, [ $row['name'], $row['email'], $row['phone'] ?? '', $row['fleet'] ?? '', $row['subject'] ?? '', $row['message'], $row['date'] ] );
        }
        fclose( $out );
        exit;
    }

    $rows       = get_option( 'mobiris_contact_submissions', [] );
    $export_url = wp_nonce_url( admin_url( 'themes.php?page=mobiris-contact-inbox&export=1' ), 'mobiris_export_contact' );
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Contact Form Submissions', 'mobiris-v5' ); ?></h1>
        <p style="color:#666;"><?php esc_html_e( 'Each submission is emailed to support@mobiris.ng and stored here as a backup.', 'mobiris-v5' ); ?></p>
        <p><a href="<?php echo esc_url( $export_url ); ?>" class="button button-primary"><?php esc_html_e( 'Export CSV', 'mobiris-v5' ); ?></a></p>
        <?php if ( empty( $rows ) ) : ?>
            <p><?php esc_html_e( 'No submissions yet.', 'mobiris-v5' ); ?></p>
        <?php else : ?>
        <table class="widefat striped" style="margin-top:1rem;">
            <thead>
                <tr>
                    <th><?php esc_html_e( 'Date', 'mobiris-v5' ); ?></th>
                    <th><?php esc_html_e( 'Name', 'mobiris-v5' ); ?></th>
                    <th><?php esc_html_e( 'Email', 'mobiris-v5' ); ?></th>
                    <th><?php esc_html_e( 'Phone', 'mobiris-v5' ); ?></th>
                    <th><?php esc_html_e( 'Fleet Size', 'mobiris-v5' ); ?></th>
                    <th><?php esc_html_e( 'Subject', 'mobiris-v5' ); ?></th>
                    <th><?php esc_html_e( 'Message', 'mobiris-v5' ); ?></th>
                </tr>
            </thead>
            <tbody>
            <?php foreach ( array_reverse( $rows ) as $row ) : ?>
                <tr>
                    <td><?php echo esc_html( $row['date'] ); ?></td>
                    <td><?php echo esc_html( $row['name'] ); ?></td>
                    <td><a href="mailto:<?php echo esc_attr( $row['email'] ); ?>"><?php echo esc_html( $row['email'] ); ?></a></td>
                    <td><?php echo esc_html( $row['phone'] ?? '—' ); ?></td>
                    <td><?php echo esc_html( $row['fleet'] ?? '—' ); ?></td>
                    <td><?php echo esc_html( $row['subject'] ?? '—' ); ?></td>
                    <td style="max-width:300px;white-space:pre-wrap;"><?php echo esc_html( $row['message'] ); ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
        <?php endif; ?>
    </div>
    <?php
}

function mobiris_leads_page(): void {
    if ( isset( $_GET['export'] ) && current_user_can( 'manage_options' ) ) {
        check_admin_referer( 'mobiris_export_leads' );
        $leads = get_option( 'mobiris_email_leads', [] );
        header( 'Content-Type: text/csv' );
        header( 'Content-Disposition: attachment; filename="mobiris-leads-' . gmdate( 'Y-m-d' ) . '.csv"' );
        $out = fopen( 'php://output', 'w' );
        fputcsv( $out, [ 'Email', 'Resource', 'Date', 'IP' ] );
        foreach ( $leads as $lead ) {
            fputcsv( $out, [ $lead['email'], $lead['resource'], $lead['date'], $lead['ip'] ] );
        }
        fclose( $out );
        exit;
    }

    $leads      = get_option( 'mobiris_email_leads', [] );
    $export_url = wp_nonce_url( admin_url( 'themes.php?page=mobiris-leads&export=1' ), 'mobiris_export_leads' );
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Mobiris Email Leads', 'mobiris-v5' ); ?></h1>
        <p><a href="<?php echo esc_url( $export_url ); ?>" class="button button-primary"><?php esc_html_e( 'Export CSV', 'mobiris-v5' ); ?></a></p>
        <table class="widefat striped">
            <thead><tr><th><?php esc_html_e( 'Email', 'mobiris-v5' ); ?></th><th><?php esc_html_e( 'Resource', 'mobiris-v5' ); ?></th><th><?php esc_html_e( 'Date', 'mobiris-v5' ); ?></th></tr></thead>
            <tbody>
            <?php if ( empty( $leads ) ) : ?>
                <tr><td colspan="3"><?php esc_html_e( 'No leads yet.', 'mobiris-v5' ); ?></td></tr>
            <?php else : ?>
                <?php foreach ( array_reverse( $leads ) as $lead ) : ?>
                    <tr>
                        <td><?php echo esc_html( $lead['email'] ); ?></td>
                        <td><?php echo esc_html( $lead['resource'] ); ?></td>
                        <td><?php echo esc_html( $lead['date'] ); ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
    <?php
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mobiris_build_css_vars( string $brand, string $brand_dark ): string {
    $rgb  = mobiris_hex_to_rgb( $brand );
    $tint = mobiris_lighten_hex( $brand, 0.92 );
    return sprintf( ':root { --brand: %s; --brand-dark: %s; --brand-tint: %s; --brand-rgb: %s; }',
        esc_attr( $brand ), esc_attr( $brand_dark ), esc_attr( $tint ), esc_attr( $rgb ) );
}

function mobiris_hex_to_rgb( string $hex ): string {
    $hex = ltrim( $hex, '#' );
    if ( strlen( $hex ) === 3 ) $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
    return hexdec( substr( $hex, 0, 2 ) ) . ', ' . hexdec( substr( $hex, 2, 2 ) ) . ', ' . hexdec( substr( $hex, 4, 2 ) );
}

function mobiris_lighten_hex( string $hex, float $amount ): string {
    $hex = ltrim( $hex, '#' );
    if ( strlen( $hex ) === 3 ) $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
    $r = (int) round( hexdec( substr( $hex, 0, 2 ) ) * ( 1 - $amount ) + 255 * $amount );
    $g = (int) round( hexdec( substr( $hex, 2, 2 ) ) * ( 1 - $amount ) + 255 * $amount );
    $b = (int) round( hexdec( substr( $hex, 4, 2 ) ) * ( 1 - $amount ) + 255 * $amount );
    return sprintf( '#%02x%02x%02x', $r, $g, $b );
}

function mobiris_whatsapp_url( string $mod_key = 'mobiris_whatsapp_demo_message' ): string {
    $number  = get_theme_mod( 'mobiris_whatsapp_number', '2348053108039' );
    $message = get_theme_mod( $mod_key, "Hi, I'd like to request a demo of Mobiris" );
    return 'https://wa.me/' . rawurlencode( $number ) . '?text=' . rawurlencode( $message );
}

function mobiris_app_url(): string {
    return get_theme_mod( 'mobiris_app_url', 'https://app.mobiris.ng' );
}

function mobiris_get_excerpt( int $limit = 20 ): string {
    $excerpt = get_the_excerpt();
    $words   = explode( ' ', $excerpt );
    if ( count( $words ) > $limit ) {
        $excerpt = implode( ' ', array_slice( $words, 0, $limit ) ) . '…';
    }
    return $excerpt;
}

// ─────────────────────────────────────────────
// Sanitisation helpers
// ─────────────────────────────────────────────
function mobiris_sanitize_text( string $v ): string  { return wp_kses_post( $v ); }
function mobiris_sanitize_url( string $v ): string   { return esc_url_raw( $v ); }
function mobiris_sanitize_checkbox( $v ): bool       { return (bool) $v; }
function mobiris_sanitize_color( string $v ): string {
    return preg_match( '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/', $v ) ? $v : '#2563eb';
}

// ─────────────────────────────────────────────
// Customizer
// ─────────────────────────────────────────────
require get_template_directory() . '/customizer.php';

// ─────────────────────────────────────────────
// Pagination helper
// ─────────────────────────────────────────────
function mobiris_pagination(): void {
    $pages = paginate_links( [
        'type'      => 'array',
        'prev_text' => '← ' . __( 'Previous', 'mobiris-v5' ),
        'next_text' => __( 'Next', 'mobiris-v5' ) . ' →',
    ] );
    if ( ! $pages ) return;
    echo '<nav class="pagination" aria-label="' . esc_attr__( 'Page navigation', 'mobiris-v5' ) . '"><div class="pagination__inner">';
    foreach ( $pages as $page ) {
        echo wp_kses_post( $page );
    }
    echo '</div></nav>';
}

// ─────────────────────────────────────────────
// Tutorial video embed helper
// ─────────────────────────────────────────────
function mobiris_get_video_embed( string $url ): string {
    if ( empty( $url ) ) return '';
    if ( preg_match( '/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_\-]+)/', $url, $m ) ) {
        return '<div class="video-embed"><iframe src="https://www.youtube.com/embed/' . esc_attr( $m[1] ) . '" title="Tutorial video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
    }
    if ( preg_match( '/vimeo\.com\/(\d+)/', $url, $m ) ) {
        return '<div class="video-embed"><iframe src="https://player.vimeo.com/video/' . esc_attr( $m[1] ) . '" title="Tutorial video" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
    }
    return '';
}
