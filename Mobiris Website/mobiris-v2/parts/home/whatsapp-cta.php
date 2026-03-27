<?php
/**
 * Homepage: WhatsApp Conversion Block — 3 pre-filled message buttons.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$wa_number  = preg_replace( '/\D/', '', mv2_option( 'whatsapp_number', '2348053108039' ) );
$msg_ops    = mv2_option( 'wa_msg_operators', 'I want to reduce leakage in my transport business' );
$msg_start  = mv2_option( 'wa_msg_starters', 'I want to start a keke business properly' );
$msg_invest = mv2_option( 'wa_msg_investors', 'I want to see how Mobiris works for investors' );

$wa_base = 'https://wa.me/' . $wa_number . '?text=';
?>
<section class="mv2-section mv2-whatsapp-cta" id="mv2-whatsapp-cta" aria-label="<?php esc_attr_e( 'WhatsApp CTA', 'mobiris-v2' ); ?>">
	<div class="mv2-container">

		<div class="mv2-wa-cta-inner">
			<!-- WhatsApp Icon -->
			<div class="mv2-wa-cta__icon" aria-hidden="true">
				<svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
			</div>

			<h2 class="mv2-wa-cta__title">
				<span data-lang-en="Prefer to start on WhatsApp?" data-lang-fr="Vous préférez commencer sur WhatsApp ?">Prefer to start on WhatsApp?</span>
			</h2>
			<p class="mv2-wa-cta__subtitle">
				<span data-lang-en="Tell us what you need. Select the message that matches your situation — we'll reply within a few hours."
				      data-lang-fr="Dites-nous ce dont vous avez besoin. Sélectionnez le message qui correspond à votre situation — nous répondrons dans quelques heures.">
					Tell us what you need. Select the message that matches your situation — we'll reply within a few hours.
				</span>
			</p>

			<!-- 3 Pre-filled Message Buttons -->
			<div class="mv2-wa-messages">

				<a href="<?php echo esc_url( $wa_base . rawurlencode( $msg_ops ) ); ?>"
				   class="mv2-wa-message-btn"
				   target="_blank"
				   rel="noopener noreferrer"
				   aria-label="<?php echo esc_attr( $msg_ops ); ?>">
					<div class="mv2-wa-message-btn__icon" aria-hidden="true">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
					</div>
					<div class="mv2-wa-message-btn__content">
						<div class="mv2-wa-message-btn__label">
							<span data-lang-en="For fleet operators" data-lang-fr="Pour les opérateurs de flotte">For fleet operators</span>
						</div>
						<div class="mv2-wa-message-btn__text">
							"<span data-lang-en="<?php echo esc_html( $msg_ops ); ?>" data-lang-fr="Je veux réduire les pertes dans mon activité de transport"><?php echo esc_html( $msg_ops ); ?></span>"
						</div>
					</div>
					<div class="mv2-wa-message-btn__arrow" aria-hidden="true">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
					</div>
				</a>

				<a href="<?php echo esc_url( $wa_base . rawurlencode( $msg_start ) ); ?>"
				   class="mv2-wa-message-btn"
				   target="_blank"
				   rel="noopener noreferrer"
				   aria-label="<?php echo esc_attr( $msg_start ); ?>">
					<div class="mv2-wa-message-btn__icon" aria-hidden="true">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
					</div>
					<div class="mv2-wa-message-btn__content">
						<div class="mv2-wa-message-btn__label">
							<span data-lang-en="For new operators" data-lang-fr="Pour les nouveaux opérateurs">For new operators</span>
						</div>
						<div class="mv2-wa-message-btn__text">
							"<span data-lang-en="<?php echo esc_html( $msg_start ); ?>" data-lang-fr="Je veux démarrer correctement une activité de keke"><?php echo esc_html( $msg_start ); ?></span>"
						</div>
					</div>
					<div class="mv2-wa-message-btn__arrow" aria-hidden="true">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
					</div>
				</a>

				<a href="<?php echo esc_url( $wa_base . rawurlencode( $msg_invest ) ); ?>"
				   class="mv2-wa-message-btn"
				   target="_blank"
				   rel="noopener noreferrer"
				   aria-label="<?php echo esc_attr( $msg_invest ); ?>">
					<div class="mv2-wa-message-btn__icon" aria-hidden="true">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
					</div>
					<div class="mv2-wa-message-btn__content">
						<div class="mv2-wa-message-btn__label">
							<span data-lang-en="For investors" data-lang-fr="Pour les investisseurs">For investors</span>
						</div>
						<div class="mv2-wa-message-btn__text">
							"<span data-lang-en="<?php echo esc_html( $msg_invest ); ?>" data-lang-fr="Je veux voir comment Mobiris fonctionne pour les investisseurs"><?php echo esc_html( $msg_invest ); ?></span>"
						</div>
					</div>
					<div class="mv2-wa-message-btn__arrow" aria-hidden="true">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
					</div>
				</a>

			</div><!-- .mv2-wa-messages -->

			<p class="mv2-wa-cta__note">
				<span data-lang-en="Or email us at " data-lang-fr="Ou envoyez-nous un email à ">Or email us at </span>
				<a href="mailto:hello@mobiris.ng">hello@mobiris.ng</a>
			</p>
		</div>

	</div>
</section>
