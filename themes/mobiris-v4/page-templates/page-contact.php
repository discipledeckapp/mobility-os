<?php
/**
 * Template Name: Contact Page
 *
 * @package mobiris-v4
 */
get_header();
$headline         = get_theme_mod( 'mobiris_contact_headline',         "Let's talk." );
$subtext          = get_theme_mod( 'mobiris_contact_subtext',          "Whether you want a demo, have a question, or just want to see how Mobiris can work for your fleet — we're here." );
$calendly_url     = get_theme_mod( 'mobiris_contact_calendly_url',     'https://calendly.com/mobiris' );
$calendly_label   = get_theme_mod( 'mobiris_contact_calendly_label',   'Book a 20-minute demo' );
$calendly_caption = get_theme_mod( 'mobiris_contact_calendly_caption', "Pick a time that works for you. We'll show you exactly how Mobiris works for your fleet." );
$wa_label         = get_theme_mod( 'mobiris_contact_wa_label',         'Chat with us on WhatsApp' );
$wa_url           = mobiris_whatsapp_url( 'mobiris_contact_wa_message' );
$email_label      = get_theme_mod( 'mobiris_contact_email_label',      'Email support' );
$support_email    = get_theme_mod( 'mobiris_support_email',            'support@mobiris.ng' );
$addr_label       = get_theme_mod( 'mobiris_contact_address_label',    'Our office' );
$addr1            = get_theme_mod( 'mobiris_address_line1',            '6, Addo-Badore Road' );
$addr2            = get_theme_mod( 'mobiris_address_line2',            'Ajah, Lagos' );
$addr_country     = get_theme_mod( 'mobiris_address_country',          'Nigeria' );
$hours_label      = get_theme_mod( 'mobiris_contact_hours_label',      'Office hours' );
$hours            = get_theme_mod( 'mobiris_contact_hours',            'Mon – Fri, 9am – 6pm WAT' );
?>
<main id="main" class="contact-page" role="main">

    <!-- Page hero -->
    <div class="page-hero">
        <div class="container--narrow">
            <p class="text-label page-hero__label"><?php esc_html_e( 'Contact', 'mobiris-v4' ); ?></p>
            <h1 class="heading heading--hero"><?php echo esc_html( $headline ); ?></h1>
            <?php if ( $subtext ) : ?><p class="page-hero__sub"><?php echo esc_html( $subtext ); ?></p><?php endif; ?>
        </div>
    </div>

    <div class="container contact-page__body">
        <div class="contact-page__grid">

            <!-- LEFT: Calendly booking -->
            <div class="contact-page__calendly">
                <div class="contact-card">
                    <div class="contact-card__icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <h2 class="contact-card__title"><?php echo esc_html( $calendly_label ); ?></h2>
                    <?php if ( $calendly_caption ) : ?><p class="contact-card__caption"><?php echo esc_html( $calendly_caption ); ?></p><?php endif; ?>
                    <a
                        href="<?php echo esc_url( $calendly_url ); ?>"
                        class="btn btn--primary"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <?php echo esc_html( $calendly_label ); ?>
                    </a>
                    <!-- Inline Calendly embed (loads only when user clicks — handled in JS to keep perf) -->
                    <div class="contact-calendly-embed" data-calendly-url="<?php echo esc_url( $calendly_url ); ?>" hidden></div>
                </div>

                <!-- WhatsApp option -->
                <div class="contact-card contact-card--wa">
                    <div class="contact-card__icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" class="contact-card__wa-svg" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </div>
                    <h2 class="contact-card__title"><?php esc_html_e( 'Prefer to chat?', 'mobiris-v4' ); ?></h2>
                    <p class="contact-card__caption"><?php esc_html_e( 'Send us a message on WhatsApp and we will respond within a few hours.', 'mobiris-v4' ); ?></p>
                    <a href="<?php echo esc_url( $wa_url ); ?>" class="btn btn--outline" target="_blank" rel="noopener noreferrer">
                        <?php echo esc_html( $wa_label ); ?>
                    </a>
                </div>
            </div>

            <!-- RIGHT: Contact info -->
            <div class="contact-page__info">
                <div class="contact-info">
                    <div class="contact-info__item">
                        <div class="contact-info__icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </div>
                        <div>
                            <p class="contact-info__label"><?php echo esc_html( $email_label ); ?></p>
                            <a href="mailto:<?php echo esc_attr( $support_email ); ?>" class="contact-info__value"><?php echo esc_html( $support_email ); ?></a>
                        </div>
                    </div>
                    <div class="contact-info__item">
                        <div class="contact-info__icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <div>
                            <p class="contact-info__label"><?php echo esc_html( $addr_label ); ?></p>
                            <p class="contact-info__value"><?php echo esc_html( $addr1 ); ?>,<br><?php echo esc_html( $addr2 ); ?>,<br><?php echo esc_html( $addr_country ); ?></p>
                        </div>
                    </div>
                    <div class="contact-info__item">
                        <div class="contact-info__icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <div>
                            <p class="contact-info__label"><?php echo esc_html( $hours_label ); ?></p>
                            <p class="contact-info__value"><?php echo esc_html( $hours ); ?></p>
                        </div>
                    </div>
                </div>
                <!-- Google Maps embed placeholder -->
                <div class="contact-map">
                    <iframe
                        title="<?php esc_attr_e( 'Mobiris office location', 'mobiris-v4' ); ?>"
                        src="https://maps.google.com/maps?q=6+Addo-Badore+Road+Ajah+Lagos&output=embed"
                        width="100%"
                        height="260"
                        style="border:0;"
                        allowfullscreen=""
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>

        </div>
    </div>
</main>
<?php get_footer();
