var threeOBJ = require("three-obj")( );
var 	fs = require("fs");

threeOBJ.convert("flower.obj", "flower.js", function( response ){
	console.log( "File saved at: flower.js"  );
});
