<?php
get_header();
$headline = get_theme_mod( 'mobiris_tutorials_headline', 'Learn how to use Mobiris' );
$subtext  = get_theme_mod( 'mobiris_tutorials_subtext',  'Step-by-step guides and video walkthroughs. Get up and running — and get the most out of your fleet operations platform.' );
$empty    = get_theme_mod( 'mobiris_tutorials_empty_text', 'Tutorials are coming soon. Check back shortly.' );
// Get all categories for filter tabs
$tut_cats = get_terms( [ 'taxonomy' => 'tutorial_category', 'hide_empty' => true ] );
$active_cat = get_query_var( 'tutorial_category' );
?>
<main id="main" class="tutorials-archive" role="main">
    <div class="page-hero">
        <div class="container--narrow">
            <p class="text-label page-hero__label"><?php esc_html_e( 'Tutorials', 'mobiris-v4' ); ?></p>
            <h1 class="heading heading--h2"><?php echo esc_html( $headline ); ?></h1>
            <?php if ( $subtext ) : ?><p class="page-hero__sub"><?php echo esc_html( $subtext ); ?></p><?php endif; ?>
        </div>
    </div>
    <div class="container tutorials-archive__content">
        <?php if ( ! empty( $tut_cats ) && ! is_wp_error( $tut_cats ) ) : ?>
            <div class="tutorials-filter" role="tablist" aria-label="<?php esc_attr_e( 'Filter tutorials', 'mobiris-v4' ); ?>">
                <a href="<?php echo esc_url( get_post_type_archive_link( 'mobiris_tutorial' ) ); ?>" class="tutorials-filter__btn <?php echo ! $active_cat ? 'tutorials-filter__btn--active' : ''; ?>">
                    <?php esc_html_e( 'All', 'mobiris-v4' ); ?>
                </a>
                <?php foreach ( $tut_cats as $cat ) : ?>
                    <a href="<?php echo esc_url( get_term_link( $cat ) ); ?>" class="tutorials-filter__btn <?php echo ( $active_cat === $cat->slug ) ? 'tutorials-filter__btn--active' : ''; ?>">
                        <?php echo esc_html( $cat->name ); ?>
                    </a>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
        <?php if ( have_posts() ) : ?>
            <div class="tutorials-grid">
                <?php while ( have_posts() ) : the_post(); get_template_part( 'template-parts/tutorials/tutorial-card' ); endwhile; ?>
            </div>
            <?php mobiris_pagination(); ?>
        <?php else : ?>
            <p class="empty-state"><?php echo esc_html( $empty ); ?></p>
        <?php endif; ?>
    </div>
</main>
<?php get_footer();
