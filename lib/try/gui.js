(function(dat, robot) {
	var isMobile  = window.isMobile = (function(a,b){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) {return true} else {return false} })(navigator.userAgent||navigator.vendor||window.opera,'http://detectmobilebrowser.com/mobile'); 

	if (window.isMobile) {return;}
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
				fuel : window.robotConfigs.fuel,
				capacity : window.robotConfigs.capacity
			},
			homeBox : {
				position : {
					x : engine.homeBox.position.x,
					y : engine.homeBox.position.y,
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
			robot.program.stop();
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
		refuel: function() {
			if (!robot.refuel()){
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
		teleport: function() {
			robot.teleport({x:200,y:200,z:200});
		},
		move_forward: function() {
			robot.move('forward');
		},
		push: function() {
			if (!robot.push()){

			}
		},
		move_backward: function() {
			robot.move('backward');
		},
		move_up: function() {
			robot.move('up');
		},
		engine_off: function() {
			robot.engineOff();
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
		robot_can_refuel: function() {
			msg(robot.sensor.canRefuel());
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
		robot_can_move_up: function() {
			msg(robot.sensor.canMove("up"));
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
	f11.add( parameters, 'push' ).name("Push");
	f11.add( parameters, 'move_forward' ).name("Move forward");
	f11.add( parameters, 'move_backward' ).name("Move backward");
	f11.add( parameters, 'move_up' ).name("Move up");
	f11.add( parameters, 'engine_off' ).name("Engine off");
	f11.add( parameters, 'step_left' ).name("Step left");
	f11.add( parameters, 'step_right' ).name("Step right");
	f11.add( parameters, 'rotate_left' ).name("Rotate left");
	f11.add( parameters, 'rotate_right' ).name("Rotate right");
	f11.add( parameters, 'turn_around' ).name("Turn around");
	f11.add( parameters, 'undo_move' ).name("Undo Move");
	f11.add( parameters, 'run' ).name("Move10Times");
	f11.add( parameters, 'charge' ).name("Charge");
	f11.add( parameters, 'refuel' ).name("Refuel");
	f11.add( parameters, 'get' ).name("Pick up");
	f11.add( parameters, 'put' ).name("Unload");
	f11.add( parameters, 'teleport' ).name("teleport");
	var f12 = f1.addFolder('Sensor');
	f12.add( parameters, 'robot_at_home' ).name("isAtHome)");
	f12.add( parameters, 'robot_can_get' ).name("canGet");
	f12.add( parameters, 'robot_can_put' ).name("canPut");
	f12.add( parameters, 'robot_can_charge' ).name("canCharge");
	f12.add( parameters, 'robot_can_refuel' ).name("canRefuel");
	f12.add( parameters, 'robot_can_move_forward' ).name("canMoveForward");
	f12.add( parameters, 'robot_can_move_backward' ).name("canMoveBackward");
	f12.add( parameters, 'robot_can_move_up' ).name("canMoveUp");
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