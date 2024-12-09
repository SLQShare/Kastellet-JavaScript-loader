// Allow .JSON files to be uploaded in the media folder
function allow_json_mime($mimes) {
    $mimes['json'] = 'application/json';
    return $mimes;
}
add_filter('upload_mimes', 'allow_json_mime');

// Enqueue the main JavaScript file with ES6 module support
function enqueue_custom_script() {
    wp_enqueue_script(
        'loader-script', // Handle for the script
        get_template_directory_uri() . '/js/loader.js', // Path to loader.js
        array(), // Dependencies (empty since this is the main module)
        null, // No version number
        true // Load in the footer
    );

    // Add type="module" for ES6 module support
    add_filter('script_loader_tag', function($tag, $handle, $src) {
        if ('loader-script' === $handle) {
            $tag = '<script type="module" src="' . esc_url($src) . '"></script>';
        }
        return $tag;
    }, 10, 3);
}
add_action('wp_enqueue_scripts', 'enqueue_custom_script');
