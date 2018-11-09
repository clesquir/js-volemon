PIXI = require('phaser-ce/build/custom/pixi');
p2 = require('phaser-ce/build/custom/p2');
Phaser = require('phaser-ce/build/custom/phaser-split');
import {
	BIG_SCALE_PHYSICS_DATA,
	NORMAL_SCALE_PHYSICS_DATA,
	SMALL_SCALE_PHYSICS_DATA
} from '/imports/api/games/constants.js';
import Engine from '/imports/api/games/engine/Engine.js';
import {PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js';

export default class PhaserEngine extends Engine {
	start(worldConfiguration, preloadGame, createGame, updateGame, scope, config = {}) {
		//Create loading mask
		Session.set('gameLoadingMask', true);
		this.bonusRadius = worldConfiguration.bonusRadius;
		const renderer = config.renderer || Phaser.AUTO;
		const debug = config.debug || false;

		this.game = new Phaser.Game({
			width: worldConfiguration.width,
			height: worldConfiguration.height,
			renderer: renderer,
			enableDebug: debug,
			parent: worldConfiguration.renderTo
		});

		this.game.state.add('boot', {
			create: () => {
				this.game.physics.startSystem(Phaser.Physics.P2JS);
				this.game.physics.p2.setImpactEvents(true);
				this.game.physics.p2.gravity.y = worldConfiguration.gravity;
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
					this.loadScaledPhysics(
						NORMAL_SCALE_PHYSICS_DATA,
						SMALL_SCALE_PHYSICS_DATA,
						'player-' + shape,
						worldConfiguration.smallPlayerScale
					);
					this.loadScaledPhysics(
						NORMAL_SCALE_PHYSICS_DATA,
						BIG_SCALE_PHYSICS_DATA,
						'player-' + shape,
						worldConfiguration.bigPlayerScale
					);
				}

				this.loadScaledPhysics(
					NORMAL_SCALE_PHYSICS_DATA,
					SMALL_SCALE_PHYSICS_DATA,
					'ball',
					worldConfiguration.smallBallScale
				);
				this.loadScaledPhysics(
					NORMAL_SCALE_PHYSICS_DATA,
					BIG_SCALE_PHYSICS_DATA,
					'ball',
					worldConfiguration.bigBallScale
				);
			},
			create: createGame.bind(scope),
			update: updateGame.bind(scope)
		});

		this.game.state.start('boot');
	}

	stop() {
		this.game.state.destroy();
		this.game.destroy();
	}

	createGame() {
		this.setupScaling();

		//Hide loading mask
		Session.set('gameLoadingMask');
	}

	changeBackgroundColor(hex) {
		this.game.stage.backgroundColor = hex;
	}

	setupScaling() {
		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
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
			newData.push({
				shape: vertices,
				eyeConfiguration: data[i].eyeConfiguration
			});
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

	loadAtlas(key, imagePath, jsonPath) {
		this.game.load.atlasJSONHash(key, imagePath, jsonPath);
	}

	loadSpriteSheet(key, path, width, height) {
		this.game.load.spritesheet(key, path, width, height);
	}

	loadData(key, path) {
		this.game.load.physics(key, path);
	}

	addGroup(enableBody = false) {
		const group = this.game.add.group();

		group.enableBody = enableBody;

		return group;
	}

	addBound(x, y, w, h, material, collisionGroup, colliders, name, debug) {
		const bound = new Phaser.Physics.P2.Body(this.game, {}, x, y, 0);
		bound.setRectangleFromSprite({width: w, height: h, rotation: 0});
		this.game.physics.p2.addBody(bound);
		bound.debug = !!debug;
		bound.data.name = name;

		bound.static = true;
		bound.setCollisionGroup(collisionGroup);
		bound.setMaterial(material);

		for (let collider of colliders) {
			bound.collides(collider);
		}

		return bound;
	}

	addImage(x, y, key, frame, group) {
		return this.game.add.image(x, y, key, frame, group);
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

	addTileSprite(x, y, width, height, key, frame, disableBody = true, group, debugBody = false) {
		const tileSprite = this.game.add.tileSprite(
			x,
			y,
			width,
			height,
			key,
			frame,
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
	 * @param {null} lineConfig
	 * @param lineConfig.width
	 * @param lineConfig.color
	 * @param {null} fillConfig
	 * @param fillConfig.color
	 * @param diameter
	 * @returns {*}
	 */
	drawCircle(x, y, lineConfig = null, fillConfig = null, diameter) {
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

	getCenterX() {
		return this.game.world.centerX;
	}

	getCenterY() {
		return this.game.world.centerY;
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

	/**
	 * @param sprite
	 * @returns {{x: number, y: number, velocityX: number, velocityY: number}}
	 */
	getPositionData(sprite) {
		const body = sprite.body;

		return {
			x: body.x,
			y: body.y,
			velocityX: body.velocity.x,
			velocityY: body.velocity.y
		};
	}

	/**
	 * @param sprite
	 * @returns {{x: number, y: number, scale: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}}
	 */
	fullPositionData(sprite) {
		return Object.assign(
			{
				gravityScale: this.getGravity(sprite),
				width: this.getWidth(sprite),
				height: this.getHeight(sprite),
				scale: sprite.scale
			},
			this.getPositionData(sprite)
		);
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

	interpolateMoveTo(sprite, serverNormalizedTimestamp, data, canMoveCallback, slideToLocation = false) {
		if (!sprite.body) {
			return;
		}

		let maxTime = 0;

		const minimumForInterpolation = 25;
		if (slideToLocation && serverNormalizedTimestamp - data.timestamp > minimumForInterpolation) {
			//+25 for fast sliding to interpolated location
			maxTime = 25;
		}

		const interpolatedData = Object.assign({}, data);
		this.interpolateFromTimestamp(serverNormalizedTimestamp + maxTime, sprite, interpolatedData);

		const moveToInterpolatedPosition = () => {
			if (sprite && sprite.body && canMoveCallback.call()) {
				this.move(sprite, interpolatedData);
			}
		};

		if (slideToLocation) {
			const t = maxTime / 1000;
			const distanceX = (interpolatedData.x - sprite.x);
			const velocityX = distanceX / t;
			sprite.body.velocity.x = velocityX * this.distanceMultiplier();

			const distanceY = (interpolatedData.y - sprite.y);
			const distanceGravityY = this.gravityDistanceAtTime(sprite, t);
			const velocityY = (distanceY - distanceGravityY) / t;
			sprite.body.velocity.y = velocityY * this.distanceMultiplier();

			this.game.time.events.add(
				maxTime,
				moveToInterpolatedPosition,
				this
			);
		} else {
			moveToInterpolatedPosition();
		}
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

	addPlayerEye(player, isHost, currentPolygonKey, currentPolygonObject) {
		let eyeConfiguration = this.game.cache.getPhysicsData(currentPolygonKey)[currentPolygonObject][0].eyeConfiguration;

		const eyeX = (isHost ? 1 : -1) * eyeConfiguration.x;
		const eyeY = eyeConfiguration.y;
		const eyeRadius = player.data.eyeRadius = eyeConfiguration.eyeRadius;
		const pupilRadius = player.data.pupilRadius = eyeConfiguration.pupilRadius;

		if (player.data.eye) {
			player.data.eye.pupil.destroy();
			player.data.eye.destroy();
		}

		//eyeball
		player.data.eye = this.addGraphics(eyeX, eyeY);
		player.data.eye.beginFill(0xffffff);
		player.data.eye.lineStyle(1, 0x363636);
		player.data.eye.drawCircle(0, 0, eyeRadius);

		//pupil
		player.data.eye.pupil = this.addGraphics();
		player.data.eye.pupil.beginFill(0x363636);
		player.data.eye.pupil.drawCircle(0, 0, pupilRadius);
		player.data.eye.pupil.beginFill(0x363636);

		player.data.eye.addChild(player.data.eye.pupil);
		player.addChild(player.data.eye);
	}

	updatePlayerEye(player, ball) {
		const eye = player.data.eye;
		const eyeRadius = player.data.eyeRadius;
		const pupilRadius = player.data.pupilRadius;

		const dx = player.x + eye.x - ball.x;
		const dy = player.y + eye.y - ball.y;
		const r = Math.sqrt(dx * dx + dy * dy);
		const max = (eyeRadius - pupilRadius) / 2;
		const x = (r < max) ? dx : dx * max / r;
		const y = (r < max) ? dy : dy * max / r;

		this.setEyePupilPosition(player, x * -1, y * -1);
	}

	setEyePupilPosition(player, x, y) {
		const eye = player.data.eye;

		eye.pupil.position.setTo(x, y);
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

	setWorldGravity(gravity) {
		this.game.physics.p2.gravity.y = gravity;
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

	getWidth(sprite) {
		return sprite.width;
	}

	setWidth(sprite, width) {
		sprite.width = width;
	}

	getHeight(sprite) {
		return sprite.height;
	}

	setHeight(sprite, height) {
		sprite.height = height;
	}

	setAnchor(sprite, anchor) {
		sprite.anchor.set(anchor);
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

	limitBallThroughNet(ball) {
		ball.body.onBeginContact.add(
			(body, bodyB, shapeA, shapeB, equation) => {
				if (
					body && bodyB.name === 'netLimit' &&
					bodyB.parent &&
					equation[0] && equation[0].bodyB && equation[0].bodyB.parent && equation[0].bodyB.parent.sprite
				) {
					if (equation[0].bodyB.parent.x < bodyB.parent.x && equation[0].bodyB.parent.velocity.x > 0) {
						equation[0].bodyB.parent.x = bodyB.parent.x - equation[0].bodyB.parent.sprite.width / 2;
					} else if (equation[0].bodyB.parent.x > bodyB.parent.x && equation[0].bodyB.parent.velocity.x < 0) {
						equation[0].bodyB.parent.x = bodyB.parent.x + equation[0].bodyB.parent.sprite.width / 2;
					}
				}
			},
			this
		);
	}

	hasSurfaceTouchingPlayerBottom(player) {
		if (this.game.physics && this.game.physics.p2) {
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

	setTint(sprite, hex) {
		sprite.tint = Phaser.Color.hexToRGB(hex);
	}

	/**
	 * @param sprite
	 * @param {{frame: {string}, frames: {string}[], speed: {int}}} animation
	 */
	playAnimation(sprite, animation) {
		sprite.animations.add(
			animation.frame,
			animation.frames,
			animation.speed,
			true
		);
		sprite.animations.play(animation.frame);
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

	isAlive(sprite) {
		return sprite.alive;
	}

	kill(sprite) {
		if (sprite && this.isAlive(sprite)) {
			this.playDeathAnimation(sprite);
			sprite.kill();
		}
	}

	revive(sprite, x, y) {
		sprite.reset(x, y);
	}

	playCountAnimation(countText) {
		const duration = 750;

		this.playDisappearAnimation(countText, duration);

		setTimeout(() => {
			if (countText) {
				countText.destroy();
			}
		}, duration);
	}

	playDeathAnimation(sprite) {
		const duration = 750;

		this.setEyePupilPosition(sprite, 0, 0);

		const spriteB = this.game.add.sprite(sprite.width, sprite.height, sprite.generateTexture());
		spriteB.x = sprite.x;
		spriteB.y = sprite.y;
		this.setAnchor(spriteB, 0.5);
		this.setOpacity(spriteB, this.getOpacity(sprite));

		this.playDisappearAnimation(spriteB, duration);

		setTimeout(() => {
			if (spriteB) {
				spriteB.destroy(true, true);
			}
		}, duration);
	}

	/**
	 * @private
	 * @param sprite
	 * @param duration
	 */
	playDisappearAnimation(sprite, duration) {
		const scale = 0.25;
		const move = 20;

		this.game.add.tween(sprite.scale).to({x: scale, y: scale}, duration).start();
		this.game.add.tween(sprite)
			.to({alpha: '-' + 0.25, x: '-' + move / 2, y: "-" + move}, duration / 4)
			.to({alpha: '-' + 0.25, x: '+' + move, y: "-" + move}, duration / 4)
			.to({alpha: '-' + 0.25, x: '-' + move, y: "-" + move}, duration / 4)
			.to({alpha: '-' + 0.25, x: '+' + move, y: "-" + move}, duration / 4)
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
			if (sprite) {
				sprite.destroy();
			}
		}, duration);
	}

	drawBonus(x, y, bonus, progress) {
		const bonusSprite = this.getBonusSprite(x, y, bonus);

		this.updateBonusProgressComponent(bonusSprite, progress);

		bonusSprite.bringToTop();
		bonusSprite.body.static = true;

		return bonusSprite;
	}

	updateBonusProgress(x, bonusSprite, progress) {
		bonusSprite.body.x = x;

		this.updateBonusProgressComponent(bonusSprite, progress);
	}

	updateBonusProgressComponent(bonusSprite, progress) {
		const minProgress = 0.00001;
		const maxProgress = 0.99999;
		const radius = this.bonusRadius - 1;
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

	addBonus(x, bonusGravityScale, bonus, bonusZIndexGroup) {
		const bonusSprite = this.getBonusSprite(x, 0, bonus, bonusZIndexGroup);

		bonusSprite.createdAt = 0;
		this.sortBonusGroup(bonusZIndexGroup);

		bonusSprite.data.initialGravity = bonusGravityScale;
		bonusSprite.data.currentGravity = bonusSprite.data.initialGravity;

		this.setFixedRotation(bonusSprite, false);
		this.setGravity(bonusSprite, bonusSprite.data.currentGravity);
		this.setDamping(bonusSprite, 0);

		return bonusSprite;
	}

	showBallHitPoint(x, y, diameter) {
		this.activateAnimation(
			this.drawCircle(
				x,
				y,
				{color: 0xffffff, width: 2},
				null,
				diameter
			)
		);
	}

	activateAnimationBonus(x, y, bonus) {
		const bonusSprite = this.getBonusSprite(x, y, bonus);

		bonusSprite.bringToTop();
		bonusSprite.body.static = true;

		this.activateAnimation(bonusSprite);
	}

	getBonusSprite(x, y, bonus, bonusGroup) {
		const bonusSprite = this.addGroupedSprite(x, y, null, bonusGroup);

		bonusSprite.body.clearShapes();
		bonusSprite.body.addCircle(this.bonusRadius);
		const sprite = this.addSprite(
			0,
			0,
			'bonus-icon',
			true,
			bonus.atlasFrame
		);
		this.setAnchor(sprite, 0.5);
		bonusSprite.addChild(sprite);

		return bonusSprite;
	}

	drawBallPrediction(x, y, color) {
		if (this.game.debug.geom) {
			if (!this.ballPredictionIndicator) {
				this.ballPredictionIndicator = new Phaser.Rectangle(0, 0, 10, 10);
			}

			this.ballPredictionIndicator.x = x - 5;
			this.ballPredictionIndicator.y = y - 5;

			this.game.debug.geom(this.ballPredictionIndicator, color);
		}
	}
}
