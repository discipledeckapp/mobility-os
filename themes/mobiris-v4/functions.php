<?php
/**
 * Mobiris v4 — Theme Functions
 *
 * @package mobiris-v4
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
        'primary' => __( 'Primary Navigation', 'mobiris-v4' ),
        'footer'  => __( 'Footer Navigation', 'mobiris-v4' ),
    ] );
}
add_action( 'after_setup_theme', 'mobiris_setup' );

// ─────────────────────────────────────────────
// Custom Post Type: Tutorial
// ─────────────────────────────────────────────
function mobiris_register_cpts(): void {
    register_post_type( 'mobiris_tutorial', [
        'labels' => [
            'name'               => __( 'Tutorials', 'mobiris-v4' ),
            'singular_name'      => __( 'Tutorial', 'mobiris-v4' ),
            'add_new_item'       => __( 'Add New Tutorial', 'mobiris-v4' ),
            'edit_item'          => __( 'Edit Tutorial', 'mobiris-v4' ),
            'new_item'           => __( 'New Tutorial', 'mobiris-v4' ),
            'view_item'          => __( 'View Tutorial', 'mobiris-v4' ),
            'search_items'       => __( 'Search Tutorials', 'mobiris-v4' ),
            'not_found'          => __( 'No tutorials found', 'mobiris-v4' ),
            'not_found_in_trash' => __( 'No tutorials found in trash', 'mobiris-v4' ),
            'menu_name'          => __( 'Tutorials', 'mobiris-v4' ),
        ],
        'public'            => true,
        'has_archive'       => 'tutorials',
        'rewrite'           => [ 'slug' => 'tutorials' ],
        'supports'          => [ 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ],
        'menu_icon'         => 'dashicons-book-alt',
        'show_in_rest'      => true,
    ] );

    register_taxonomy( 'tutorial_category', 'mobiris_tutorial', [
        'labels' => [
            'name'          => __( 'Tutorial Categories', 'mobiris-v4' ),
            'singular_name' => __( 'Tutorial Category', 'mobiris-v4' ),
            'add_new_item'  => __( 'Add New Category', 'mobiris-v4' ),
            'edit_item'     => __( 'Edit Category', 'mobiris-v4' ),
        ],
        'hierarchical'  => true,
        'public'        => true,
        'rewrite'       => [ 'slug' => 'tutorial-category' ],
        'show_in_rest'  => true,
    ] );
}
add_action( 'init', 'mobiris_register_cpts' );

// ─────────────────────────────────────────────
// Flush rewrite rules on theme activation
// ─────────────────────────────────────────────
add_action( 'after_switch_theme', function() {
    mobiris_register_cpts();
    flush_rewrite_rules();
} );

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

    // Gated content JS — only load when a gated section exists on the page
    if ( is_front_page() || is_page_template( 'page-templates/page-contact.php' ) ) {
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
}
add_action( 'wp_enqueue_scripts', 'mobiris_enqueue_assets' );

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
        wp_send_json_error( [ 'message' => __( 'Please enter a valid email address.', 'mobiris-v4' ) ] );
    }

    // Store in WP options as a simple list (operators can also connect Mailchimp / ConvertKit via hooks)
    $leads = get_option( 'mobiris_email_leads', [] );
    $leads[] = [
        'email'    => $email,
        'resource' => $resource,
        'date'     => gmdate( 'Y-m-d H:i:s' ),
        'ip'       => sanitize_text_field( $_SERVER['REMOTE_ADDR'] ?? '' ),
    ];
    update_option( 'mobiris_email_leads', $leads );

    // Allow third-party plugins (Mailchimp for WP etc.) to hook in
    do_action( 'mobiris_email_captured', $email, $resource );

    $download_url = get_theme_mod( 'mobiris_gated_download_url', '' );

    wp_send_json_success( [
        'message'      => __( 'Thanks! Your download is ready.', 'mobiris-v4' ),
        'downloadUrl'  => esc_url( $download_url ),
        'downloadLabel' => get_theme_mod( 'mobiris_gated_download_label', 'Download Now' ),
    ] );
}

// ─────────────────────────────────────────────
// Export leads as CSV (admin only)
// ─────────────────────────────────────────────
add_action( 'admin_menu', function() {
    add_submenu_page(
        'themes.php',
        __( 'Mobiris Email Leads', 'mobiris-v4' ),
        __( 'Email Leads', 'mobiris-v4' ),
        'manage_options',
        'mobiris-leads',
        'mobiris_leads_page'
    );
} );

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

    $leads = get_option( 'mobiris_email_leads', [] );
    $export_url = wp_nonce_url( admin_url( 'themes.php?page=mobiris-leads&export=1' ), 'mobiris_export_leads' );
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Mobiris Email Leads', 'mobiris-v4' ); ?></h1>
        <p><a href="<?php echo esc_url( $export_url ); ?>" class="button button-primary"><?php esc_html_e( 'Export CSV', 'mobiris-v4' ); ?></a></p>
        <table class="widefat striped">
            <thead><tr><th><?php esc_html_e( 'Email', 'mobiris-v4' ); ?></th><th><?php esc_html_e( 'Resource', 'mobiris-v4' ); ?></th><th><?php esc_html_e( 'Date', 'mobiris-v4' ); ?></th></tr></thead>
            <tbody>
            <?php if ( empty( $leads ) ) : ?>
                <tr><td colspan="3"><?php esc_html_e( 'No leads yet.', 'mobiris-v4' ); ?></td></tr>
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
        'prev_text' => '← ' . __( 'Previous', 'mobiris-v4' ),
        'next_text' => __( 'Next', 'mobiris-v4' ) . ' →',
    ] );
    if ( ! $pages ) return;
    echo '<nav class="pagination" aria-label="' . esc_attr__( 'Page navigation', 'mobiris-v4' ) . '"><div class="pagination__inner">';
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
    // YouTube
    if ( preg_match( '/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_\-]+)/', $url, $m ) ) {
        return '<div class="video-embed"><iframe src="https://www.youtube.com/embed/' . esc_attr( $m[1] ) . '" title="Tutorial video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
    }
    // Vimeo
    if ( preg_match( '/vimeo\.com\/(\d+)/', $url, $m ) ) {
        return '<div class="video-embed"><iframe src="https://player.vimeo.com/video/' . esc_attr( $m[1] ) . '" title="Tutorial video" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
    }
    return '';
}
