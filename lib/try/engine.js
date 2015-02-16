/*
	Author: Stephan Ahlf
*/
// MAIN
(function(THREE) {
	createjs.Sound.addEventListener("fileload", handleLoadComplete);
	createjs.Sound.registerSound({src:"snd/computer_work_beep_simple.mp3", id:"beep-work"});
	createjs.Sound.registerSound({src:"snd/computer_error.mp3", id:"beep-error"});
	function handleLoadComplete(event) {
		if(event.id==="beep-work"){
			
		}
	}

	var $tooltip;
	var debugBoxen = window.debugBoxen = [];
	var closeEditorWindows = window.closeEditorWindows = function  () {
		if (window.editorEnvironment)
	   		window.editorEnvironment.close();
	   	if (window.editorProgram)
	   		window.editorProgram.close();
	   	if (window.editorTests)
   			window.editorTests.close();
	}

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
	    	item.material.color.set( new THREE.Color( 0x6FC3DF ) );
		}

		if (wall){
	    	wall.material.color.set( new THREE.Color( 0xDF740C )  );
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
		//console.warn(f.id);
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

	  /*  resetSelected();
	    resetSelectedFlower();
	    resetSelectedStation();*/
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
				window.editorEnvironment.boxConfig.movable = !!engine.selected.userData.movable;
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

	function onDocumentMouseMove( event ) {
		if (!$tooltip) return;
		var projector = new THREE.Projector();
		var mouse3D = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1,   //x
		                                -( event.clientY / window.innerHeight ) * 2 + 1,  //y
		                                0.5 );                                            //z
		var raycaster = projector.pickingRay( mouse3D.clone(), camera );
		var stations = raycaster.intersectObjects( stationMeshList );
		if ( stations.length > 0 ) {
			$tooltip.text( " | StationType: " + stations[ 0 ].object.userData.type);
		} else {
			var stations = raycaster.intersectObjects( [homeBoxCube] );
			if ( stations.length > 0 ) {
				$tooltip.text(" | HomeBoxCube");
			} else {
				$tooltip.text("");
			}
		}

		var walls = raycaster.intersectObjects( collidableMeshList );
		// Change color if hit block
		if ( walls.length > 0) {
			if (walls[0].object.userData.movable === true){
				$tooltip.text(" | Movable wall");
			} else {
				$tooltip.text(" | Static wall");
			}
		} else {
			$tooltip.text("");
		}
	}

	function __removeMesh (mesh, meshList) {
		for (var i = 0; i <  meshList.length; i++) {
			var m =  meshList[i];
			if (m.id === mesh.id){
				scene.remove(mesh);
				var meta = meshList.splice(i,1);
				return mesh;
			}
		}
	}

	function removeWall(mesh) {
		return __removeMesh(mesh, collidableMeshList);
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
			//console.log(meta);
			f.position.set (meta.position.x, meta.position.y || 0,meta.position.z);
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
		if (!meta.movable){
			meta.movable = false;
		}


		var wallGeometry = new THREE.CubeGeometry(meta.scale.x,meta.scale.y,meta.scale.z);
		var WireTexture = new THREE.ImageUtils.loadTexture( 'images/square-thick.png' );
		var wallMaterial1 = new THREE.MeshBasicMaterial( {color: 0x6FC3DF, map: WireTexture , side: THREE.DoubleSide, opacity:0.85, transparent:true}  );
		var wall = new THREE.Mesh(wallGeometry, wallMaterial1);
		wall.userData.movable = meta.movable;
		wall.position.set(meta.position.x,meta.position.y || (meta.scale.y/2),meta.position.z);

		scene.add(wall);

		collidableMeshList.push(wall);
		window.engine.selected = wall;
		resetSelected(wall);
		return wall;
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
		document.addEventListener( 'mousemove', onDocumentMouseMove, false );

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
		window.robot.program.stop(function(){

			createjs.Sound.play("beep-work");
		});
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
			if (box.box.isIntersectionBox(bbox.box)){
				return m;
				break;
			} else {
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
	function getWallCollisionItem (box) {
		//return  _collision(box,collidableFlowerList);
		return  getCollisionObject(box,collidableMeshList);
	}


	function robotIsAtHome () {
		var robotBB = new THREE.Box3().setFromObject(android);
		var homeBB = new THREE.Box3().setFromObject(homeBoxCube);
		return homeBB.containsBox(robotBB);
	}

	function robotCan (name) {
		var result = false;
		var robotBB = new THREE.Box3().setFromObject(android);
		for (var i = 0; i < stationMeshList.length; i++) {
			var s = stationMeshList[i];
			var homeBB = new THREE.Box3().setFromObject(s);
			if (homeBB.containsBox(robotBB)){
				if (!s.userData.type){s.userData.type = name}
				if (s.userData.type === name){
					return true;
				}
			}
		}
		return result;
	}

	function robotCanCharge () {
		return robotCan("energy") || robotIsAtHome();
	}

	function robotCanRefuel () {
		return robotCan("fuel");
	}

	function robotCanTeleport () {
		return robotCan("teleport") ;
	}

	var gravity = window.gravity =  false;



	var updatePhysics = window.updatePhysics = function (done) {

		if (!android || robot.flying) {
			done();
			return;
		};
		var time = 1000;
		if (robot.program.abort) {time = 0;}
		window.gravity = true;

		//android.position.y = 0;

		var width = 30;
		var height = 16;
		if (window.robot.direction().val() === "E" || window.robot.direction().val() === "W"){
			width = 16;
			height = 30;
		}
		var rayWallGeometry = new THREE.CubeGeometry(width,50000,height);
		var rayWallMaterial = new THREE.MeshBasicMaterial( {color: 0x6FC3DF,  side: THREE.DoubleSide, transparent:true, opacity:0.1}  );
		var rayWall = new THREE.Mesh(rayWallGeometry, rayWallMaterial);
		rayWall.position.copy(android.position);
		if (engine.debugMode){
/*			scene.add(rayWall); // debug
			window.debugBoxen.push(rayWall); 
*/			document.title =android.position.x + "," + android.position.y + "," + android.position.z;
		}
		rayWall.position.y = 0;

		var target = android.position.clone();

		var bbox = new THREE.BoundingBoxHelper(rayWall);
		bbox.update();
		var highest = 0;
		for (var i = 0; i < collidableMeshList.length; i++) {
			var mesh = collidableMeshList[i];
			var bboxx = new THREE.BoundingBoxHelper(mesh);
			bboxx.update();
			if (bbox.box.isIntersectionBox(bboxx.box)){
				if(mesh.geometry.height > highest){
					highest = mesh.geometry.height;
				}
			}
		}
		target.y = highest;


		if (Math.round(target.y) !== Math.round(android.position.y) && highest < android.position.y){
			//console.log(target.y !== android.position.y, target.y , android.position.y)
			var tween = new TWEEN.Tween({y:android.position.y}).to(target, time);

			if (engine.debugMode){
				var bbox = new THREE.BoundingBoxHelper( android);
				bbox.position.set(target.x,target.y,target.z);
				bbox.update();
				//scene.add(bbox); // debug
				//window.debugBoxen.push(bbox);
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
		if ( android && window.robot && robot.walking && !robot.flying ) {
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
			getWallCollisionItem : getWallCollisionItem,
			robotIsAtHome : robotIsAtHome,
			robotCanCharge : robotCanCharge,
			robotCanRefuel : robotCanRefuel,
			robotCanTeleport : robotCanTeleport,
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
								y : m.position.y,
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
				reset 	: function() {
					this.clear();
					if (window.originalWallPositions) for (var i = 0; i < window.originalWallPositions.length; i++) {
						var pos = window.originalWallPositions[i];
						this.add(pos);
					}
				},
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
							},
							movable : !!m.userData.movable
						});
					}
					return result;
				},
			},
			debugMode : (document.location.hostname === "localhost"),
			loadEnvironment : function(meta, complete) {
				this.wall.clear();
				this.flower.clear();
				this.station.clear();
				if (meta.walls){
					for (var i = 0; i < meta.walls.length; i++) {
						var wall = meta.walls[i];
						window.engine.wall.add(wall);
					}
				}
				window.originalWallPositions = meta.walls;
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
/*
				FIXME:
				conflicts with updatePhysics
				android.position.x = meta.robot.position.x;
				android.position.z = meta.robot.position.z;
*/
				if (android){
					android.rotation.y = 0;
					android.position.x = 0;
					android.position.z = 0;
				}

				homeBoxCube.position.x = meta.homeBox.position.x;
				homeBoxCube.position.y = meta.homeBox.position.y || 25;
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
				window.orginalBotEnergyCurrent = meta.robot.energy.current;
				if (meta.robot.fuel)
					window.orginalBotFuelCurrent = meta.robot.fuel.current;
				if (meta.robot.energy){window.robotConfigs.energy = meta.robot.energy}
				if (meta.robot.fuel){
					window.robotConfigs.fuel = meta.robot.fuel
	   				window.engine.fuelGauge.maxValue = meta.robot.fuel.max;
	   				window.engine.fuelGauge.set(robotConfigs.fuel.current);
				} else {
					window.robotConfigs.fuel.current = 0;
					window.robotConfigs.fuel.max = 0;
				}
				window.refreshRobotEnergyStatus();
				window.refreshRobotFuelStatus();
				window.refreshRobotCapacityStatus();
				window.setTimeout(function() {
					window.robot.program.stop(complete);
				},200);
			},
			test : function() {
				window.robotConfigs.speed = 1;
				var self = this;
				var resetMocha = function() {
					$('#mocha-report').remove();
					$('#mocha-stats').remove();
					mocha.suite.suites = [];
				};
				var fin = function() {
					//alert("done"); // next package test
					$.magnificPopup.open({
					  items: {
					      src: '#t',
					      type: 'inline'
					  }
					});
				};
				var packages = [];
				var index = -1;
				resetMocha();
				var testRunner = function() {
					++index;
					if (index===packages.length-1){
						fin();
					} else {
						if (packages[index].test) {
							toastr.info("Loading " + packages[index].name + "...") ;
							self.channel.load(index, function(p) {
								toastr.clear();
								toastr.info("Run program \"" + packages[index].name + "\"...")
								window.robot.program.run(function  () {
									// cool down client before test
									toastr.info("Cooling down... Testing...")
									window.setTimeout(function() {
										toastr.clear();
										window.tests.program.run(false, function() {
											mocha.suite.suites = [];
												testRunner();
										});
									}, 1000); 
								});
							});
						} else {
							testRunner();
						}
					}

				};
				self.channel.list(function(data){
					packages = data.packages;
					testRunner();
				});
			}
		};
	}

	$(function() {
		if (window.isMobile){
			$('.entry-open').fadeIn(4000);
			return;
		} else {
			$("#ThreeJS").show();
		}
		var opts = {
		  lines: 12, // The number of lines to draw
		  angle: 0.15, // The length of each line
		  lineWidth: 0.44, // The line thickness
		  pointer: {
		    length: 0.9, // The radius of the inner circle
		    strokeWidth: 0.035 // The rotation offset
		  },
		  colorStart: '#6FADCF',   // Colors
		  colorStop: '#8FC0DA',    // just experiment with them
		  strokeColor: '#E0E0E0'   // to see which ones work best for you
		};
		var target = document.getElementById('fuel-gauge'); // your canvas element
		var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
		gauge.maxValue = 0; // set max gauge value
		gauge.animationSpeed = 5; // set animation speed (32 is default value)
		engine.fuelGauge = gauge;

		$tooltip = $("#tooltip");
		toastr.options = {
		  "closeButton": false,
		  "debug": false,
		  "newestOnTop": false,
		  "progressBar": false,
		  "positionClass": "toast-top-center",
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
		toastr.options.onShown = function() { 
			switch ($(this).attr("class").split("-").pop()){
				case "error":
	    			createjs.Sound.play("beep-error");
					break;
			}
		}
 
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
			/*addWall({
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
			});	*/

		/*	gauge.set(3000, function  () {
				gauge.set(0, function  () {
					gauge.set(3000);
				}); // set actual value
			}); // set actual value*/
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
        window.onunload = function() {
    		closeEditorWindows();
        };
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
