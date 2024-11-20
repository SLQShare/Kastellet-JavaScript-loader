// function that allows .JSON files to be uploaded in the media folder
function allow_json_mime($mimes) {
	$mimes['json'] = 'application/json';
	return $mimes;
	}
add_filter('upload_mimes', 'allow_json_mime');

// loads the JavaScript and .JSON files into wordpress
function enqueue_custom_script() {
    // Enqueue your custom JS file
    wp_enqueue_script('custom-filter-script', get_template_directory_uri() . '/js/loader.js', array('jquery'), null, true);
    
    // Find and load the .JSON files
    wp_localize_script('custom-filter-script', 'jsonData', array(
        'json_url' => get_template_directory_uri() . 'wp-content/uploads/2024/11/dk.json',
    ));
}
add_action('wp_enqueue_scripts', 'enqueue_custom_script');