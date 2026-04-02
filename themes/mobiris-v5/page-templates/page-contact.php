<?php
/**
 * Template Name: Contact Page
 *
 * @package mobiris-v5
 */
get_header();
$headline         = get_theme_mod( 'mobiris_contact_headline',         "Let's talk." );
$subtext          = get_theme_mod( 'mobiris_contact_subtext',          "Whether you want a demo, have a question, or just want to see how Mobiris can work for your fleet — we're here." );
$calendly_url     = get_theme_mod( 'mobiris_contact_calendly_url',     'https://calendly.com/mobiris' );
$calendly_label   = get_theme_mod( 'mobiris_contact_calendly_label',   'Book a 20-minute demo' );
$calendly_caption = get_theme_mod( 'mobiris_contact_calendly_caption', "Pick a time that works for you. We'll walk through the platform for your specific fleet type." );
$wa_label         = get_theme_mod( 'mobiris_contact_wa_label',         'Chat on WhatsApp' );
$wa_url           = mobiris_whatsapp_url( 'mobiris_contact_wa_message' );
$support_email    = get_theme_mod( 'mobiris_support_email',            'support@mobiris.ng' );
$addr1            = get_theme_mod( 'mobiris_address_line1',            '6, Addo-Badore Road' );
$addr2            = get_theme_mod( 'mobiris_address_line2',            'Ajah, Lagos' );
$addr_country     = get_theme_mod( 'mobiris_address_country',          'Nigeria' );
$hours            = get_theme_mod( 'mobiris_contact_hours',            'Mon – Fri, 9am – 6pm WAT' );
?>
<main id="main" class="contact-page" role="main">

    <!-- Page hero -->
    <div class="page-hero">
        <div class="container--narrow">
            <p class="text-label page-hero__label"><?php esc_html_e( 'Contact', 'mobiris-v5' ); ?></p>
            <h1 class="heading heading--hero"><?php echo esc_html( $headline ); ?></h1>
            <?php if ( $subtext ) : ?><p class="page-hero__sub"><?php echo esc_html( $subtext ); ?></p><?php endif; ?>
        </div>
    </div>

    <div class="container contact-page__body">
        <div class="contact-page__grid">

            <!-- LEFT: Contact form -->
            <div class="contact-page__form-col">
                <div class="contact-form-card">
                    <h2 class="contact-form-card__title"><?php esc_html_e( 'Send us a message', 'mobiris-v5' ); ?></h2>
                    <p class="contact-form-card__sub"><?php esc_html_e( "We'll reply within 24 hours. For faster support, use WhatsApp.", 'mobiris-v5' ); ?></p>

                    <form id="mobiris-contact-form" class="contact-form" novalidate>

                        <div class="contact-form__row contact-form__row--2">
                            <div class="contact-form__group">
                                <label class="contact-form__label" for="cf-name">
                                    <?php esc_html_e( 'Your name', 'mobiris-v5' ); ?>
                                    <span class="contact-form__required" aria-hidden="true">*</span>
                                </label>
                                <input
                                    id="cf-name"
                                    name="name"
                                    type="text"
                                    class="contact-form__input"
                                    placeholder="Oluwaseyi Adelaju"
                                    required
                                    autocomplete="name"
                                >
                            </div>
                            <div class="contact-form__group">
                                <label class="contact-form__label" for="cf-email">
                                    <?php esc_html_e( 'Email address', 'mobiris-v5' ); ?>
                                    <span class="contact-form__required" aria-hidden="true">*</span>
                                </label>
                                <input
                                    id="cf-email"
                                    name="email"
                                    type="email"
                                    class="contact-form__input"
                                    placeholder="you@company.ng"
                                    required
                                    autocomplete="email"
                                >
                            </div>
                        </div>

                        <div class="contact-form__row contact-form__row--2">
                            <div class="contact-form__group">
                                <label class="contact-form__label" for="cf-phone">
                                    <?php esc_html_e( 'Phone / WhatsApp', 'mobiris-v5' ); ?>
                                </label>
                                <input
                                    id="cf-phone"
                                    name="phone"
                                    type="tel"
                                    class="contact-form__input"
                                    placeholder="+234 800 000 0000"
                                    autocomplete="tel"
                                >
                            </div>
                            <div class="contact-form__group">
                                <label class="contact-form__label" for="cf-fleet">
                                    <?php esc_html_e( 'Fleet size', 'mobiris-v5' ); ?>
                                </label>
                                <select id="cf-fleet" name="fleet" class="contact-form__select">
                                    <option value=""><?php esc_html_e( 'Select…', 'mobiris-v5' ); ?></option>
                                    <option value="1-10"><?php esc_html_e( '1–10 vehicles', 'mobiris-v5' ); ?></option>
                                    <option value="11-30"><?php esc_html_e( '11–30 vehicles', 'mobiris-v5' ); ?></option>
                                    <option value="31-100"><?php esc_html_e( '31–100 vehicles', 'mobiris-v5' ); ?></option>
                                    <option value="100+"><?php esc_html_e( '100+ vehicles', 'mobiris-v5' ); ?></option>
                                </select>
                            </div>
                        </div>

                        <div class="contact-form__group">
                            <label class="contact-form__label" for="cf-subject">
                                <?php esc_html_e( 'What can we help with?', 'mobiris-v5' ); ?>
                            </label>
                            <select id="cf-subject" name="subject" class="contact-form__select">
                                <option value=""><?php esc_html_e( 'Select…', 'mobiris-v5' ); ?></option>
                                <option value="Demo request"><?php esc_html_e( 'I want a product demo', 'mobiris-v5' ); ?></option>
                                <option value="Pricing question"><?php esc_html_e( 'Pricing question', 'mobiris-v5' ); ?></option>
                                <option value="Technical support"><?php esc_html_e( 'Technical support', 'mobiris-v5' ); ?></option>
                                <option value="Partnership"><?php esc_html_e( 'Partnership enquiry', 'mobiris-v5' ); ?></option>
                                <option value="Other"><?php esc_html_e( 'Something else', 'mobiris-v5' ); ?></option>
                            </select>
                        </div>

                        <div class="contact-form__group">
                            <label class="contact-form__label" for="cf-message">
                                <?php esc_html_e( 'Message', 'mobiris-v5' ); ?>
                                <span class="contact-form__required" aria-hidden="true">*</span>
                            </label>
                            <textarea
                                id="cf-message"
                                name="message"
                                class="contact-form__textarea"
                                rows="5"
                                placeholder="<?php esc_attr_e( "Tell us about your fleet — how many vehicles, how you currently track remittances, and what you're trying to fix.", 'mobiris-v5' ); ?>"
                                required
                            ></textarea>
                        </div>

                        <div class="contact-form__feedback" id="cf-feedback" role="alert" aria-live="polite" hidden></div>

                        <div class="contact-form__footer">
                            <button type="submit" class="btn btn--primary contact-form__submit" id="cf-submit">
                                <span class="cf-submit-label"><?php esc_html_e( 'Send message', 'mobiris-v5' ); ?></span>
                                <span class="cf-submit-loading" aria-hidden="true" hidden>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cf-spinner"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"/></svg>
                                    <?php esc_html_e( 'Sending…', 'mobiris-v5' ); ?>
                                </span>
                            </button>
                            <p class="contact-form__privacy">
                                <?php esc_html_e( 'We respect your privacy. No spam, ever.', 'mobiris-v5' ); ?>
                            </p>
                        </div>

                        <!-- Success state -->
                        <div class="contact-form__success" id="cf-success" hidden>
                            <div class="contact-form__success-icon" aria-hidden="true">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                            </div>
                            <p class="contact-form__success-msg" id="cf-success-msg"></p>
                            <a href="<?php echo esc_url( $wa_url ); ?>" class="btn btn--outline" target="_blank" rel="noopener noreferrer" id="cf-wa-fallback" hidden>
                                <?php esc_html_e( 'Contact us on WhatsApp instead', 'mobiris-v5' ); ?>
                            </a>
                        </div>

                    </form>
                </div>
            </div>

            <!-- RIGHT: Other contact options + info -->
            <div class="contact-page__info-col">

                <!-- Book a demo -->
                <?php if ( $calendly_url ) : ?>
                <div class="contact-card">
                    <div class="contact-card__icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <h2 class="contact-card__title"><?php echo esc_html( $calendly_label ); ?></h2>
                    <?php if ( $calendly_caption ) : ?><p class="contact-card__caption"><?php echo esc_html( $calendly_caption ); ?></p><?php endif; ?>
                    <a href="<?php echo esc_url( $calendly_url ); ?>" class="btn btn--primary btn--sm" target="_blank" rel="noopener noreferrer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <?php echo esc_html( $calendly_label ); ?>
                    </a>
                </div>
                <?php endif; ?>

                <!-- WhatsApp -->
                <div class="contact-card contact-card--wa">
                    <div class="contact-card__icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </div>
                    <h2 class="contact-card__title"><?php esc_html_e( 'Prefer to chat?', 'mobiris-v5' ); ?></h2>
                    <p class="contact-card__caption"><?php esc_html_e( 'Message us on WhatsApp and we respond within a few hours — usually faster.', 'mobiris-v5' ); ?></p>
                    <a href="<?php echo esc_url( $wa_url ); ?>" class="btn btn--outline btn--sm" target="_blank" rel="noopener noreferrer">
                        <?php echo esc_html( $wa_label ); ?>
                    </a>
                </div>

                <!-- Contact details -->
                <div class="contact-info">
                    <div class="contact-info__item">
                        <div class="contact-info__icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </div>
                        <div>
                            <p class="contact-info__label"><?php esc_html_e( 'Email', 'mobiris-v5' ); ?></p>
                            <a href="mailto:<?php echo esc_attr( $support_email ); ?>" class="contact-info__value"><?php echo esc_html( $support_email ); ?></a>
                        </div>
                    </div>
                    <div class="contact-info__item">
                        <div class="contact-info__icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <div>
                            <p class="contact-info__label"><?php esc_html_e( 'Office', 'mobiris-v5' ); ?></p>
                            <p class="contact-info__value"><?php echo esc_html( $addr1 ); ?>,<br><?php echo esc_html( $addr2 ); ?>,<br><?php echo esc_html( $addr_country ); ?></p>
                        </div>
                    </div>
                    <div class="contact-info__item">
                        <div class="contact-info__icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <div>
                            <p class="contact-info__label"><?php esc_html_e( 'Hours', 'mobiris-v5' ); ?></p>
                            <p class="contact-info__value"><?php echo esc_html( $hours ); ?></p>
                        </div>
                    </div>
                </div>

                <!-- Google Maps -->
                <div class="contact-map">
                    <iframe
                        title="<?php esc_attr_e( 'Mobiris office location', 'mobiris-v5' ); ?>"
                        src="https://maps.google.com/maps?q=6+Addo-Badore+Road+Ajah+Lagos&output=embed"
                        width="100%"
                        height="240"
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
