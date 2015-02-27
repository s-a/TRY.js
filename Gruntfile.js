var projectVersion = require("./package.json").version;
module.exports = function(grunt) {
	grunt.initConfig({
	    mocha_slimer: {
	        browser_test: {
	            options: {
	                ui: 'bdd',
	                reporter: 'Spec',
	                //grep: 'some keyword',
	                // SlimerJS timeout 
	                timeout: 60000,
	                // set to false and call it later for async tests (AMD etc) 
	                run: false,
	                // run SlimerJS via 'xvfb-run': for true headless testing 
	                // must be true on Travis-CI, use: (process.env.TRAVIS === 'true') 
	                xvfb: false,
	                // pass http urls (use grunt-contrib-connect etc) 
	                urls: ['http://localhost/robot.js/']
	            }

		  	}
		}
	});
	 

	// Production Build Tools
	grunt.loadNpmTasks('grunt-bump');
	grunt.loadNpmTasks('grunt-mocha-slimer'); 
	// Default Production Build task(s).
	grunt.registerTask('browser_test', [
		'mocha_slimer'
	]);

};