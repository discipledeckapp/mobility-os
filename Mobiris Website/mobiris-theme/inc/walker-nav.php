<?php
/**
 * Custom Navigation Walker
 * Supports dropdown menus with accessible keyboard navigation.
 *
 * @package Mobiris
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Custom Walker_Nav_Menu class for enhanced dropdown accessibility.
 *
 * Adds:
 * - has-dropdown class to items with children
 * - Accessible dropdown toggle button with SVG chevron
 * - aria-haspopup and aria-expanded attributes
 * - role="menuitem" attributes on anchors
 * - Keyboard navigation support (arrow keys, Enter, Escape)
 *
 * @extends Walker_Nav_Menu
 */
class Mobiris_Walker_Nav_Menu extends Walker_Nav_Menu {

	/**
	 * Starts the list before the items.
	 *
	 * @param string $output Passed by reference. Used to append additional content.
	 * @param int    $depth  Depth of menu. Used for formatting.
	 * @param stdClass $args An object containing wp_nav_menu() arguments.
	 * @return void
	 */
	public function start_lvl( &$output, $depth = 0, $args = null ) {
		if ( isset( $args->item_spacing ) && 'discard' === $args->item_spacing ) {
			$indent = '';
		} else {
			$indent = str_repeat( "\t", $depth + 1 );
		}

		// Wrap child UL in a dropdown wrapper div for CSS animations.
		$output .= "\n" . $indent . '<div class="dropdown-wrapper" role="region">' . "\n";
		$output .= $indent . '<ul class="sub-menu" role="menu">' . "\n";
	}

	/**
	 * Ends the list of after the items.
	 *
	 * @param string $output Passed by reference. Used to append additional content.
	 * @param int    $depth  Depth of menu. Used for formatting.
	 * @param stdClass $args An object containing wp_nav_menu() arguments.
	 * @return void
	 */
	public function end_lvl( &$output, $depth = 0, $args = null ) {
		if ( isset( $args->item_spacing ) && 'discard' === $args->item_spacing ) {
			$indent = '';
		} else {
			$indent = str_repeat( "\t", $depth + 1 );
		}

		$output .= $indent . '</ul>' . "\n";
		$output .= $indent . '</div>' . "\n"; // Close dropdown wrapper.
	}

	/**
	 * Starts the element output.
	 *
	 * @param string   $output            Passed by reference. Used to append additional content.
	 * @param WP_Post  $data_object       The data object.
	 * @param int      $depth             Depth of the item in reference to parents. May be 0.
	 * @param stdClass $args              An object containing wp_nav_menu() arguments.
	 * @param int      $current_object_id ID of the current item.
	 * @return void
	 */
	public function start_el( &$output, $data_object, $depth = 0, $args = null, $current_object_id = 0 ) {
		$data_object = (object) $data_object;

		// Build <li> opening tag.
		if ( isset( $args->item_spacing ) && 'discard' === $args->item_spacing ) {
			$indent = '';
		} else {
			$indent = str_repeat( "\t", $depth + 1 );
		}

		$output .= $indent . '<li';

		// Add ID if present.
		if ( ! empty( $data_object->ID ) ) {
			$output .= ' id="menu-item-' . intval( $data_object->ID ) . '"';
		}

		// Add default classes.
		$classes = array( 'menu-item' );

		// Add menu-item-{post_id} class.
		if ( ! empty( $data_object->ID ) ) {
			$classes[] = 'menu-item-' . intval( $data_object->ID );
		}

		// Add current item classes if applicable.
		if ( ! empty( $data_object->ID ) && in_array( $data_object->ID, (array) $current_object_id, true ) ) {
			$classes[] = 'current-menu-item';
		}

		// Check if this item has children (check if next item in the tree has greater depth).
		$has_children = false;
		$all_items    = isset( $args->items ) ? $args->items : array();

		if ( ! empty( $all_items ) && is_array( $all_items ) ) {
			$item_depth = $this->get_item_depth( $data_object, $all_items );
			// Check if next item has greater depth.
			for ( $i = 0; $i < count( $all_items ); $i++ ) {
				if ( isset( $all_items[ $i ]->ID ) && $all_items[ $i ]->ID === $data_object->ID ) {
					if ( isset( $all_items[ $i + 1 ] ) && isset( $all_items[ $i + 1 ]->menu_item_parent ) ) {
						if ( $all_items[ $i + 1 ]->menu_item_parent === $data_object->ID ) {
							$has_children = true;
						}
					}
					break;
				}
			}
		}

		// Add has-dropdown class if item has children.
		if ( $has_children ) {
			$classes[] = 'has-dropdown';
		}

		// Add custom filters for additional classes.
		$classes = apply_filters( 'nav_menu_css_class', array_filter( $classes ), $data_object, $args, $depth );

		if ( ! empty( $classes ) ) {
			$output .= ' class="' . implode( ' ', $classes ) . '"';
		}

		$output .= '>';

		// Now handle the anchor tag.
		$output .= $indent . "\t";
		$output .= '<a href="' . esc_url( $data_object->url ?? '#' ) . '"';

		// Add menu-item-link class.
		$output .= ' class="menu-item-link"';

		// Add role and aria attributes for accessibility.
		$output .= ' role="menuitem"';

		if ( $has_children ) {
			$output .= ' aria-haspopup="true" aria-expanded="false"';
		}

		// Add title if present.
		if ( ! empty( $data_object->title ) ) {
			$output .= ' title="' . esc_attr( $data_object->title ) . '"';
		}

		// Add custom filters for anchor attributes.
		$output = apply_filters( 'nav_menu_link_attributes', $output, $data_object, $args, $depth );

		$output .= '>';

		// Menu item text.
		$title = ! empty( $data_object->title ) ? $data_object->title : '';
		$title = apply_filters( 'nav_menu_item_title', $title, $data_object, $args, $depth );

		$output .= esc_html( $title );

		// Add dropdown toggle button with SVG chevron for items with children.
		if ( $has_children ) {
			$output .= ' <button class="dropdown-toggle" aria-label="' . esc_attr( sprintf( __( 'Toggle submenu for %s', 'mobiris' ), $title ) ) . '" type="button">';
			// Inline SVG chevron icon.
			$output .= '<svg class="dropdown-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">';
			$output .= '<path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
			$output .= '</svg>';
			$output .= '</button>';
		}

		$output .= '</a>';
	}

	/**
	 * Get the depth of an item in the menu.
	 *
	 * @param object $item      The menu item.
	 * @param array  $all_items All menu items.
	 * @return int Item depth.
	 */
	private function get_item_depth( $item, $all_items ) {
		$depth = 0;

		if ( ! isset( $item->menu_item_parent ) || 0 === (int) $item->menu_item_parent ) {
			return $depth;
		}

		$parent_id = (int) $item->menu_item_parent;

		foreach ( $all_items as $menu_item ) {
			if ( isset( $menu_item->ID ) && (int) $menu_item->ID === $parent_id ) {
				$depth = 1 + $this->get_item_depth( $menu_item, $all_items );
				break;
			}
		}

		return $depth;
	}

	/**
	 * Ends the element output, if anything needs to be done after each item.
	 *
	 * @param string   $output            Passed by reference. Used to append additional content.
	 * @param WP_Post  $data_object       The data object.
	 * @param int      $depth             Depth of the item in reference to parents. May be 0.
	 * @param stdClass $args              An object containing wp_nav_menu() arguments.
	 * @return void
	 */
	public function end_el( &$output, $data_object, $depth = 0, $args = null ) {
		if ( isset( $args->item_spacing ) && 'discard' === $args->item_spacing ) {
			$indent = '';
		} else {
			$indent = str_repeat( "\t", $depth + 1 );
		}

		$output .= "</li>\n";
	}
}

/**
 * Helper function to display a menu using the custom walker.
 *
 * @param string $location Menu location/theme location.
 * @param array  $args     Additional wp_nav_menu() arguments.
 * @return void
 */
function mobiris_nav_menu( $location, $args = array() ) {
	$defaults = array(
		'theme_location' => $location,
		'walker'         => new Mobiris_Walker_Nav_Menu(),
		'container'      => false,
		'fallback_cb'    => 'wp_page_menu',
		'items_wrap'     => '<ul id="%1$s" class="%2$s" role="menubar">%3$s</ul>',
	);

	$args = wp_parse_args( $args, $defaults );

	wp_nav_menu( $args );
}
