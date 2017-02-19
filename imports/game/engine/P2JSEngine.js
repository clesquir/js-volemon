import p2 from '/imports/lib/p2.js';
import { Config } from '/imports/lib/config.js';
import { Constants } from '/imports/lib/constants.js';
import { round } from '/imports/lib/utils.js';

export default class P2JSEngine {

	mpx(v) {
		return v *= 20;
	}

	mpxi(v) {
		return v *= -20;
	}

	pxm(v) {
		return v * 0.05;
	}

	pxmi(v) {
		return v * -0.05;
	}

	start(width, height, parent, preloadGame, createGame, updateGame, scope) {
		this.width = width;
		this.height = height;

		if (Meteor.isClient) {
			// // Init canvas
			// this.canvas = document.createElement("canvas");
			// this.canvas.width = width;
			// this.canvas.height = height;
			// document.getElementById(parent).appendChild(this.canvas);
			//
			// this.ctx = this.canvas.getContext("2d");
			// this.ctx.lineWidth = 0.02;
			// this.ctx.strokeStyle = this.ctx.fillStyle = 'white';

			this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {backgroundColor: 0x9ad3de});
			this.container = new PIXI.Container();
			document.getElementById(parent).appendChild(this.renderer.view);

			// Add transform to the container
			let zoom = 8.05;
			this.container.position.x = this.width / 2; // center at origin
			this.container.position.y = this.height / 2;
			this.container.scale.x = zoom;  // zoom in
			this.container.scale.y = -zoom; // Note: we flip the y axis to make "up" the physics "up"
		}

		this._collisionGroupID = 2;
		this.collisionGroups = [];
		this.cachedData = {};
		this.timers = [];
		this.spritesToRender = [];
		this.texture = {};

		preloadGame.call(scope);
		createGame.call(scope);

		// Animation loop
		this.lastAnimateLoopTime = 0;
		this.lastCallTime = Date.now() / 1000;
		this.fixedTimeStep = 1 / 60; // seconds
		this.maxSubSteps = 10;
		this.animate = () => {
			let me = this;
			let now = Date.now() / 1000;
			let timeSinceLastCall = now - this.lastCallTime;

			// Move bodies forward in time
			this.lastCallTime = now;
			this.world.step(this.fixedTimeStep, timeSinceLastCall, this.maxSubSteps);

			this.runTimers(now);
			updateGame.call(scope);
			if (Meteor.isClient) {
				scope.render.call(scope);
			}

			this.animateLoop(function(time) {
				me.animate(time);
			});
		};

		this.animate();
	}

	render() {
		for (let sprite of this.spritesToRender) {
			sprite.graphic.position.x = sprite.body.position[0];
			sprite.graphic.position.y = sprite.body.position[1];
			sprite.graphic.rotation = sprite.body.angle;
		}

		// Render scene
		this.renderer.render(this.container);
	}

	animateLoop(callback) {
		if (Meteor.isClient) {
			return requestAnimationFrame(callback);
		} else {
			let currentTime = new Date().getTime();
			let timeToCall = Math.max(0, 16 - (currentTime - this.lastAnimateLoopTime));
			let id = Meteor.setTimeout(function() {
				callback(currentTime + timeToCall);
			}, timeToCall);

			this.lastAnimateLoopTime = currentTime + timeToCall;

			return id;
		}
	}

	runTimers(now) {
		let activeTimers = [];

		for (timer of this.timers) {
			if (now >= timer.endTime) {
				timer.fn.call(timer.scope);
			} else {
				activeTimers.push(timer);
			}
		}

		this.timers = activeTimers;
	}

	stop() {
		this.animate = () => {};
	}

	onGameEnd() {
	}

	preloadGame() {
	}

	createGame() {
		for (let shape of Constants.PLAYER_LIST_OF_SHAPES) {
			this.loadScaledPhysics(Constants.NORMAL_SCALE_PHYSICS_DATA, Constants.SMALL_SCALE_PHYSICS_DATA, 'player-' + shape, Constants.SMALL_SCALE_PLAYER_BONUS);
			this.loadScaledPhysics(Constants.NORMAL_SCALE_PHYSICS_DATA, Constants.BIG_SCALE_PHYSICS_DATA, 'player-' + shape, Constants.BIG_SCALE_BONUS);
		}
		this.loadScaledPhysics(Constants.NORMAL_SCALE_PHYSICS_DATA, Constants.SMALL_SCALE_PHYSICS_DATA, 'ball', Constants.SMALL_SCALE_BALL_BONUS);
		this.loadScaledPhysics(Constants.NORMAL_SCALE_PHYSICS_DATA, Constants.BIG_SCALE_PHYSICS_DATA, 'ball', Constants.BIG_SCALE_BONUS);

		this.world = new p2.World({
			gravity: [0, this.pxmi(Config.worldGravity)]
		});
		this.world.on('impact', this.impactHandler, this);

		this.setupWalls();

		this.world.defaultContactMaterial.friction = 0;
		this.world.defaultContactMaterial.restitution = 0;
		this.world.setGlobalStiffness(1e10);
	}

	impactHandler(event) {
		if (event.bodyA._bodyCallbacks && event.bodyB._bodyCallbacks) {
			//  Body vs. Body callbacks
			let a = event.bodyA;
			let b = event.bodyB;

			if (a._bodyCallbacks[event.bodyB.id]) {
				a._bodyCallbacks[event.bodyB.id].call(a._bodyCallbackContext[event.bodyB.id], a, b, event.shapeA, event.shapeB);
			}

			if (b._bodyCallbacks[event.bodyA.id]) {
				b._bodyCallbacks[event.bodyA.id].call(b._bodyCallbackContext[event.bodyA.id], b, a, event.shapeB, event.shapeA);
			}

			//  Body vs. Group callbacks
			if (a._groupCallbacks[event.shapeB.collisionGroup]) {
				a._groupCallbacks[event.shapeB.collisionGroup].call(a._groupCallbackContext[event.shapeB.collisionGroup], a, b, event.shapeA, event.shapeB);
			}

			if (b._groupCallbacks[event.shapeA.collisionGroup]) {
				b._groupCallbacks[event.shapeA.collisionGroup].call(b._groupCallbackContext[event.shapeA.collisionGroup], b, a, event.shapeB, event.shapeA);
			}
		}
	}

	setupWalls() {
		this.walls = {};
		this.setupWall('left', this.width, 0, -1.5707963267948966);
		this.setupWall('right', 0, 0, 1.5707963267948966);
		this.setupWall('top', 0, 0, -3.141592653589793);
		this.setupWall('bottom', 0, this.height, 0);
	}

	setupWall(wall, x, y, angle) {
		this.walls[wall] = new p2.Body({
			mass: 0,
			position: [
				this.pxmi(x),
				this.pxmi(y)
			],
			angle: angle
		});
		this.walls[wall].addShape(new p2.Plane({}));
		this.world.addBody(this.walls[wall]);
	}

	loadScaledPhysics(originalPhysicsKey, newPhysicsKey, shapeKey, scale) {
		let newData = [];
		let data = this.cachedData[originalPhysicsKey][shapeKey];

		for (let i = 0; i < data.length; i++) {
			let vertices = [];
			for (let j = 0; j < data[i].shape.length; j += 2) {
				vertices[j] = data[i].shape[j] * scale;
				vertices[j + 1] = data[i].shape[j + 1] * scale;
			}
			newData.push({shape: vertices});
		}

		let item = {};
		if (this.cachedData[newPhysicsKey]) {
			item = this.cachedData[newPhysicsKey];
		}

		item[shapeKey] = newData;
		this.cachedData[newPhysicsKey] = item;
	}

	loadImage(key, path) {
		this.texture[key] = PIXI.Texture.fromImage(path);
	}

	loadData(key, path, data) {
		if (typeof data === 'string') {
			data = JSON.parse(data);
		}
		this.cachedData[key] = data;
	}

	addKeyControllers() {
		let keys = {
			'up': 38,
			'down': 40,
			'left': 37,
			'right': 39,
			'spacebar': 32,
			'a': "A".charCodeAt(0),
			'w': "W".charCodeAt(0),
			'd': "D".charCodeAt(0),
			's': "S".charCodeAt(0)
		};

		this.cursor = {};
		for (let keyName in keys) {
			this.cursor[keyName] = {};
			this.cursor[keyName].isDown = false;
		}

		window.onkeydown = (event) => {
			let targetKeyPressed = false;
			for (let keyName in keys) {
				if (event.keyCode == keys[keyName]) {
					this.cursor[keyName].isDown = true;
					targetKeyPressed = true;
				}
			}

			return !targetKeyPressed;
		};

		window.onkeyup = (event) => {
			let targetKeyPressed = false;
			for (let keyName in keys) {
				if (event.keyCode == keys[keyName]) {
					this.cursor[keyName].isDown = false;
					targetKeyPressed = true;
				}
			}

			return !targetKeyPressed;
		};
	}

	addGroup() {
		return {
			add: function() {},
			removeAll: function() {}
		};
	}

	createSprite(x, y, width, height, key) {
		return {
			key: key,
			x: this.pxmi(x),
			y: this.pxmi(y),
			width: this.pxm(width),
			height: this.pxm(height),
			collidesWith: []
		};
	}

	addSprite(x, y, width, height, key, disableBody) {
		let sprite = this.createSprite(x - width / 2, y - height / 2, width, height, key);

		if (!disableBody) {
			this.enableBody(sprite, 1);

			if (Meteor.isClient) {
				sprite.graphic = new PIXI.Graphics();
				this.container.addChild(sprite.graphic);
				this.spritesToRender.push(sprite);
			}
		}

		return sprite;
	}

	addTileSprite(x, y, width, height, key, group, disableBody, hide) {
		let sprite = this.createSprite(x, y, width, height, key);

		if (!disableBody) {
			this.enableBody(sprite, undefined);

			sprite.body.addShape(new p2.Box({
				width: this.pxm(width),
				height: this.pxm(height)
			}));

			if (Meteor.isClient && !hide) {
				sprite.graphic = new PIXI.Graphics();
				sprite.graphic.beginFill(0x787878);
				sprite.graphic.drawRect(-this.pxm(width) / 2, -this.pxm(height) / 2, this.pxm(width), this.pxm(height));
				sprite.graphic.endFill();

				this.container.addChild(sprite.graphic);
				this.spritesToRender.push(sprite);
			}
		}

		return sprite;
	}

	addGraphics(x, y, group) {
		//implement if client side is needed
	}

	addText(x, y, text, style, group) {
		//implement if client side is needed
		return {};
	}

	startTimer(seconds, fn, scope) {
		let timer = {
			endTime: Date.now() / 1000 + seconds,
			fn: fn,
			start: function() {},
			stop: function() {},
			scope: scope
		};

		this.timers.push(timer);

		return timer;
	}

	createMaterial(material) {
		return new p2.Material();
	}

	isLeftKeyDown() {
		return this.cursor.left.isDown;
	}

	isRightKeyDown() {
		return this.cursor.right.isDown;
	}

	isUpKeyDown() {
		return this.cursor.up.isDown;
	}

	isDownKeyDown() {
		return this.cursor.down.isDown;
	}

	isAKeyDown() {
		return this.cursor.a.isDown;
	}

	isWKeyDown() {
		return this.cursor.w.isDown;
	}

	isDKeyDown() {
		return this.cursor.d.isDown;
	}

	isSKeyDown() {
		return this.cursor.s.isDown;
	}

	isSpacebarKeyDown() {
		return this.cursor.spacebar.isDown;
	}

	getCenterX() {
		//implement if client side is needed
	}

	getCenterY() {
		//implement if client side is needed
	}

	isTimerRunning(timer) {
		//implement if client side is needed
	}

	getTimerRemainingDuration(timer) {
		//implement if client side is needed
	}

	getKey(spriteBody) {
		return spriteBody.sprite.key;
	}

	updateContactMaterials(ballMaterial, playerMaterial, playerDelimiterMaterial,
		bonusMaterial, netDelimiterMaterial, groundDelimiterMaterial) {
		let worldMaterial = this.createMaterial('world');

		this.updateBoundsCollisionGroup();
		this.setWorldMaterial(worldMaterial);

		this.createContactMaterial(
			ballMaterial,
			worldMaterial,
			{restitution: 1}
		);
		this.createContactMaterial(
			ballMaterial,
			groundDelimiterMaterial,
			{restitution: 1}
		);

		this.createContactMaterial(
			playerMaterial,
			worldMaterial,
			{stiffness: 1e20, relaxation: 3, friction: 0}
		);
		this.createContactMaterial(
			playerMaterial,
			playerDelimiterMaterial,
			{stiffness: 1e20, relaxation: 3, friction: 0}
		);

		this.createContactMaterial(
			bonusMaterial,
			worldMaterial,
			{restitution: 1}
		);
		this.createContactMaterial(
			bonusMaterial,
			netDelimiterMaterial,
			{restitution: 0.7}
		);
		this.createContactMaterial(
			bonusMaterial,
			groundDelimiterMaterial,
			{restitution: 1}
		);
	}

	updateBoundsCollisionGroup() {
		let mask = Math.pow(2, 1);

		this.walls.left.shapes[0].collisionGroup = mask;
		this.walls.right.shapes[0].collisionGroup = mask;
		this.walls.top.shapes[0].collisionGroup = mask;
		this.walls.bottom.shapes[0].collisionGroup = mask;
	}

	setCollisionGroup(sprite, collisionGroup) {
		let mask = Math.pow(2, 1);

		sprite.body.shapes[0].collisionGroup = collisionGroup.mask;
		sprite.body.shapes[0].collisionMask = mask;
	}

	createCollisionGroup() {
		let bitmask = Math.pow(2, this._collisionGroupID);

		this.walls.left.shapes[0].collisionMask = this.walls.left.shapes[0].collisionMask | bitmask;
		this.walls.right.shapes[0].collisionMask = this.walls.right.shapes[0].collisionMask | bitmask;
		this.walls.top.shapes[0].collisionMask = this.walls.top.shapes[0].collisionMask | bitmask;
		this.walls.bottom.shapes[0].collisionMask = this.walls.bottom.shapes[0].collisionMask | bitmask;

		this._collisionGroupID++;

		let group = {mask: bitmask};
		this.collisionGroups.push(group);

		return group;
	}

	collidesWith(sprite, collisionGroup, callback, scope) {
		let mask = Math.pow(2, 1);

		sprite.collidesWith.push(collisionGroup);

		sprite.body.shapes[0].collisionMask = mask;
		for (let collider of sprite.collidesWith) {
			sprite.body.shapes[0].collisionMask = sprite.body.shapes[0].collisionMask | collider.mask;
		}
		sprite.body._groupCallbacks[collisionGroup.mask] = callback;
		sprite.body._groupCallbackContext[collisionGroup.mask] = scope;
	}

	setWorldMaterial(worldMaterial) {
		this.walls['left'].shapes[0].material = worldMaterial;
		this.walls['right'].shapes[0].material = worldMaterial;
		this.walls['top'].shapes[0].material = worldMaterial;
		this.walls['bottom'].shapes[0].material = worldMaterial;
	}

	createContactMaterial(materialA, materialB, options) {
		this.world.addContactMaterial(
			new p2.ContactMaterial(
				materialA,
				materialB,
				options
			)
		);
	}

	metricVertices(shapeVertices) {
		let metricVertices = [];

		let xVertice;
		let yVertice;
		for (let i = 0; i < shapeVertices.length; i++) {
			const vertice = shapeVertices[i];
			if (i % 2) {
				yVertice = vertice;
				metricVertices.push([this.pxmi(xVertice), this.pxmi(yVertice)]);
			} else {
				xVertice = vertice;
			}
		}

		return metricVertices;
	}

	verticesToPixiPoints(vertices) {
		let points = [];

		for (let vertice of vertices) {
			points.push(new PIXI.Point(vertice[0], vertice[1]));
		}

		return points;
	}

	loadPolygon(sprite, key, object) {
		this.clearShapes(sprite);

		sprite.body.addShape(new p2.Convex({
			vertices: this.metricVertices(this.cachedData[key][object][0].shape)
		}));

		if (Meteor.isClient) {
			sprite.graphic.beginFill(0xffffff);
			sprite.graphic.drawPolygon(this.verticesToPixiPoints(this.metricVertices(this.cachedData[key][object][0].shape)));
			sprite.graphic.endFill();
		}
	}

	enableBody(sprite, mass) {
		sprite.body = new p2.Body({
			mass: mass,
			fixedRotation: true,
			position: [
				sprite.x,
				sprite.y
			]
		});
		sprite.body.sprite = sprite;
		sprite.body.parent = sprite;
		sprite.body._bodyCallbacks = [];
		sprite.body._bodyCallbackContext = [];
		sprite.body._groupCallbacks = [];
		sprite.body._groupCallbackContext = [];
		this.world.addBody(sprite.body);

		sprite.destroy = () => {
			this.world.removeBody(sprite.body);
		};
	}

	interpolateFromTimestamp(currentTimestamp, sprite, data) {
		let t = (currentTimestamp - data.timestamp) / 1000;
		let gravity = this.world.gravity[1] * sprite.body.gravityScale;
		let x = data.velocityX * t;
		let y = 0;

		if (data.velocityY != 0) {
			y = -data.velocityY * t - 0.5 * gravity * t * t;
		}

		/**
		 * From x and y starting point,
		 * determine what would be the new x and y position
		 * from the x and y velocity and the elapsedTime
		 */
		data.x = x + data.x;
		data.y = data.y - y;

		//@todo Restrict horizontally
		//@todo Restrict vertically

		return data;
	}

	getPositionData(sprite) {
		let body = sprite.body;

		return {
			x: round(this.mpxi(body.position[0]), 2),
			y: round(this.mpxi(body.position[1]), 2),
			velocityX: this.mpxi(body.velocity[0]),
			velocityY: this.mpxi(body.velocity[1])
		};
	}

	move(sprite, data) {
		if (!sprite.body) {
			return;
		}

		sprite.body.position[0] = this.pxmi(data.x);
		sprite.body.position[1] = this.pxmi(data.y);
		sprite.body.velocity[0] = this.pxmi(data.velocityX);
		sprite.body.velocity[1] = this.pxmi(data.velocityY);
	}

	freeze(sprite) {
		let body = sprite.body;

		body.fixedRotation = true;
		body.velocity[0] = 0;
		body.velocity[1] = 0;
		this.setGravity(sprite, 0);
	}

	unfreeze(sprite) {
		this.setGravity(sprite, sprite.initialGravity);
	}

	spawn(sprite, x, y, width, height) {
		sprite.body.angularVelocity = 0;
		sprite.body.velocity[0] = 0;
		sprite.body.velocity[1] = 0;
		sprite.body.position[0] = this.pxmi(x - width / 2);
		sprite.body.position[1] = this.pxmi(y - height / 2);
		sprite.body.setZeroForce();
	}

	setMass(sprite, mass) {
		sprite.body.mass = mass;
		sprite.body.updateMassProperties();
	}

	setFixedRotation(sprite, fixedRotation) {
		sprite.body.fixedRotation = fixedRotation;
	}

	setGravity(sprite, gravity) {
		sprite.body.gravityScale = gravity;
	}

	setDamping(sprite, damping) {
		sprite.body.damping = damping;
	}

	setStatic(sprite, isStatic) {
		sprite.body.static = isStatic;
	}

	isSpeedDirectionLeft(sprite) {
		return this.getHorizontalSpeed(sprite) > 0;
	}

	isSpeedDirectionRight(sprite) {
		return this.getHorizontalSpeed(sprite) < 0;
	}

	getHorizontalSpeed(sprite) {
		return this.mpx(sprite.body.velocity[0]);
	}

	setHorizontalSpeed(sprite, velocityX) {
		sprite.body.velocity[0] = this.pxm(velocityX);
	}

	getVerticalSpeed(sprite) {
		return this.mpxi(sprite.body.velocity[1]);
	}

	setVerticalSpeed(sprite, velocityY) {
		sprite.body.velocity[1] = this.pxmi(velocityY);
	}

	getBottom(sprite) {
		return this.getYPosition(sprite) + this.mpxi(sprite.body.shapes[0].centerOfMass[1]);
	}

	hasXPositionBefore(spriteA, spriteB) {
		return spriteA.body.position[0] > spriteB.body.position[0];
	}

	getXPosition(sprite) {
		return this.mpxi(sprite.body.position[0]) + this.mpxi(sprite.body.shapes[0].centerOfMass[0]);
	}

	getYPosition(sprite) {
		return this.mpxi(sprite.body.position[1]);
	}

	setAnchor(sprite, anchor) {
		//implement if client side is needed
	}

	setMaterial(sprite, material) {
		sprite.body.shapes[0].material = material;
	}

	constrainVelocity(sprite, maxVelocity) {
		let body = sprite.body;
		let angle;
		let currVelocitySqr;
		let vx;
		let vy;

		maxVelocity = this.pxm(maxVelocity);

		vx = body.velocity[0];
		vy = body.velocity[1];
		currVelocitySqr = vx * vx + vy * vy;

		if (currVelocitySqr > maxVelocity * maxVelocity) {
			angle = Math.atan2(vy, vx);
			vx = Math.cos(angle) * maxVelocity;
			vy = Math.sin(angle) * maxVelocity;
			body.velocity[0] = vx;
			body.velocity[1] = vy;
		}
	}

	clearShapes(sprite) {
		let i = sprite.body.shapes.length;

		while (i--) {
			sprite.body.removeShape(sprite.body.shapes[i]);
		}
	}

	getOpacity(sprite) {
		return sprite.alpha;
	}

	setOpacity(sprite, opacity) {
		sprite.alpha = opacity;
	}

	animateSetOpacity(sprite, opacityTo, opacityFrom, duration) {
		this.setOpacity(sprite, opacityFrom);
	}

	scale(sprite, x, y) {
		if (Meteor.isClient) {
			//implement if client side is needed
		}
	}

	animateScale(sprite, xTo, yTo, xFrom, yFrom, duration) {
		this.scale(sprite, xFrom, yFrom);
	}

	updateText(textComponent, text) {
		//implement if client side is needed
	}

	shake(sprite, move, time) {
		//implement if client side is needed
	}

	drawBonus(x, y, bonusLetter, bonusFontSize, bonusSpriteBorderKey, bonusProgress) {
		//implement if client side is needed
	}

	addBonus(x, bonusGravityScale, bonusMaterial, bonusCollisionGroup,
		bonusLetter, bonusFontSize, bonusSpriteBorderKey) {
		let bonusSprite = this.getBonusSprite(x, 0, bonusLetter, bonusFontSize, bonusSpriteBorderKey);

		bonusSprite.initialGravity = bonusGravityScale;

		this.setFixedRotation(bonusSprite, false);
		this.setGravity(bonusSprite, bonusSprite.initialGravity);
		this.setDamping(bonusSprite, 0);
		this.setMaterial(bonusSprite, bonusMaterial);
		this.setCollisionGroup(bonusSprite, bonusCollisionGroup);

		bonusSprite.body.updateAABB();
		bonusSprite.body.updateBoundingRadius();
		bonusSprite.body.updateMassProperties();

		return bonusSprite;
	}

	getBonusSprite(x, y, bonusLetter, bonusFontSize, bonusSpriteBorderKey) {
		let bonusSprite = this.addSprite(x, y, 0, 0, 'delimiter');

		this.clearShapes(bonusSprite);
		bonusSprite.body.addShape(new p2.Circle({radius: this.pxm(Config.bonusRadius)}));

		if (Meteor.isClient) {
			bonusSprite.graphic.beginFill(0xffffff);
			bonusSprite.graphic.drawCircle(bonusSprite.x, bonusSprite.y, this.pxm(Config.bonusRadius));
			bonusSprite.graphic.endFill();
		}

		return bonusSprite;
	}

}
