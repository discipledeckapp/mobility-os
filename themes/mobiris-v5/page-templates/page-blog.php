<?php
/**
 * Template Name: Blog
 *
 * Standalone blog archive template. Assign this to any WordPress page
 * to display the blog — no need to configure Settings > Reading.
 *
 * @package mobiris-v5
 */
get_header();

$blog_headline = get_theme_mod( 'mobiris_blog_headline', 'Fleet operations insights' );
$blog_subtext  = get_theme_mod( 'mobiris_blog_subtext',  'Practical tips, operator stories, and product updates from the Mobiris team.' );
$posts_per_page = (int) get_theme_mod( 'mobiris_blog_posts_per_page', 9 );

$paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;

$query = new WP_Query( [
    'post_type'      => 'post',
    'post_status'    => 'publish',
    'posts_per_page' => $posts_per_page,
    'paged'          => $paged,
    'orderby'        => 'date',
    'order'          => 'DESC',
] );
?>
<main id="main" class="blog-archive" role="main">
    <div class="page-hero page-hero--light">
        <div class="container--narrow">
            <p class="text-label page-hero__label"><?php esc_html_e( 'Blog', 'mobiris-v5' ); ?></p>
            <h1 class="heading heading--h2"><?php echo esc_html( $blog_headline ); ?></h1>
            <?php if ( $blog_subtext ) : ?><p class="page-hero__sub"><?php echo esc_html( $blog_subtext ); ?></p><?php endif; ?>
        </div>
    </div>
    <div class="container blog-archive__content">
        <?php if ( $query->have_posts() ) : ?>
            <div class="post-grid">
                <?php while ( $query->have_posts() ) : $query->the_post(); ?>
                    <?php get_template_part( 'template-parts/blog/post-card' ); ?>
                <?php endwhile; ?>
            </div>
            <?php
            // Pagination for this custom query
            $big = 999999999;
            $pages = paginate_links( [
                'base'    => str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) ),
                'format'  => '?paged=%#%',
                'current' => max( 1, $paged ),
                'total'   => $query->max_num_pages,
                'type'    => 'array',
                'prev_text' => '← ' . __( 'Previous', 'mobiris-v5' ),
                'next_text' => __( 'Next', 'mobiris-v5' ) . ' →',
            ] );
            if ( $pages ) {
                echo '<nav class="pagination" aria-label="' . esc_attr__( 'Page navigation', 'mobiris-v5' ) . '"><div class="pagination__inner">';
                foreach ( $pages as $page ) echo wp_kses_post( $page );
                echo '</div></nav>';
            }
            wp_reset_postdata();
            ?>
        <?php else : ?>
            <p class="empty-state"><?php esc_html_e( 'No posts yet. Check back soon.', 'mobiris-v5' ); ?></p>
        <?php endif; ?>
    </div>
</main>
<?php get_footer();
