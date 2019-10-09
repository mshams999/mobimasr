<?php

class SupsysticTables_Widget extends WP_Widget {

    private $tables;

    /**
     * Register widget with WordPress.
     */
    function __construct() {

        $this->tables = new SupsysticTables_Tables_Model_Tables();
        parent::__construct(
            'tables_widget',
            'Tables Widget',
            array( 'description' => 'Tables Widget' )
        );

    }

    /**
     * Front-end display of widget.
     *
     * @see WP_Widget::widget()
     *
     * @param array $args     Widget arguments.
     * @param array $instance Saved values from database.
     */
    public function widget( $args, $instance ) {
        $title = apply_filters( 'widget_title', $instance['title'] );
        echo $args['before_widget'];
        if ( ! empty( $title ) ) {
            echo $args['before_title'] . $title . $args['after_title'];
        }
        echo do_shortcode('[supsystic-tables id=' . $instance['id'] . ' position="center"]');
        echo $args['after_widget'];
        echo $args['after_widget'];
    }

    /**
     * Back-end widget fo*rm.
     * @see WP_Widget::form()
     *
     * @param array $instance Previously saved values from database.
     */
    public function form( $instance ) {
        if ( isset( $instance[ 'title' ] ) ) {
            $title = $instance[ 'title' ];
        } else {
            $title = 'Title';
        }

        $idTables = array();

        if ($this->tables->getList()) {
            foreach($this->tables->getList() as $table) {
                if (!empty($table->title) && isset($table->title)) {
                    array_push($idTables, array(
                        'name' => $table->title,
                        'value' => $table->id
                    ));
                }
            }
        }
        else {
            echo "<h4 style='color:red;text-align: center;'>No tables</h4>";
            echo "<a href='/wp-admin/admin.php?page=supsystic-tables'>Create table</a>";
        }

        ?>

        <p>
            <label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php _e( 'Title:' ); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
            <label for="<?php echo $this->get_field_id( 'id' ); ?>"><?php _e( 'Select table: ' ); ?></label>
            <select id="<?php echo $this->get_field_id( 'id' ); ?>" class="widefat" name="<?php echo $this->get_field_name( 'id' ); ?>" type="text">
                <?php foreach($idTables as $element)
                if ($instance['id'] == $element['value'] && isset($element['value'])) {
                    echo "<option value=" . $element['value'] . " selected>" . $element['name'] . "</option>";
                } else {
                    echo "<option value=" . $element['value'] . ">" . $element['name'] . "</option>";
                }
                ?>
            </select>
        </p>
    <?php
    }


    /**
     * Sanitize widget form values as they are saved.
     *
     * @see WP_Widget::update()
     *
     * @param array $new_instance Values just sent to be saved.
     * @param array $old_instance Previously saved values from database.
     *
     * @return array Updated safe values to be saved.
     */
    public function update( $new_instance, $old_instance ) {
        $instance = array();
        $instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
        $instance['id'] = ( ! empty( $new_instance['id'] ) ) ? strip_tags( $new_instance['id'] ) : '';
        return $instance;
    }
}