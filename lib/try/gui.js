(function(dat, robot) {
	var editorEnvironment = window.editorEnvironment;
	var windowParms = "width=600,height=500,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no";
	var packages = [];

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

					var li = $("<li><strong>" + p.name + "</strong> <small>" + p.description + "<i> by " + p.author + "</i></small></li>" + links).data("idx", i);
					li.attr("title", p.description);
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
		share_on_github :function() {
			window.open("https://github.com/s-a/channel.try.js");
		},
		list_examples: function() {
			showPackages();
			return;
			if(window.console){
			} else {
				alert("Please open a console first.");
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
			window.open("https://github.com/s-a/try.js");
			return false;
		},
		bugreport: function() {
			window.open("https://github.com/s-a/try.js/issues");
			return false;
		},
		robot_at_home: function() {
			alert(robot.sensor.atHome());
			return false;
		},
		robot_can_move_forward: function() {
			alert(robot.sensor.canMove("forward"));
			return false;
		},
		robot_can_move_backward: function() {
			alert(robot.sensor.canMove("backward"));
			return false;
		},
		robot_can_turn_left: function() {
			alert(robot.sensor.canTurn("left"));
			return false;
		},
		robot_can_turn_right: function() {
			alert(robot.sensor.canTurn("right"));
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
 
	var f0 = gui.addFolder('Camera');
	f0.add( parameters, 'move_cam_top' ).name("Top");
	f0.add( parameters, 'move_cam_front' ).name("North");
	f0.add( parameters, 'move_cam_right' ).name("East");
	f0.add( parameters, 'move_cam_behind' ).name("South");
	f0.add( parameters, 'move_cam_left' ).name("West");

	
	var f1 = gui.addFolder('Robot');
	f1.add( window.robotConfigs, 'speed', 0, 2000).step(1).name("Speed").listen();
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
	var f12 = f1.addFolder('Sensor');
	f12.add( parameters, 'robot_at_home' ).name("isAtHome)");
	f12.add( parameters, 'robot_can_move_forward' ).name("canMoveForward");
	f12.add( parameters, 'robot_can_move_backward' ).name("canMoveBackward");
	f12.add( parameters, 'robot_can_turn_left' ).name("canTurnLeft");
	f12.add( parameters, 'robot_can_turn_right' ).name("canTurnRight");

	gui.add( parameters, 'edit_environment' ).name("Environment");

	var f2 = gui.addFolder('Program');
	f2.add( parameters, 'edit_program' ).name("Edit");
	f2.add( parameters, 'run_program' ).name("Run");
	f2.add( parameters, 'stop_program' ).name("Stop");
	var f3 = gui.addFolder('Tests');
	f3.add( parameters, 'edit_tests' ).name("Edit");
	f3.add( parameters, 'run_tests' ).name("Run");

	
	var f4 = gui.addFolder('Package');
	f4.add( parameters, 'list_examples' ).name("Open");
	f4.add( parameters, 'share_on_github' ).name("Share on GitHub");

	var f5 = gui.addFolder('About');
	//f5.add( parameters, 'try_source_at_github' ).name("Fork the code");
	f5.add( parameters, 'help' ).name("Help");
	f5.add( parameters, 'bugreport' ).name("Report a bug");
	f5.add( parameters, 'donate' ).name("Donate");

	gui.open(); 
})(window.dat, window.robot);