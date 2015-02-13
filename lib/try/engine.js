/*
	Author: Stephan Ahlf
*/
// MAIN
(function(THREE) {

	var debugBoxen = window.debugBoxen = [];
	var urlParms = function() {
		var params = {};

		if (location.search) {
		    var parts = location.search.substring(1).split('&');

		    for (var i = 0; i < parts.length; i++) {
		        var nv = parts[i].split('=');
		        if (!nv[0]) continue;
		        params[nv[0]] = nv[1] || true;
		    }
		}

		return params;
	}

	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	
	//debug = false;
	// standard global variables
	var container, scene, camera, renderer, controls, stats,floor;
	var clock = new THREE.Clock();
	
	// custom global variables
	var android, homeBoxCube, flower;
	var collidableMeshList =[];
	var stationMeshList =[];
	var collidableFlowerList =[];
	// the following code is from
	//    http://catchvar.com/threejs-animating-blender-models
	var animOffset       = 0,   // starting frame of animation
		
		duration        = 1000, // milliseconds to complete animation
		keyframes       = 20,   // total number of animation frames
		interpolation   = duration / keyframes, // milliseconds per frame
		lastKeyframe    = 0,    // previous keyframe
		currentKeyframe = 0;


	function resetSelected (wall) {
		for (var i = 0; i < collidableMeshList.length; i++) {
			var item = collidableMeshList[i];
	    	item.material.color.set( new THREE.Color( 0x0066CC ) );
		}

		if (wall){
	    	wall.material.color.set( new THREE.Color( 0xCC0000 )  );
		} else {
			engine.selected = null;
		}
	}

	function resetSelectedStation (station) {
		for (var i = 0; i < stationMeshList.length; i++) {
			var item = stationMeshList[i];
			setStationType(item);
		}

		if (station) {
	    	station.material.color.set( new THREE.Color( 0xE6FFFF )  );
		}else {
			engine.selectedStation = null;
		}
	}

	var setFlowerColor = function(f, selected) {
		console.warn(f.id);
		f.material.materials[1].color.set( new THREE.Color( 0xF5B800 )  ); // yellow
		f.material.materials[2].color.set( new THREE.Color( 0xCC0000 )  ); // red
/*		if (selected){
			f.material.materials[2].color.set( new THREE.Color( 0xFFFFCC )  ); // white
		} else {
		}*/
		f.material.materials[0].color.set( new THREE.Color( 0x009900 )  ); // green
		f.material.materials[3].color.set( new THREE.Color( 0x006600 )  ); // green
	};

	function resetSelectedFlower (f, resetAll) {
		 
		for (var i = 0; i < collidableFlowerList.length; i++) {
			var item = collidableFlowerList[i];
			if (item.userData.sel){
				scene.remove(item.userData.sel);
			}
		}

		if (f && !resetAll){
			var hex  = 0x009900;
			var bbox = new THREE.BoundingBoxHelper( f, hex );
			f.userData.sel = bbox;
			bbox.update();
			scene.add(bbox);
		} else {
			engine.selectedFlower = null;
		}
	}

	function onDocumentMouseDown( e ) {
	    e.preventDefault();

	    resetSelected();
	    resetSelectedFlower();
	    resetSelectedStation();
	  	var projector = new THREE.Projector(); 
		var mouse3D = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1,   //x
		                                -( event.clientY / window.innerHeight ) * 2 + 1,  //y
		                                0.5 );                                            //z
		var raycaster = projector.pickingRay( mouse3D.clone(), camera );
		var walls = raycaster.intersectObjects( collidableMeshList );
		// Change color if hit block
		if ( walls.length > 0 ) {
			resetSelected(walls[ 0 ].object);
		    window.engine.selected = walls[ 0 ].object;
		    if (window.editorEnvironment){
			    window.editorEnvironment.boxConfig.position.z = window.engine.selected.position.z;
			    window.editorEnvironment.boxConfig.position.x = window.engine.selected.position.x;
				window.editorEnvironment.boxConfig.scale.x = engine.selected.geometry.width;
				window.editorEnvironment.boxConfig.scale.y = engine.selected.geometry.height;
				window.editorEnvironment.boxConfig.scale.z = engine.selected.geometry.depth;
		    }
		}
		var flowers = raycaster.intersectObjects( collidableFlowerList );
		// Change color if hit block
		if ( flowers.length > 0 ) {
			resetSelectedFlower(flowers[ 0 ].object);
		    window.engine.selectedFlower = flowers[ 0 ].object;
		    if (window.editorEnvironment){
			    window.editorEnvironment.flowerConfig.position.z = window.engine.selectedFlower.position.z;
			    window.editorEnvironment.flowerConfig.position.x = window.engine.selectedFlower.position.x;
		    }
		}

		var stations = raycaster.intersectObjects( stationMeshList );
		// Change color if hit block
		if ( stations.length > 0 ) {
			resetSelectedStation(stations[ 0 ].object);
		    window.engine.selectedStation = stations[ 0 ].object;
		    if (window.editorEnvironment){
			    window.editorEnvironment.stationConfig.position.z = window.engine.selectedStation.position.z;
			    window.editorEnvironment.stationConfig.position.y = window.engine.selectedStation.position.y;
			    window.editorEnvironment.stationConfig.position.x = window.engine.selectedStation.position.x;
			    window.editorEnvironment.stationConfig.type = window.engine.selectedStation.userData.type || "energy";
		    }
		}
	}


	function __removeMesh (mesh, meshList) {
		for (var i = 0; i <  meshList.length; i++) {
			var m =  meshList[i];
			if (m.id === mesh.id){
				scene.remove(mesh);
				meshList.splice(i,1);
				break;
			}
		}
	}

	function removeWall(mesh) {
		__removeMesh(mesh, collidableMeshList);
	}

	function removeStation(mesh) {
		__removeMesh(mesh, stationMeshList);
	}

	function removeFlower(mesh) {
		if (mesh.userData.sel){
			scene.remove(mesh.userData.sel);
		}
		__removeMesh(mesh, collidableFlowerList);
	}

	function addFlower(meta) {
		var f = flower.clone();
		f.material = flower.material.clone(flower.material);
		var flowerMeshOffset = 80;

		if (!meta){
			// todo check robot s direction
			// first case OK! 
			f.position.y = android.position.y;
			switch(window.robot.direction().val()){
				case "S":
					f.position.x = android.position.x + 80;//- (window.movementSetup.distance * window.movementSetup.repeats);
					f.position.z = android.position.z + (window.movementSetup.distance * window.movementSetup.repeats);
					break;
				case "N":
					f.position.x = android.position.x + 80;//- (window.movementSetup.distance * window.movementSetup.repeats);
					f.position.z = android.position.z - ((window.movementSetup.distance * window.movementSetup.repeats)+15);
					break;
				case "W":
					f.position.x = android.position.x + 80 - 15;//- (window.movementSetup.distance * window.movementSetup.repeats);
					f.position.z = android.position.z -10;
					break;
				case "E":
					f.position.x = android.position.x + 80 + 15;//- (window.movementSetup.distance * window.movementSetup.repeats);
					f.position.z = android.position.z -10;
					break;
				default:
					toastr.info("todo");
			}
		} else {
			console.log(meta);
			f.position.set (meta.position.x,0,meta.position.z);
		}
		scene.add(f);
		collidableFlowerList.push(f);

		window.engine.selectedFlower = f;
		resetSelectedFlower(f, (meta===undefined));
	}


	function setStationType(station, type) {
		if (type) {station.userData.type = type;}
		var color = 0x000000;
		switch(station.userData.type){
			case "energy":
				color = 0xFFE64D; 
				break;
			case "fuel":
				color = 0x6FC3DF; 
				break;
			case "teleport":
				color = 0xFF4D64; 
				break;
			default:
				color = 0x6FC3DF; 
				break;

		}
		station.material.color.set(color);
	}

	function addStation(meta) {
		if (!meta){
			meta = {};
		}

		if (!meta.position){
			meta.position = {
				x:0,
				y:25,
				z:0
			}
		}
		var cubeGeometry = new THREE.CubeGeometry(50,50,50,1,1,1);
		var wireMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe:false , side: THREE.DoubleSide, opacity:0.44, transparent:true, } );
		var station = new THREE.Mesh( cubeGeometry, wireMaterial );
		station.position.set(meta.position.x,meta.position.y,meta.position.z);
		setStationType(station, meta.type || "energy"); 
		scene.add(station);

		stationMeshList.push(station);
		window.engine.selectedStation = station;
		resetSelectedStation(station);
	}

	function addWall(meta) {
		if (!meta){
			meta = {};
		}
		if (!meta.scale){
			meta.scale = {
				x:100,
				y:50,
				z:5
			}
		}
		if (!meta.position){
			meta.position = {
				x:0,
				y:0,
				z:0
			}
		}
		var wallGeometry = new THREE.CubeGeometry(meta.scale.x,meta.scale.y,meta.scale.z);
		var WireTexture = new THREE.ImageUtils.loadTexture( 'images/square-thick.png' );
		var wallMaterial1 = new THREE.MeshBasicMaterial( {color: 0x8888ff, map: WireTexture , side: THREE.DoubleSide, opacity:0.85, transparent:true}  );
		var wall = new THREE.Mesh(wallGeometry, wallMaterial1);
		
		wall.position.set(meta.position.x,meta.position.y || (meta.scale.y/2),meta.position.z);
 
		scene.add(wall);

		collidableMeshList.push(wall);
		window.engine.selected = wall;
		resetSelected(wall);
	}

	function addWallMesh(wall) {
		scene.add(wall);
		collidableMeshList.push(wall);
		window.engine.selected = wall;
		resetSelected(wall);
	}
 

	// FUNCTIONS
	function init(){
		// SCENE
		scene = new THREE.Scene();
		scene.fog = new THREE.Fog( 0xffffff, 1000, 10000 );

		var texture = new THREE.Texture();
		// model
		

		document.addEventListener( 'mousedown', onDocumentMouseDown, false );

		// CAMERA
		camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
		scene.add(camera);
		camera.position.set(0,150,400);
		camera.lookAt(scene.position);
		// RENDERER
		if ( Detector.webgl )
			renderer = new THREE.WebGLRenderer( {antialias:true} );
		else
			renderer = new THREE.CanvasRenderer();
		renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
		container = document.getElementById( 'ThreeJS' );
		container.appendChild( renderer.domElement );
		// EVENTS
		THREEx.WindowResize(renderer, camera);
		THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
		// CONTROLS
		//controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls = new THREE.OrbitControls( camera, document/* document.getElementById("program__run__state")*/ );
		controls.userPan = true;
    	controls.userPanSpeed = 10;

		controls.addEventListener( 'change', render );
		// STATS
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.bottom = '0px';
		stats.domElement.style.zIndex = 100;
		container.appendChild( stats.domElement );
		// LIGHT

		// LIGHTS
		var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.475 );
		directionalLight.position.set( 100, 100, -100 );
		scene.add( directionalLight );


		var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1.25 );
		hemiLight.color.setHSL( 0.6, 1, 0.75 );
		hemiLight.groundColor.setHSL( 0.1, 0.8, 0.7 );
		hemiLight.position.y = 500;
		scene.add( hemiLight );
 
		// FLOOR
		var floorTexture = new THREE.ImageUtils.loadTexture( 'images/ground.png' );
		floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
		var floorSquareSize = 50;
		floorTexture.repeat.set( floorSquareSize, floorSquareSize );
		var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
		var floorGeometry = new THREE.PlaneGeometry(10000, 10000, floorSquareSize, floorSquareSize);
		floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.position.y = -0.5;
		floor.rotation.x = Math.PI / 2;
		scene.add(floor);
		// SKYBOX/FOG
		var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
		var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
		var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
		// scene.add(skyBox);
		scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
 
		////////////
		// CUSTOM //
		////////////
		var cubeGeometry = new THREE.CubeGeometry(50,50,50,1,1,1);
		var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xDF740C, wireframe:false , side: THREE.DoubleSide, opacity:0.44, transparent:true, } );
		homeBoxCube = new THREE.Mesh( cubeGeometry, wireMaterial );
		homeBoxCube.position.set(0, 25.1, 0);
		scene.add( homeBoxCube );




		////////////
		// CUSTOM //
		////////////

		var jsonLoader = new THREE.JSONLoader();
		jsonLoader.load( "models/android-animations.js", addModelToScene );
		// addModelToScene function is called back after model has loaded
		var jsonLoader2 = new THREE.JSONLoader();
		jsonLoader2.load( "models/flower.js", function(geometry, materials) {

			for (var i = 0; i < materials.length; i++){ 
				materials[i].side = THREE.DoubleSide;
			}
			var material = new THREE.MeshFaceMaterial( materials );
			var mesh = new THREE.Mesh( geometry, material );
			setFlowerColor(mesh);
			mesh.scale.set(20,20,20);
			mesh.position.set(80,0,30);
			
			//scene.add( mesh);
			collidableFlowerList.push(mesh);
			flower = mesh.clone();

		} );

		var ambientLight = new THREE.AmbientLight(0x111111);
		scene.add(ambientLight);

	}

	function addModelToScene( geometry, materials ){
		// for preparing animation
		for (var i = 0; i < materials.length; i++) materials[i].morphTargets = true;
		var material = new THREE.MeshFaceMaterial( materials );
		android = new THREE.Mesh( geometry, material );
		android.scale.set(3,3,3);
		scene.add( android );
		android.position.y = 500;

 		window.engine.android = android;
		window.engine.originalBotPosition = android.position.clone();
		window.engine.originalBotRotation = android.rotation.clone();
		window.robot.program.stop();

	}

	function animate(){
	    requestAnimationFrame( animate );
		render();
		update();
	}

	function __collision (obj, collidableMeshList) {
		var originPoint = obj.position;
		for (var vertexIndex = 0; vertexIndex < obj.geometry.vertices.length; vertexIndex++){
			var localVertex = obj.geometry.vertices[vertexIndex].clone();
			var globalVertex = localVertex.applyMatrix4( obj.matrix );
			var directionVector = globalVertex.sub( obj.position );

			var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
			var collisionResults = ray.intersectObjects( collidableMeshList );
			if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ){
				return true;
			}
		}
	}

	function collision (obj) {
			var hex  = 0xff0000;
			var bbox = new THREE.BoundingBoxHelper( obj, hex );
			bbox.update();
			if (engine.debugMode){
				debugger;
				scene.add(bbox); // debug
				window.debugBoxen.push(bbox);
			}

		return _collision(bbox, collidableMeshList) || _collision(bbox,collidableFlowerList);
	} 

	function _collision (box, collidableMeshList) {
		var result = false;
		for (var i = 0; i < collidableMeshList.length; i++) {
			var m = collidableMeshList[i];
			var hex  = 0xff0000;
			var bbox = new THREE.BoundingBoxHelper( m, hex );
			bbox.update();
			//scene.add(bbox);
			//scene.remove(m);//
			
			if (box.box.isIntersectionBox(bbox.box)){
			//	scene.remove(bbox);
				result = true;
				break;
			} else {
				scene.remove(bbox);
			}
		}
		return result;
	}

	function getCollisionObject (box, collidableMeshList) {
		var result = false;
		for (var i = 0; i < collidableMeshList.length; i++) {
			var m = collidableMeshList[i];
			var hex  = 0xff0000;
			var bbox = new THREE.BoundingBoxHelper( m, hex );
			bbox.update();
		/*	scene.add(box);
			scene.add(bbox);*/
			//scene.remove(m);//

			if (box.box.isIntersectionBox(bbox.box)){
			//	scene.remove(bbox);
				return m;
				break;
			} else {
				//scene.remove(bbox);
			}
		}
		return result;
	}

	function boxCollision (box) {
		return _collision(box, collidableMeshList);
	}
	function flowerCollision (box) {
		return  _collision(box,collidableFlowerList);
	}
	function getFlowerCollisionItem (box) {
		//return  _collision(box,collidableFlowerList);
		return  getCollisionObject(box,collidableFlowerList);
	}


	function robotIsAtHome () {
		var robotBB = new THREE.Box3().setFromObject(android);
		var homeBB = new THREE.Box3().setFromObject(homeBoxCube);
		return homeBB.containsBox(robotBB);
	}
	function robotCanCharge () {
		var robotBB = new THREE.Box3().setFromObject(android);
		for (var i = 0; i < stationMeshList.length; i++) {
			var s = stationMeshList[i];
			var homeBB = new THREE.Box3().setFromObject(s);
			if (homeBB.containsBox(robotBB)){
				if (!s.userData.type){s.userData.type = "energy"}
				if (s.userData.type === "energy"){
					return true;
				}
			}
		}
		return robotIsAtHome() || false;
	}


function getBelow (){
 

}
	var gravity = window.gravity =  false;

 

	var updatePhysics = window.updatePhysics = function (done) {
 
		if (!android) return;

		window.gravity = true;


		var lookAtPostion = floor.position.clone();
		lookAtPostion.y -= 10000;

		var projector = new THREE.Projector(); 
		var mouse3D = lookAtPostion.clone()
		projector.unprojectVector( lookAtPostion, camera );   
		mouse3D.sub( android.position );                
		mouse3D.normalize();
		var raycaster = new THREE.Raycaster( android.position, mouse3D );
		var intersects = raycaster.intersectObjects( collidableMeshList );
		// Change color if hit block

			

		var target = android.position.clone();
    	if ( intersects.length === 0 ){
			target.y = 0;
    	} else {
	      	//intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff ); 
			target.y -= intersects[ 0 ].distance - 1;
		}
		if (Math.round(target.y) !== Math.round(android.position.y)){
			console.log(target.y !== android.position.y, target.y , android.position.y)
			var tween = new TWEEN.Tween({y:android.position.y}).to(target, 1000);
			
			if (engine.debugMode){
				var bbox = new THREE.BoundingBoxHelper( android);
				bbox.position.set(target.x,target.y,target.z);
				bbox.update();
				scene.add(bbox); // debug
				window.debugBoxen.push(bbox);
			}

			tween.onUpdate(function(){
				android.position.y = this.y;
			});
			tween.onComplete(function() { 
				window.gravity = false;
				if (done) done();
			});
			tween.easing(TWEEN.Easing.Exponential.In);
			tween.start();  
		} else {
			window.gravity = false;
			if (done) done();
		}
    }

	function update(){ 
		//updatePhysics();
		controls.update();
		stats.update();
		TWEEN.update();
	}

	function render(){
		if ( android && window.robot && robot.walking ) {
			// Alternate morph targets
			var time = new Date().getTime() % duration;
			keyframe = Math.floor( time / interpolation ) + animOffset;
			if ( keyframe != currentKeyframe ){
				android.morphTargetInfluences[ lastKeyframe ] = 0;
				android.morphTargetInfluences[ currentKeyframe ] = 1;
				android.morphTargetInfluences[ keyframe ] = 0;
				lastKeyframe = currentKeyframe;
				currentKeyframe = keyframe;
			}
			android.morphTargetInfluences[ keyframe ] = ( time % interpolation ) / interpolation;
			android.morphTargetInfluences[ lastKeyframe ] = 1 - android.morphTargetInfluences[ keyframe ];
		}

		renderer.render( scene, camera );
	}
	
	init();
	animate();

		var mazeThreeJsDrawLine =   function(x1, y1, x2, y2) {
			//console.log(x1, y1, x2, y2);
		  	var lengthX = Math.abs(x1 - x2);
		  	var lengthY = Math.abs(y1 - y2);
		  	var height = 50;
	 		if (lengthX === 0) lengthX = 5;
		  	if (lengthY === 0) lengthY = 5;

		  	engine.wall.add({ 
			  	position : {
			        x:  (x1 - ((x1 - x2) / 2) - (2 / 2))-70,
			        y:  (height / 2),
			        z:  (y1 - ((y1 - y2)) / 2 - (2 / 2))-70
		      	},
	          	scale : {
	          		x:lengthX, 
	          		y:height, 
	          		z:lengthY
	          	}
		  	});
		}

	if (!window.engine) {
		window.engine = {
			addOn : {
				maze : {
					generate : function(parms) {
						engine.wall.clear();
						var maze = new Maze(document, 'maze', parms.height, parms.width, parms.rows, parms.cols);
						maze.drawLine = mazeThreeJsDrawLine;
					 	maze.generate();
						maze.draw();
					}
				}
			},
			cam : {
				tween : function (target, done){
					var position = camera.position;
					var tween = new TWEEN.Tween(position).to(target, 1800);
					
		 			if (controls) {
						//controls.object.children[0].rotation.x = 0; // Rotates the Pitch Object
		 			}
					tween.onUpdate(function(){
					   
					    if (android){
			 			 
			 				controls.center.x = android.position.x;
			 				controls.center.y = android.position.y;
			 				controls.center.z = android.position.z;
					    	camera.lookAt(android.position)

					    }
					});
					 
					tween.onComplete(function() {  
					  	if (done){done();}
					});
					tween.easing(TWEEN.Easing.Bounce.Out);
					tween.start();  
				},
				camera : camera
			},
			android : android,
			homeBox : homeBoxCube,
			collision : collision,
			boxCollision : boxCollision,
			flowerCollision : flowerCollision,
			getFlowerCollisionItem : getFlowerCollisionItem,
			robotIsAtHome : robotIsAtHome,
			robotCanCharge : robotCanCharge,
			done : function() {
				
			},
			scene:scene,
			flower : {
				reset 	: function() {
					this.clear();
					if (window.originalFlowerPositions) for (var i = 0; i < window.originalFlowerPositions.length; i++) {
						var pos = window.originalFlowerPositions[i];
						this.add(pos);
					}
				},
				add 	: addFlower,
				remove 	: removeFlower,
				clear	: function() {
					for (var i = collidableFlowerList.length - 1; i >= 0; i--) {
						var flower = collidableFlowerList[i];
						this.remove(flower);
					}
				},
				meta  	: function() {
					var result = [];
					for (var i = 0; i < collidableFlowerList.length; i++) {
						var m = collidableFlowerList[i];
						result.push({
							position:{
								x : m.position.x,
								//y : m.position.y,
								z : m.position.z,
							}
						});
					}
					return result;
				},
			},
			station : {
				setType : setStationType,
				clear	: function() {
					for (var i = stationMeshList.length - 1; i >= 0; i--) {
						var station = stationMeshList[i];
						this.remove(station);
					}
				},
				add 	: addStation,
				remove 	: removeStation,
				meta  	: function() {
					var result = [];
					for (var i = 0; i < stationMeshList.length; i++) {
						var m = stationMeshList[i];
						result.push({
							position:{
								x : m.position.x,
								y : m.position.y,
								z : m.position.z,
							},
							type: m.userData.type || "energy"
						});
					}
					return result;
				},
			},
			wall : {
				clear	: function() {
					for (var i = collidableMeshList.length - 1; i >= 0; i--) {
						var wall = collidableMeshList[i];
						this.remove(wall);
					}
				},
				add 	: addWall,
				addMesh : addWallMesh,
				remove 	: removeWall,
				meta  	: function() {
					var result = [];
					for (var i = 0; i < collidableMeshList.length; i++) {
						var m = collidableMeshList[i];
						result.push({
							position:{
								x : m.position.x,
								y : m.position.y,
								z : m.position.z,
							},
							scale : {
								x : m.geometry.width,
								y : m.geometry.height,
								z : m.geometry.depth,
							}
						});
					}
					return result;
				},
			},
			debugMode : (document.location.hostname === "localhost"),
			loadEnvironment : function(meta) {
				this.wall.clear();
				this.flower.clear();
				this.station.clear();
				if (meta.walls){
					for (var i = 0; i < meta.walls.length; i++) {
						var wall = meta.walls[i];
						window.engine.wall.add(wall);
					}
				}
				window.originalFlowerPositions = meta.flowers;
				window.originalStationPositions = meta.stations;
				if (meta.flowers){
					for (var i = 0; i < meta.flowers.length; i++) {
						var flower = meta.flowers[i];
						window.engine.flower.add(flower);
					}
				}
				if (meta.stations){
					for (var i = 0; i < meta.stations.length; i++) {
						var station = meta.stations[i];
						window.engine.station.add(station);
					}
				}
				android.rotation.y = 0;
				android.position.x = meta.robot.position.x;
				android.position.z = meta.robot.position.z;

				homeBoxCube.position.x = meta.homeBox.position.x;
				homeBoxCube.position.z = meta.homeBox.position.z;

				if (meta.robot.capacity){
					window.robotConfigs.capacity = meta.robot.capacity;
				} else {
					window.robotConfigs.capacity.current = 0;
					window.robotConfigs.capacity.max = 0;
				}
				window.engine.originalBotPosition = android.position.clone();
				window.engine.originalBotRotation = android.rotation.clone();
				window.orginalBotCapacityCurrent = meta.robot.capacity.current;
				if (meta.robot.energy){window.robotConfigs.energy = meta.robot.energy}
				window.refreshRobotEnergyStatus();
				window.refreshRobotCapacityStatus();
				window.setTimeout(function() {
					window.robot.program.stop();
				},200);
				
			}
		};
	}

	$(function() {
		toastr.options = {
		  "closeButton": false,
		  "debug": false,
		  "newestOnTop": false,
		  "progressBar": false,
		  "positionClass": "toast-top-left",
		  "preventDuplicates": false,
		  "onclick": null,
		  "showDuration": "2000",
		  "hideDuration": "400",
		  "timeOut": "5000",
		  "extendedTimeOut": "1000",
		  "showEasing": "swing",
		  "hideEasing": "linear",
		  "showMethod": "fadeIn",
		  "hideMethod": "fadeOut"
		};
		$('#share').socialSharePrivacy({
			path_prefix:"lib/share/",
			layout: "line",
			info_link: "",
			info_link_target : "_blank" ,

			order: ["hackernews", "facebook", "twitter","gplus"],
			services : { 
				tumblr : {status : false},
				mail : {status : false}
			}
		});

		$("#shareBtn").click(function() {
			$.magnificPopup.open({
			  items: {
			    src: "#share", 
			    type: 'inline'
			  }
			});
			return false;
		});

		if (engine.debugMode){
			addWall({
				position:{x:0,y:0,z:0},
				scale:{x:100,y:100,z:100},
			});

			window.engine.station.add({
				position:{
					x:100,y:100,z:100
				}
			});
			window.engine.station.add({
				position:{
					x:100,y:100,z:300
				}
			});			
		} else {
			window.setTimeout(function() {
				var target = new THREE.Vector3(0,1110,0);
				window.engine.cam.tween(target, function() {
				});
			}, 2000);
			engine.addOn.maze.generate({
				height:500,
				width:500,
				rows:3,
				cols:3,
			});
	        window.onbeforeunload = function() {
	           return "Are you sure you want to leave this page?";
	        };
		}
		window.setTimeout(function() {
			var parms = urlParms();
			if (parms.q){
				var env = JSON.parse(decodeURIComponent(parms.q));
				window.engine.loadEnvironment(env.e);
				window.robot.program.load(env.c);
				window.robot.program.stop();
				window.tests.program.load(env.t);
			}
		},1000);
	});
})(window.THREE);

