<?php
/**
 * App Download Section Template Part
 *
 * Displays platform access options (iOS, Android, Web).
 * Conditionally shown via theme customizer setting.
 *
 * @package Mobiris
 * @since 1.0.0
 */

$show_app_section = get_theme_mod( 'mobiris_show_app_section', '1' );

if ( ! $show_app_section ) {
	return;
}

$app_section_title = get_theme_mod( 'mobiris_app_section_title', esc_html__( 'Access Mobiris anywhere', 'mobiris' ) );
$app_section_subtitle = get_theme_mod( 'mobiris_app_section_subtitle', esc_html__( 'Web console, iOS, and Android. Stay connected to your fleet from any device.', 'mobiris' ) );
$app_section_image = get_theme_mod( 'mobiris_app_section_image', '' );

// Mock function to get platform access links
// In a real implementation, this would be defined in functions.php
if ( ! function_exists( 'mobiris_get_platform_access_links' ) ) {
	function mobiris_get_platform_access_links() {
		return array(
			'web_url'     => 'https://app.mobiris.ng',
			'ios_url'     => '',
			'android_url' => '',
		);
	}
}

$access_links = mobiris_get_platform_access_links();
?>

<section class="app-section section" aria-label="<?php esc_attr_e( 'App & Platform Access', 'mobiris' ); ?>">
	<div class="container">
		<div class="app-inner">
			<div class="app-content">
				<?php if ( $app_section_title ) : ?>
					<h2 class="section-title"><?php echo esc_html( $app_section_title ); ?></h2>
				<?php endif; ?>

				<?php if ( $app_section_subtitle ) : ?>
					<p class="app-subtitle"><?php echo esc_html( $app_section_subtitle ); ?></p>
				<?php endif; ?>

				<div class="app-buttons">
					<!-- Web App -->
					<a href="<?php echo esc_url( $access_links['web_url'] ); ?>" class="app-button web-app">
						<span class="app-button-icon" aria-hidden="true">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
								<line x1="2" y1="17" x2="22" y2="17"></line>
								<line x1="6" y1="21" x2="18" y2="21"></line>
							</svg>
						</span>
						<div class="app-button-text">
							<span class="app-button-label"><?php esc_html_e( 'Web App', 'mobiris' ); ?></span>
							<span class="app-button-platform"><?php esc_html_e( 'Open in Browser', 'mobiris' ); ?></span>
						</div>
					</a>

					<!-- iOS App -->
					<a href="<?php echo esc_url( $access_links['ios_url'] ?: '#' ); ?>"
						class="app-button ios-app <?php echo empty( $access_links['ios_url'] ) ? 'coming-soon' : ''; ?>"
						<?php echo empty( $access_links['ios_url'] ) ? 'aria-disabled="true"' : ''; ?>
					>
						<span class="app-button-icon" aria-hidden="true">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M17.5 1.5a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3zm-5 16v3"></path>
								<line x1="9" y1="20.5" x2="15" y2="20.5"></line>
							</svg>
						</span>
						<div class="app-button-text">
							<span class="app-button-label"><?php esc_html_e( 'iPhone', 'mobiris' ); ?></span>
							<span class="app-button-platform">
								<?php echo empty( $access_links['ios_url'] ) ? esc_html__( 'Coming Soon', 'mobiris' ) : esc_html__( 'App Store', 'mobiris' ); ?>
							</span>
						</div>
					</a>

					<!-- Android App -->
					<a href="<?php echo esc_url( $access_links['android_url'] ?: '#' ); ?>"
						class="app-button android-app <?php echo empty( $access_links['android_url'] ) ? 'coming-soon' : ''; ?>"
						<?php echo empty( $access_links['android_url'] ) ? 'aria-disabled="true"' : ''; ?>
					>
						<span class="app-button-icon" aria-hidden="true">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="21 8 21 21 3 21 3 8"></polyline>
								<line x1="7" y1="4" x2="7" y2="8"></line>
								<line x1="17" y1="4" x2="17" y2="8"></line>
								<line x1="9" y1="16" x2="9" y2="19"></line>
								<line x1="15" y1="16" x2="15" y2="19"></line>
							</svg>
						</span>
						<div class="app-button-text">
							<span class="app-button-label"><?php esc_html_e( 'Android', 'mobiris' ); ?></span>
							<span class="app-button-platform">
								<?php echo empty( $access_links['android_url'] ) ? esc_html__( 'Coming Soon', 'mobiris' ) : esc_html__( 'Play Store', 'mobiris' ); ?>
							</span>
						</div>
					</a>
				</div>
			</div>

			<?php if ( $app_section_image ) : ?>
				<div class="app-visual">
					<img src="<?php echo esc_url( $app_section_image ); ?>" alt="<?php esc_attr_e( 'Mobiris mobile app mockup', 'mobiris' ); ?>" />
				</div>
			<?php else : ?>
				<div class="app-visual app-placeholder">
					<!-- Device mockup SVG -->
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 640" width="200" height="400" class="phone-mockup">
						<!-- Phone frame -->
						<defs>
							<filter id="phone-shadow" x="-50%" y="-50%" width="200%" height="200%">
								<feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity="0.15"/>
							</filter>

							<linearGradient id="screen-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
								<stop offset="0%" style="stop-color:#F8FAFC"/>
								<stop offset="100%" style="stop-color:#E2E8F0"/>
							</linearGradient>
						</defs>

						<!-- Phone body -->
						<rect x="20" y="20" width="280" height="600" rx="40" fill="#0F172A" filter="url(#phone-shadow)"/>

						<!-- Screen -->
						<rect x="32" y="52" width="256" height="536" rx="30" fill="url(#screen-gradient)"/>

						<!-- Status bar -->
						<rect x="32" y="52" width="256" height="28" rx="30" fill="#0F172A"/>
						<text x="160" y="71" text-anchor="middle" font-size="10" fill="#FFFFFF" dominant-baseline="middle">
							9:41
						</text>

						<!-- App header -->
						<rect x="32" y="80" width="256" height="60" fill="#2563EB"/>
						<text x="160" y="115" text-anchor="middle" font-size="14" font-weight="bold" fill="#FFFFFF" dominant-baseline="middle">
							Fleet Dashboard
						</text>

						<!-- Content cards -->
						<rect x="48" y="160" width="224" height="80" rx="8" fill="#DBEAFE" stroke="#2563EB" stroke-width="1"/>
						<text x="60" y="180" font-size="9" font-weight="600" fill="#0F172A">
							Active Vehicles
						</text>
						<text x="60" y="200" font-size="16" font-weight="bold" fill="#2563EB">
							42
						</text>

						<rect x="48" y="260" width="224" height="80" rx="8" fill="#DBEAFE" stroke="#2563EB" stroke-width="1"/>
						<text x="60" y="280" font-size="9" font-weight="600" fill="#0F172A">
							Today's Remittance
						</text>
						<text x="60" y="300" font-size="16" font-weight="bold" fill="#2563EB">
							₦750,000
						</text>

						<rect x="48" y="360" width="224" height="80" rx="8" fill="#DBEAFE" stroke="#2563EB" stroke-width="1"/>
						<text x="60" y="380" font-size="9" font-weight="600" fill="#0F172A">
							Alerts
						</text>
						<text x="60" y="400" font-size="13" font-weight="600" fill="#EF4444">
							2 Issues
						</text>

						<!-- Bottom navigation -->
						<rect x="32" y="540" width="256" height="48" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
						<circle cx="80" cy="564" r="6" fill="#2563EB"/>
						<circle cx="160" cy="564" r="4" fill="#CBD5E1"/>
						<circle cx="240" cy="564" r="4" fill="#CBD5E1"/>

						<!-- Notch -->
						<rect x="125" y="20" width="70" height="20" rx="0" fill="#0F172A"/>
					</svg>
				</div>
			<?php endif; ?>
		</div>
	</div>
</section>
