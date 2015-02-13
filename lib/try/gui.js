(function(dat, robot) {
	var editorEnvironment = window.editorEnvironment;
	var windowParms = "width=600,height=500,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no";
	var packages = [];
	var msg = function(m) {

		if (typeof (m) === "boolean"){
			if (m){
				toastr.success(m);
			} else {
				toastr.error("false");
			}
		} else {
			toastr.info(m);
		}
	}


	// dublicates in editor gui.js :(	 
	var getEnvironmentMeta = function() {
		//window.opener.robot.program.stop();
		var wallMetaData = engine.wall.meta();
		var staionMetaData = engine.station.meta();
		var flowerMetaData = engine.flower.meta();
		var source = {
			robot : {
				position : {
					x : engine.android.position.x,
					z : engine.android.position.z
				},
				energy : window.robotConfigs.energy,
				capacity : window.robotConfigs.capacity
			},
			homeBox : {
				position : {
					x : engine.homeBox.position.x,
					z : engine.homeBox.position.z
				}
			},
			walls : wallMetaData,
			stations: staionMetaData,
			flowers : flowerMetaData
		}
		return source;
	}

	var showPackages = function() {
		var $dlg = null;
		var show = function() {

			var dlg = $('<div class="white-popup"><h3><a href="https://github.com/s-a/channel.try.js" target="_blank">Packages shared on GitHub</a><h3></div>');
			var ul = $("<ul></ul>");
			 
				for (var i = 0; i < packages.length; i++) {
					var p = packages[i];

					var 
					links = ""; /*"<li>" + p.environment + "</li>";
					links += "<li>" + p.program + "</li>";
					links += "<li>" + p.tests + "</li>";
					links = "<ul>"+links+"</ul>";*/

					var li = $("<li><strong>" + p.name + "</strong> - <small>" + p.description + "<sub> Author: " + p.author + "</sub></small></li>" + links).data("idx", i);
					//li.attr("title", p.description);
					li.click(function() {
						window.engine.channel.load($(this).data("idx"), function() {
							$.magnificPopup.close();
						});
					});
					li.appendTo(ul);
				}
			 
			ul.appendTo(dlg);
			$dlg = $.magnificPopup.open({
			  items: {
			    src: dlg, 
			    type: 'inline'
			  }
			});
		};

		if (packages.length === 0){
			window.engine.channel.list(function(data){
				packages = data.packages;
				show();
			});
		} else {
			show();
		}
	};
	var parameters = {
		x: 0, y: 30, z: 0,
		color: "#ff0000", // color (change "#" to "0x")
		visible: true,
		material: "Phong",
		move_cam_top:function() {
			var target = new THREE.Vector3(0,1110,0);
			window.engine.cam.tween(target);
		},
		move_cam_left:function() {
			var target = new THREE.Vector3(engine.android.position.x+500,100,engine.android.position.z);
			window.engine.cam.tween(target);
		},
		move_cam_right:function() {
			var target = new THREE.Vector3(engine.android.position.x-500,100,engine.android.position.z);
			window.engine.cam.tween(target);
		},
		move_cam_front:function() {
			var target = new THREE.Vector3(engine.android.position.x,100,engine.android.position.z+500);
			window.engine.cam.tween(target);
		},
		move_cam_behind:function() {
			var target = new THREE.Vector3(engine.android.position.x,100,engine.android.position.z-500);
			window.engine.cam.tween(target);
		},
		donate :function() {
			$dlg = $.magnificPopup.open({
			  items: {
			    src: "#donate", 
			    type: 'inline'
			  }
			});
		},
		quickShare :function() {
			var res = {
				c : robot.program.rawCode(),
				t : tests.program.rawCode(),
				e : getEnvironmentMeta(),
			}
			res = JSON.stringify(res);
			if (res.length>2000){
				toastr.error("Cannot create a valid share link because this package is too large and exceeds the maximum length of 2000 characters.");
			} else {
				window.open("?q=" + encodeURIComponent(res));
			}
			// max 2000
		 
		},
		share_on_github :function() {
			window.open("https://github.com/s-a/channel.try.js");
		},
		list_examples: function() {
			showPackages();
			return;
		},
		charge: function() {
			if (!robot.charge()){
				//msg("Charge does only work within an energy box.");
			}
		},
		get: function() {
			if (!robot.get()){
				//msg("Here is nothing to pick up or I do not have enough capacity.");
			}
		},
		put: function() {
			if (!robot.put()){
				//msg("I have nothing to unload or it is not possible to unload something here because there is no space.");
			}
		},
		run: function() {
			robot.run(10);
		},
		move_forward: function() {
			robot.move('forward');
		},
		move_backward: function() {
			robot.move('backward');
		},
		turn_around: function() {
			robot.turn('around');
		},
		rotate_left: function() {
			robot.turn('left');
		},
		rotate_right: function() {
			robot.turn('right');
		},
		undo_move: function() {
			robot.undoMove();
		},
		step_left: function() {
			robot.step("left");
		},
		step_right: function() {
			robot.step("right");
		},
		edit_environment: function() {
			window.robot.program.stop();
			window.editorEnvironment = window.open("editor/environment.html", "Environment", windowParms);
			window.editorEnvironment.focus();
			return false;
		},
		edit_program: function() {
			window.editorProgram = window.open("editor/program.html", "Program", windowParms);
			window.editorProgram.focus();
			return false;
		},		
		run_program: function() {
			window.robot.program.run();
			return false;
		},
		stop_program: function() {
			window.robot.program.stop();
			return false;
		},
		try_source_at_github: function() {
			window.open("https://github.com/s-a/try.js");
			return false;
		},
		help: function() {
			window.open("https://github.com/s-a/try.js#learn-tryjs-in-a-few-minutes");
			return false;
		},
		bugreport: function() {
			window.open("https://github.com/s-a/try.js/issues");
			return false;
		},
		robot_at_home: function() {
			msg(robot.sensor.atHome());
			return false;
		},
		robot_can_move_forward: function() {
			var f = !!robot.sensor.canMove("forward");
			msg(f);
			return false;
		},
		robot_can_get: function() {
			msg(robot.sensor.canGet());
			return false;
		},
		robot_can_charge: function() {
			msg(robot.sensor.canCharge());
			return false;
		},
		robot_can_put: function() {
			msg(robot.sensor.canPut());
			return false;
		},
		robot_can_move_backward: function() {
			msg(robot.sensor.canMove("backward"));
			return false;
		},
		robot_can_turn_left: function() {
			msg(robot.sensor.canTurn("left"));
			return false;
		},
		robot_can_turn_right: function() {
			msg(robot.sensor.canTurn("right"));
			return false;
		},
		run_tests : function() {
			window.tests.program.run();
		},
		edit_tests: function() {
			window.editorTests = window.open("editor/tests.html", "Tests", windowParms);
			window.editorTests.focus();
			return false;
		},		

	};

	var gui = new dat.GUI();

	gui.add( parameters, 'help' ).name("Getting Started");

	var f0 = gui.addFolder('Camera');
	f0.add( parameters, 'move_cam_top' ).name("Top");
	f0.add( parameters, 'move_cam_front' ).name("North");
	f0.add( parameters, 'move_cam_right' ).name("East");
	f0.add( parameters, 'move_cam_behind' ).name("South");
	f0.add( parameters, 'move_cam_left' ).name("West");

 

	
	var f1 = gui.addFolder('Robot');
	f1.add( window.robotConfigs, 'speed', 1, 400).step(1).name("Speed").listen();
	var f11 = f1.addFolder('Commands');
	f11.add( parameters, 'move_forward' ).name("Move forward");
	f11.add( parameters, 'move_backward' ).name("Move backward");
	f11.add( parameters, 'step_left' ).name("Step left");
	f11.add( parameters, 'step_right' ).name("Step right");
	f11.add( parameters, 'rotate_left' ).name("Rotate left");
	f11.add( parameters, 'rotate_right' ).name("Rotate right");
	f11.add( parameters, 'turn_around' ).name("Turn around");
	f11.add( parameters, 'undo_move' ).name("Undo Move");
	f11.add( parameters, 'run' ).name("Move10Times");
	f11.add( parameters, 'charge' ).name("charge");
	f11.add( parameters, 'get' ).name("Pick up");
	f11.add( parameters, 'put' ).name("Unload");
	var f12 = f1.addFolder('Sensor');
	f12.add( parameters, 'robot_at_home' ).name("isAtHome)");
	f12.add( parameters, 'robot_can_get' ).name("canGet");
	f12.add( parameters, 'robot_can_put' ).name("canPut");
	f12.add( parameters, 'robot_can_charge' ).name("canCharge");
	f12.add( parameters, 'robot_can_move_forward' ).name("canMoveForward");
	f12.add( parameters, 'robot_can_move_backward' ).name("canMoveBackward");
	f12.add( parameters, 'robot_can_turn_left' ).name("canTurnLeft");
	f12.add( parameters, 'robot_can_turn_right' ).name("canTurnRight");

	var f4 = gui.addFolder('Package');
	f4.add( parameters, 'list_examples' ).name("Open");
	f4.add( parameters, 'quickShare' ).name("ShareViaLink");
	f4.add( parameters, 'share_on_github' ).name("ShareOnGitHub");

	gui.add( parameters, 'edit_environment' ).name("Edit Environment");

	var f2 = gui.addFolder('Program');
	f2.add( parameters, 'edit_program' ).name("Edit");
	f2.add( parameters, 'run_program' ).name("Run");
	f2.add( parameters, 'stop_program' ).name("Stop");

	var f3 = gui.addFolder('Tests');
	f3.add( parameters, 'edit_tests' ).name("Edit");
	f3.add( parameters, 'run_tests' ).name("Run");

	var f5 = gui.addFolder('About');
	//f5.add( parameters, 'try_source_at_github' ).name("Fork the code");
	f5.add( parameters, 'help' ).name("Help");
	f5.add( parameters, 'bugreport' ).name("Report a bug");
	f5.add( parameters, 'donate' ).name("Donate");

	gui.open();
	f1.open();
})(window.dat, window.robot);