(function(engine) {

	var stepWidth = 10
	var movementSetup = window.movementSetup = {
		distance : 1,
		repeats : stepWidth,
		rotation :  Math.PI/stepWidth
	};
	window.robotConfigs = {
		speed : 400,
		energy : {
			current : 80,
			max : 80
		},
		capacity : {
			current : 4,
			max : 4
		}
	};

	var Bot = function() {
		return this;
	};
	Bot.prototype.walking = false;
	Bot.prototype.undoMove = function  (cb) {
		cb();
	};

	Bot.prototype.sensor = {
		
	};

	var refreshRobotCapacityStatus = window.refreshRobotCapacityStatus = function() {
		$("#robot__capacity__status").text(window.robotConfigs.capacity.max - window.robotConfigs.capacity.current + "/" + window.robotConfigs.capacity.max);
	}
	
	var refreshRobotEnergyStatus = window.refreshRobotEnergyStatus = function(charging) {
		var level = window.robotConfigs.energy.current / window.robotConfigs.energy.max * 100;
		var icon = "alert";
		var color = "red";
		if (level >= 20) { 
			color = "#FF3300";
			icon = "20"; 
		}
		if (level >= 30) { 
			color = "#FF3300";
			icon = "30"; 
		}
		if (level >= 50) { 
			color = "#CC6600";
			icon = "50"; 
		}
		if (level >= 60) { 
			color = "#CC6600";
			icon = "60"; 
		}
		if (level >= 80) { 
			color = "green";
			icon = "80"; 
		}
		if (level >= 90) { 
			color = "green";
			icon = "90"; 
		}
		if (level === 100) { icon = "full"; }
		var ico = "device:battery-";
		if (charging) { ico = "device:battery-charging-"; }
		$("#robot__energy").attr("icon", ico + icon).css("color", color);
		$("#robot__energy__status").text(window.robotConfigs.energy.current);
	};

	var chargeRobot = function(done) {
		var i = window.setInterval(function() {
			if (window.robotConfigs.energy.current >= window.robotConfigs.energy.max){
				clearInterval(i);
				window.robotConfigs.energy.current = window.robotConfigs.energy.max;
				if(done){done()}
			} else {
				window.robotConfigs.energy.current += 10;
			}
			refreshRobotEnergyStatus(true);
		}, window.robotConfigs.speed);
	};

	Bot.prototype.charge = function(dummy, done) {
		if (this.sensor.atHome()){
			this.charging = true;
			chargeRobot(function() {
				this.charging = false;
				refreshRobotEnergyStatus(false);
				if (done) {$.proxy(done, this)({error:false})}
			});
			return true;
		} else {
			if (done) {$.proxy(done, this)({error:true})}
			return false;
		}
	};

	Bot.prototype.sensor.energy = function() {
		return window.robotConfigs.energy.current;
	};

	Bot.prototype.sensor.energyLevel = function() {
		return window.robotConfigs.energy.current / window.robotConfigs.energy.max * 100;
	};


	Bot.prototype.sensor.atHome = engine.robotIsAtHome;
	Bot.prototype.sensor.canMove = function(direction) {
		return this.bot.tryMove(direction);
	};
	Bot.prototype.sensor.canTurn = function(direction) {
		return this.bot.tryRotate(direction);
	};

	Bot.prototype.sensor.canGet = function() {
		if (this.bot.tryMove("forward")){
			return false;
		} else {
			return this.bot.tryGet();
		}
	};

	Bot.prototype.sensor.canPut = function() {
		return this.canMove("forward");
	};


	var resetPosition = function(direction) {
		if (engine.android){
			engine.android.rotation.y = window.engine.originalBotRotation.y;
			var pos = window.engine.originalBotPosition;
			engine.android.position.set (pos.x, pos.y, pos.z);
		}
		refreshRobotEnergyStatus(false);
	}

	Bot.prototype.put = function() { 
		var result = false;
		if (window.robotConfigs.capacity.current === window.robotConfigs.capacity.max) return false;
		if (this.sensor.canMove("forward")){
			window.engine.flower.add();
			result = true;
			window.robotConfigs.capacity.current++;
			window.robotConfigs.energy.current--;
			refreshRobotEnergyStatus(false);
			$("#robot__capacity__status").text(window.robotConfigs.capacity.max - window.robotConfigs.capacity.current + "/" + window.robotConfigs.capacity.max);
		}
		return result;
	}

	Bot.prototype.get = function(tryOnly) { 
		//var clone = engine.android.clone();
		if (window.robotConfigs.capacity.current === 0) return false;
		var distance = (movementSetup.distance * movementSetup.repeats);
		var direction = "forward";
		var hex  = 0xff0000;
		var clone  = engine.android.clone();
		switch(direction) {
		    case "forward":
				clone.translateZ( distance  );
		        break;
		    case "backward":
				clone.translateZ( -distance );
		        break;
		}
		var bbox = new THREE.BoundingBoxHelper( clone, hex );
		bbox.update();
			/*window.engine.scene.add(bbox);
			scene.remove(m);*/

		var result = engine.getFlowerCollisionItem(bbox);

		if (tryOnly !== true && result){
			engine.flower.remove(result);
			window.robotConfigs.capacity.current--;
			window.robotConfigs.energy.current--;
			refreshRobotEnergyStatus(false);
			$("#robot__capacity__status").text(window.robotConfigs.capacity.max - window.robotConfigs.capacity.current + "/" + window.robotConfigs.capacity.max);
		}
		return result;
	};

	Bot.prototype.tryGet = function() {
		return this.get(true) !== false;
	};

	Bot.prototype.tryMove = function(direction) {
		var clone = engine.android.clone();
		var distance = (movementSetup.distance * movementSetup.repeats);
		switch(direction) {
		    case "forward":
				clone.translateZ( distance  );
		        break;
		    case "backward":
				clone.translateZ( -distance );
		        break;
		}
		var result = engine.collision(clone);
		return !result;
	};

	Bot.prototype.tryRotate = function(direction) {
		var clone = engine.android.clone();
		var distance = (movementSetup.distance * movementSetup.repeats);
 		var rotation = movementSetup.rotation * movementSetup.repeats/2;
		switch(direction) {
		    case "left":
				clone.rotation.y += (rotation);
		        break;
		    case "right":
				clone.rotation.y -= (rotation);
		        break;
		}

		var hex  = 0xff0000;
		var bbox = new THREE.BoundingBoxHelper( clone, hex );
		bbox.update();
		//engine.scene.add( bbox );

		var result = engine.boxCollision(bbox) || engine.flowerCollision(bbox);
		console.log("collision:", result);
		return !result; //!result;
	};

	Bot.prototype.run = function(count, done) {
		var self = this;
		var _count = 0;
		var run = function() {
			_count++;
			if (_count < count ){
				self.move("forward", function() {
					run();
				});
			} else {
				if (done) {$.proxy(done, self)()}
			}

		}
		run();

	}

	Bot.prototype.step = function(direction, done) {
		var self = this;
		switch(direction) {
		    case "left":
				self.move('left', function(){
					self.move('forward', function() {
						self.move('right', function() {
							if (done) $.proxy(done, self)() ;
						});
					});
				});
		        break;
		    case "right":
				self.move('right', function(){
					self.move('forward', function() {
						self.move('left', function() {
							if (done) $.proxy(done, self)() ;
						});
					});
				});
		        break;
		}
	}

	Bot.prototype.tweenRotation = function (targetRotation, onComplete){
		var target = new THREE.Vector3(targetRotation.x,targetRotation.y,targetRotation.z);
		var rotation = engine.android.rotation;
		var tween = new TWEEN.Tween(rotation).to(target, window.robotConfigs.speed);

		tween.onUpdate(function(){
			engine.android.rotation.x = rotation.x;
		    engine.android.rotation.y = rotation.y;
		    engine.android.rotation.z = rotation.z;
		});
		tween.onComplete(onComplete);
		tween.easing(TWEEN.Easing.Quadratic.In);
		tween.start();
	}

	Bot.prototype.tweenPosition = function (targetPosition, onComplete){
		var target = new THREE.Vector3(targetPosition.x,targetPosition.y,targetPosition.z);
		var position = engine.android.position;
		var tween = new TWEEN.Tween(position).to(target, window.robotConfigs.speed);

		tween.onUpdate(function(){
			engine.android.position.x = position.x;
		    engine.android.position.y = position.y;
		    engine.android.position.z = position.z;
		});
		tween.onComplete(onComplete);
		tween.easing(TWEEN.Easing.Quadratic.Out);
		tween.start();
	}

	var currentCoordinate = "z";
	var currentCoordinateDirection = 1;
	var currentDirectionIndex = 2;
	var directions = ["N", "E", "S", "W"];
	Bot.prototype.direction = function() {
		this.inc = function() {
			currentDirectionIndex ++;
			if (currentDirectionIndex > directions.length-1){ currentDirectionIndex = 0 }
		};

		this.dec = function() {
			currentDirectionIndex --;
			if (currentDirectionIndex < 0){ currentDirectionIndex = directions.length-1 }
		};

		this.val = function() {
			return directions[currentDirectionIndex];
		};

		return this;
	}

	Bot.prototype.turn = function(direction, done) {
		switch (direction){
			case "left":
				this.move(direction, done);
				break;
			case "right" :
				this.move(direction, done);
				break;
			case "around" :
				this.move("left", function(onComplete) {
					this.move("left", done);
				});
				break;
		}
	}

	Bot.prototype.move = function(direction, done) {
		var self = this;
		if (self.program.abort) {
			self.program.stop();
			self.program.abort = false;
			return
		}
		var force = $.isArray(direction) && direction[0] === "force";
		if (force) {
			direction = direction[1];
		} else {
			if (self.walking || window.robotConfigs.energy.current <= 0) {return}
			if (direction === "left" || direction === "right"){
				if (!self.tryRotate(direction)){
					//if (done) {done()}
					return
				}
			}
			if (direction === "forward" || direction === "backward"){
				if (!self.tryMove(direction)){
					//if (done) {done()}
					return
				}
			}
		}
		var prepareUndo = function(_direction) {
			self.undoMove = function(cb) {
				self.move(["force", _direction], function() {
					if (cb) { $.proxy(cb, self)() }
				});
			};
		};

		var onComplete = function() {
			self.walking = false;
			window.robotConfigs.energy.current--;
			refreshRobotEnergyStatus(false);
			if (done) { $.proxy(done, self)() }
		};

		var toggleCoordinate = function() {
			switch(self.direction().val()){
				case "N":
					currentCoordinate = "z";
					currentCoordinateDirection = -1;
					break;
				case "E":
					currentCoordinate = "x";
					currentCoordinateDirection = 1;
					break;
				case "S":
					currentCoordinate = "z";
					currentCoordinateDirection = 1;
					break;
				case "W":
					currentCoordinate = "x";
					currentCoordinateDirection = -1;
					break;
			}
		};

		this.walking = true;


		var newPosition = engine.android.position.clone();
		var newRotation = engine.android.rotation.clone();
		switch(direction) {
		    case "forward":
				newPosition[currentCoordinate] += (movementSetup.distance * movementSetup.repeats * currentCoordinateDirection);
		    	self.tweenPosition(newPosition, onComplete);
		    	prepareUndo("backward");
		        break;
		    case "backward":
				newPosition[currentCoordinate] -= (movementSetup.distance * movementSetup.repeats * currentCoordinateDirection);
		    	self.tweenPosition(newPosition, onComplete);
		    	prepareUndo("forward");
		        break;
		    case "left":
		    	self.direction().dec();
		    	toggleCoordinate();
				newRotation.y += (movementSetup.rotation * movementSetup.repeats)/2;
				self.tweenRotation(newRotation, onComplete);
		    	prepareUndo("right");
		        break;
		    case "right":
		    	self.direction().inc();
		    	toggleCoordinate();
				newRotation.y -= (movementSetup.rotation * movementSetup.repeats)/2;
				self.tweenRotation(newRotation, onComplete);
		    	prepareUndo("left");
		        break;
		}
	}
 
	var funProgram = null;
	var funTest = null;

	var rawProgramSource = "";
	var rawTestSource = "";


	var commandSequence = [];

	Bot.prototype.clearCommands = function() {
		commandSequence = [];
		return this;
	}

	Bot.prototype.do =  function() {
		var args = arguments;
		commandSequence.push({
			cmd : arguments[0],
			parms : arguments[1]
		});

		return this;
	}

	Bot.prototype.shutdown =  function(dummy, done) {
		$("#program__run__state").css("color", "#0D0D0D");
		// run mission validations
		if (done) {$.proxy(done, this)()};
	}

	Bot.prototype.start =  function(done) {
		var i = -1;
		var self = this;
		var doCommand = function() {
			i++;
			if (i < commandSequence.length) {
				var cmd = commandSequence[i];
				self[cmd.cmd](cmd.parms, function() {
					doCommand();
				})
			} else {
				if (done) $.proxy(done, self)();
			}
		};

		doCommand();
	}


	Bot.prototype.program = {};

	Bot.prototype.program.run =  function() {
		if (funProgram){
			this.stop();
			this.abort = false;
			$("#program__run__state").css("color", "#a4c639");
			try{
				funProgram(function() {
					console.log("Bot.prototype.program.run done");
				});
			}catch(e){
				toastr.error(e);
			}
		} else {
			toastr.warning("No robot program assigned.");
		}
	}

	Bot.prototype.program.stop =  function() {
		$("#program__run__state").css("color", "#0D0D0D");
		this.abort = true;
		resetDirectionValues();
		resetPosition();
		window.engine.flower.reset();
		window.robotConfigs.energy.current = window.robotConfigs.energy.max;
		window.robotConfigs.capacity.current = window.orginalBotCapacityCurrent || window.robotConfigs.capacity.max || 0;
		refreshRobotEnergyStatus(false);
		refreshRobotCapacityStatus();
	}

	Bot.prototype.program.rawCode =  function() {
		return rawProgramSource;
	}

	var resetDirectionValues = function() {
		currentCoordinate = "z";
		currentCoordinateDirection = 1;
		currentDirectionIndex = 2;
	};

	Bot.prototype.program.load =  function(source) {
		this.stop();
		try{
			var f = new Function("done", source);
			funProgram = $.proxy(f, robot);
			rawProgramSource = source;
		}catch(e){
			toastr.error(e);
		}
	}

	 
		var robot = new Bot();
		robot.sensor.bot = robot;
		robot.program.stop();
		if (!window.robot) {window.robot = robot}
	 


/*
	var f = "this.move('forward', function() {  console.log(this);  this.move('forward', function() { console.log(this); done(); });    }) ";
	window.robot.program.load(f);

	f = 'this.clearCommands().do("move", "forward").do("run", "1").do("step", "right").do("shutdown").start()';
	window.robot.program.load(f);
*/
$(function() {
	$("#robot__capacity__status").text(window.robotConfigs.capacity.max - window.robotConfigs.capacity.current + "/" + window.robotConfigs.capacity.max);
	$("#program__run__state").css("color", "#3D3D3D");
	refreshRobotEnergyStatus();
});
	var Tests = function() {
		return this;
	};

	Tests.prototype.program = {};
	Tests.prototype.program.rawCode = function() {
		return rawTestSource;
	};
	Tests.prototype.program.load = function(source) { 
		robot.program.stop();
		try{
			var f = new Function("done", source);
			funTest = $.proxy(f, engine);
			console.log(mocha.suite);
			mocha.suite.suites = [];
			funTest();
			rawTestSource = source;
		} catch(e){
			toastr.error(e + "\n\n" + source);
			console.error(source);
		}
	};
	Tests.prototype.program.run = function() {
		$('#mocha-report').remove();
		$('#mocha-stats').remove();
		// From an element with ID #popup
		$.magnificPopup.open({
		  items: {
		      src: '#t',
		      type: 'inline'
		  }
		});
 		var runner = mocha.run();
 	};

	var tests = new Tests();
	if (!window.tests) {window.tests = tests}

})(window.engine);