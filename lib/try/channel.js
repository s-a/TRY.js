(function ($, engine) {


	function parseURL(url) {
	    var parser = document.createElement('a'),
	        searchObject = {},
	        queries, split, i;
	    // Let the browser do the work
	    parser.href = url;
	    // Convert query string to object
	    queries = parser.search.replace(/^\?/, '').split('&');
	    for( i = 0; i < queries.length; i++ ) {
	        split = queries[i].split('=');
	        searchObject[split[0]] = split[1];
	    }
	    return {
	        protocol: parser.protocol,
	        host: parser.host,
	        hostname: parser.hostname,
	        port: parser.port,
	        pathname: parser.pathname,
	        search: parser.search,
	        searchObject: searchObject,
	        hash: parser.hash
	    };
	}

	//https://raw.githubusercontent.com/s-a/channel.try.js/efdd939f9eedd48240546bd28c84d693276c301c/channel.json
	function getGitFileContent (repo, filename, done) {
		var url = "https://api.github.com/repos/" + repo.user + "/" + repo.name + "/contents/" + filename;
		$.ajax({
		    url: url,
		    jsonp: "callback",
		   	dataType: "text",
		    success: function( response ) {
		    	var data = JSON.parse(response);
		    	var content = atob(data.content);
		    	try {
		    		content = JSON.parse(content);
		    	} catch (e) {
		    	} finally {
		    	}

		        done( content ); // server response
		    }
		});
	}


	var Channel = function() { 
		var self = this;
		this.packages = [];
		this.list = function(done) {
			getGitFileContent(repoChannel, "channel.json", function(data) {
				self.packages = data.packages;
				/*var package = data.packages[0];
				var nfo = parseUrlRepoInfo(package.environment);
				getGitFileContent(nfo.repo, nfo.filename, function(data) {
					console.warn(data);
				});*/
				for (var i = 0; i < data.packages.length; i++) {
					var package = data.packages[i];
					console.info(i, package.name + " by " + package.author , package.description );
				}
				console.info("Load a package with", "engine.channel.load(packageIndex);");
				if (done) {done(data)}
			});
		};
		this.load = function(packageIndex, done) {
			var l = function() {
				var package = self.packages[packageIndex];
				var nfo = parseUrlRepoInfo(package.environment);
				getGitFileContent(nfo.repo, nfo.filename, function(data) {
					engine.loadEnvironment(data);
					if (package.program){
						var nfo = parseUrlRepoInfo(package.program);
						getGitFileContent(nfo.repo, nfo.filename, function(sc) {
							window.robot.program.load(sc);
							if (package.test){
								var nfo = parseUrlRepoInfo(package.test);
								getGitFileContent(nfo.repo, nfo.filename, function(scr) {
									window.tests.program.load(scr);
									if (done) {done(data)}
								});
							} else {
								if (done) {done(data)}
							}
							//if (done) {done(data)}
						});
					} else {
						if (done) {done(data)}
					}
				});
			};

			if (self.packages.length === 0){
				self.list(function() {
					l();
				});
			} else {
				l();
			}

		};
		return this;
	};


	engine.channel = new Channel();

	var Repo = function(setup) {
		this.user = setup.user;
		this.name = setup.name;
		this.branch = setup.branch;
	};

	var repoChannel = new Repo({user: "s-a", name:"channel.try.js", branch:"master"});

	function parseUrlRepoInfo (url) { 
		url = parseURL(url).pathname.split("/");
		url.shift();
		var userName = url.shift();
		var repoName = url.shift();
		var branchName = url.shift();
		var filename = url.join("/");
		return {
			repo : new Repo({user: userName, name:repoName, branch:branchName}),
			filename :filename
		}
	}



})(jQuery, window.engine);


