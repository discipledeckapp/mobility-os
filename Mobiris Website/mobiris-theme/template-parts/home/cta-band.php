<?php
/**
 * CTA Band Section Template Part
 *
 * Bottom call-to-action band - final conversion opportunity.
 * Always shown on homepage.
 *
 * @package Mobiris
 * @since 1.0.0
 */

$cta_band_title = get_theme_mod( 'mobiris_cta_band_title', esc_html__( 'Ready to transform your fleet operations?', 'mobiris' ) );
$cta_band_subtitle = get_theme_mod( 'mobiris_cta_band_subtitle', esc_html__( 'Join transport operators across Nigeria, Ghana, and Kenya who trust Mobiris to verify drivers, track remittance, and detect fraud.', 'mobiris' ) );
$cta_band_primary_label = get_theme_mod( 'mobiris_cta_band_primary_label', esc_html__( 'Get Started Free', 'mobiris' ) );
$cta_band_primary_url = get_theme_mod( 'mobiris_cta_band_primary_url', 'https://app.mobiris.ng/signup' );
$cta_band_secondary_label = get_theme_mod( 'mobiris_cta_band_secondary_label', esc_html__( 'Book a Demo', 'mobiris' ) );
$cta_band_secondary_url = get_theme_mod( 'mobiris_cta_band_secondary_url', '' );
$cta_band_style = get_theme_mod( 'mobiris_cta_band_style', 'blue' );
?>

<section class="cta-band cta-band-<?php echo esc_attr( $cta_band_style ); ?>" aria-label="<?php esc_attr_e( 'Call to Action', 'mobiris' ); ?>">
	<div class="container">
		<div class="cta-band-content">
			<?php if ( $cta_band_title ) : ?>
				<h2 class="cta-band-title"><?php echo esc_html( $cta_band_title ); ?></h2>
			<?php endif; ?>

			<?php if ( $cta_band_subtitle ) : ?>
				<p class="cta-band-subtitle"><?php echo esc_html( $cta_band_subtitle ); ?></p>
			<?php endif; ?>

			<div class="cta-band-actions">
				<?php if ( $cta_band_primary_label && $cta_band_primary_url ) : ?>
					<a href="<?php echo esc_url( $cta_band_primary_url ); ?>" class="btn btn-primary btn-lg">
						<?php echo esc_html( $cta_band_primary_label ); ?>
					</a>
				<?php endif; ?>

				<?php if ( $cta_band_secondary_label && $cta_band_secondary_url ) : ?>
					<a href="<?php echo esc_url( $cta_band_secondary_url ); ?>" class="btn btn-secondary btn-lg">
						<?php echo esc_html( $cta_band_secondary_label ); ?>
					</a>
				<?php endif; ?>
			</div>
		</div>
	</div>
</section>
