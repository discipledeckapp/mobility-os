<?php
/**
 * Statistics Section Template Part
 *
 * Displays key platform metrics and statistics.
 * Conditionally shown via theme customizer setting.
 *
 * @package Mobiris
 * @since 1.0.0
 */

$show_stats = get_theme_mod( 'mobiris_show_stats', '1' );

if ( ! $show_stats ) {
	return;
}

// Retrieve stats from customizer
$stats = array();
for ( $i = 1; $i <= 4; $i++ ) {
	$value = get_theme_mod( "mobiris_stat_{$i}_value", '' );
	$label = get_theme_mod( "mobiris_stat_{$i}_label", '' );

	if ( $value && $label ) {
		$stats[] = array(
			'value' => $value,
			'label' => $label,
		);
	}
}

// If no stats configured, show defaults
if ( empty( $stats ) ) {
	$stats = array(
		array(
			'value' => '5,000+',
			'label' => 'Drivers Verified',
		),
		array(
			'value' => '₦2B+',
			'label' => 'Remittance Tracked',
		),
		array(
			'value' => '98%',
			'label' => 'Platform Uptime',
		),
		array(
			'value' => '15+',
			'label' => 'Operating Companies',
		),
	);
}
?>

<section class="stats-section section-sm" aria-label="<?php esc_attr_e( 'Platform statistics', 'mobiris' ); ?>">
	<div class="container">
		<div class="stats-grid">
			<?php foreach ( $stats as $stat ) : ?>
				<div class="stat-item">
					<span class="stat-value"><?php echo esc_html( $stat['value'] ); ?></span>
					<span class="stat-label"><?php echo esc_html( $stat['label'] ); ?></span>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</section>
