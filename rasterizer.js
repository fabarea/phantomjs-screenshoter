/**
 * Takes a screenshot from a web page and add numeric bullets next to
 * pre-defined selectors.
 *
 * Configuration:
 * create as many "resource" object in the configuration zone and make sure they
 * are added in the resources array.
 *
 * @todo: add a delimter zone in the screenshot. For now take the whole HTML page.
 **/

//////////////////////////////////////////
// Configuration zone
//////////////////////////////////////////
var resources = new Array()
resource = {};

// copy / paste this bit
resource = {
	// The URL of the resource
	url:'http://localhost/',

	// Where the bullet 1,2,3,... will appear
	selectors:[
		'h1',
		'ul li:nth-child(1)',
		'ul li:nth-child(3)',
		'ul li:nth-child(5)'
	]
}
resources.push(resource);

var jqueryResource = 'http://code.jquery.com/jquery-1.7.1.min.js';

//////////////////////////////////////////
// Let's the fun happen
//////////////////////////////////////////

// Script inspired from
// http://www.cameronjtinker.com/post/2011/09/26/Take-Screenshot-of-all-HTML-documents-in-a-folder-using-PhantomJS.aspx
var page = require('webpage').create(),
	loadInProgress = false,
	fs = require('fs')

console.log('Number of pages to handle: ' + resources.length);

// output pages as PNG
var resourceIndex = 0;

var interval = setInterval(function () {
	if (!loadInProgress && resourceIndex < resources.length) {
		page.open(resources[resourceIndex].url);
	}
}, 250);


page.onLoadStarted = function () {
	loadInProgress = true;
	console.log('Loading page ' + (resourceIndex + 1));
};

page.onLoadFinished = function (status) {
	if (status === "success") {


		page.includeJs(jqueryResource, function () {

			loadInProgress = false;

			// It should be possible to pass variables in phantomjs 1.5...
			eval('function workaround(){ window.selector = "' + resources[resourceIndex].selector + '";}');
			page.evaluate(workaround);

			// It should be possible to pass variables in phantomjs 1.5...
			// Notice Array will be serialized with a comma separated string
			eval('function workaround(){ window.selectors = "' + resources[resourceIndex].selectors + '";}');
			page.evaluate(workaround);

			page.evaluate(function () {

				//////////////////////////////////////////
				// Define the style of the bullet
				//////////////////////////////////////////

				// It should be possible to pass variables in phantomjs 1.5...
				// For now, defines the bullet style here...
				var styleToInject = {
					"span.bullet":{
						"margin-left":"10px",
						"color":"#fff",
						"background-color":"black",
						"border":"2px solid black",
						"border-radius":"20px",
						"font-family":'"Verdana",Arial,sans-serif',
						"font-size":'9pt',
						"font-weight":'bold'
					}
				}

				var styleFormatted = '';

				for (var styles in styleToInject) {

					var _stylesFormatted = '';
					for (var style in styleToInject[styles]) {
						_stylesFormatted += style + ":" + styleToInject[styles][style] + ";";
					}

					styleFormatted = styles + "{" + _stylesFormatted + "}";
				}

				styleFormatted = '<style>' + styleFormatted + '</style>';
				$("body").append(styleFormatted);

				var bullets = window.selectors.split(",");
				for (var index = 0; index < bullets.length; index++) {
					$(bullets[index]).append('<span class="bullet">' + (index + 1) + '</span>');
				}

			});
			page.render("output" + (resourceIndex + 1) + ".png");
			console.log('page ' + (resourceIndex + 1) + ' load finished');
			resourceIndex++;

			// Stop Phantom by hand if job's done!
			if (resourceIndex == resources.length) {
				console.log("image render complete!");
				phantom.exit();
			}
		});
	}
}

page.onConsoleMessage = function (msg) {
	console.log(msg);
};
