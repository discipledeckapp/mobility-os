<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<?php
$logo_text  = get_theme_mod( 'mobiris_nav_logo_text', 'Mobiris' );
$app_url    = mobiris_app_url();
$wa_url     = mobiris_whatsapp_url( 'mobiris_whatsapp_demo_message' );

$link1_label  = get_theme_mod( 'mobiris_nav_link1_label',  'How it works' );
$link1_anchor = get_theme_mod( 'mobiris_nav_link1_anchor', '#how-it-works' );
$link2_label  = get_theme_mod( 'mobiris_nav_link2_label',  "Who it's for" );
$link2_anchor = get_theme_mod( 'mobiris_nav_link2_anchor', '#use-cases' );
$link3_label  = get_theme_mod( 'mobiris_nav_link3_label',  'Why trust us' );
$link3_anchor = get_theme_mod( 'mobiris_nav_link3_anchor', '#trust' );
$signin_label = get_theme_mod( 'mobiris_nav_signin_label', 'Sign in' );
$cta_label    = get_theme_mod( 'mobiris_nav_cta_label',    'Request a demo' );
?>

<header class="nav" role="banner">
    <div class="container nav__inner">

        <!-- Logo -->
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="nav__logo" aria-label="<?php echo esc_attr( $logo_text ); ?> — Home">
            <div class="nav__logo-mark" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" focusable="false">
                    <path d="M2 12L5 5L8 9L11 6L14 12H2Z" fill="white" stroke-linejoin="round"/>
                </svg>
            </div>
            <?php echo esc_html( $logo_text ); ?>
        </a>

        <!-- Desktop nav links -->
        <nav class="nav__links" aria-label="<?php esc_attr_e( 'Primary', 'mobiris-v3' ); ?>">
            <a href="<?php echo esc_url( $link1_anchor ); ?>"><?php echo esc_html( $link1_label ); ?></a>
            <a href="<?php echo esc_url( $link2_anchor ); ?>"><?php echo esc_html( $link2_label ); ?></a>
            <a href="<?php echo esc_url( $link3_anchor ); ?>"><?php echo esc_html( $link3_label ); ?></a>
        </nav>

        <!-- Actions -->
        <div class="nav__actions">
            <a href="<?php echo esc_url( $app_url ); ?>" class="nav__signin">
                <?php echo esc_html( $signin_label ); ?>
            </a>
            <a
                href="<?php echo esc_url( $wa_url ); ?>"
                class="btn btn--primary btn--sm"
                target="_blank"
                rel="noopener noreferrer"
            >
                <?php echo esc_html( $cta_label ); ?>
            </a>
        </div>

    </div>
</header>
