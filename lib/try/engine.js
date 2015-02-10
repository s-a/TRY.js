/*
	"An Andoid Robot to learn JavaScript"
	Author: Stephan Ahlf
*/
// MAIN
(function(THREE) {

	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;

	// standard global variables
	var container, scene, camera, renderer, controls, stats;
	var clock = new THREE.Clock();
	
	// custom global variables
	var android, homeBoxCube;
	var collidableMeshList =[];
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

	    wall.material.color.set( new THREE.Color( 0xCC0000 )  );
	}

	function onDocumentMouseDown( e ) {
	    e.preventDefault();
	  	var projector = new THREE.Projector(); 
		var mouse3D = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1,   //x
		                                -( event.clientY / window.innerHeight ) * 2 + 1,  //y
		                                0.5 );                                            //z
		var raycaster = projector.pickingRay( mouse3D.clone(), camera );
		var intersects = raycaster.intersectObjects( collidableMeshList );
		// Change color if hit block
		if ( intersects.length > 0 ) {
			resetSelected(intersects[ 0 ].object);
		    window.engine.selected = intersects[ 0 ].object;
		    if (window.editorEnvironment){
			    window.editorEnvironment.boxConfig.position.z = window.engine.selected.position.z;
			    window.editorEnvironment.boxConfig.position.x = window.engine.selected.position.x;
				window.editorEnvironment.boxConfig.scale.x = engine.selected.geometry.width;
				window.editorEnvironment.boxConfig.scale.y = engine.selected.geometry.height;
				window.editorEnvironment.boxConfig.scale.z = engine.selected.geometry.depth;
		    } else {
		    	//alert("There is no code editor for the environment attached. Please open a code editor window.");
		    }

		}
	}


	function removeWall(mesh) {
			for (var i = 0; i < collidableMeshList.length; i++) {
				var m = collidableMeshList[i];
				if (m.id === mesh.id){
					scene.remove(mesh);
					collidableMeshList.splice(i,1);
					break;
				}
			}
	}

	function addWall(meta) {
		var wallGeometry = new THREE.CubeGeometry(meta.scale.x,meta.scale.y,meta.scale.z);
		var WireTexture = new THREE.ImageUtils.loadTexture( 'images/square-thick.png' );
		var wallMaterial1 = new THREE.MeshBasicMaterial( {color: 0x8888ff, map: WireTexture , side: THREE.DoubleSide}  );
		var wall = new THREE.Mesh(wallGeometry, wallMaterial1);
		
		wall.position.set(meta.position.x,meta.position.y || (meta.scale.y/2),meta.position.z);
		/*if (meta  && meta.id){
			// wall.id = meta.id; conflicts?
			wall.position.z = meta.position.z;
			wall.position.x = meta.position.x;
		 	wall.scale.x = meta.scale.x;
			wall.scale.y = meta.scale.y || 50;
			wall.scale.z = meta.scale.z; 
		} else {
		}*/
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
				var manager = new THREE.LoadingManager();
				manager.onProgress = function ( item, loaded, total ) {

					console.log( item, loaded, total );

				};
				var onError = function ( xhr ) {
				};
				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};

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
		var floorTexture = new THREE.ImageUtils.loadTexture( 'images/square-thick.png' );
		floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
		var floorSquareSize = 100;
		floorTexture.repeat.set( floorSquareSize, floorSquareSize );
		var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
		var floorGeometry = new THREE.PlaneGeometry(10000, 10000, floorSquareSize, floorSquareSize);
		var floor = new THREE.Mesh(floorGeometry, floorMaterial);
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
		var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true , side: THREE.DoubleSide } );
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
			materials[1].color.set( new THREE.Color( 0xF5B800 )  ); // yellow
			materials[2].color.set( new THREE.Color( 0xCC0000 )  ); // red
			materials[0].color.set( new THREE.Color( 0x009900 )  ); // green
			materials[3].color.set( new THREE.Color( 0x006600 )  ); // green
			for (var i = 0; i < materials.length; i++){ 
				materials[i].side = THREE.DoubleSide;
			}
			var material = new THREE.MeshFaceMaterial( materials );
			var mesh = new THREE.Mesh( geometry, material );
			mesh.scale.set(20,20,20);
			mesh.position.set(80,0,30);
			
			scene.add( mesh);
			collidableFlowerList.push(mesh);
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
 
		window.engine.android = android;
		window.engine.originalBotPosition = android.position.clone();
		window.engine.originalBotRotation = android.rotation.clone();

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
		return __collision(obj, collidableMeshList) || __collision(obj,collidableFlowerList);
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

	function boxCollision (box) {
		return _collision(box, collidableMeshList);
	}
	function flowerCollision (box) {
		return _collision(box, collidableFlowerList);
	}


	function robotIsAtHome () {
		var robotBB = new THREE.Box3().setFromObject(android);
		var homeBB = new THREE.Box3().setFromObject(homeBoxCube)
		return homeBB.containsBox(robotBB);
	}

	function update(){ 
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
			robotIsAtHome : robotIsAtHome,
			done : function() {
				
			},
			scene:scene,
			wall : {
				clear	: function() {
					for (var i = collidableMeshList.length - 1; i >= 0; i--) {
						var wall = collidableMeshList[i];
						this.remove(wall);
					}
				},
				add 	: addWall,
				addMesh 	: addWallMesh,
				remove 	: removeWall,
				meta  	: function() {
					var result = [];
					for (var i = 0; i < collidableMeshList.length; i++) {
						var m = collidableMeshList[i];
						result.push({
							id : m.id,
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
			loadEnvironment : function(meta) {
				this.wall.clear();
				for (var i = 0; i < meta.walls.length; i++) {
					var wall = meta.walls[i];
					window.engine.wall.add(wall);
				}

				android.rotation.y = 0;
				android.position.x = meta.robot.position.x;
				android.position.z = meta.robot.position.z;

				homeBoxCube.position.x = meta.homeBox.position.x;
				homeBoxCube.position.z = meta.homeBox.position.z;

				window.engine.originalBotPosition = android.position.clone();
				window.engine.originalBotRotation = android.rotation.clone();
				if (meta.energy){window.robotConfigs.energy = meta.robot.energy}
			}
		};
	}

	engine.addOn.maze.generate({
		height:500,
		width:500,
		rows:3,
		cols:3,
	});
	$(function() {
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

		if (document.location.hostname !== "localhost")
			window.setTimeout(function() {
				var target = new THREE.Vector3(0,1110,0);
				window.engine.cam.tween(target, function() {
				});
			}, 2000);
        // runner.globals(['foo', 'bar', 'baz']);
        // runner.on('test end', function(test){
        //   console.log(test.fullTitle());
        // });
	})
})(window.THREE);

