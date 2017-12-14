PIXI = require('phaser-ce/build/custom/pixi');
p2 = require('phaser-ce/build/custom/p2');
Phaser = require('phaser-ce/build/custom/phaser-split');
import Engine from '/imports/api/games/engine/Engine.js';
import {
	NORMAL_SCALE_PHYSICS_DATA,
	SMALL_SCALE_PHYSICS_DATA,
	BIG_SCALE_PHYSICS_DATA,
	SMALL_SCALE_PLAYER_BONUS,
	SMALL_SCALE_BALL_BONUS,
	BIG_SCALE_BONUS
} from '/imports/api/games/constants.js';
import {PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js';

export default class PhaserEngine extends Engine {
	start(width, height, parent, preloadGame, createGame, updateGame, scope) {
		this.game = new Phaser.Game({
			width: width,
			height: height,
			renderer: Phaser.AUTO,
			parent: parent
		});

		this.game.state.add('boot', {
			create: () => {
				this.game.physics.startSystem(Phaser.Physics.P2JS);
				this.game.physics.p2.setImpactEvents(true);
				this.game.physics.p2.gravity.y = this.gameConfiguration.worldGravity();
				this.game.physics.p2.world.defaultContactMaterial.friction = 0;
				this.game.physics.p2.world.setGlobalStiffness(1e10);
				this.game.physics.p2.restitution = 0;
				this.game.stage.disableVisibilityChange = true;

				this.game.state.start('load');
			}
		});

		this.game.state.add('load', {
			create: () => {
				preloadGame.call(scope);

				this.game.load.onLoadComplete.add(() => {
					if (this.game.state) {
						this.game.state.start('play');
					}
				}, this);
				this.game.load.start();
			}
		});

		this.game.state.add('play', {
			preload: () => {
				for (let shape of PLAYER_LIST_OF_SHAPES) {
					this.loadScaledPhysics(NORMAL_SCALE_PHYSICS_DATA, SMALL_SCALE_PHYSICS_DATA, 'player-' + shape, SMALL_SCALE_PLAYER_BONUS);
					this.loadScaledPhysics(NORMAL_SCALE_PHYSICS_DATA, BIG_SCALE_PHYSICS_DATA, 'player-' + shape, BIG_SCALE_BONUS);
				}
				this.loadScaledPhysics(NORMAL_SCALE_PHYSICS_DATA, SMALL_SCALE_PHYSICS_DATA, 'ball', SMALL_SCALE_BALL_BONUS);
				this.loadScaledPhysics(NORMAL_SCALE_PHYSICS_DATA, BIG_SCALE_PHYSICS_DATA, 'ball', BIG_SCALE_BONUS);
			},
			create: createGame.bind(scope),
			update: updateGame.bind(scope)
		});

		this.game.state.start('boot');
	}

	stop() {
		this.removeKeyControllers();
		this.game.state.destroy();
		this.game.destroy();
	}

	onGameEnd() {
		this.removeKeyControllers();
	}

	createGame() {
		this.setupScaling();
	}

	changeBackgroundColor(hex) {
		this.game.stage.backgroundColor = hex;
	}

	setupScaling() {
		this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
		this.game.scale.setUserScale(
			$(this.game.scale.parentNode).width() / this.game.width,
			$(this.game.scale.parentNode).height() / this.game.height
		);
		this.game.scale.setResizeCallback(() => {
			const hScale = $(this.game.scale.parentNode).width() / this.game.width;
			const vScale = $(this.game.scale.parentNode).height() / this.game.height;

			if (!this.game.scale.scaleFactorInversed || (this.game.scale.scaleFactorInversed.x !== hScale &&  this.game.scale.scaleFactorInversed.y !== vScale)) {
				this.game.scale.setUserScale(
					hScale,
					vScale
				);
			}
		});
	}

	loadScaledPhysics(originalPhysicsKey, newPhysicsKey, shapeKey, scale) {
		const newData = [];
		const data = this.game.cache.getPhysicsData(originalPhysicsKey, shapeKey);

		for (let i = 0; i < data.length; i++) {
			let vertices = [];
			for (let j = 0; j < data[i].shape.length; j += 2) {
				vertices[j] = data[i].shape[j] * scale;
				vertices[j + 1] = data[i].shape[j + 1] * scale;
			}
			newData.push({shape: vertices});
		}

		let item = {};
		if (this.game.cache.checkKey(Phaser.Cache.PHYSICS, newPhysicsKey)) {
			item = this.game.cache.getPhysicsData(newPhysicsKey);
		}

		item[shapeKey] = newData;
		this.game.load.physics(newPhysicsKey, '', item);
	}

	loadImage(key, path) {
		this.game.load.image(key, path);
	}

	loadSpriteSheet(key, path, width, height) {
		this.game.load.spritesheet(key, path, width, height);
	}

	loadData(key, path) {
		this.game.load.physics(key, path);
	}

	addKeyControllers() {
		if (Phaser.Keyboard) {
			this.cursor = this.game.input.keyboard.createCursorKeys();
			this.cursor['a'] = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
			this.cursor['w'] = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
			this.cursor['d'] = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
			this.cursor['s'] = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
			this.cursor['spacebar'] = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		}
	}

	removeKeyControllers() {
		if (Phaser.Keyboard) {
			this.game.input.keyboard.clearCaptures();
		}
	}

	addGroup(enableBody = false) {
		const group = this.game.add.group();

		group.enableBody = enableBody;

		return group;
	}

	addBound(x, y, w, h, material, collisionGroup, colliders, debug) {
		const bound = new Phaser.Physics.P2.Body(this.game, {}, x, y, 0);
		bound.setRectangleFromSprite({width: w, height: h, rotation: 0});
		this.game.physics.p2.addBody(bound);
		bound.debug = !!debug;

		bound.static = true;
		bound.setCollisionGroup(collisionGroup);
		bound.setMaterial(material);

		for (let collider of colliders) {
			bound.collides(collider);
		}

		return bound;
	}

	addImage(x, y, key, frame) {
		return this.game.add.image(x, y, key, frame);
	}

	addSprite(x, y, key, disableBody = false, frame, debugBody = false) {
		return this.addGroupedSprite(x, y, key, undefined, disableBody, frame, debugBody);
	}

	addGroupedSprite(x, y, key, group, disableBody = false, frame, debugBody = false) {
		const sprite = this.game.add.sprite(x, y, key, frame, group);

		if (!disableBody) {
			this.enableBody(sprite, debugBody);
		}

		return sprite;
	}

	loadSpriteTexture(sprite, key) {
		sprite.loadTexture(key);
	}

	addTileSprite(x, y, width, height, key, disableBody = true, group, debugBody = false) {
		const tileSprite = this.game.add.tileSprite(
			x,
			y,
			width,
			height,
			key,
			undefined,
			group
		);

		if (!disableBody) {
			this.enableBody(tileSprite, debugBody);
		}

		return tileSprite;
	}

	addGraphics(x, y, group) {
		return this.game.add.graphics(x, y, group);
	}

	addText(x, y, text, style, group) {
		const textObject = this.game.add.text(x, y, text, style, group);

		textObject.smoothed = true;
		this.setAnchor(textObject, 0.5);

		return textObject;
	}

	/**
	 * @param x
	 * @param y
	 * @param lineConfig
	 * @param lineConfig.width
	 * @param lineConfig.color
	 * @param fillConfig
	 * @param fillConfig.color
	 * @param diameter
	 * @returns {*}
	 */
	drawCircle(x, y, lineConfig, fillConfig, diameter) {
		const circle = this.addGraphics(x, y);

		if (lineConfig !== null) {
			circle.lineStyle(lineConfig.width, lineConfig.color);
		}
		if (fillConfig !== null) {
			circle.beginFill(fillConfig.color);
		}
		circle.drawCircle(0, 0, diameter);
		circle.endFill();

		return circle;
	}

	drawRectangle(x, y, w, h, config) {
		const graphics = this.addGraphics(x, y);

		graphics.beginFill(config.color, config.opacity);
		graphics.drawRect(0, 0, w, h);
		graphics.endFill();
	}

	createTimer(seconds, fn, scope) {
		const timer = this.game.time.create();

		timer.add(Phaser.Timer.SECOND * seconds, fn, scope);

		return timer;
	}

	createCollisionGroup() {
		return this.game.physics.p2.createCollisionGroup();
	}

	createMaterial(material) {
		return this.game.physics.p2.createMaterial(material);
	}

	isInputSetup() {
		return !!Phaser.Keyboard || this.deviceController;
	}

	isLeftKeyDown() {
		return this.cursor.left.isDown || this.deviceController.leftPressed();
	}

	isRightKeyDown() {
		return this.cursor.right.isDown || this.deviceController.rightPressed();
	}

	isUpKeyDown() {
		return this.cursor.up.isDown || this.deviceController.upPressed();
	}

	isDownKeyDown() {
		return this.cursor.down.isDown || this.deviceController.downPressed();
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
		return this.game.world.centerX;
	}

	getCenterY() {
		return this.game.world.centerY;
	}

	getTime() {
		return this.game.time.time;
	}

	isTimerRunning(timer) {
		return timer.running;
	}

	getTimerRemainingDuration(timer) {
		return timer.duration;
	}

	getKey(spriteBody) {
		return spriteBody.sprite.data.key;
	}

	getPositionData(sprite) {
		const body = sprite.body;

		return {
			x: body.x,
			y: body.y,
			velocityX: body.velocity.x,
			velocityY: body.velocity.y
		};
	}

	initWorldContactMaterial() {
		this.worldMaterial = this.createMaterial('world');

		this.game.physics.p2.updateBoundsCollisionGroup();
		this.game.physics.p2.setWorldMaterial(this.worldMaterial);
	}

	createWorldContactMaterial(material, config) {
		this.game.physics.p2.createContactMaterial(material, this.worldMaterial, config);
	}

	createContactMaterial(materialA, materialB, config) {
		this.game.physics.p2.createContactMaterial(materialA, materialB, config);
	}

	loadPolygon(sprite, key, object) {
		sprite.body.clearShapes();
		sprite.body.loadPolygon(key, object);
	}

	enableBody(sprite, debug) {
		this.game.physics.p2.enable(sprite, debug);
	}

	distanceMultiplier() {
		return 1.502636245994042;
	}

	gravityDistanceAtTime(sprite, t) {
		const gravity = this.game.physics.p2.gravity.y * sprite.body.data.gravityScale;

		return 0.5 * gravity * t * t;
	}

	interpolateFromTimestamp(currentTimestamp, sprite, data) {
		const t = (currentTimestamp - data.timestamp) / 1000;
		const distanceX = data.velocityX / this.distanceMultiplier() * t;
		let distanceY = 0;

		if (data.velocityY != 0) {
			distanceY = (data.velocityY / this.distanceMultiplier() * t) + this.gravityDistanceAtTime(sprite, t);
		}

		data.x = data.x + distanceX;
		data.y = data.y + distanceY;

		return data;
	}

	interpolateMoveTo(sprite, serverNormalizedTimestamp, data, canMoveCallback) {
		if (!sprite.body) {
			return;
		}

		//+25 for fast sliding to interpolated location
		const maxTime = 25;
		let t = maxTime / 1000;

		const interpolatedData = Object.assign({}, data);
		this.interpolateFromTimestamp(serverNormalizedTimestamp + maxTime, sprite, interpolatedData);

		const distanceX = (interpolatedData.x - sprite.x);
		const velocityX = distanceX / t;
		sprite.body.velocity.x = velocityX * this.distanceMultiplier();

		const distanceY = (interpolatedData.y - sprite.y);
		const distanceGravityY = this.gravityDistanceAtTime(sprite, t);
		const velocityY = (distanceY - distanceGravityY) / t;
		sprite.body.velocity.y = velocityY * this.distanceMultiplier();

		//@todo Restrict horizontally
		//@todo Restrict vertically

		this.game.time.events.add(
			maxTime,
			() => {
				if (sprite && sprite.body && canMoveCallback.call()) {
					this.move(sprite, interpolatedData);
				}
			},
			this
		);
	}

	move(sprite, data) {
		if (!sprite.body) {
			return;
		}

		sprite.body.x = data.x;
		sprite.body.y = data.y;
		sprite.body.velocity.x = data.velocityX;
		sprite.body.velocity.y = data.velocityY;
	}

	getIsFrozen(sprite) {
		return sprite.data.isFrozen;
	}

	freeze(sprite) {
		const body = sprite.body;

		body.setZeroRotation();
		body.setZeroVelocity();
		this.setGravity(sprite, 0);
		sprite.data.isFrozen = true;
	}
	
	unfreeze(sprite) {
		this.setGravity(sprite, sprite.data.currentGravity);
		sprite.data.isFrozen = false;
	}

	spawn(sprite, x, y) {
		sprite.body.setZeroRotation();
		sprite.body.setZeroVelocity();
		sprite.reset(x, y);
	}

	getMass(sprite) {
		return sprite.body.mass;
	}

	setMass(sprite, mass) {
		sprite.body.mass = mass;
	}

	setFixedRotation(sprite, fixedRotation) {
		sprite.body.fixedRotation = fixedRotation;
	}

	getGravity(sprite) {
		return sprite.body.data.gravityScale;
	}

	setGravity(sprite, gravity) {
		sprite.body.data.gravityScale = gravity;
	}

	setDamping(sprite, damping) {
		sprite.body.damping = damping;
	}

	setStatic(sprite, isStatic) {
		sprite.body.static = isStatic;
	}

	getHorizontalSpeed(sprite) {
		return sprite.body.velocity.x;
	}

	setHorizontalSpeed(sprite, velocityX) {
		sprite.body.velocity.x = velocityX;
	}

	getVerticalSpeed(sprite) {
		return sprite.body.velocity.y;
	}

	setVerticalSpeed(sprite, velocityY) {
		sprite.body.velocity.y = velocityY;
	}

	getXPosition(sprite) {
		return sprite.body.x;
	}

	getYPosition(sprite) {
		return sprite.body.y;
	}

	getHeight(sprite) {
		return sprite.height;
	}

	setAnchor(sprite, anchor) {
		sprite.anchor.set(anchor);
	}

	tweenRotate(sprite, rotateSpeed) {
		const engine = this;
		const time = 1;
		const tween = this.game.add.tween(sprite);

		sprite.data.tweenRotate = tween;

		tween.onComplete.add(() => {
			engine.tweenRotate(sprite, rotateSpeed);
		});
		tween.to({angle: sprite.angle + rotateSpeed * time}, time, Phaser.Easing.Linear.None, true);
	}

	stopTweenRotation(sprite) {
		if (sprite.data.tweenRotate) {
			sprite.data.tweenRotate.stop();
		}
	}

	rotateLeft(sprite, velocity) {
		sprite.body.rotateLeft(velocity);
	}

	setMaterial(sprite, material) {
		sprite.body.setMaterial(material);
	}

	setCollisionGroup(sprite, collisionGroup) {
		sprite.body.setCollisionGroup(collisionGroup);
	}

	collidesWith(sprite, collisionGroup, callback, scope) {
		sprite.body.collides(collisionGroup, callback, scope);
	}

	constrainVelocity(sprite, maxVelocity) {
		const body = sprite.body;
		let angle;
		let currVelocitySqr;
		let vx;
		let vy;

		vx = body.velocity.x;
		vy = body.velocity.y;
		currVelocitySqr = vx * vx + vy * vy;

		if (currVelocitySqr > maxVelocity * maxVelocity) {
			angle = Math.atan2(vy, vx);
			vx = Math.cos(angle) * maxVelocity;
			vy = Math.sin(angle) * maxVelocity;
			body.velocity.x = vx;
			body.velocity.y = vy;
		}
	}

	hasSurfaceTouchingPlayerBottom(player) {
		for (let i = 0; i < this.game.physics.p2.world.narrowphase.contactEquations.length; i++) {
			const contact = this.game.physics.p2.world.narrowphase.contactEquations[i];
			if (
				(contact.bodyA === player.body.data && this.canPlayerJumpOnBody(player, contact.bodyB)) ||
				(contact.bodyB === player.body.data && this.canPlayerJumpOnBody(player, contact.bodyA))
			) {
				let dot = p2.vec2.dot(contact.normalA, p2.vec2.fromValues(0, 1));

				if (contact.bodyA === player.body.data) {
					dot *= -1;
				}

				if (dot > 0.5) {
					return true;
				}
			}
		}

		return false;
	}

	canPlayerJumpOnBody(player, body) {
		return (
			player.data.canJumpOnBodies.indexOf(body) !== -1 ||
			player.data.canJumpOnBodies.indexOf(body.parent) !== -1
		);
	}

	getOpacity(sprite) {
		return sprite.alpha;
	}

	setOpacity(sprite, opacity) {
		sprite.alpha = opacity;
	}

	animateSetOpacity(sprite, opacityTo, opacityFrom, duration) {
		this.setOpacity(sprite, opacityFrom);
		this.game.add.tween(sprite).to({alpha: opacityTo}, duration).start();
	}

	scale(sprite, x, y) {
		sprite.scale.setTo(x, y);
	}

	animateScale(sprite, xTo, yTo, xFrom, yFrom, duration) {
		this.scale(sprite, xFrom, yFrom);
		this.game.add.tween(sprite.scale).to({x: xTo, y: yTo}, duration).start();
	}

	updateText(textComponent, text) {
		let multilineText = text;

		if (!Array.isArray(multilineText)) {
			multilineText = [multilineText];
		}

		multilineText = multilineText.map(line => {return '    ' + line + '    ';});

		return textComponent.text = multilineText.join('\n');
	}

	emitParticules(x, y, xMinSpeed, xMaxSpeed, yMinSpeed, yMaxSpeed, keys, frames, particlesQuantity, explode, lifespan, frequency, quantity) {
		const emitter = this.game.add.emitter(x, y);
		emitter.bounce.setTo(0.5, 0.5);
		emitter.setXSpeed(xMinSpeed, xMaxSpeed);
		emitter.setYSpeed(yMinSpeed, yMaxSpeed);
		emitter.makeParticles(keys, frames, particlesQuantity);
		emitter.start(explode, lifespan, frequency, quantity);
	}

	shake(sprite, move, time) {
		const initialX = sprite.x;
		const initialY = sprite.y;

		this.game.add.tween(sprite)
			.to({y: "-" + move}, time).to({y: "+" + move * 2}, time * 2).to({y: "-" + move}, time)
			.to({y: "-" + move}, time).to({y: "+" + move * 2}, time * 2).to({y: "-" + move}, time)
			.to({y: "-" + move / 2}, time).to({y: "+" + move}, time * 2).to({y: "-" + move / 2}, time)
			.to({y: initialY}, time)
			.start();

		this.game.add.tween(sprite)
			.to({x: "-" + move}, time).to({x: "+" + move * 2}, time * 2).to({x: "-" + move}, time)
			.to({x: "-" + move}, time).to({x: "+" + move * 2}, time * 2).to({x: "-" + move}, time)
			.to({x: "-" + move / 2}, time).to({x: "+" + move}, time * 2).to({x: "-" + move / 2}, time)
			.to({x: initialX}, time)
			.start();
	}

	activateAnimation(sprite) {
		const duration = 250;
		const scale = 4;

		this.scale(sprite, 1, 1);
		this.setOpacity(sprite, 0.5);
		this.game.add.tween(sprite.scale).to({x: scale, y: scale}, duration).start();
		this.game.add.tween(sprite).to({alpha: 0}, duration).start();
		setTimeout(() => {
			sprite.destroy();
		}, duration);
	}

	drawBonus(x, y, bonus, progress) {
		const bonusSprite = this.getBonusSprite(x, y, bonus);

		this.updateBonusProgressComponent(bonusSprite, progress);

		bonusSprite.bringToTop();
		this.setStatic(bonusSprite, true);

		return bonusSprite;
	}

	updateBonusProgress(x, bonusSprite, progress) {
		bonusSprite.body.x = x;

		this.updateBonusProgressComponent(bonusSprite, progress);
	}

	updateBonusProgressComponent(bonusSprite, progress) {
		const minProgress = 0.00001;
		const maxProgress = 0.99999;
		const radius = this.gameConfiguration.bonusRadius() - 1;
		progress = Phaser.Math.clamp(progress, minProgress, maxProgress);

		let color = '#000000';
		let opacity = 0.25;
		if (progress <= 0.1) {
			color = '#c94141';
			opacity = 0.5;
		}

		let canvasContainer = bonusSprite.data.canvasContainer;
		let canvas;

		if (!canvasContainer) {
			canvas = this.game.add.bitmapData(radius * 2, radius * 2);
			canvasContainer = this.game.add.sprite(0, 0, canvas);

			this.setAnchor(canvasContainer, 0.5);
			canvasContainer.angle = -90;

			bonusSprite.addChild(canvasContainer);
			bonusSprite.data.canvasContainer = canvasContainer;

			canvasContainer.data.canvas = canvas;
			canvasContainer.data.progress = maxProgress;
			canvasContainer.data.color = color;
		} else {
			canvas = canvasContainer.data.canvas;
		}

		const progressThreshold = 0.008;
		if (
			canvasContainer.data.progress - progress > progressThreshold ||
			canvasContainer.data.color !== color
		) {
			canvas.clear();
			canvas.context.fillStyle = color;
			canvas.context.beginPath();
			canvas.context.arc(radius, radius, radius, 0, (Math.PI * 2) * progress, true);
			canvas.context.lineTo(radius, radius);
			canvas.context.closePath();
			canvas.context.fill();

			canvasContainer.data.progress = progress;
			canvasContainer.data.color = color;
		}

		this.setOpacity(canvasContainer, opacity);

		return canvasContainer;
	}

	sortBonusGroup(bonusZIndexGroup) {
		bonusZIndexGroup.sort('createdAt', Phaser.Group.SORT_ASCENDING);
	}

	addBonus(x, bonusGravityScale, bonusMaterial, bonusCollisionGroup, bonus, bonusZIndexGroup) {
		const bonusSprite = this.getBonusSprite(x, 0, bonus, bonusZIndexGroup);

		bonusSprite.createdAt = 0;
		this.sortBonusGroup(bonusZIndexGroup);

		bonusSprite.data.initialGravity = bonusGravityScale;
		bonusSprite.data.currentGravity = bonusSprite.data.initialGravity;

		this.setFixedRotation(bonusSprite, false);
		this.setGravity(bonusSprite, bonusSprite.data.currentGravity);
		this.setDamping(bonusSprite, 0);
		this.setMaterial(bonusSprite, bonusMaterial);
		this.setCollisionGroup(bonusSprite, bonusCollisionGroup);

		return bonusSprite;
	}

	activateAnimationBonus(x, y, bonus) {
		const bonusSprite = this.getBonusSprite(x, y, bonus);

		bonusSprite.bringToTop();
		this.setStatic(bonusSprite, true);

		this.activateAnimation(bonusSprite);
	}

	getBonusSprite(x, y, bonus, bonusGroup) {
		const bonusSprite = this.addGroupedSprite(x, y, null, bonusGroup);

		bonusSprite.body.clearShapes();
		bonusSprite.body.addCircle(this.gameConfiguration.bonusRadius());

		const sprites = bonus.itemsToDraw(this);
		for (let sprite of sprites) {
			bonusSprite.addChild(sprite);
		}

		return bonusSprite;
	}
}
