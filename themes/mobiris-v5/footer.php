<?php
$logo      = get_theme_mod( 'mobiris_footer_logo_text', 'Mobiris' );
$tagline   = get_theme_mod( 'mobiris_footer_tagline', "Fleet & Driver Operations Platform.\nBuilt for transport operators in Nigeria." );
$domain    = get_theme_mod( 'mobiris_footer_domain', 'mobiris.ng' );
$copyright = get_theme_mod( 'mobiris_footer_copyright', 'Growth Figures Limited. All rights reserved.' );
$app_url   = mobiris_app_url();
$wa_url    = mobiris_whatsapp_url( 'mobiris_whatsapp_demo_message' );
$wa_num    = get_theme_mod( 'mobiris_whatsapp_number', '2348053108039' );
$email     = get_theme_mod( 'mobiris_support_email', 'support@mobiris.ng' );
$addr1     = get_theme_mod( 'mobiris_address_line1', '6, Addo-Badore Road' );
$addr2     = get_theme_mod( 'mobiris_address_line2', 'Ajah, Lagos' );
?>

<?php if ( get_theme_mod( 'mobiris_float_show', true ) ) : ?>
    <?php get_template_part( 'template-parts/global/floating-chat' ); ?>
<?php endif; ?>

<footer class="footer" role="contentinfo">
    <div class="container">
        <div class="footer__grid">

            <!-- Brand -->
            <div class="footer__brand">
                <div class="footer__logo">
                    <div class="footer__logo-mark" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" focusable="false">
                            <path d="M2 12L5 5L8 9L11 6L14 12H2Z" fill="white"/>
                        </svg>
                    </div>
                    <?php echo esc_html( $logo ); ?>
                </div>
                <p class="footer__tagline"><?php echo esc_html( $tagline ); ?></p>
                <!-- App store badges -->
                <div class="footer__app-badges">
                    <?php $ios = get_theme_mod( 'mobiris_app_ios_url', '#' ); $and = get_theme_mod( 'mobiris_app_android_url', '#' ); ?>
                    <?php if ( $ios && $ios !== '#' ) : ?>
                        <a href="<?php echo esc_url( $ios ); ?>" class="footer__badge" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Download on App Store', 'mobiris-v5' ); ?>">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                            <?php esc_html_e( 'App Store', 'mobiris-v5' ); ?>
                        </a>
                    <?php endif; ?>
                    <?php if ( $and && $and !== '#' ) : ?>
                        <a href="<?php echo esc_url( $and ); ?>" class="footer__badge" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Get it on Google Play', 'mobiris-v5' ); ?>">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.18 23.76c.34.19.72.24 1.09.15l12.16-7.02-2.59-2.59-10.66 9.46zm-1.1-1.33c-.07-.2-.08-.42-.08-.65V2.22c0-.23.01-.45.08-.65L13.7 12 2.08 22.43zm19.94-11.16L18.97 9.3l-2.88 2.7 2.88 2.7 3.05-1.97c.87-.5.87-1.71 0-2.21zM4.27.24C3.9.14 3.52.2 3.18.39L13.7 10.98 16.3 8.4 4.27.24z"/></svg>
                            <?php esc_html_e( 'Google Play', 'mobiris-v5' ); ?>
                        </a>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Product links -->
            <div class="footer__col">
                <p class="footer__col-heading"><?php esc_html_e( 'Product', 'mobiris-v5' ); ?></p>
                <ul>
                    <li><a href="<?php echo esc_url( $app_url ); ?>"><?php esc_html_e( 'Sign in', 'mobiris-v5' ); ?></a></li>
                    <li><a href="#how-it-works"><?php esc_html_e( 'How it works', 'mobiris-v5' ); ?></a></li>
                    <li><a href="#use-cases"><?php esc_html_e( "Who it's for", 'mobiris-v5' ); ?></a></li>
                    <li><a href="<?php echo esc_url( get_theme_mod( 'mobiris_app_ios_url', '#' ) ); ?>"><?php esc_html_e( 'iOS App', 'mobiris-v5' ); ?></a></li>
                    <li><a href="<?php echo esc_url( get_theme_mod( 'mobiris_app_android_url', '#' ) ); ?>"><?php esc_html_e( 'Android App', 'mobiris-v5' ); ?></a></li>
                </ul>
            </div>

            <!-- Resources links -->
            <div class="footer__col">
                <p class="footer__col-heading"><?php esc_html_e( 'Resources', 'mobiris-v5' ); ?></p>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/tutorials' ) ); ?>"><?php esc_html_e( 'Tutorials', 'mobiris-v5' ); ?></a></li>
                    <li><a href="<?php echo esc_url( home_url( '/blog' ) ); ?>"><?php esc_html_e( 'Blog', 'mobiris-v5' ); ?></a></li>
                </ul>
            </div>

            <!-- Contact info -->
            <div class="footer__col">
                <p class="footer__col-heading"><?php esc_html_e( 'Contact', 'mobiris-v5' ); ?></p>
                <ul class="footer__contact-list">
                    <li>
                        <a href="mailto:<?php echo esc_attr( $email ); ?>">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            <?php echo esc_html( $email ); ?>
                        </a>
                    </li>
                    <li>
                        <a href="<?php echo esc_url( $wa_url ); ?>" target="_blank" rel="noopener noreferrer">
                            <svg class="footer__wa-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            +<?php echo esc_html( $wa_num ); ?>
                        </a>
                    </li>
                    <li class="footer__address">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <?php echo esc_html( $addr1 ); ?>,<br><?php echo esc_html( $addr2 ); ?>
                    </li>
                </ul>
            </div>

        </div>

        <div class="footer__bottom">
            <p>© <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( $copyright ); ?></p>
            <p><?php echo esc_html( $domain ); ?></p>
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
