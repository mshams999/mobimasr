=== WP Reset - Best WordPress Reset Plugin ===
Tags: wordpress reset, reset database, reset wordpress database, reset, advanced wordpress reset, restart wordpress, clean wordpress, default wordpress, reset wp, wp reset, developer, wp-cli
Contributors: WebFactory, wpreset, googlemapswidget, underconstructionpage
Requires at least: 4.0
Requires PHP: 5.2
Tested up to: 5.2
Stable tag: 1.65
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

WordPress Reset resets any WordPress site to the default values without modifying any files. It deletes all customizations and content. Safe to use.

== Description ==

<a href="https://wpreset.com/?utm_source=wordpressorg&utm_medium=content&utm_campaign=wp-reset&utm_term=wp-reset-top">WP Reset</a> quickly resets the site's database to the default installation values without modifying any files. It deletes all customizations and content. WP Reset is fast and safe to use. It has multiple fail-safe mechanisms so you can never accidentally lose data. WP Reset is extremely helpful for plugin and theme developers. It **speeds up testing and debugging** by providing a quick way to reset settings and re-test code. It was developed by developers for developers.

https://youtu.be/qMnkCW2PFoI?rel=0

For support please use the <a href="https://wordpress.org/support/plugin/wp-reset">forums</a>, and if you need more information visit <a href="https://wpreset.com/?utm_source=wordpressorg&utm_medium=content&utm_campaign=wp-reset&utm_term=wpreset.com">wpreset.com</a> and be sure to check out the <a href="https://wpreset.com/roadmap/?utm_source=wordpressorg&utm_medium=content&utm_campaign=wp-reset&utm_term=roadmap">roadmap</a> for the list of upcoming features.

Access WP Reset admin page via the "Tools" menu.

WP Reset is fully integrated with <a href="https://wordpress.org/plugins/wp-webhooks/">WP Webhooks</a> plugin - a secure, universal system that connects WP to any 3rd party systems and enables you to initiate actions both from WPs end (for instance start a MailChimp campaign once a new user registers), and from any other application (create a new user in WP when a purchase is made on a 3rd party system). View more <a href="https://underconstructionpage.com/wp-webhooks-connect-integrate-wordpress/" target="_blank">practical use-cases</a> that save hours of repetitive work.


**Please read carefully before proceeding to understand what WP Reset does**

#### Resetting will delete:

* all posts, pages, custom post types, comments, media entries, users
* all default WP database tables
* all custom database tables that have the same prefix table prefix as the one defined in _wp-config.php_ and used by default tables

#### Resetting will not delete or modify:

* media files - they remain in the _wp-uploads_ folder untouched but will no longer be listed under Media in admin
* no files are touched; plugins, themes, uploads - everything stays
* site title, WordPress address, site address, site language and search engine visibility settings
* currently logged in user will be restored with the current username and password

#### What happens when I click the Reset button?

* you will have to confirm the action one more time because there is NO UNDO
* everything will be reset; see bullets above for details
* site title, WordPress address, site address, site language, search engine visibility settings as well as the current user will be restored
* you will be logged out, automatically logged in and taken to the admin dashboard
* WP Reset plugin will be reactivated if that option is chosen in the post-reset options

#### WP-CLI support

WP Reset comes with full WP-CLI support. Help on our WP-CLI commands is available via _wp help reset_. By default the commands have to be confirmed but you can use the `--yes` option to skip confirmation. Instead of the active user, the first user with admin privileges found in the database will be restored after reset. Please be careful when using WP Reset with WP-CLI - as with using the GUI there is no undo.

#### Database Snapshots

Database snapshot is a copy of all WP database tables, standard and custom ones, saved in the currently used database (as set by _wp-config.php_). Files are not saved or included in snapshots in any way.
Snapshots are primarily a development tool. Although they can be used for backups (and downloaded as gzipped SQL dumps), we suggest finding a more suitable tool for doing backups of live sites. Use snapshots to find out what changes a plugin made to your database - what custom tables were created, modified, deleted or what changes were made to site's settings. Or use it to quickly restore the development environment after testing database related changes.
Restoring a snapshot does not affect other snapshots, or WP Reset settings. Snapshots can be compared to current database tables, restored (by overwriting current tables), exported ad gzipped SQL dumps, or deleted. Creating a snapshot on an average WordPress installation takes 1-2 seconds.

https://youtu.be/xBfMmS12vMY?rel=0

#### Multisite (WP-MU) Support

WP Reset has yet to be completely tested with multisite! Please be careful when using it with multisite enabled. We don't recommend to resetting the main site. Sub-sites should be OK. We're working on making WP Reset fully compatible with WP-MU. Till then please be careful. Thank you for understanding.

#### Partial Reset Tools

* Delete transients - deletes all transient related database entries. Including expired and non-expired transients, and orphaned timeout entries.
* Delete uploads - delete all files and folder in the /uploads/ folder.
* Delete plugins - deletes all plugins except WP Reset which remains active.
* Reset theme options - resets all options for all themes that use the WP theme mods API.
* Delete themes - deletes all themes.
* Empty or delete custom tables - empties (truncates) or deletes (drops) all custom database tables.
* Delete .htaccess file - deletes the .htaccess file. If you need to edit .htaccess without FTP use our free <a href="https://wordpress.org/plugins/wp-htaccess-editor/">WP Htaccess Editor</a> plugin.


#### Friends who helped us translate WP Reset

* French - <a href="https://www.infrenchtranslation.com/">Jeff Inho</a>


== Installation ==

Follow the usual routine;

1. Open WordPress admin, go to Plugins, click Add New
2. Enter "wp reset" in search and hit Enter
3. Plugin will show up as the first on the list (look for our black&red round logo), click "Install Now"
4. Activate & open plugin's settings page located under the Tools menu

Or if needed, upload manually;

1. Download the latest stable version from from <a href="https://downloads.wordpress.org/plugin/wp-reset.latest-stable.zip">downloads.wordpress.org/plugin/wp-reset.latest-stable.zip</a>
2. Unzip it and upload to _/wp-content/plugins/_
3. Open WordPress admin - Plugins and click "Activate" next to "WP Reset"
4. Open plugin's admin page located under the Tools menu


== Screenshots ==

1. WP Reset admin page
2. Reset action has to be double-confirmed
3. Additional tools for resetting and deleting various WordPress objects

== Changelog ==

= v1.65 =
* 2019/07/15
* bug fixes

= v1.60 =
* 2019/04/15
* bug fixes
* new tool: Reset theme options
* added Product Hunt banner
* added actions (hooks) to all tools and snapshot actions; all action names start with "wp-reset-"
* removed features survey
* announced plugin & theme collections

= v1.55 =
* 2019/03/25
* 100k users hit on 2019/01/15 with 560,300 downloads; 34 days for +10k & 71k downloads
* bug fixes
* support for WP Webhooks
* added features survey

= v1.50 =
* 2019/01/08
* new tool: delete .htaccess file
* new WP-CLI command: wp reset delete htaccess
* 90k users hit on 2018/12/12 with 489,100 downloads; 27 days for +10k & 58k downloads

= v1.45 =
* 2018/11/27
* new tool: truncate or drop custom DB tables
* truncate / drop tables tool added to WP-CLI
* all snapshot tools added to WP-CLI
* 80k users hit on 2018/11/15 with 430,800 downloads; 30 days for +10k & 57k downloads

= v1.40 =
* 2018/10/24
* new tool: DB Snapshots
* rewrote code documentation for most functions
* some parts of Snapshots need refactoring
* 70k users hit on 2018/10/16 with 373,300 downloads; 30 days for +10k & 50k downloads

= v1.35 =
* 2018/09/18
* sponsorship by IP Geolocation
* 60k users hit on 2018/09/16 with 323,300 downloads; 35 days for +10k
* added all tools to WP-CLI
* new tool: delete all files in uploads folder

= v1.30 =
* 2018/08/27
* more code clean-up
* added new reset params to WP-CLI
* big GUI changes
* started adding various tools; delete transients, delete all plugins, delete all themes
* we hit 50,000 installations on 2018/08/11 with 274,000 downloads

= v1.25 =
* 2018/07/30
* code clean-up
* post-reset options - reactivate plugin, themes & WP Reset
* added WP-MU warning till we make WP Reset fully compatible with it
* Tidy Repo notice
* added option to collapse boxes
* modified rating notice

= v1.20 =
* 2018/07/09
* we hit 40k installations on 2018/06/26
* WP-CLI support via "wp reset" command
* new logo
* ask for rating notice
* GUI improvements
* code clean up
* preparations for further development and new features

= v1.10 =
* 2018/05/09
* WebFactory took over development
* numerous bug fixes and improvements
* 30,000 installations; 199,000 downloads

= v1.0 =
* 2016/05/16
* Initial release

== Frequently Asked Questions ==

= How can I log in after resetting? =

Use the same username and password you used while doing the reset. Only one user will be restored after resetting. The one you used at that time.

= Will any files be deleted or modified? =

No. All files are left untouched.

= Will I have to reconfigure wp-config.php? =

Absolutely not. No reconfiguration is needed. No files are modified.

= Do you support WP-CLI? =

We sure do! Just type "wp reset" in your shell to see the list of available commands and options.

= How long does it take for the reset operation to complete? =

On most installations a second or two. If you have a huge amounts of data in tables then up to ten seconds.
