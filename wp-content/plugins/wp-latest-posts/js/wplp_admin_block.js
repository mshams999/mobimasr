/** WPLP back-end jQuery script v.0.1 **/

(function($){
    $( document ).ready(function() {

        $('select#theme').change(function (e) {
            var theme_img = themes[$(this).val()]['theme_url'] + '/screenshot.png';
            if (theme_img.indexOf('portfolio') > -1) {
                $('input#colorpicker').attr('value', '#808080');
                $('input#colorpicker').closest('li').find('.wp-color-result').
                css('background-color', ' rgb(128, 128, 128);');
            } else {
                $('input#colorpicker').attr('value', '#ff0000');
                $('input#colorpicker').closest('li').find('.wp-color-result').
                css('background-color', ' rgb(255, 0, 0);');
            }
        });

        $("#colorPicker .colorInner").unbind("mousedown");

        // /** Theme preview drop-down **/
        $('select#theme').change( function(e){
            ThemeChange($(this));
        });

        ThemeChange($('select#theme'),true);

        function ThemeChange(object,first){
            var theme_img = themes[object.val()]['theme_url']+'/screenshot.png';
            /*
             *
             * If theme is Premium > disable Option
             * else theme is defautl > enable Option
             *
             */
            if (!first){
                $('.wplp-theme-preview img').fadeOut(200, function(){
                    $(this).attr('src',theme_img).bind('onreadystatechange load', function(){
                        if (this.complete) $(this).fadeIn(400);
                    });
                });
            }

            if ($('#force_icon1').is(':checked')) {
                var current = $('#theme :selected').val();

                if ( current  === 'masonry-category'){
                    $('.select-hover-icon').show();
                    $('#masory_icon').hide();
                    $('#dashicons_selector').show();
                    $('#masory_category_icon').show();
                    $('#masory-category-icon-box').show();
                    $('.select-hover-icon .dropify-wrapper').hide();
                }
                if ( current === "masonry"){
                    $('.select-hover-icon').show();
                    $('#dashicons_selector').hide();
                    $('#masory_category_icon').hide();
                    $('#masory_icon').show();
                    $('#masory-category-icon-box').hide();
                    $('.select-hover-icon .dropify-wrapper').show();
                }
            } else {
                $('.select-hover-icon').hide();
            }

            if (object.val().indexOf("masonry") > -1) {
                $("#animation").children(".settings-wrapper").hide();

                $("#wplp-arrow-color, #wplp-readmore-config, #wplp-overlay-config").hide();

                $(".theme-image-position, .theme-new-item, .pagination, .number-rows, .default-color-theme, .lazyloading-btn, .image-position, .crop-text").hide();

                // Show
                $("#animation").children(".white-content").show();

                $("#wplp-default-color").show();

                $(".more-btn-property, .load-more-btn, .force-icon-hover, .crop-text, .number-columns").show();

            } else if (object.val().indexOf("smooth") > -1) {
                $("#wplp-arrow-color, #wplp-arrow-color, #wplp-readmore-config, #wplp-overlay-config").hide();

                $(".theme-image-position, .theme-new-item, .number-columns, .number-rows, .translation-checkbox, .default-color-theme, .force-icon-hover, .more-btn-property, .image-position, .select-hover-icon").hide();

                $("#animation").children(".white-content").hide();
                // Show

                $('#animation').children('.settings-wrapper').show();

                $("#wplp-default-color").show();

                $(".crop-text , .pagination").show();

            } else if (object.val().indexOf("timeline") > -1) {
                $("#animation").children(".settings-wrapper").hide();

                $("#wplp-arrow-color, #wplp-readmore-config, #wplp-overlay-config").hide();

                $(".select-hover-icon, .theme-new-item, .force-icon-hover, .more-btn-property, .number-columns , .number-rows, .pagination, .theme-image-position, .image-position , .default-color-theme").hide();

                // Show
                $("#animation").children(".white-content").show();

                $("#wplp-default-color").show();

                $(".crop-text").show();

            } else if(object.val().indexOf("portfolio") > -1) {
                $('#animation').children('.settings-wrapper').hide();

                $("#wplp-arrow-color, #wplp-readmore-config, #wplp-overlay-config ").hide();

                $(".select-hover-icon, .crop-text, .theme-new-item, .pagination, .number-rows, .more-btn-property, .theme-image-position, .image-position, .force-icon-hover").hide();

                // Show
                $("#animation").children(".white-content").show();

                $("#wplp-default-color").show();

                $(".number-columns, .default-color-theme").show();

            } else {
                $("#wplp-default-color").hide();

                $(".load-more-btn, .force-icon-hover, .select-hover-icon").hide();

                $("#animation").children(".white-content").hide();

                // Show
                $('#animation').children('.settings-wrapper').show();

                $(" #wplp-arrow-color, #wplp-readmore-config , #wplp-overlay-config").show();
                $(".theme-new-item , .crop-text , .pagination, .number-columns , .number-rows, .autoanim-transition, .animation-transition,.more-btn-property, .lazyloading-btn, .theme-image-position, .image-position, .translation-checkbox").show();
            }

            if (object.val().indexOf("masonry-category") > -1) {
                $("#wplp-arrow-color, #wplp-readmore-config, #wplp-overlay-config").hide();

                $(".crop-text , .lazyloading-btn").hide();
            }
        }

        $('.dropify').dropify();

        //
        // // poup icon for overlay
        $('#overlayIcon').click(function(){
            $('#overlayIconList').toggle('show');
        });
        $('.wplp-overlay-close').click(function(){
            $('#overlayIconList').toggle('hide');
            $('#overlayIconSelected').attr('value','');
        });

        $('#overlayIconList .dashicons').click(function(){
            var alt = $(this).attr("alt");
            var iconClass = $(this).attr("class");
            $('#overlayIconSelected').attr('value',alt);
            $('#overlayIconList').toggle('hide');
            $('.overlay-icon #verlay-icon-box').removeClass().addClass(iconClass);
        });
        //
        //force
        $('.force_icon').click(function(){
            icon_selector();
        });
        icon_selector();
        // //popup list icon
        $('#masory_category_icon').click(function(){
            $('#iconlist').toggle('show');
        });
        $('.wplp-close').click(function(){
            $('#iconlist').toggle('hide');
            $('#dashicons_selector').attr('value','');
        });
        $('#iconlist .dashicons').click(function(){
            var alt = $(this).attr("alt");
            var iconClass = $(this).attr("class");
            $('#dashicons_selector').attr('value',alt);
            $('#iconlist').toggle('hide');
            $('.select-hover-icon #masory-category-icon-box').removeClass().addClass(iconClass);
        });

        // slider overlay
        $('.overlay-slider').slider({
            min: 0,
            max: 1,
            step: 0.1,
            slide: function (event, ui) {
                field = event.target.id;
                $("#" + field).val(ui.value);
            }
        });

        $('#slider_overlay_transparent').each(function () {
            $(this).slider({
                min: 0,
                max: 1,
                step: 0.1,
                value: $("#overlayTransparent").val(),
                slide: function (event, ui) {
                    $("#overlayTransparent").val(ui.value);
                }
            });
        });
        $('#overlayTransparent').change(function () {
            $('.overlay-slider').slider('value', $(this).val());
        });

        $("select.mutilsite_select").change(function(){
            var content_language = $('#selected_content_language').val();
            var val_blog = $(this).val();
            var type = $(this).attr('id');
            $.ajax({
                url : ajaxurl,
                dataType :'json',
                method : 'POST',
                data:{
                    action : 'change_cat_multisite',
                    val_blog : val_blog,
                    type : type,
                    content_language: content_language,
                    ajaxnonce : wpsolBackJS.ajaxnonce
                },
                success : function(res){
                    var type = res.type;

                    if(type.indexOf('post') > -1){
                        parent = $('.postcat');
                        parent.find('ul').remove();
                        parent.append(res.output);
                    }else if(type.indexOf('page') > -1){
                        parent = $('.pagecat');
                        parent.find('ul').remove();
                        parent.append(res.output);
                    }else if(type.indexOf('tag') > -1){
                        parent = $('.tagcat');
                        parent.find('ul').remove();
                        parent.append(res.output);
                    } else if(type.indexOf('cat_list') > -1){
                        parent = $('.catlistcat');
                        parent.find('ul').remove();
                        parent.append(res.output);
                    }

                }
            });
        });

        $('.wplp_close_notification').click(function(){
            $.ajax({
                url: ajaxurl,
                method: 'POST',
                dataType: 'json',
                data:{
                    action: 'wplp_set_close_notification',
                    task : 'wplp_cookie',
                    ajaxnonce : wpsolBackJS.ajaxnonce
                },
                success: function(res){
                    if(res){
                        $('.wplp_notification.wplp_wrap_notification').remove();
                    }
                }
            });
        });


        if($('select[name="wplp_source_date_min_switch"]').val() == 'between'){
            $('.source_date_max').show();
        }else{
            $('.source_date_max').hide();
        }
        // change option Show articles created
        $('select[name="wplp_source_date_min_switch"]').change(function(){
            var val = $(this).val();
            if(val === 'between'){
                $('.source_date_max').show();
            }else{
                $('.source_date_max').hide();
            }
        });

        $('#overlayIconList').scroll(function(){
            pos = $(this).scrollTop();
            $('.wplp-overlay-close').css('margin-top', pos+ 'px');
        });

        $('.color-box').click(function(){
            var color = $(this).data('id');
            $('.colorPicker-text').attr('value', color);
            $('.color-list-box ul li').removeClass('color-selected');
            $(this).addClass('color-selected');
            $('#wplp-default-color .wp-picker-container .wp-color-result').css('background', color);
        });

        // Transition theme
        $('input[name=wplp_autoanimation_trans]').click(function(){
            var id = $(this).data('id');

            $('.list-animation-transition li').removeClass();
            $(this).closest('li').addClass(id);

            $('.list-animation-transition li label').removeClass('transition-label-checked');
            $('.list-animation-transition li.'+id+' label').addClass('transition-label-checked')
        });
        // Slide Transition
        $('input[name=wplp_autoanimation_slidedir]').click(function(){
            var id = $(this).data('id');

            $('.list-slide-transition li').removeClass();
            $(this).closest('li').addClass(id);

            $('.list-slide-transition li label').removeClass('transition-label-checked');
            $('.list-slide-transition li.'+id+' label').addClass('transition-label-checked')
        });

        // Select visibility
        $('#post-visibility-select').change(function(){
            var val = $(this).val();
            if (val === 'password') {
                $('#password-visibility').show();
            } else {
                $('#password-visibility').hide();
            }
        });

        if ($('#post-visibility-select').val() === 'password') {
            $('#password-visibility').show();
        } else {
            $('#password-visibility').hide();
        }

        const monthNames = ["1", "2", "3", "4", "5", "6","7", "8", "9", "10", "11", "12"];
        // console.log($("#post-date").datepicker( 'getDate' ));
        $('#post-date').change(function(){
            var val = $(this).val();
            var date = new Date(val);

            $('input[name=jj]').val(date.getDate());
            $('input[name=mm]').val(monthNames[date.getMonth()]);
            $('input[name=aa]').val(date.getFullYear());
        });

        // SEARCH CONTENT SOURCE
        $('.content-search-input').on('input', function () {
            var search = $(this).val().trim().toLowerCase();
            var active_tab = $("input[name=wplp_source_type]").val();
            var type;
            switch(active_tab) {
                case 'src_category' :
                    type = '.postcat';
                    break;
                case 'src_category_list' :
                    type = '.catlistcat';
                    break;
                case 'src_page' :
                    type = '.pagecat';
                    break;
                case 'src_tags' :
                    type = '.tagcat';
                    break;
            }
            // Check per content source with source type
            $(type+' ul li').each(function(){
                var text = $(this).children('label').text().trim().toLowerCase();

                if (text.indexOf(search) < 0) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });



        });
        $('.content-search-input').on('focus', function () {
            $(this).parent('.content-search-field').addClass('focused');
        }).on('blur', function () {
            $(this).parent('.content-search-field').removeClass('focused');
        });
    });
  
})( jQuery );

function icon_selector(){
     if (jQuery('#force_icon1').is(':checked')) {
         var current = jQuery('#theme :selected').val();

            if ( current  === 'masonry-category'){
                jQuery('.select-hover-icon').show();
                jQuery('#masory_icon').hide();
                jQuery('#dashicons_selector').show();
                jQuery('#masory_category_icon').show();
                jQuery('#masory-category-icon-box').show();
                jQuery('.select-hover-icon .dropify-wrapper').hide();
            }
            if ( current === "masonry"){
                jQuery('.select-hover-icon').show();
                jQuery('#dashicons_selector').hide();
                jQuery('#masory_category_icon').hide();
                jQuery('#masory-category-icon-box').hide();
                jQuery('#masory_icon').show();
                jQuery('.select-hover-icon .dropify-wrapper').show();
            }
     } else {
         jQuery('.select-hover-icon').hide();
     }
}