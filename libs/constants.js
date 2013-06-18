/**
 * This holds the function and associated class for setting constants.
 **/
var __constants = {};

function C(key)
{
	if(typeof __constants[key] === "undefined")
		console.log("Warning: attempt to access a constant failed.");

	return __constants[key];
}

C.set = function(obj) {
	for(var key in obj)
		if(typeof __constants[key] === "undefined")
			__constants[key] = obj[key];
};
