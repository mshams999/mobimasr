<?php
defined('ABSPATH') || die;

$args = array(
    'post_type'      => CUSTOM_POST_NEWS_WIDGET_NAME,
    'post_status'    => array('publish', 'future', 'private', 'draft'),
    'orderby'        => 'date',
    'order'          => 'desc',
    'posts_per_page' => - 1
);

$blocks = get_posts($args);
wp_nonce_field('wplp_blocks_nonce', 'wplp_blocks_nonce');
?>

<div class="widget-header" style="padding-top: 40px">
    <h1 class="header-title"><?php esc_html_e('All News Blocks', 'wp-latest-posts') ?></h1>
    <div class="inline-button-wrapper">
        <a class="ju-rect-button waves-effect waves-light action-button"
           href="<?php echo esc_attr(admin_url('admin.php?page=wplp-widget&view=block&id=addnew')) ?>"
        >
            <i class="mi mi-add"></i>
            <span><?php esc_html_e('New block', 'wp-latest-posts') ?></span>
        </a>
    </div>
</div>
<div class="widget-list-wrapper">
    <div class="widget-list-action-btn" style="float: left; margin: 25px auto">
        <button type="button" id="delete-blocks" class="ju-rect-button waves-effect waves-dark">
            <?php esc_html_e('Delete selected', 'wp-latest-posts') ?>
        </button>
    </div>
    <div class="widget-search-wrapper" style="float: right; width: 350px">
        <input type="text" class="block-search-input widget-search-input"
               placeholder="<?php esc_html_e('Search blocks by title or author', 'wp-latest-posts') ?>"
        >
        <i class="mi mi-search"></i>
    </div>
    <table id="blocks-list">
        <thead>
        <tr>
            <th class="block-header-checkbox select-box">
                <input type="checkbox" class="select-all-block ju-checkbox">
            </th>
            <th class="block-header-title sorting-header" data-sort="title">
                    <span>
                        <span><?php esc_html_e('Title', 'wp-latest-posts') ?></span>
                        <i class="dashicons"></i>
                    </span>
            </th>
            <th class="block-header-author sorting-header" data-sort="author">
                    <span>
                        <span><?php esc_html_e('Author', 'wp-latest-posts') ?></span>
                        <i class="dashicons"></i>
                    </span>
            </th>
            <th class="block-header-date sorting-header" data-sort="date">
                    <span>
                        <span><?php esc_html_e('Date', 'wp-latest-posts') ?></span>
                        <i class="dashicons"></i>
                    </span>
            </th>
            <th class="block-header-date sorting-header" data-sort="date">
                    <span>
                        <span><?php esc_html_e('Status', 'wp-latest-posts') ?></span>
                        <i class="dashicons"></i>
                    </span>
            </th>
        </tr>
        </thead>
        <tbody>
        <?php if (count($blocks) > 0) : ?>
            <?php foreach ($blocks as $block) : ?>
                <tr class="wplp-block" data-block-id="<?php echo esc_html($block->ID) ?>">
                    <td class="block-checkbox select-box">
                        <input type="checkbox" class="ju-checkbox" name="wplp_block[]" value="<?php echo esc_html($block->ID) ?>">
                    </td>
                    <td class="block-title">
                        <a href="<?php echo esc_html(admin_url('admin.php?page=wplp-widget&view=block&id='.$block->ID)) ?>">
                            <?php echo esc_html($block->post_title ? $block->post_title : __('(untitled)', 'wp-latest-posts')) ?>
                        </a>
                        <i class="mi mi-delete-forever block-delete"
                           title="<?php esc_attr_e('Delete', 'wp-latest-posts') ?>"
                           data-block-id="<?php echo esc_html($block->ID) ?>">
                        </i>
                    </td>
                    <td class="block-author"><?php the_author_meta('display_name', $block->post_author) ?></td>
                    <td class="block-date"><?php echo get_the_date('Y/m/d - H:i', $block->ID) ?></td>
                    <td class="block-status"><?php echo esc_html($block->post_status) ?></td>
                </tr>
            <?php endforeach; ?>
        <?php else : ?>
            <tr>
                <td colspan="3" class="wplp-no-blocks">
                    <?php esc_html_e('No blocks found.', 'wp-latest-posts') ?>
                </td>
            </tr>
        <?php endif; ?>
        </tbody>
    </table>
</div>
