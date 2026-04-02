<?php
$logo_text     = get_theme_mod( 'mobiris_footer_logo_text', 'Mobiris' );
$tagline       = get_theme_mod( 'mobiris_footer_tagline', "Fleet & Driver Operations Platform.\nBuilt for transport operators in Nigeria." );
$domain        = get_theme_mod( 'mobiris_footer_domain', 'mobiris.ng' );
$company       = get_theme_mod( 'mobiris_company_name', 'Growth Figures Limited' );
$copyright_sfx = get_theme_mod( 'mobiris_footer_copyright', 'Growth Figures Limited. All rights reserved.' );
$support_label = get_theme_mod( 'mobiris_footer_support_label', 'Support' );
$app_url       = mobiris_app_url();
$wa_url        = mobiris_whatsapp_url( 'mobiris_whatsapp_demo_message' );

$link1_label  = get_theme_mod( 'mobiris_nav_link1_label',  'How it works' );
$link1_anchor = get_theme_mod( 'mobiris_nav_link1_anchor', '#how-it-works' );
$link2_label  = get_theme_mod( 'mobiris_nav_link2_label',  "Who it's for" );
$link2_anchor = get_theme_mod( 'mobiris_nav_link2_anchor', '#use-cases' );
$signin_label = get_theme_mod( 'mobiris_nav_signin_label', 'Sign in' );
$wa_number    = get_theme_mod( 'mobiris_whatsapp_number', '2348053108039' );
?>

<footer class="footer" role="contentinfo">
    <div class="container">

        <div class="footer__main">
            <!-- Brand -->
            <div class="footer__brand">
                <div class="footer__logo">
                    <div class="footer__logo-mark" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" focusable="false">
                            <path d="M2 12L5 5L8 9L11 6L14 12H2Z" fill="white" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <?php echo esc_html( $logo_text ); ?>
                </div>
                <p class="footer__tagline"><?php echo esc_html( $tagline ); ?></p>
            </div>

            <!-- Nav links -->
            <nav class="footer__nav" aria-label="<?php esc_attr_e( 'Footer', 'mobiris-v3' ); ?>">
                <a href="<?php echo esc_url( $app_url ); ?>"><?php echo esc_html( $signin_label ); ?></a>
                <a href="<?php echo esc_url( $link1_anchor ); ?>"><?php echo esc_html( $link1_label ); ?></a>
                <a href="<?php echo esc_url( $link2_anchor ); ?>"><?php echo esc_html( $link2_label ); ?></a>
                <a href="<?php echo esc_url( $wa_url ); ?>" target="_blank" rel="noopener noreferrer">
                    <?php echo esc_html( $support_label ); ?>
                </a>
            </nav>

            <!-- Contact -->
            <div class="footer__contact">
                <a href="<?php echo esc_url( $wa_url ); ?>" target="_blank" rel="noopener noreferrer">
                    <svg class="footer__wa-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    +<?php echo esc_html( $wa_number ); ?>
                </a>
            </div>
        </div>

        <!-- Bottom bar -->
        <div class="footer__bottom">
            <p>© <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( $copyright_sfx ); ?></p>
            <p><?php echo esc_html( $domain ); ?></p>
        </div>

    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
