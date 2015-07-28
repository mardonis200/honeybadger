// Obfuscation? Honey badger don't care!

function honeybadger_base64_encode(data) {
	//  discuss at: http://phpjs.org/functions/honeybadger_base64_encode/
	// original by: Tyler Akins (http://rumkin.com)
	// improved by: Bayron Guevara
	// improved by: Thunder.m
	// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// improved by: Rafał Kukawski (http://kukawski.pl)
	// bugfixed by: Pellentesque Malesuada
	
	var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
	ac = 0,
	enc = '',
	tmp_arr = [];
	
	if (!data) {
		return data;
	}
	
	do { // pack three octets into four hexets
		o1 = data.charCodeAt(i++);
		o2 = data.charCodeAt(i++);
		o3 = data.charCodeAt(i++);
		
		bits = o1 << 16 | o2 << 8 | o3;
		
		h1 = bits >> 18 & 0x3f;
		h2 = bits >> 12 & 0x3f;
		h3 = bits >> 6 & 0x3f;
		h4 = bits & 0x3f;
		
		// use hexets to index into b64, and append result to encoded string
		tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	} while (i < data.length);
	
	enc = tmp_arr.join('');
	
	var r = data.length % 3;
	
	return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}

// We'll use these later
honeybadger_eval = eval
honeybadger_write = document.write

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

// DOM changes we're interested in
honeybadger_collect_dom_objects = ['IFRAME', 'APPLET', 'OBJECT', 'SCRIPT']

// Logging function
function honeybadger_log(type, msg){
	var xmlhttp = null;
	if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	else{// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.open("POST", honeybadger_reporting_url+"?submission_id="+honeybadger_submission_id+"&type="+type+"&msg="+honeybadger_base64_encode(msg).replace('+', '%2B'), false)
	xmlhttp.send(null);
	return xmlhttp.responseText;
}


// Catch Errors
window.onerror = function(message, url, lineNumber) {
	honeybadger_log('error', lineNumber + ": " + message);
	return true;
};

// Catch useragent checks
honeybadger_ua = window.navigator.userAgent
navigator.__defineGetter__('userAgent', function(){
	honeybadger_log('alert', 'Script checks the browser useragent')
    return honeybadger_ua
});

// Catch DOM manipulations
if (window.MutationObserver){

	var observer = new MutationObserver(function(mutations){
		mutations.forEach(function(mutation) {
			if (mutation.type == "childList"){
				for (i = 0; i < mutation.addedNodes.length; i++){
					if (honeybadger_collect_dom_objects.indexOf(mutation.addedNodes[i].nodeName) != -1){
						honeybadger_log("dom",  mutation.addedNodes[i].nodeName + ':' + mutation.addedNodes[i].outerHTML);
					}
				}
			}
		});
	});

	observer.observe(document, {
		subtree: true,
		attributes: true,
		childList: true
	});

}

honeybadger_Function = Function
Function = function (arg1, arg2){
	if (arg2 == undefined){
		honeybadger_log('anonymous_function', arg1);
		return honeybadger_Function(arg1);
	}
	honeybadger_log('anonymous_function', arg1, + ', ' + arg2);
	return honeybadger_Function(arg1, arg2);
}

Function.prototype = honeybadger_Function.prototype

// Override evals
eval = function(code){
	honeybadger_log("eval", code);
	return Function.prototype.apply.call(
		honeybadger_eval, window, arguments
	);
}

// Override writes
document.writeln = document.write = function(code){
	honeybadger_log("write", code);
	return Function.prototype.apply.call(
		honeybadger_write, document, arguments
	);
}

// Snapshot environment variables
function snapshot(){
	var things = {};
	for (thing in window){
		things[thing] = window[thing];
	}
	delete thing
	return things
}

// Compare environment variables
function compareThings(things1, things2){

	var changes = [];
	for (thing in things2){
		if (things1[thing] == undefined && things2[thing] != null && thing != 'honeybadger_things'){
			changes.push(Array(thing, typeof(things2[thing]), things2[thing]));
		}
	}

	delete thing
	return changes
}

// Check for new strings after 8 seconds
window.setTimeout(function(){
	result = compareThings(honeybadger_things, snapshot());
	for (i in result){
		if (result[i][1] == 'string'){
			honeybadger_log('var', result[i][0] + ':' + honeybadger_base64_encode(result[i][2]));
		}
	}
}, 8000);

// Don't want these going off!
alert = function(){}
confirm = function(){return true}
prompt = function(){return 'Honeybadger Rul3z!!!'}

honeybadger_things = snapshot();
