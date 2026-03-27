</main><!-- #main-content -->

<footer class="mv2-footer" role="contentinfo">
	<div class="mv2-footer__top">
		<div class="mv2-container mv2-footer__top-inner">

			<!-- Brand Column -->
			<div class="mv2-footer__brand">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="mv2-footer__logo" rel="home">
					<?php if ( has_custom_logo() ) : ?>
						<?php the_custom_logo(); ?>
					<?php else : ?>
						<span class="mv2-logo-text mv2-logo-text--footer">
							<?php echo esc_html( mv2_option( 'company_name', 'Mobiris' ) ); ?>
						</span>
					<?php endif; ?>
				</a>
				<p class="mv2-footer__tagline">
					<span data-lang-en="Mobility Risk Infrastructure" data-lang-fr="Infrastructure de risque de mobilité">Mobility Risk Infrastructure</span>
				</p>
				<p class="mv2-footer__desc">
					<span data-lang-en="Biometric driver verification, remittance tracking, and compliance management for transport operators in Nigeria and West Africa."
					      data-lang-fr="Vérification biométrique des chauffeurs, suivi des remises et gestion de la conformité pour les opérateurs de transport au Nigeria et en Afrique de l'Ouest.">Biometric driver verification, remittance tracking, and compliance management for transport operators in Nigeria and West Africa.</span>
				</p>

				<!-- App Store Badges -->
				<div class="mv2-footer__app-badges">
					<?php
					$ios_url     = mv2_option( 'ios_url', '' );
					$android_url = mv2_option( 'android_url', '' );
					?>
					<div class="mv2-app-badge <?php echo $ios_url ? '' : 'mv2-app-badge--coming-soon'; ?>">
						<?php if ( $ios_url ) : ?>
							<a href="<?php echo esc_url( $ios_url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Download on the App Store', 'mobiris-v2' ); ?>">
								<svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
									<rect width="120" height="40" rx="6" fill="#000"/>
									<text x="35" y="17" font-family="Inter,sans-serif" font-size="8" fill="#fff" font-weight="400">Download on the</text>
									<text x="30" y="29" font-family="Inter,sans-serif" font-size="13" fill="#fff" font-weight="600">App Store</text>
									<text x="12" y="27" font-family="sans-serif" font-size="20" fill="#fff"></text>
								</svg>
							</a>
						<?php else : ?>
							<div class="mv2-app-badge__placeholder">
								<svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
									<rect width="120" height="40" rx="6" fill="#1A2C47"/>
									<text x="25" y="24" font-family="Inter,sans-serif" font-size="10" fill="#8BA0B8">iOS — Coming soon</text>
								</svg>
							</div>
						<?php endif; ?>
					</div>
					<div class="mv2-app-badge <?php echo $android_url ? '' : 'mv2-app-badge--coming-soon'; ?>">
						<?php if ( $android_url ) : ?>
							<a href="<?php echo esc_url( $android_url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Get it on Google Play', 'mobiris-v2' ); ?>">
								<svg width="135" height="40" viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
									<rect width="135" height="40" rx="6" fill="#000"/>
									<text x="38" y="17" font-family="Inter,sans-serif" font-size="8" fill="#fff" font-weight="400">GET IT ON</text>
									<text x="30" y="29" font-family="Inter,sans-serif" font-size="13" fill="#fff" font-weight="600">Google Play</text>
								</svg>
							</a>
						<?php else : ?>
							<div class="mv2-app-badge__placeholder">
								<svg width="135" height="40" viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg">
									<rect width="135" height="40" rx="6" fill="#1A2C47"/>
									<text x="18" y="24" font-family="Inter,sans-serif" font-size="10" fill="#8BA0B8">Android — Coming soon</text>
								</svg>
							</div>
						<?php endif; ?>
					</div>
				</div>
			</div>

			<!-- Footer Nav Columns -->
			<div class="mv2-footer__nav-col">
				<h3 class="mv2-footer__nav-title">
					<span data-lang-en="Product" data-lang-fr="Produit">Product</span>
				</h3>
				<?php
				wp_nav_menu(
					array(
						'theme_location' => 'footer-col-1',
						'menu_class'     => 'mv2-footer__nav-list',
						'container'      => false,
						'fallback_cb'    => false,
						'depth'          => 1,
					)
				);
				?>
			</div>

			<div class="mv2-footer__nav-col">
				<h3 class="mv2-footer__nav-title">
					<span data-lang-en="Company" data-lang-fr="Entreprise">Company</span>
				</h3>
				<?php
				wp_nav_menu(
					array(
						'theme_location' => 'footer-col-2',
						'menu_class'     => 'mv2-footer__nav-list',
						'container'      => false,
						'fallback_cb'    => false,
						'depth'          => 1,
					)
				);
				?>
			</div>

			<div class="mv2-footer__nav-col">
				<h3 class="mv2-footer__nav-title">
					<span data-lang-en="Contact" data-lang-fr="Contact">Contact</span>
				</h3>
				<ul class="mv2-footer__nav-list mv2-footer__contact-list">
					<li>
						<a href="<?php echo esc_url( mv2_wa_url() ); ?>" target="_blank" rel="noopener noreferrer">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
							WhatsApp
						</a>
					</li>
					<li>
						<a href="mailto:hello@mobiris.ng">hello@mobiris.ng</a>
					</li>
					<li>
						<span class="mv2-footer__address">6 Addo-Badore Road, Ajah, Lagos</span>
					</li>
					<li class="mv2-footer__legal-links">
						<?php
						wp_nav_menu(
							array(
								'theme_location' => 'footer-col-3',
								'menu_class'     => 'mv2-footer__legal-list',
								'container'      => false,
								'fallback_cb'    => false,
								'depth'          => 1,
							)
						);
						?>
					</li>
				</ul>
			</div>

		</div>
	</div>

	<!-- Footer Bottom Bar -->
	<div class="mv2-footer__bottom">
		<div class="mv2-container mv2-footer__bottom-inner">
			<p class="mv2-footer__copyright">
				&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?>
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php echo esc_html( mv2_option( 'company_name', 'Mobiris' ) ); ?></a>
				<span data-lang-en=" — Growth Figures Limited (RC1957484). NDPA 2023 compliant."
				      data-lang-fr=" — Growth Figures Limited (RC1957484). Conforme NDPA 2023."> — Growth Figures Limited (RC1957484). NDPA 2023 compliant.</span>
			</p>
			<div class="mv2-footer__trust-badges">
				<span class="mv2-trust-badge">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
					<span data-lang-en="NDPA 2023 Compliant" data-lang-fr="Conforme NDPA 2023">NDPA 2023 Compliant</span>
				</span>
				<span class="mv2-trust-badge">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
					<span data-lang-en="No card required" data-lang-fr="Sans carte bancaire">No card required</span>
				</span>
				<span class="mv2-trust-badge">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
					<span data-lang-en="14-day free trial" data-lang-fr="14 jours d'essai gratuit">14-day free trial</span>
				</span>
			</div>
		</div>
	</div>
</footer>

<!-- Floating WhatsApp Button -->
<?php get_template_part( 'parts/global/whatsapp-float' ); ?>

<?php wp_footer(); ?>
</body>
</html>
