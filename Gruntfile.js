var projectVersion = require("./package.json").version;
var https = require('https');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var atob = require('atob');
var url = require('url'); 

	var Repo = function(setup) {
		this.user = setup.user;
		this.name = setup.name;
		this.branch = setup.branch;
	};

	var repoChannel = new Repo({user: "s-a", name:"channel.try.js", branch:"master"});

	var parseUrlRepoInfo = function (u) { 
		var res =  url.parse(u);
		res = res.pathname.split("/");
		res.shift();
		var userName = res.shift();
		var repoName = res.shift();
		var branchName = res.shift();
		var filename = res.join("/");
		return {
			repo : new Repo({user: userName, name:repoName, branch:branchName}),
			filename :filename
		}
	}



var download = function(repository, filename, done) {
	var url = "https://api.github.com/repos/" + repository.user + "/" + repository.name + "/contents/" + filename;
	var targetFilename = "./temp/" + repository.user + "/" + repository.name + "/contents/" ;
	filename = decodeURI (filename);
	if (! fs.existsSync(targetFilename + filename) ){
		console.log("prepare", targetFilename, " ..." );

		var tmp = filename.split("/");
		if (tmp.length === 0 ){
	 		mkdirp.sync(targetFilename);
		} else {
			tmp.pop();
			mkdirp.sync(targetFilename + tmp.join("/"));
		}

 		targetFilename += filename;
		console.log(url, "=>", targetFilename, " ..." );

		var request = require('request');
		var options = {
		    url: url,
		    headers: {
		        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36'
		    }
		};
		var fileWriter = fs.createWriteStream(targetFilename);
		var callback = function(error, response, body) {
		    if (!error && response.statusCode === 200) {
		    	var content = atob(JSON.parse(body).content);
		    	//console.log(content);
		    	console.log("writing content", "=>", targetFilename);
		        fileWriter.end(content); // write to cache

				fileWriter.on('finish', function() {
					var data = null;
					if (targetFilename.split(".json").length > 1){
						data = require(targetFilename);
					}
	        		done(data);
				});
		    } else {
		    	throw error;
		    }
		}

		request(options, callback);
	} else {
 		targetFilename += filename;
		console.log("chache", "=>", targetFilename, " ..." );
		var data = null;
		if (targetFilename.split(".json").length > 1){
			data = require(targetFilename);
		}

		done(data);
	}
};

module.exports = function(grunt) {

	    grunt.registerTask('fetch-packages', function() {
			var done = this.async();
			var all = 0;
			var channelJsonComplete = function(data) {
				var files = [];
				var doDownload = function() {
					if (files.length === 0){
						done();
					} else {
						download(files[0].repo, files[0].filename, function  (dat) {
							files.shift();
							doDownload();
						})
					}
				};

				for (var i = 0; i < data.packages.length; i++) {
					var p = data.packages[i];

					if (p.environment){
						all--;
						var env = parseUrlRepoInfo(p.environment);
						files.push(env);
					}
					if (p.test){
						all--;
						var test = parseUrlRepoInfo(p.test);
						files.push(test);
					}
					if (p.program){
						all--;
						var program = parseUrlRepoInfo(p.program);
						files.push(program)
					}
				}
				doDownload();
			};

			download(repoChannel, "channel.json", channelJsonComplete);

	    });


		grunt.initConfig({
		    mocha_slimer: {
		    	"fetch-packages" : {},
		        "browser_test": {
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
		                xvfb: (process.env.TRAVIS === 'true'),
		                // pass http urls (use grunt-contrib-connect etc)
		                urls: ['http://localhost/robot.js/'],
		                "webSecurity": false
		            }

			  	}
			}
		});


		// Production Build Tools
		grunt.loadNpmTasks('grunt-bump');
		grunt.loadNpmTasks('grunt-mocha-slimer');
		// Default Production Build task(s).
		grunt.registerTask('browser_test', [
			'fetch-packages',
		 	'mocha_slimer'
		]);

	};