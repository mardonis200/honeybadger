// Begin plugin spoofer

VERSIONS = {{versions}}

window.navigator.pluginEnabled = function(){ return true }

plugins = []
mimetypes = []

if (VERSIONS.flash){
	plugins.push({
		'name': 'Shockwave Flash',
		'description' : 'Shockwave Flash ' + VERSIONS.flash,
		'version': VERSIONS.flash,
	})
	mimetypes.push({'honeybadger_plugin' : 'application/x-shockwave-flash',
	'type': 'application/x-shockwave-flash?version=' + VERSIONS.flash,
	'enabledPlugin' : {
		'name': 'Shockwave Flash',
		'description': VERSIONS.flash,
		'version': VERSIONS.flash,
	}})
}

if (VERSIONS.java){
	plugins.push({
		'name': 'Java',
		'description' : 'Java ' + VERSIONS.java,
		'version': VERSIONS.java,
	})
	mimetypes.push({'honeybadger_plugin' : 'application/x-java-applet',
	'type': 'application/x-java-applet;jpi-version=' + VERSIONS.java,
	'enabledPlugin' : {
		'name': 'Java',
		'description': VERSIONS.java,
		'version': VERSIONS.java,
	}})
}

for (var i = 0; i < mimetypes.length; i++){
	plugin = mimetypes[i].honeybadger_plugin
	mimetypes[plugin] = mimetypes[i]
}

if (Object.keys(VERSIONS).length > 0){
	navigator.__defineGetter__('plugins', function(){ return plugins });
	navigator.__defineGetter__('mimeTypes', function(){ return mimetypes });
}
// End plugin spoofer
