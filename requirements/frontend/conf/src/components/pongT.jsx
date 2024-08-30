import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import WaitList from './WaitList';
import TourneyDisplay from './TourneyDisplay';
import styles from '../styles/game.module.css';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { useAuth } from '../context/AuthenticationContext';
import { useGame } from '../context/GameContext';
import React from 'react';

const PongT = ({
	scoreL, setScoreL,
	scoreR, setScoreR,
	gameEnd, setGameEnd,
	gameError, setGameError,
	setErrorMessage,
	socket, myUser
}) => {
	const { user } = useAuth();
	const {
		tourneyStarted,
		tourneyEnded,
		gameStarted,
		gameEnded,
		gameErrored,
		tourney,
		tourneyPlayers,
		room,
		setGameStarted,
		setGameEnded,
		setGameErrored,
		updateRoom,
		updatePlayers,
		performanceMode,
		cameraMode
	} = useGame();
	const canvasRef = useRef(null);
	const [matchNb, setMatchNb] = useState(1);
	const [watchLogout, setWatchLogout] = useState(false);

	useEffect(() => {
		if (!user && watchLogout) {
			setGameError(true);
			setGameErrored(true);
			if (socket)
				socket.disconnect();
			setErrorMessage('You were disconnected');
		} else if (user) {
			setGameError(false);
			setGameErrored(false);
			setErrorMessage('');
			setWatchLogout(true);
		}
	}, [user]);

	useEffect(() => {
		if (!socket || !myUser || matchNb > 2)
			return ;
		if (!setGameStarted || !updateRoom || !updatePlayers || tourneyEnded)
			return ;

		socket.on('resetGameState', () => {
			updateRoom(null, null);
			setGameStarted(false);
			setGameEnd(false);
			setGameEnded(false);
			setScoreL(0);
			setScoreR(0);
		});

		socket.on('endMatch', () => {
			setMatchNb(matchNb + 1);
		});

		/// SCENE
		let scene = new THREE.Scene();
		scene.background = new THREE.Color(0x111111);

		const canvas = canvasRef.current;

		/// RENDERER
		const renderer = canvas ? new THREE.WebGLRenderer({ antialias: true, canvas }) : null;

		/// CANVAS

		/// CAMERA SETTINGS
		const fov = 42;
		const aspect = 1.5;
		const near = 0.1;
		const far = 100000;

		/// TEXTURE SKYBOX AND SPHERE
		const loader = new THREE.TextureLoader();
		const texture = loader.load('games/pong/texture/skybox.jpg');
		texture.colorSpace = THREE.SRGBColorSpace;
		const texturesphere = loader.load('games/pong/texture/ball.png');
		texture.colorSpace = THREE.SRGBColorSpace;

		/// CAMERA
		let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		camera.position.set(0, 100, 10);
		camera.lookAt(new THREE.Vector3(0, 0, 0));

		let modelsLoaded = false;
		if (performanceMode) {
			modelsLoaded = true;
		} else {
			/// MODEL 3D
			const totalmodel = 11;
			let actualmodel = 0;
			modelsLoaded = false;
			
			// Fonction pour vérifier si tous les modèles sont chargés
			function checkModelsLoaded() {
				if (actualmodel === totalmodel)
					modelsLoaded = true;
			}
			checkModelsLoaded();

			const loadermodel = new GLTFLoader();

			loadermodel.load(
				'games/pong/models/Building.glb',
				function (gltf) {
					gltf.scene.position.z = -45;
					gltf.scene.position.x = -2;
					gltf.scene.position.y = 0.5;
					gltf.scene.scale.set(0.339, 0.25, 0.25);
					scene.add( gltf.scene );
					actualmodel += 1;
					checkModelsLoaded();
				},
				undefined,
				function (error) {}
			);

			loadermodel.load(
				'games/pong/models/city.glb',
				function (gltf) {
					gltf.scene.position.z = 490;
					gltf.scene.position.x = 1330;
					gltf.scene.position.y = -1063;
					gltf.scene.rotation.y = 2.17;
					gltf.scene.scale.set(100, 100, 100);
					scene.add( gltf.scene );
					actualmodel++;
					checkModelsLoaded();
				},
				undefined,
				function (error) {}
			);

			loadermodel.load(
				'games/pong/models/Parrot.glb',
				function (gltf) {
					gltf.scene.position.z = -52;
					gltf.scene.position.x = -20;
					gltf.scene.position.y = 3;
					gltf.scene.rotation.y = 1.5;
					gltf.scene.scale.set(0.1, 0.1, 0.1);
					scene.add( gltf.scene );
					actualmodel++;
					checkModelsLoaded();
				},
				undefined,
				function (error) {}
			);

			loadermodel.load(
				'games/pong/models/palm/palmtree.gltf',
				function (gltf) {
					gltf.scene.position.z = 26.5;
					gltf.scene.position.x = 48.5;
					gltf.scene.position.y = 1;
					gltf.scene.rotation.y = 1;
					gltf.scene.scale.set(5, 5, 5);
					scene.add(gltf.scene);
					actualmodel++;
					checkModelsLoaded();
				},
				undefined,
				function (error) {}
			);

			loadermodel.load(
				'games/pong/models/palm/palmtree.gltf',
				function (gltf) {
					gltf.scene.position.z = 26.5;
					gltf.scene.position.x = -48.5;
					gltf.scene.position.y = 1;
					gltf.scene.rotation.y = -1;
					gltf.scene.scale.set(5, 5, 5);
					scene.add(gltf.scene);
					actualmodel++;
					checkModelsLoaded();
				},
				undefined,
				function (error) {}
			);

			loadermodel.load(
				'games/pong/models/bush/scene.gltf',
				function (gltf) {
					gltf.scene.position.z = 27;
					gltf.scene.position.x = -49;
					gltf.scene.position.y = -2;
					gltf.scene.rotation.y = -1;
					gltf.scene.scale.set(0.05, 0.05, 0.05);
					scene.add(gltf.scene);
					actualmodel++;
					checkModelsLoaded();
				},
				undefined,
				function (error) {}
			);

			loadermodel.load(
				'games/pong/models/bush/scene.gltf',
				function (gltf) {
					gltf.scene.position.z = 27;
					gltf.scene.position.x = 49;
					gltf.scene.position.y = -2;
					gltf.scene.rotation.y = -1;
					gltf.scene.scale.set(0.05, 0.05, 0.05);
					scene.add(gltf.scene);
					actualmodel++;
					checkModelsLoaded();
				},
				undefined,
				function (error) {}
			);

			loadermodel.load(
				'games/pong/models/palm2/scene.gltf',
				function (gltf) {
					gltf.scene.position.z = -71;
					gltf.scene.position.x = -50;
					gltf.scene.position.y = 1;
					gltf.scene.rotation.y = -1.4;
					gltf.scene.scale.set(9, 9, 9);
					scene.add(gltf.scene);
					actualmodel++;
					checkModelsLoaded();
				},
				undefined,
				function (error) {}
			);

			loadermodel.load(
				'games/pong/models/bush/scene.gltf',
				function (gltf) {
					gltf.scene.position.z = -71;
					gltf.scene.position.x = -50;
					gltf.scene.position.y = -2;
					gltf.scene.rotation.y = -1;
					gltf.scene.scale.set(0.05, 0.05, 0.05);
					scene.add(gltf.scene);
					actualmodel++;
					checkModelsLoaded();
				},
				undefined,
				function (error) {}
			);

			loadermodel.load(
				'games/pong/models/palm2/scene.gltf',
				function (gltf) {
					gltf.scene.position.z = -71;
					gltf.scene.position.x = 50;
					gltf.scene.position.y = 1;
					gltf.scene.rotation.y = -1.5;
					gltf.scene.scale.set(9, 9, 9);
					scene.add(gltf.scene);
					actualmodel++;
					checkModelsLoaded();
				},
				undefined,
				function (error) {}
			);

			loadermodel.load(
				'games/pong/models/bush/scene.gltf',
				function (gltf) {
					gltf.scene.position.z = -71;
					gltf.scene.position.x = 50;
					gltf.scene.position.y = -2;
					gltf.scene.rotation.y = -1;
					gltf.scene.scale.set(0.05, 0.05, 0.05);
					scene.add(gltf.scene);
					actualmodel++;
					checkModelsLoaded();
				},
				undefined,
				function (error) {}
			);
		}

		/// TEXT
		let text3, text3r, text2, text2r, text1, text1r, text0, text0r;
		let textMesh1, font;
		let textGeo;

		const loadertext = new FontLoader();
		loadertext.load('games/pong/fonts/helvetiker_regular.typeface.json',
			function (loadedFont)
			{
				font = loadedFont;
				// model interieur
				let RED = [
					new THREE.MeshPhongMaterial( { color: 0xFF0000, flatShading: true } ), // front
					new THREE.MeshPhongMaterial( { color: 0xFF0000 } ) // side
				];
				// model exterieur
				let BLACK = [
					new THREE.MeshPhongMaterial( { color: 0x000000, flatShading: true } ), // front
					new THREE.MeshPhongMaterial( { color: 0x000000 } ) // side
				];
				// creation des different model de textes pour le compte a rebours
				text3 = createText("3", BLACK, 31, 5, 5, 2, 0, 5);
				text3r = createText("3", RED, 30, 5, 6, 1, -1, 5.5);
				text2 = createText("2", BLACK, 31, 5, 5, 2, 0, 5);
				text2r = createText("2", RED, 30, 5, 6, 1, -1, 5.5);
				text1 = createText("1", BLACK, 31, 5, 5, 2, -7, 5);
				text1r = createText("1", RED, 30, 5, 6, 1, -8, 5.5);
				text0 = createText("0", BLACK, 31, 5, 5, 2, 0, 5);
				text0r = createText("0", RED, 30, 5, 6, 1, -1, 5.5);
			}
		);
		// creation des textes avec les parametres
		function createText(text, materials, size, z, y, epaisseur, x, profondeur)
		{
			textGeo = new TextGeometry( text,
				{
					font: font,
					size: size,
					depth: 1,
					curveSegments: 10,
					bevelThickness: profondeur,
					bevelSize: epaisseur,
					bevelEnabled: y
				}
			);

			textGeo.computeBoundingBox();
			const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
			textMesh1 = new THREE.Mesh(textGeo, materials);
			// positionnement des textes
			textMesh1.position.x = centerOffset + x;
			textMesh1.position.y = y + 10;
			textMesh1.position.z = z;
			textMesh1.rotation.x = -1.4;
			textMesh1.rotation.y = Math.PI * 2;
			textMesh1.rotation.z = 0;
			return (textMesh1);
		}

		/// FLOOR DE LA PISCINE (PONG)
		const planeSize = 42;
		const texture2 = loader.load('games/pong/texture/pool.png');
		texture2.colorSpace = THREE.SRGBColorSpace;
		texture2.wrapS = THREE.RepeatWrapping;
		texture2.wrapT = THREE.RepeatWrapping;
		texture2.repeat.set(6, 2.5);
		const planeGeo = new THREE.PlaneGeometry(planeSize * 2 + 6, planeSize + 3);
		const planeMat = new THREE.MeshPhongMaterial({ map: texture2, side: THREE.DoubleSide });
		const mesh = new THREE.Mesh(planeGeo, planeMat);
		mesh.rotation.x = Math.PI * -.5;
		scene.add(mesh);

		if (!performanceMode) {
			const textureWood = loader.load('games/pong/texture/wood.jpg');
			textureWood.colorSpace = THREE.SRGBColorSpace;
			textureWood.wrapS = THREE.RepeatWrapping;
			textureWood.wrapT = THREE.RepeatWrapping;
			textureWood.repeat.set(8, 8);

			/// floor toit immeuble
			const Size = 104;
			const plane_Geo = new THREE.PlaneGeometry(Size + 20, Size -11);
			const plane_Mat = new THREE.MeshPhongMaterial({ map: textureWood, side: THREE.DoubleSide });
			const planmesh = new THREE.Mesh(plane_Geo, plane_Mat);
			planmesh.rotation.x = Math.PI * -.5;
			planmesh.position.y = -1.1;
			planmesh.position.z = -22;
			scene.add(planmesh);

			/// floor toit immeuble
			const Size2 = 104;
			const plane_Geo2 = new THREE.PlaneGeometry(Size2 -11, Size2 +18);
			const plane_Mat2 = new THREE.MeshPhongMaterial({ map: textureWood, side: THREE.DoubleSide });
			const planmesh2 = new THREE.Mesh(plane_Geo2, plane_Mat2);
			planmesh2.rotation.x = Math.PI * -.5;
			planmesh2.position.y = -1.2;
			planmesh2.position.z = -22;
			scene.add(planmesh2);

			/// floor toit immeuble
			const Size3 = 12;
			const plane_Geo3 = new THREE.PlaneGeometry(Size3, Size3);
			const plane_Mat3 = new THREE.MeshPhongMaterial({ color: 0x000005, side: THREE.DoubleSide });
			const planmesh3 = new THREE.Mesh(plane_Geo3, plane_Mat3);
			planmesh3.rotation.x = Math.PI * -.5;
			planmesh3.position.y = -2.2;
			planmesh3.position.z = -70;
			planmesh3.position.x = 49;
			scene.add(planmesh3);
		}

		/// ORBITAL CONTROL
		if (cameraMode) {
			const controls = canvas ? new OrbitControls(camera, canvas) : null;
			if (controls) controls.unableDamping = true;
			controls?.target.set(0, 0, 0);
			controls.maxDistance = 300;
			controls?.update();
		}

		/// LUMIERES
		// lumiere ambiante
		const skyColor = 0xFFFFFF;
		const groundColor = 0xFFFFFF;
		const intensity2 = 5;
		const light2 = new THREE.HemisphereLight(skyColor, groundColor, intensity2);
		scene.add(light2);

		/// OBJETS
		// chargement des textures
		const texturewater = loader.load('games/pong/texture/water.jpg');
		const textureraquette = loader.load('games/pong/texture/paddle.png');
		const textureraquette2 = loader.load('games/pong/texture/paddle2.png');
		const textureraquette3 = loader.load('games/pong/texture/paddleSide.png');
		const texturevitre = loader.load('games/pong/texture/glass.jpg');
		texturevitre.colorSpace = THREE.SRGBColorSpace;

		const texturetoit = loader.load('games/pong/texture/rock.jpg');
		texturetoit.wrapS = THREE.RepeatWrapping;
		texturetoit.wrapT = THREE.RepeatWrapping;
		texturetoit.magFilter = THREE.NearestFilter;
		texturetoit.colorSpace = THREE.SRGBColorSpace;
		texturetoit.repeat.set(30, 30);

		// creation des materiaux
		const wallmaterials = new THREE.MeshBasicMaterial({ map: texturevitre, side: THREE.DoubleSide, transparent: true, opacity: 0.2});
		const wallmaterials2 = new THREE.MeshBasicMaterial({ map: texturevitre, side: THREE.DoubleSide, transparent: true, opacity: 0.2, wireframe: true, });
		const water = new THREE.MeshBasicMaterial({ map: texturewater, transparent: true, opacity: 0.25, side: THREE.DoubleSide});

		// creation materiaux avec des textures differentes sur chaque face
		const sideMaterial = new THREE.MeshBasicMaterial({ map: textureraquette });
		const sideMaterial2 = new THREE.MeshBasicMaterial({ map: textureraquette2 });
		const sideMaterial3 = new THREE.MeshBasicMaterial({ map: textureraquette3 });
		const raquettematerials = [
			sideMaterial2,
			sideMaterial,
			sideMaterial3,
			sideMaterial3,
			sideMaterial3,
			sideMaterial3
		];

		// creation des differents cubes
		const cube = new THREE.BoxGeometry(2, 4, 10);
		const wall = new THREE.BoxGeometry(89, 6, 0.5);
		const wall2 = new THREE.BoxGeometry(0.5, 6, 45);
		const watercube = new THREE.BoxGeometry(89, 4, 44);

		// creation de la balle
		const radius = 2;
		const detail = 5;
		const ball = new THREE.IcosahedronGeometry(radius, detail);

		// creation des tableaux pour les paddles et les mouvements des paddles
		var ballObj;
		const ballDir = [ 0.99999, 0.00001 ]
		const paddles = [];
		let role = 'pending';
		let paddleUp = false;
		let paddleDown = false;

		// ajout des objets dans la scene et placement des objets
		addball(0, 2, 0, makeObj(ball, texturesphere));
		addraquette(-43, 2, 0, new THREE.Mesh(cube, raquettematerials));
		addraquette(43, 2, 0, new THREE.Mesh(cube, raquettematerials));
		addwall(0, 3, 22.25, new THREE.Mesh(wall, wallmaterials));
		addwall(0, 3, -22.25, new THREE.Mesh(wall, wallmaterials));
		addwall(-44.75, 3, 0, new THREE.Mesh(wall2, wallmaterials));
		addwall(44.75, 3, 0, new THREE.Mesh(wall2, wallmaterials));

		addwall(0, 3, 22.25, new THREE.Mesh(wall, wallmaterials2));
		addwall(0, 3, -22.25, new THREE.Mesh(wall, wallmaterials2));
		addwall(-44.75, 3, 0, new THREE.Mesh(wall2, wallmaterials2));
		addwall(44.75, 3, 0, new THREE.Mesh(wall2, wallmaterials2));
		addwall(0, 2.1, 0, new THREE.Mesh(watercube, water));

		/// SKYBOX
		// creation d'une sphere pour le ciel
		if (cameraMode) {
			const skybox = new THREE.IcosahedronGeometry(4200,50);
			const skyboxMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide });
			const skyboxMesh = new THREE.Mesh(skybox, skyboxMaterial);
			// positionnement de l'objet ciel
			skyboxMesh.rotation.y = -2.5;
			skyboxMesh.position.z = 20 - 45;
			scene.add(skyboxMesh);
		}

		let gameStart = false;
		let startTimer = false;
		let startGameplay = false;
		let startTime = Date.now();
		let currentTime = Date.now();
		let lastLoopTime = Date.now();

		/// CONTROLS
		function handleKeyDown(event) {
			if (event.repeat)
				return ;
			switch (event.key) {
				case "ArrowUp":
					if (!paddleUp) {
						paddleUp = true;
						socket.emit('input', { gameType: 'pong2', input: { key: event.key, type: 'keydown' } });
					}
					break;
				case "ArrowDown":
					if (!paddleDown) {
						paddleDown = true;
						socket.emit('input', { gameType: 'pong2', input: { key: event.key, type: 'keydown' } });
					}
					break;
			}
		}
		document.addEventListener('keydown', handleKeyDown);

		function handleKeyUp(event) {
			if (event.repeat)
				return ;
			switch (event.key) {
				case "ArrowUp":
					if (paddleUp) {
						paddleUp = false;
						socket.emit('input', { gameType: 'pong2', input: { key: event.key, type: 'keyup' } });
					}
					break;
				case "ArrowDown":
					if (paddleDown) {
						paddleDown = false;
						socket.emit('input', { gameType: 'pong2', input: { key: event.key, type: 'keyup' } });
					}
					break;
			}
		}
		document.addEventListener('keyup', handleKeyUp);

		/// RENDER
		var frame = 0;
		renderer?.render(scene, camera);

		/// FUNCTIONS
		function makeObj(geometry, map)
		{
			const material = new THREE.MeshBasicMaterial({ map: map });
			const obj = new THREE.Mesh(geometry, material);
			return obj;
		}

		function addball(x, y, z, obj)
		{
			obj.position.x = x;
			obj.position.y = y;
			obj.position.z = z;
			ballObj = obj;
			scene.add(obj);
		}

		function addraquette(x, y, z, obj)
		{
			obj.position.x = x;
			obj.position.y = y;
			obj.position.z = z;
			scene.add(obj);
			paddles.push(obj);
		}

		function addwall(x, y, z, obj)
		{
			obj.position.x = x;
			obj.position.y = y;
			obj.position.z = z;
			scene.add(obj);
		}

		let startRender = Date.now();

		socket.on('gameStart', ({ players }) => {
			for (const playerKey in players) {
				if (players[playerKey].id === myUser.id) {
					role = players[playerKey].role;
				}
			}
			gameStart = true;
			setGameStarted(true);
		});

		socket.on('startTimer', () => {
			startTimer = true;
			startRender = Date.now();
		});

		socket.on('startGameplay', () => {
			startGameplay = true;
			startTime = Date.now();
		});

		let stopGameError = false;
		socket.on('gameEnd', ({ winner, score }) => {
			stopGameError = true;
			setGameEnded(true);
			setGameEnd(true);
		});

		socket.on('gameError', ({ message }) => {
			if (stopGameError)
				return ;
			setGameErrored(true);
			setGameError(true);
			setErrorMessage(message);
		});

		socket.on('gameStatus', ({
			leftScore, rightScore,
			newPaddleSpeed,
			ballX, ballZ, newBallSpeed,
			ballDirX, ballDirZ, resetRotation,
			leftPaddleZ, rightPaddleZ
		}) => {
			// Score
			if (leftScore !== scoreL)
				setScoreL(leftScore);
			if (rightScore !== scoreR)
				setScoreR(rightScore);

			// Ball
			/// Speed
			ballSpeed = newBallSpeed;
			/// X Pos
			ballObj.position.x = ballX;
			/// Z Pos
			ballObj.position.z = ballZ;
			/// X Dir
			ballDir[0] = ballDirX;
			/// Z Dir
			ballDir[1] = ballDirZ;
			/// Rotation
			if (resetRotation) {
				ballObj.rotation.z = 0;
				ballObj.rotation.x = 0;
				ballObj.rotation.y = 0;
			}

			// Paddles
			/// Speed
			paddleSpeed = newPaddleSpeed;
			/// Pos
			paddles[0].position.z = leftPaddleZ;
			paddles[1].position.z = rightPaddleZ;
		});

		// Gameplay constants
		const FPS = 60;
		const PADDLE_SPEED = 37;							// units per second
		const BASE_BALL_SPEED = 60;						// units per second
		const BALL_MAX_X = 42.5;
		const BALL_MAX_Z = 20;
		const PADDLE_MAX_Z = 16.5;
		const BALL_MAX_Z_DIR = 0.6;
		let paddleSpeed = PADDLE_SPEED;
		let ballSpeed = BASE_BALL_SPEED;

		let first = 0;
		let frameReqId = null;
		function render(time)
		{
			if (!modelsLoaded)
			{
				frameReqId = requestAnimationFrame(render);
				return;
			}

			if (first === 0) {
				socket.emit('readyTimer', { gameType: 'pong2' });
				first = 1;
			}

			if (!startTimer)
			{
				frameReqId = requestAnimationFrame(render);
				return;
			}

			time *= 0.0001;
			frame += 0.1;
			
			currentTime = Date.now();
			const timeRendered = (currentTime - startRender) / 1000; // In seconds
			// Rendering at FPS frames per second
			if (currentTime - startTime >= 1000 / FPS)
			{
				if (timeRendered > 5)
				{
					if (first === 1) {
						socket.emit('ready', { gameType: 'pong2' });
						first = 2;
					}
					if (startGameplay) {
						startTime = Date.now();
						const timeSinceLastLoop = (startTime - lastLoopTime) / 1000; // In seconds
						// Client-side game updates

						// Paddle Movement
						const displaceP = paddleSpeed * timeSinceLastLoop;
						/// Left Paddle
						if (role === 'leftPaddle') {
							if (paddleUp)
								paddles[0].position.z -= displaceP;
							if (paddleDown)
								paddles[0].position.z += displaceP;
							paddles[0].position.z = Math.min(Math.max(paddles[0].position.z, -PADDLE_MAX_Z), PADDLE_MAX_Z);
						}
						/// Right Paddle
						else if (role === 'rightPaddle') {
							if (paddleUp)
								paddles[1].position.z -= displaceP;
							if (paddleDown)
								paddles[1].position.z += displaceP;
							paddles[1].position.z = Math.min(Math.max(paddles[1].position.z, -PADDLE_MAX_Z), PADDLE_MAX_Z);
						}

						// Ball movement
						/// X
						const displaceX = (ballSpeed * timeSinceLastLoop) * Math.abs(ballDir[0]);
						if (ballDir[0] > 0)
							ballObj.position.x += displaceX;
						else if (ballDir[0] < 0)
							ballObj.position.x -= displaceX;
						ballObj.position.x = Math.min(Math.max(ballObj.position.x, -BALL_MAX_X), BALL_MAX_X);
						/// Z
						const displaceZ = (ballSpeed * timeSinceLastLoop) * Math.abs(ballDir[1]);
						if (ballDir[1] > 0) {
							ballObj.position.z += displaceZ;
						} else if (ballDir[1] < 0) {
							ballObj.position.z -= displaceZ;
						}
						/// Bounce on top and bottom walls
						if (ballObj.position.z > BALL_MAX_Z || ballObj.position.z < -BALL_MAX_Z) {
							ballDir[1] *= -1;
							ballObj.rotation.x = 0;
							ballObj.rotation.y = 0;
							ballObj.rotation.z = 0;
						}
						ballObj.position.z = Math.min(Math.max(ballObj.position.z, -BALL_MAX_Z), BALL_MAX_Z);

						// Clamp Ball Z Direction
						ballDir[1] = Math.min(Math.max(ballDir[1], -BALL_MAX_Z_DIR), BALL_MAX_Z_DIR);

						const absSum = Math.abs(ballDir[0]) + Math.abs(ballDir[1]);
						if (absSum !== 1)
						{
							const ratio = 1 / absSum;
							ballDir[0] *= ratio;
							ballDir[1] *= ratio;
						}

						// Ball Rotation
						const angle = Math.atan2(ballDir[1], ballDir[0]);
						const rotationX = Math.cos(angle) * (Math.PI / 4 / 5);
						const rotationZ = Math.sin(angle) * (Math.PI / 4 / 5);
						ballObj.rotateX(rotationZ);
						ballObj.rotateZ(-rotationX);
					}
				}
				else if (timeRendered > 4)
				{
					scene.remove(text0);
					scene.remove(text0r);
					scene.remove(text1);
					scene.remove(text1r);
					scene.remove(text2);
					scene.remove(text2r);
					scene.remove(text3);
					scene.remove(text3r);
				}
				else if (timeRendered > 3)
				{
					scene.remove(text1);
					scene.remove(text1r);
					scene.add(text0);
					scene.add(text0r);
				}
				else if (timeRendered > 2)
				{
					scene.remove(text2);
					scene.remove(text2r);
					scene.add(text1);
					scene.add(text1r);
				}
				else if (timeRendered > 1)
				{
					scene.remove(text3);
					scene.remove(text3r);
					scene.add(text2);
					scene.add(text2r);
				}
				else
				{
					scene.add(text3);
					scene.add(text3r);
				}
			}

			lastLoopTime = Date.now();
			if (!gameEnd && !gameError) {
				renderer?.render(scene, camera);
				frameReqId = requestAnimationFrame(render);
			}
		}
		function waitForGameStart() {
			if (gameStart && !gameEnd && !gameError) {
				lastLoopTime = Date.now();
				frameReqId = requestAnimationFrame(render);
			} else if (!gameEnd && !gameError) {
				setTimeout(waitForGameStart, 250); // Every 0.25 seconds
			}
		}
		waitForGameStart();

		return () =>
		{
			setGameEnd(true);
			cancelAnimationFrame(frameReqId);
			gameStart = false;
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);

			// Dispose of Three.js objects
			scene.traverse((object) =>
			{
				if (!object.isMesh)
					return;

				object.geometry.dispose();

				if (object.material.isMaterial)
				{
					cleanMaterial(object.material);
				}
				else
				{
					for (const material of object.material)
						cleanMaterial(material);
				}
			});

			function cleanMaterial(material)
			{
				material.dispose();
				// Dispose textures if any
				for (const key in material)
				{
					const value = material[key];
					if (value && typeof value === 'object' && 'minFilter' in value) {
						value.dispose();
					}
				}
			}

			renderer?.renderLists.dispose();
			renderer?.dispose();

			scene.traverse((object) =>
			{
				if (!object.isMesh)
					return;

				object.geometry = null;

				if (object.material.isMaterial)
					object.material = null;
				else
					object.material = [];
			});
		};
	}, [myUser, socket, matchNb]);

	useEffect(() => {
		if (gameEnded || gameErrored) {
			setGameStarted(false);
			setGameEnded(false);
			setGameErrored(false);
		}
	}, [gameEnded, gameErrored]);

	let testmessage = <></>;
	let hidden = '';
	if (!tourney) {
		hidden = 'hidden';
		testmessage = (
			<div className={React.background}>
				<p style={{color: 'white'}}>Connecting...</p>
			</div>
		);
	}
	else if (!tourneyStarted) {
		hidden = 'hidden';
		testmessage = (
			<div className={React.background}>
				<p style={{color: 'white'}}>In tourney {tourney?.id}, waiting for other players . . .</p>
				<WaitList players={tourneyPlayers} />
			</div>
		);
	}
	else if (!room) {
		hidden = 'hidden';
		testmessage = (
			<div className={React.background}>
				<p style={{color: 'white'}}>In tourney {tourney?.id}, waiting for next match.</p>
				<TourneyDisplay matches={tourney?.matches || null} />
			</div>
		);
	}
	else if (!gameStarted) {
		hidden = 'hidden';
		testmessage = (
			<div className={React.background}>
				<p style={{color: 'white'}}>In room {room?.id}, waiting for your opponent . . .</p>
			</div>
		);
	} else {
		hidden = '';
	}

	return (
		<div>
			{testmessage}
			<div className={styles.canvasWrapper}>
				<canvas hidden={hidden} ref={canvasRef} id="pong-canvas" className={styles.canvas} width="1000" height="600"></canvas>
			</div>
		</div>
	);
};

export default PongT;
