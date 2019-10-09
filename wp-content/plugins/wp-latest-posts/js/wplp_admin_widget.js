(function ( $ ) {
    $(document).ready(function ( $ ) {
        // Function for searching menus
        $('.widget-search-input').on('focus', function () {
            $(this).parent('.widget-search-wrapper').addClass('focused');
        }).on('blur', function () {
            $(this).parent('.widget-search-wrapper').removeClass('focused');
        });

        // Sort blocks
        function sortBlocks(sortBy, asc) {
            if (typeof asc === 'undefined') asc = false;

            var tbody = $('#blocks-list').find('tbody');
            tbody.find('tr').sort(function(a, b) {
                if (asc) {
                    return $('td.block-' + sortBy, a).text().localeCompare($('td.block-' + sortBy, b).text());
                } else {
                    return $('td.block-' + sortBy, b).text().localeCompare($('td.block-' + sortBy, a).text());
                }
            }).appendTo(tbody);
        }

        // Clicking header to sort
        $('#blocks-list thead .sorting-header').unbind('click').click(function () {
            var sortBy = $(this).data('sort');
            var asc = true;

            if ($(this).hasClass('asc')) {
                asc = false;
                $('#blocks-list').find('.sorting-header').removeClass('desc').removeClass('asc');
                $('#blocks-list').find('.block-header-'+ sortBy).addClass('desc');
            } else {
                $('#blocks-list').find('.sorting-header').removeClass('desc').removeClass('asc');
                $('#blocks-list').find('.block-header-'+ sortBy).addClass('asc');
            }

            sortBlocks(sortBy, asc);
            return false;
        });

        // Search blocks
        $('.block-search-input').on('input', function () {
            var searchKey = $(this).val().trim().toLowerCase();

            $('#blocks-list .wplp-block').each(function () {
                var blockTitle = $(this).find('.block-title').text().trim().toLowerCase(),
                    blockAuthor = $(this).find('.block-author').text().trim().toLowerCase();

                if (blockTitle.indexOf(searchKey) > -1 || blockAuthor.indexOf(searchKey) > -1) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            })
        });

        // Check all checkboxes
        $('.select-all-block').click(function () {
            $('.select-all-block').prop('checked', this.checked);
            $(this).closest('#blocks-list').find('tbody .block-checkbox input[type=checkbox]').prop('checked', this.checked);
        });

        $('.block-checkbox input[type=checkbox]').click(function () {
            if (!this.checked) {
                $('.select-all-block').prop('checked', this.checked);
            }
        });

        // DELETE block
        // Click delete single block
        $('.block-delete').unbind('click').click(function () {
            var willDelete = confirm('Are you sure to delete this block? This action cannot be undone.');
            var blockID = $(this).data('block-id');

            if (willDelete) deleteBlocks([blockID]);
        });

        // Click delete multi-blocks
        $('#delete-blocks').unbind('click').click(function () {
            var blockIDs = [];
            var blocksChecked = $('#blocks-list').find('.block-checkbox input:checkbox:checked');

            if (blocksChecked.length < 1) {
                alert( 'No blocks selected!' );
                return false;
            }

            blocksChecked.each(function () {
                blockIDs.push($(this).val());
            });

            var willDelete = confirm('Are you sure to delete these blocks? This action cannot be undone.');
            if (willDelete) deleteBlocks(blockIDs);
        });

        // Delete blocks by id
        function deleteBlocks(ids) {
            var blocksNonce = $('#wplp_blocks_nonce').val();

            $.ajax({
                url: ajaxurl,
                method: 'POST',
                data: {
                    action: 'wplp_delete_blocks',
                    ajaxNonce: blocksNonce,
                    ids: ids
                },
                success: function (res) {
                    res.deleted.forEach(function (id, index) {
                        setTimeout(function () {
                            $('.wplp-block[data-block-id='+ id +']').fadeOut(300, function () {
                                $(this).remove();
                            });
                        }, index * 500);
                    })
                },
                error: function ( xhr, error ) {
                    alert(error + ' - ' + xhr.responseText);
                }
            })
        }
    })
})(jQuery);