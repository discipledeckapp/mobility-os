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
$logo     = get_theme_mod( 'mobiris_nav_logo_text', 'Mobiris' );
$app_url  = mobiris_app_url();
$wa_url   = mobiris_whatsapp_url( 'mobiris_whatsapp_demo_message' );
$signin   = get_theme_mod( 'mobiris_nav_signin_label', 'Sign in' );
$cta      = get_theme_mod( 'mobiris_nav_cta_label', 'Get started' );
$links = [
    [ get_theme_mod( 'mobiris_nav_link1_label', 'Product' ),    get_theme_mod( 'mobiris_nav_link1_anchor', '#how-it-works' ) ],
    [ get_theme_mod( 'mobiris_nav_link2_label', 'Tutorials' ),  get_theme_mod( 'mobiris_nav_link2_anchor', '/tutorials' ) ],
    [ get_theme_mod( 'mobiris_nav_link3_label', 'Blog' ),       get_theme_mod( 'mobiris_nav_link3_anchor', '/blog' ) ],
    [ get_theme_mod( 'mobiris_nav_link4_label', 'Contact' ),    get_theme_mod( 'mobiris_nav_link4_anchor', '/contact' ) ],
];
?>

<header class="nav" role="banner">
    <div class="container nav__inner">

        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="nav__logo" aria-label="<?php echo esc_attr( $logo ); ?> — Home">
            <div class="nav__logo-mark" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" focusable="false">
                    <path d="M2 12L5 5L8 9L11 6L14 12H2Z" fill="white"/>
                </svg>
            </div>
            <?php echo esc_html( $logo ); ?>
        </a>

        <nav class="nav__links" aria-label="<?php esc_attr_e( 'Primary', 'mobiris-v5' ); ?>">
            <?php foreach ( $links as $link ) : ?>
                <a href="<?php echo esc_url( $link[1] ); ?>" <?php echo ( strpos( $link[1], '#' ) !== 0 && get_permalink() === home_url( rtrim( $link[1], '/' ) . '/' ) ) ? 'aria-current="page"' : ''; ?>>
                    <?php echo esc_html( $link[0] ); ?>
                </a>
            <?php endforeach; ?>
        </nav>

        <!-- Mobile hamburger -->
        <button class="nav__hamburger" aria-label="<?php esc_attr_e( 'Toggle menu', 'mobiris-v5' ); ?>" aria-expanded="false" aria-controls="mobile-menu">
            <span></span><span></span><span></span>
        </button>

        <div class="nav__actions">
            <a href="<?php echo esc_url( $app_url ); ?>" class="nav__signin"><?php echo esc_html( $signin ); ?></a>
            <a href="<?php echo esc_url( $app_url ); ?>" class="btn btn--primary btn--sm"><?php echo esc_html( $cta ); ?></a>
        </div>

    </div>

    <!-- Mobile drawer -->
    <div id="mobile-menu" class="nav__mobile" aria-hidden="true">
        <nav class="nav__mobile-links">
            <?php foreach ( $links as $link ) : ?>
                <a href="<?php echo esc_url( $link[1] ); ?>"><?php echo esc_html( $link[0] ); ?></a>
            <?php endforeach; ?>
            <a href="<?php echo esc_url( $app_url ); ?>"><?php echo esc_html( $signin ); ?></a>
        </nav>
        <div class="nav__mobile-cta">
            <a href="<?php echo esc_url( $wa_url ); ?>" class="btn btn--primary" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $cta ); ?></a>
        </div>
    </div>
</header>
