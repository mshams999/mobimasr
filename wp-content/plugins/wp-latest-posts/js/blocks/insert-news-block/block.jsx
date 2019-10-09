(function (wpI18n, wpBlocks, wpElement, wpEditor, wpComponents) {
    const {__} = wp.i18n;
    const {Component} = wpElement;
    const {registerBlockType} = wpBlocks;
    const {TextControl} = wpComponents;

    const el = wpElement.createElement;
    const iconblock = el('svg', {width: 24, height: 24, className: 'dashicon'},
        el('path', {d: "M22 13h-8v-2h8v2zm0-6h-8v2h8V7zm-8 10h8v-2h-8v2zm-2-8v6c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2zm-1.5 6l-2.25-3-1.75 2.26-1.25-1.51L3.5 15h7z"})
    );

    class WplpNews extends Component {
        /**
         * Constructor
         */
        constructor() {
            super(...arguments);
            this.state = {
                isOpenList: false,
                searchValue: ''
            };

            this.setWrapperRef = this.setWrapperRef.bind(this);
            this.handleClickOutside = this.handleClickOutside.bind(this);
        }

        componentDidMount() {
            const {attributes} = this.props;
            const {
                shortcode
            } = attributes;

            this.setState({
                searchValue: shortcode
            });

            document.addEventListener('mousedown', this.handleClickOutside);
        }

        /**
         * Set the wrapper ref
         */
        setWrapperRef(node) {
            this.wrapperRef = node;
        }

        /**
         * Alert if clicked on outside of element
         */
        handleClickOutside(event) {
            if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
                const {attributes, setAttributes} = this.props;
                const {
                    shortcode
                } = attributes;

                this.setState({
                    isOpenList: false,
                    searchValue: shortcode
                });
                setAttributes({
                    shortcode: shortcode
                });
            }
        }

        /**
         * Select news post
         */
        selectPost(value) {
            const {setAttributes} = this.props;
            this.setState({
                isOpenList: false,
                searchValue: '[frontpage_news widget="' + value + '"]'
            });

            setAttributes({
                newsID: value.toString(),
                shortcode: '[frontpage_news widget="' + value + '"]'
            });
        }

        /**
         * DO search news post
         */
        search(value) {
            const {setAttributes} = this.props;
            let newsSearchList = wplp_blocks.vars.posts_select.filter(function (event) {
                return event.label.toLowerCase().indexOf(value.toLowerCase()) > -1
            });

            this.setState({searchValue: value});

            setAttributes({
                newsList: newsSearchList
            });
        }

        /**
         * Click to search input
         */
        handleClick() {
            const {setAttributes} = this.props;
            setAttributes({
                newsList: wplp_blocks.vars.posts_select
            });

            this.setState({
                isOpenList: true,
                searchValue: ''
            })
        }

        /**
         * Render block
         */
        render() {
            const {attributes} = this.props;
            const {
                newsList,
                newsID
            } = attributes;

            return (
                <div className="wp-block-shortcode" ref={this.setWrapperRef}>
                    <label>{iconblock} {wplp_blocks.l18n.block_title}</label>

                    <div className="wp-latest-posts-block">
                        <TextControl
                            value={this.state.searchValue}
                            className="wplp_search_news"
                            placeholder={wplp_blocks.l18n.select_label}
                            autoComplete="off"
                            onChange={this.search.bind(this)}
                            onClick={this.handleClick.bind(this)}
                        />

                        {
                            this.state.isOpenList && newsList.length &&
                            <ul className="wp-latest-posts-list">
                                {
                                    newsList.map((post) =>
                                        <li className={(newsID.toString() === post.value.toString()) ? 'news_post_item news_post_item_active' : 'news_post_item'}
                                            key={post.value}
                                            onClick={this.selectPost.bind(this, post.value)}>{post.label}</li>
                                    )
                                }
                            </ul>
                        }

                        {
                            this.state.isOpenList && !newsList.length &&
                            <ul className="wp-latest-posts-list">
                                <li key="0">{wplp_blocks.l18n.no_post_found}</li>
                            </ul>
                        }
                    </div>
                </div>
            );
        }
    }

    // register block
    registerBlockType('wplp/block-news', {
        title: wplp_blocks.l18n.block_title,
        icon: iconblock,
        category: 'common',
        keywords: [
            __('post')
        ],
        attributes: {
            newsList: {
                type: 'array',
                default: wplp_blocks.vars.posts_select
            },
            newsID: {
                type: 'string',
                default: '0'
            },
            shortcode: {
                type: 'string',
                default: ''
            }
        },
        edit: WplpNews,
        save: ({attributes}) => {
            const {
                shortcode
            } = attributes;
            return shortcode;
        }
    });
})(wp.i18n, wp.blocks, wp.element, wp.editor, wp.components);