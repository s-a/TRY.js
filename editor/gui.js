
(function(dat, engine, js_beautify, robot, gapi, rtclient, google) {
	var url = window.location.pathname;
	var filename = url.substring(url.lastIndexOf('/')+1);

	
	var scaleFactor = 50;
	var gui = new dat.GUI();
	var codeMode = filename.split(".")[0];
	var BoxConfig = function() {
		this.position = {
			z : 0,
			x : 0,
		}
		this.scale = {
			x:5,
			y:5,
			z:5,
		}
	};

	var robotConfig = window.robotConfig = {
		position : {
			x : 0,
			z : 0
		},
		energy: window.opener.robotConfigs.energy

	}

	var homeBoxConfig = window.homeBoxConfig = {
		x : 0,
		z : 0
	}

	var config = window.config = {
		docName : ""
	};
	var boxConfig = window.boxConfig = new BoxConfig();
	var updateSourceCode = function(json) {
	  	window.editor.setValue(getEnvironmentMetaSourceCode(json));
	}


	var getEnvironmentMetaSourceCode = window.getEnvironmentMetaSourceCode = function(json) {
		try {
			var source = json;
			if (typeof (json) === "object")	{
				source = JSON.stringify(json);
			}
			return js_beautify(source);
		} catch (e) {
	 	} finally {
		}
	}

	var getEnvironmentMeta = window.getEnvironmentMeta = function() {
		robotConfig.energy = window.opener.robotConfigs.energy;
		//window.opener.robot.program.stop();
		var wallMetaData = engine.wall.meta();
		var source = {
			robot : {
				position : {
					x : engine.android.position.x,
					z : engine.android.position.z
				},
				energy : window.opener.robotConfigs.energy
			},
			homeBox : {
				position : {
					x : engine.homeBox.position.x,
					z : engine.homeBox.position.z
				}
			},
			walls : wallMetaData,
		}
		return source;
	}
	var refreshrobotSourceCode = window.refreshrobotSourceCode = function() {
		var source = window.opener.robot.program.rawCode();
		updateSourceCode(source);
	}

	var refreshTestSourceCode = window.refreshTestSourceCode = function() {
		var source = window.opener.tests.program.rawCode();
		updateSourceCode(source);
	}

	var refreshWallMetaSourceCode = window.refreshWallMetaSourceCode = function() {

		var source = getEnvironmentMeta();
		updateSourceCode(source);
	}

	var cmd = {
		create : function() {
			window._client.createNewFileAndRedirect()
		},
		open : function() {

	      /*$('#btn-share').addClass('disabled');*/
	      return google.load('picker', '1', {
	        callback: function() {
	          var picker, token, view;
	          token = gapi.auth.getToken().access_token;
	          view = new google.picker.View(google.picker.ViewId.DOCS);
	          view.setMimeTypes("application/vnd.google-apps.drive-sdk." + window.APPID);
	          picker = new google.picker.PickerBuilder().enableFeature(google.picker.Feature.NAV_HIDDEN).setAppId(window.APPID).setOAuthToken(token).addView(view).addView(new google.picker.DocsUploadView()).setCallback(window.openCallback).build();
	          return picker.setVisible(true);
	        }
	      });
		},
		addWall : function() {
			engine.wall.add();
			refreshWallMetaSourceCode();
		},
		removeWall : function() {
			if (engine.selected){
				engine.wall.remove(engine.selected);
				window.opener.robot.program.stop();
				refreshWallMetaSourceCode();
				engine.selected = null;
			} else {
				alert("No wall selected.");
			}
		},
		assign_program_source_code : function() {
			var source = window.editor.getValue();
			window.opener.robot.program.load(source);
		},
		assign_test_source_code : function() {
			var source = window.editor.getValue();
			window.opener.tests.program.load(source);
		}
	}

	var folderDocument = gui.addFolder('Document');

	folderDocument.add( cmd, 'open' ).name("Open Document");
	folderDocument.add( cmd, 'create' ).name("New Document");

	var txtDocName = window.txtDocName = folderDocument.add( config, "docName").name("docName").listen().onChange(function() {
          var renameRequest;
          //$('#doc-name').attr('disabled', '');
		  $(txtDocName.domElement).find("input:first").attr('disabled', '');
          renameRequest = gapi.client.drive.files.patch({
            fileId: rtclient.params.fileId,
            resource: {
              title: config.docName
            }
          });
          return renameRequest.execute(function(resp) {
            config.docName = resp.title;
            return $(txtDocName.domElement).find("input:first").removeAttr('disabled').focus();
            //$('#doc-name').val(resp.title);
            //return $('#doc-name').removeAttr('disabled');
          });
	});

	var refreshWallGeometry = function(){
	   	engine.wall.remove(engine.selected);
	   	engine.wall.add(boxConfig);
		window.opener.robot.program.stop();
	  	refreshWallMetaSourceCode();
	}

    switch(codeMode) {
        case "environment":
			gui.add( cmd, 'addWall' ).name("New Wall");
			var folderSelectedWall = gui.addFolder('Selected wall');
			var folderRobot = gui.addFolder('Robot');
			var folderHomeBox = gui.addFolder('HomeBox');
			folderSelectedWall.add( cmd, 'removeWall' ).name("Remove");


			folderSelectedWall.add( boxConfig.position, 'x' ).step(10).name("PositionX").listen().onChange( function(){
			  	engine.selected.position.x = (+boxConfig.position.x);
	  			window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});
			folderSelectedWall.add( boxConfig.position, 'z' ).step(10).name("PositionZ").listen().onChange( function(){
			  	engine.selected.position.z = (+boxConfig.position.z);
		  		window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});
			folderSelectedWall.add( boxConfig.scale, 'x', 5, 10000 ).step(10).name("ScaleX").listen().onChange(refreshWallGeometry);
			folderSelectedWall.add( boxConfig.scale, 'y', 50, 100 ).step(10).name("ScaleY").listen().onChange(refreshWallGeometry);
			folderSelectedWall.add( boxConfig.scale, 'z', 5, 10000 ).step(10).name("ScaleZ").listen().onChange(refreshWallGeometry);


			folderRobot.add( robotConfig.energy, 'current',0).step(1).name("CurrentEnergy").listen().onChange( function(){
			   	window.opener.robotConfigs.energy.current = robotConfig.energy.current;
			  	window.opener.refreshRobotEnergyStatus();
	  			window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});
			folderRobot.add( robotConfig.energy, 'max',0).step(1).name("MaxEnergy").listen().onChange( function(){
			   	window.opener.robotConfigs.energy.max = robotConfig.energy.max;
			  	window.opener.refreshRobotEnergyStatus();
	  			window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});

			folderRobot.add( robotConfig.position, 'x').name("PositionX").listen().onChange( function(){
			   	engine.android.position.x = robotConfig.position.x;
			   	window.opener.engine.originalBotPosition.x = robotConfig.position.x;
			  	refreshWallMetaSourceCode();
			});
			folderRobot.add( robotConfig.position, 'z').name("PositionZ").listen().onChange( function(){
			   	engine.android.position.z = robotConfig.position.z;
			   	window.opener.engine.originalBotPosition.z = robotConfig.position.z;
			  	refreshWallMetaSourceCode();
			});

			folderHomeBox.add( homeBoxConfig, 'x').name("PositionX").listen().onChange( function(){
			   	engine.homeBox.position.x = homeBoxConfig.x;
	   			window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});
			folderHomeBox.add( homeBoxConfig, 'z').name("PositionZ").listen().onChange( function(){
			   	engine.homeBox.position.z = homeBoxConfig.z;
	   			window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});


			var mazecmd = {
				"generate" : function() {
					window.opener.engine.addOn.maze.generate({
						height:500,
						width:500,
						rows:3,
						cols:3,
					});
					refreshWallMetaSourceCode();
				}
			}
			var folderAddOns = gui.addFolder('Addons');
			var folderMaze = folderAddOns.addFolder('Maze');
			folderMaze.add(mazecmd, "generate").name("new");



          	break;
        case "program":
			gui.add(cmd, 'assign_program_source_code').name("AssignCode");
          	break;
        case "tests":
          	gui.add(cmd, 'assign_test_source_code').name("AssignCode");
          	break;
    }

	var init = function() {
		if (engine.selected){
			boxConfig.position.z = engine.selected.position.z;
			boxConfig.position.x = engine.selected.position.x;
			boxConfig.scale.x = engine.selected.geometry.width;
			boxConfig.scale.y = engine.selected.geometry.height;
			boxConfig.scale.z = engine.selected.geometry.depth;
		}
		gui.open();
		if (folderSelectedWall) {
			folderSelectedWall.open()
		}
	};

	init()

})(window.dat, window.opener.engine, window.js_beautify, window.opener.robot, window.gapi, window.rtclient, window.google);