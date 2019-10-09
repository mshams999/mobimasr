<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'wordpress' );

/** MySQL database username */
define( 'DB_USER', 'root' );

/** MySQL database password */
define( 'DB_PASSWORD', '' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '-mX<{F{m(8sPP_RIoVd%o:&e`03CPG=!)vg89qP$Rm1dJ;jO32Ef8Fl5<8ZUJK0j' );
define( 'SECURE_AUTH_KEY',  'I=^#{%ts%7[6$w)mIy9Hl5YHB|/F#oqHB^.c,(x&E|)}rcYHQ>CEg*R#/2G@G<pS' );
define( 'LOGGED_IN_KEY',    ']gS|(W5w`Ep^t9?=,rvDg>) 9:/t+Ho)q#n UzKQf_I[wS%)>+)bzr]daXLd{$8q' );
define( 'NONCE_KEY',        '!X%61|Muo23BC bnp|9xtg+M< Il}@`IhUUp|sF.zZ#BtD}h=oWOO+K!w2s5O1bb' );
define( 'AUTH_SALT',        '~0_Muv=9O?{8_S;>T~a$EnGETstDu=bCSP{}to(]Wz?KWYc(eCinO)$FU|tuy7R~' );
define( 'SECURE_AUTH_SALT', '}tI!?DIBMj,TK}f&WE9G3-K <!;;&O Fz/]qV|{qYge^|~aVU`W*fQ[9@a[D{E$)' );
define( 'LOGGED_IN_SALT',   '- D8=%pgfGngxQ&-*aRdvm(:=tEYkNuRJh%PM 4zNt:s(DDV&4PyMLB-+!vxVX&.' );
define( 'NONCE_SALT',       '9Fe|#d$a4V}a#FH@K+5gAeV:khxm!wzYX@``dr}{t _Mm;3}DwxpkiO^vS|S*x6!' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define( 'WP_DEBUG', false );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

/** Sets up WordPress vars and included files. */
require_once( ABSPATH . 'wp-settings.php' );
