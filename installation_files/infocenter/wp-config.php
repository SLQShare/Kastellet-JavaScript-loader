<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */


// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'local' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', 'root' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

// ** Set PHP upload and memory settings ** //
@ini_set( 'upload_max_filesize', '6GB' );
@ini_set( 'post_max_size', '6GB' );
@ini_set( 'memory_limit', '512M' );
@ini_set( 'max_execution_time', '0' );
@ini_set( 'max_input_time', '300' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',          'DB7o G!+-,]=^gfJop54e-q.}w3p?U]f1M(1GZacm/6Ds6NK1T+4N![S^*y>e&Bh' );
define( 'SECURE_AUTH_KEY',   '2K26>SYQ~WCZ7+NE}|]5^[vDncMp^3)o(^P#5t.uC*&Gm34N..y&mC3>=}z:!%s:' );
define( 'LOGGED_IN_KEY',     'Ti8(mFd:7%a%&g)8L}>k5.%w/;>bE?FE09rC<o .BaZ&R`SO%{~i(?X6QA/$%gWo' );
define( 'NONCE_KEY',         '#veU ZQ*HDfP|>uJQQZVwE5sL9k<PQ,dl:->%6;3j:!_WzIGKf#|vpdjvN:O|fu/' );
define( 'AUTH_SALT',         'N8QvdnNa<$9nM~^wO.wdg+-IFcDmbC.iIu/#/@JV?bsHB)Bq9&ZGCVK83Mz4O9[@' );
define( 'SECURE_AUTH_SALT',  '%05^o5+/G/2ht /mY{^q4&_%)6oV7#)f:NC=!wGvc<VhiuA]/kJ;Wo>;9I/(3X)0' );
define( 'LOGGED_IN_SALT',    'JIA*0@rU`{e0]{3qXj8{OIFha|@K_YN2J#B?B&oOJ4$!o7d*%9=HHDoCYIheAL;b' );
define( 'NONCE_SALT',        ']l#`BJq_nL}?6a4JJ$5a/xhC{ Z4 dC5o_2cDm0M_dra6jU671*%Ro0^`)KZ#R ^' );
define( 'WP_CACHE_KEY_SALT', 'cr),TZ$o!9s^pt^YazF$)F!P4?[I}+@H]fx6v=1A Q?ZSQ0:{]$&{{e2U3Su2<~7' );


/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';


/* Add any custom values between this line and the "stop editing" line. */



/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', false );
}

define( 'WP_ENVIRONMENT_TYPE', 'local' );
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
