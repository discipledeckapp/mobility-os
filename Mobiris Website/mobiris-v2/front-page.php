<?php
/**
 * Front page template — calls all homepage parts in order.
 *
 * @package mobiris-v2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

// Section visibility helpers.
$show = array(
	'profit_opportunity' => mv2_option( 'show_profit_opportunity', true ),
	'leakage_exposure'   => mv2_option( 'show_leakage_exposure', true ),
	'pain_amplification' => mv2_option( 'show_pain_amplification', true ),
	'product_intro'      => mv2_option( 'show_product_intro', true ),
	'how_it_works'       => mv2_option( 'show_how_it_works', true ),
	'before_after'       => mv2_option( 'show_before_after', true ),
	'calculator'         => mv2_option( 'show_calculator', true ),
	'use_cases'          => mv2_option( 'show_use_cases', true ),
	'lead_capture'       => mv2_option( 'show_lead_capture', true ),
	'whatsapp_cta'       => mv2_option( 'show_whatsapp_cta', true ),
	'pricing'            => mv2_option( 'show_pricing', true ),
	'final_cta'          => mv2_option( 'show_final_cta', true ),
);

// Hero — always shown.
get_template_part( 'parts/home/hero' );

if ( $show['profit_opportunity'] ) {
	get_template_part( 'parts/home/profit-opportunity' );
}

if ( $show['leakage_exposure'] ) {
	get_template_part( 'parts/home/leakage-exposure' );
}

if ( $show['pain_amplification'] ) {
	get_template_part( 'parts/home/pain-amplification' );
}

if ( $show['product_intro'] ) {
	get_template_part( 'parts/home/product-intro' );
}

if ( $show['how_it_works'] ) {
	get_template_part( 'parts/home/how-it-works' );
}

if ( $show['before_after'] ) {
	get_template_part( 'parts/home/before-after' );
}

if ( $show['calculator'] ) {
	get_template_part( 'parts/home/calculator' );
}

if ( $show['use_cases'] ) {
	get_template_part( 'parts/home/use-cases' );
}

if ( $show['pricing'] ) {
	get_template_part( 'parts/home/pricing' );
}

if ( $show['lead_capture'] ) {
	get_template_part( 'parts/home/lead-capture' );
}

if ( $show['whatsapp_cta'] ) {
	get_template_part( 'parts/home/whatsapp-cta' );
}

if ( $show['final_cta'] ) {
	get_template_part( 'parts/home/final-cta' );
}

get_footer();
