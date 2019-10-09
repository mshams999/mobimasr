(function ( $ ) {
    // Pseudo contains case insensitive
    $.expr[":"].contains = $.expr.createPseudo(function(arg) {
        return function( elem ) {
            return $(elem).text().toLowerCase().indexOf(arg.toLowerCase()) >= 0;
        };
    });

    $(document).ready(function ( $ ) {
        // Function for searching menus
        $('.ju-menu-search-input').on('input', function () {
            $('.ju-right-panel .ju-settings-option').removeClass('search-result');
            $('.ju-menu-tabs .tab').show();

            var searchKey = $(this).val().trim().toLowerCase();
            if (searchKey === '') {
                $('.ju-menu-tabs .tab').show();
                return false;
            }

            var searchResult = $('.ju-right-panel .ju-settings-option label:contains("'+searchKey+'")').closest('.ju-settings-option');
            var searchParent = searchResult.closest('.ju-content-wrapper');
            var searchSub = searchResult.closest('.tab-content');
            var tabID = [], subID = [];

            searchResult.addClass('search-result');

            searchParent.each(function () {
                tabID.push($(this).attr('id'));
            });

            searchSub.each(function () {
                subID.push($(this).attr('id'));
            });

            $('.ju-menu-tabs .tab .link-tab').each(function () {
                var href = $(this).attr('href');
                var text = $(this).text().trim().toLowerCase();
                var dataHref = $(this).data('href');

                if (href !== undefined) {
                    href = href.replace(/#/g, '');
                }

                if (dataHref !== undefined) {
                    dataHref = dataHref.replace(/#/, '');
                }

                if (tabID.indexOf(href) < 0 && text.indexOf(searchKey) < 0 && subID.indexOf(dataHref) < 0) {
                    $(this).closest('li.tab').hide();
                } else {
                    if ($(this).closest('.ju-submenu-tabs').length > 0) {
                        $(this).closest('.ju-submenu-tabs').closest('li.tab').show();
                    }
                }
            });
        });

        // Add submenus
        $('.ju-top-tabs').each(function () {
            var topTab = $(this);
            var tabClone = $(this).clone();
            var parentHref = $(this).closest('.ju-content-wrapper').attr('id');
            tabClone.removeClass('ju-top-tabs').removeClass('tabs').addClass('ju-submenu-tabs');

            tabClone.find('li.tab').each(function () {
                var currentSubMenu = $(this).closest('.ju-submenu-tabs');
                var currentTab = $(this).find('a.link-tab').removeClass('waves-effect');
                var tabClass = currentTab.attr('class');
                var tabHref = currentTab.attr('href');

                $(this).html('<div class="'+ tabClass +'" data-href="'+ tabHref +'">'+ $(this).text() +'</div>');

                $(this).find('div.link-tab').click(function () {
                    topTab.find('li.tab a[href="'+ tabHref +'"]').click();
                    currentSubMenu.find('li.tab div.link-tab').removeClass('active');
                    $(this).addClass('active');
                })
            });

            $('.ju-menu-tabs .tab a.link-tab[href="#'+ parentHref +'"]').closest('.tab').append(tabClone);
        });

        // Top tab click also navigate submenu tabs
        $('.ju-top-tabs li.tab').click(function () {
            var parentHref = $(this).closest('.ju-content-wrapper').attr('id');
            var tabHref = $(this).find('a.link-tab').attr('href');
            var subMenu = $('.ju-menu-tabs .tab a.link-tab[href="#'+ parentHref +'"]').closest('li.tab').find('.ju-submenu-tabs');

            subMenu.find('div.link-tab').removeClass('active');
            subMenu.find('div.link-tab[data-href="'+ tabHref +'"]').addClass('active');
        });

        // Collapsed the menu when clicking if it opened
        $('.ju-menu-tabs li.tab a.link-tab').click(function () {
            if (!$(this).hasClass('active')) {
                $(this).closest('.ju-menu-tabs').find('li.tab a.link-tab').removeClass('expanded');
            }

            if ($(this).closest('li.tab').find('.ju-submenu-tabs').length > 0) {
                $(this).toggleClass('expanded');
            }
        });

        // Not show expand icon if this tab has no sub menus
        $('.ju-menu-tabs li.tab').each(function () {
            if ($(this).find('.ju-submenu-tabs').length > 0) {
                var linkTab = $(this).find('a.link-tab');

                linkTab.addClass('with-submenus');
                if (linkTab.hasClass('active')) {
                    linkTab.addClass('expanded');
                }
            }
        });

        // Close notice message
        $('.ju-notice-close').click(function () {
            $(this).closest('.ju-notice-msg').slideUp();
        });

        Waves.attach('.waves-effect');
        Waves.init();
    })
})(jQuery);