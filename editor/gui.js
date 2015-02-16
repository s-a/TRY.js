(function(dat, engine, js_beautify, robot, gapi, rtclient, google) {
	var url = window.location.pathname;
	var filename = url.substring(url.lastIndexOf('/')+1);

	 //unRegisterAllEventListeners(window);
	var scaleFactor = 50;
	var gui = new dat.GUI();
	dat.GUI.toggleHide = function() {};
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
		this.movable = false;
	};
	var flowerConfig = window.flowerConfig = {
		position : {
			z : 0,
			x : 0,
			y : 0,
		}
	}
	if (engine.selectedFlower){
		flowerConfig.position.x = engine.selectedFlower.position.x;
		flowerConfig.position.y = engine.selectedFlower.position.y;
		flowerConfig.position.z = engine.selectedFlower.position.z;
	}

	var robotConfig = window.robotConfig = {
		position : {
			x : 0,
			z : 0
		},
		energy: window.opener.robotConfigs.energy ,
		fuel: window.opener.robotConfigs.fuel || {current:0, max:0},
		capacity: window.opener.robotConfigs.capacity
	}

	var homeBoxConfig = window.homeBoxConfig = {
		x : engine.homeBox.position.x,
		y : engine.homeBox.position.y,
		z : engine.homeBox.position.z
	}

	var config = window.config = {
		docName : ""
	};
	var boxConfig = window.boxConfig = new BoxConfig();

	if (window.opener.engine.selected) {boxConfig.movable = !!window.opener.engine.selected.userData.movable};
	var stationConfig = window.stationConfig = {
		type : 'energy',
		position:{
			x:0,
			y:0,
			z:0,
		}
	};
	 
	if (engine.selectedStation){
		stationConfig.type = engine.selectedStation.userData.type;
		stationConfig.position.x = engine.selectedStation.position.x;
		stationConfig.position.y = engine.selectedStation.position.y;
		stationConfig.position.z = engine.selectedStation.position.z;
	}

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
		robotConfig.fuel = window.opener.robotConfigs.fuel;
		//window.opener.robot.program.stop();
		var wallMetaData = engine.wall.meta();
		var stationMetaData = engine.station.meta();
		var flowerMetaData = engine.flower.meta();
		var source = {
			robot : {
				position : {
					x : engine.android.position.x,
					z : engine.android.position.z
				},
				energy : window.opener.robotConfigs.energy,
				fuel : window.opener.robotConfigs.fuel,
				capacity : window.opener.robotConfigs.capacity
			},
			homeBox : {
				position : {
					x : engine.homeBox.position.x,
					y : engine.homeBox.position.y,
					z : engine.homeBox.position.z
				}
			},
			walls : wallMetaData,
			stations : stationMetaData,
			flowers : flowerMetaData
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
		help : function() {
			var url = "";
			switch(codeMode){
				case "environment":
					url = "https://github.com/s-a/TRY.js/blob/master/docs/environment.MD";
					break;
				case "tests":
					url = "https://github.com/s-a/TRY.js/blob/master/docs/tests.MD";
					break;
				case "program":
					url = "https://github.com/s-a/TRY.js/blob/master/docs/robot.MD";
					break;
			}
			window.open(url);
		},
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
			window.opener.originalWallPositions = engine.wall.meta();
		    boxConfig.position.z = window.opener.engine.selected.position.z;
		    boxConfig.position.x = window.opener.engine.selected.position.x;
			boxConfig.scale.x = window.opener.engine.selected.geometry.width;
			boxConfig.scale.y = window.opener.engine.selected.geometry.height;
			boxConfig.scale.z = window.opener.engine.selected.geometry.depth;			
			boxConfig.movable = !!window.opener.engine.selected.userData.movable;
			refreshWallMetaSourceCode();
		},
		addFlower : function() {
			engine.flower.add();
			window.opener.originalFlowerPositions = engine.flower.meta();
			refreshWallMetaSourceCode();
		},
		addStation : function() {
			engine.station.add();
			window.opener.originalStaionPositions = engine.station.meta();
			refreshWallMetaSourceCode();
		},
		removeStation : function() {
			if (engine.selectedStation){
				engine.station.remove(engine.selectedStation);
				window.opener.robot.program.stop();
				refreshWallMetaSourceCode();
				engine.selectedStation = null;
			} else {
				alert("No station selected.");
			}
		},
		removeFlower : function() {
			if (engine.selectedFlower){
				engine.flower.remove(engine.selectedFlower);
				window.opener.originalFlowerPositions = engine.flower.meta();
				window.opener.robot.program.stop();
				refreshWallMetaSourceCode();
				engine.selectedFlower = null;
			} else {
				alert("No flower selected.");
			}
		},
		removeWall : function() {
			if (engine.selected){
				engine.wall.remove(engine.selected);
				window.opener.originalWallPositions = engine.wall.meta();
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
		assign_environment_source_code : function() {
			var source = window.editor.getValue();
			window.opener.engine.loadEnvironment(JSON.parse(source));
		},
		assign_test_source_code : function() {
			var source = window.editor.getValue();
			window.opener.tests.program.load(source);
		}
	}

	gui.add( cmd, 'help' ).name("Help");
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
	  	window.opener.originalWallPositions = engine.wall.meta();
		window.opener.robot.program.stop();
	  	refreshWallMetaSourceCode();
	}

    switch(codeMode) {
        case "environment":
			gui.add( cmd, 'addWall' ).name("New Wall");
			var folderSelectedWall = gui.addFolder('Selected wall');
			gui.add( cmd, 'addFlower' ).name("New Flower");
			var folderFlower = gui.addFolder('Selected flower');
			folderFlower.add( cmd, 'removeFlower' ).name("Remove");
			gui.add( cmd, 'addStation' ).name("New Station");
			var folderSelectedStation = gui.addFolder('Selected station');

			var folderRobot = gui.addFolder('Robot');
			var folderHomeBox = gui.addFolder('HomeBox');
			folderSelectedWall.add( cmd, 'removeWall' ).name("Remove");
			
          	folderSelectedWall.add(boxConfig, 'movable').name("Movable").listen().onChange( function(){
          		if (window.opener.engine.selected){window.opener.engine.selected.userData.movable = boxConfig.movable;}
			  	refreshWallMetaSourceCode();
			});


			folderSelectedWall.add( boxConfig.position, 'x' ).step(10).name("PositionX").listen().onChange( function(){
			  	engine.selected.position.x = (+boxConfig.position.x);
				window.opener.originalWallPositions = engine.wall.meta();
	  			window.opener.robot.program.abort = true;
	  			engine.android.position.y = 50000;
	  			window.opener.updatePhysics()
	  			window.opener.robot.program.abort = false;
			  	refreshWallMetaSourceCode();
			});
			folderSelectedWall.add( boxConfig.position, 'z' ).step(10).name("PositionZ").listen().onChange( function(){
			  	engine.selected.position.z = (+boxConfig.position.z);
				window.opener.originalWallPositions = engine.wall.meta();
	  			window.opener.robot.program.abort = true;
	  			engine.android.position.y = 50000;
	  			window.opener.updatePhysics()
	  			window.opener.robot.program.abort = false;
		  		//window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});
			folderSelectedWall.add( boxConfig.scale, 'x', 5, 10000 ).step(10).name("ScaleX").listen().onChange(refreshWallGeometry);
			folderSelectedWall.add( boxConfig.scale, 'y', 50, 1000 ).step(10).name("ScaleY").listen().onChange(refreshWallGeometry);
			folderSelectedWall.add( boxConfig.scale, 'z', 5, 10000 ).step(10).name("ScaleZ").listen().onChange(refreshWallGeometry);

			folderFlower.add( flowerConfig.position, 'x' ).step(10).name("PositionX").listen().onChange( function(){
			  	engine.selectedFlower.position.x = (+flowerConfig.position.x);
			  	engine.selectedFlower.userData.sel.position.x = (+flowerConfig.position.x-80);
	  			window.opener.originalFlowerPositions = engine.flower.meta();
			  	refreshWallMetaSourceCode();
			});
			folderFlower.add( flowerConfig.position, 'y',0 ).step(10).name("PositionY").listen().onChange( function(){
			  	engine.selectedFlower.position.y = (+flowerConfig.position.y);
			  	engine.selectedFlower.userData.sel.position.y = (+flowerConfig.position.y+15);
	  			window.opener.originalFlowerPositions = engine.flower.meta();
			  	refreshWallMetaSourceCode();
			});
			folderFlower.add( flowerConfig.position, 'z' ).step(10).name("PositionZ").listen().onChange( function(){
			  	engine.selectedFlower.position.z = (+flowerConfig.position.z);
			  	engine.selectedFlower.userData.sel.position.z = (+flowerConfig.position.z+5);
	  			window.opener.originalFlowerPositions = engine.flower.meta();
		  		//window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});

			folderSelectedStation.add( cmd, 'removeStation' ).name("Remove");
// callbacks
    		folderSelectedStation.add( stationConfig, 'type', ['energy', 'fuel', 'teleport']).listen().onChange(function() {
    			if (engine.selectedStation){
    				engine.station.setType(engine.selectedStation, stationConfig.type);
			  		refreshWallMetaSourceCode();
    			} else {
    				alert("No station selected.");
    			}
    		});
			folderSelectedStation.add( stationConfig.position, 'x' ).step(10).name("PositionX").listen().onChange( function(){
			  	engine.selectedStation.position.x = (+stationConfig.position.x);
	  			window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});
			folderSelectedStation.add( stationConfig.position, 'y' , 20).step(10).name("PositionY").listen().onChange( function(){
			  	engine.selectedStation.position.y = (+stationConfig.position.y);
		  		window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});
			folderSelectedStation.add( stationConfig.position, 'z' ).step(10).name("PositionZ").listen().onChange( function(){
			  	engine.selectedStation.position.z = (+stationConfig.position.z);
		  		window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});



			folderRobot.add( robotConfig.energy, 'current',0).step(1).name("CurrentEnergy").listen().onChange( function(){
			   	window.opener.robotConfigs.energy.current = robotConfig.energy.current;
				window.opener.orginalBotEnergyCurrent = robotConfig.energy.current;
			  	window.opener.refreshRobotEnergyStatus();
	  			//window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});
			folderRobot.add( robotConfig.energy, 'max',0).step(1).name("MaxEnergy").listen().onChange( function(){
			   	window.opener.robotConfigs.energy.max = robotConfig.energy.max;
			  	window.opener.refreshRobotEnergyStatus();
	  			//window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});
			folderRobot.add( robotConfig.fuel, 'current',0).step(1).name("FuelCurrent").listen().onChange( function(){
			   	window.opener.robotConfigs.fuel.current = robotConfig.fuel.current;
				window.opener.orginalBotFuelCurrent = robotConfig.fuel.current;
			  	window.opener.refreshRobotFuelStatus();
	  			//window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});
			folderRobot.add( robotConfig.fuel, 'max',0).step(1).name("FuelMax").listen().onChange( function(){
			   	window.opener.robotConfigs.fuel.max = robotConfig.fuel.max;
	   			window.opener.engine.fuelGauge.maxValue = robotConfig.fuel.max;
			  	window.opener.refreshRobotFuelStatus();
	  			//window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});

			folderRobot.add( robotConfig.capacity, 'current',0).step(1).name("CurrentCapacity").listen().onChange( function(){
			   	window.opener.robotConfigs.capacity.current = robotConfig.capacity.current;
			   	window.opener.orginalBotCapacityCurrent = robotConfig.capacity.current;
			  	window.opener.refreshRobotCapacityStatus();
	  			//window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});
			folderRobot.add( robotConfig.capacity, 'max',0).step(1).name("MaxCapacity").listen().onChange( function(){
			   	window.opener.robotConfigs.capacity.max = robotConfig.capacity.max;
			  	window.opener.refreshRobotCapacityStatus();
	  			//window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});

			/*
			FIXME:
			conflicts with updatePhysics
			folderRobot.add( robotConfig.position, 'x').name("PositionX").listen().onChange( function(){
			   	engine.android.position.x = robotConfig.position.x;
			   	window.opener.engine.originalBotPosition.x = robotConfig.position.x;
			  	refreshWallMetaSourceCode();
			});
			folderRobot.add( robotConfig.position, 'z').name("PositionZ").listen().onChange( function(){
			   	engine.android.position.z = robotConfig.position.z;
			   	window.opener.engine.originalBotPosition.z = robotConfig.position.z;
			  	refreshWallMetaSourceCode();
			});*/

			folderHomeBox.add( homeBoxConfig, 'x').name("PositionX").listen().onChange( function(){
			   	engine.homeBox.position.x = homeBoxConfig.x;
	   			window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});
			folderHomeBox.add( homeBoxConfig, 'y', 20).name("PositionY").listen().onChange( function(){
			   	engine.homeBox.position.y = homeBoxConfig.y;
	   			window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});
			folderHomeBox.add( homeBoxConfig, 'z').name("PositionZ").listen().onChange( function(){
			   	engine.homeBox.position.z = homeBoxConfig.z;
	   			window.opener.robot.program.stop();
			  	refreshWallMetaSourceCode();
			});


			var mazecmd = {
				height:500,
				width:500,
				rows:3,
				cols:3,
				"generate" : function() {
					window.opener.engine.addOn.maze.generate({
						height:mazecmd.height,
						width:mazecmd.height,
						rows:mazecmd.rows,
						cols:mazecmd.cols,
					});
					refreshWallMetaSourceCode();
				}
			}
			var folderAddOns = gui.addFolder('Addons');
			var folderMaze = folderAddOns.addFolder('Maze');
			folderMaze.add(mazecmd, "height", 500, 4000).step(1).name("Height");
			//folderMaze.add(mazecmd, "width", 500, 10000).name("Width");
			folderMaze.add(mazecmd, "cols", 3, 50).step(1).name("Cols");
			folderMaze.add(mazecmd, "rows", 3, 50).step(1).name("Rows");
			folderMaze.add(mazecmd, "generate").name("new");



          	gui.add(window.opener.engine, 'debugMode').name("Debug Mode");
          	gui.add(cmd, 'assign_environment_source_code').name("AssignCode");
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
		//	folderSelectedWall.open()
		}
	};

	init()

})(window.dat, window.opener.engine, window.js_beautify, window.opener.robot, window.gapi, window.rtclient, window.google);