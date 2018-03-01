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

WEBGL_RENDERER = true;
CANVAS_RENDERER = true;
const Phaser = require('phaser/dist/phaser');

export default class Phaser3Engine extends Engine {
	start(worldConfiguration, preloadGame, createGame, updateGame, scope) {
		//Create loading mask
		Session.set('gameLoadingMask', true);
		this.bonusRadius = worldConfiguration.bonusRadius;

		const me = this;
		me.currentScene = null;
		this.game = new Phaser.Game({
			width: worldConfiguration.width,
			height: worldConfiguration.height,
			backgroundColor: worldConfiguration.backgroundColor,
			type: Phaser.AUTO,
			parent: worldConfiguration.renderTo,
			banner: {
				hidePhaser: true
			},
			physics: {
				default: 'matter',
				matter: {
					debug: true,
					gravity: {
						x: 0,
						y: worldConfiguration.gravity
					}
				}
			},
			scene: {
				preload: function() {
					me.currentScene = this;
					preloadGame.call(scope);
				},

				create: function() {
					for (let shape of PLAYER_LIST_OF_SHAPES) {
						me.loadScaledPhysics(NORMAL_SCALE_PHYSICS_DATA, SMALL_SCALE_PHYSICS_DATA, 'player-' + shape, SMALL_SCALE_PLAYER_BONUS);
						me.loadScaledPhysics(NORMAL_SCALE_PHYSICS_DATA, BIG_SCALE_PHYSICS_DATA, 'player-' + shape, BIG_SCALE_BONUS);
					}
					me.loadScaledPhysics(NORMAL_SCALE_PHYSICS_DATA, SMALL_SCALE_PHYSICS_DATA, 'ball', SMALL_SCALE_BALL_BONUS);
					me.loadScaledPhysics(NORMAL_SCALE_PHYSICS_DATA, BIG_SCALE_PHYSICS_DATA, 'ball', BIG_SCALE_BONUS);

					createGame.call(scope);
				},

				update: function() {
					updateGame.call(scope);
				}
			}
		});
	}

	stop() {
		this.currentScene.sys.game.destroy(true);
	}

	createGame() {
		//Hide loading mask
		Session.set('gameLoadingMask');
	}

	loadScaledPhysics(originalPhysicsKey, newPhysicsKey, shapeKey, scale) {
		const newData = [];
		const data = this.currentScene.cache.json.get(originalPhysicsKey)[shapeKey];

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
		if (this.currentScene.cache.json.has(newPhysicsKey)) {
			item = this.currentScene.cache.json.get(newPhysicsKey);
		}

		item[shapeKey] = newData;
		this.currentScene.cache.json.add(newPhysicsKey, item);
	}

	loadImage(key, path) {
		this.currentScene.load.image(key, path);
	}

	loadAtlas(key, imagePath, jsonPath) {
		this.currentScene.load.atlas(key, imagePath, jsonPath);
	}

	loadSpriteSheet(key, path, width, height) {
		this.currentScene.load.spritesheet(key, path, width, height);
	}

	loadData(key, path) {
		this.currentScene.load.json(key, path);
	}

	addGroup(enableBody = false) {
		return this.currentScene.add.group();
	}

	addBound(x, y, w, h, material, collisionGroup, colliders, debug) {
		const bound = this.currentScene.matter.add.rectangle(x, y, w, h, { isStatic: true, friction: 0, frictionStatic: 0 });

		bound.collisionFilter.category = collisionGroup;
		this.collidesBodyWith(bound, colliders);

		return bound;
	}

	collidesBodyWith(body, categories) {
		let flags = 0;

		for (let i = 0; i < categories.length; i++) {
			flags |= categories[i];
		}

		body.collisionFilter.mask = flags;
	}

	addImage(x, y, key, frame, group) {
		return this.currentScene.add.image(x, y, key, frame);
	}

	addSprite(x, y, key, disableBody = false, frame, debugBody = false) {
		return this.addGroupedSprite(x, y, key, undefined, disableBody, frame, debugBody);
	}

	addGroupedSprite(x, y, key, group, disableBody = false, frame, debugBody = false) {
		const sprite = this.currentScene.matter.add.sprite(x, y, key, frame);

		if (!disableBody) {
			this.enableBody(sprite, debugBody);
		}

		return sprite;
	}

	loadSpriteTexture(sprite, key) {
		sprite.setTexture(key);
	}

	addTileSprite(x, y, width, height, key, frame, disableBody = true, group, debugBody = false) {
		const tileSprite = this.currentScene.add.tileSprite(
			x + width / 2,
			y + height / 2,
			width,
			height,
			key,
			frame
		);
		if (group) {
			group.add(tileSprite);
		}

		if (!disableBody) {
			this.enableBody(tileSprite, debugBody);
		}

		return tileSprite;
	}

	addGraphics(config) {
		return this.currentScene.add.graphics(config);
	}

	addText(x, y, text, style) {
		const textObject = this.currentScene.add.text(x, y, text, style);

		textObject.setOrigin(0.5);

		return textObject;
	}

	drawRectangle(x, y, w, h, config) {
		const graphics = this.addGraphics({x: x, y: y, fillStyle: {color: config.color, opacity: config.opacity}});

		graphics.fillRect(0, 0, w, h);
	}

	createTimer(seconds, fn, scope) {
		return this.currentScene.time.delayedCall(seconds * 1000, fn, [], scope);
	}

	createCollisionGroup() {
		return this.currentScene.matter.world.nextCategory();
	}

	createMaterial(material) {
		//@todo
		// return this.currentScene.physics.p2.createMaterial(material);
	}

	isTimerRunning(timer) {
		return timer.getProgress() < 1;
	}

	getTimerRemainingDuration(timer) {
		return timer.delay - timer.getElapsedSeconds();
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

	initWorldContactMaterial() {
		this.currentScene.matter.world.setBounds();
	}

	createWorldContactMaterial(material, config) {
		// this.currentScene.physics.p2.createContactMaterial(material, this.worldMaterial, config);
	}

	createContactMaterial(materialA, materialB, config) {
		// this.currentScene.physics.p2.createContactMaterial(materialA, materialB, config);
	}

	loadPolygon(sprite, key, object) {
		const data = this.currentScene.cache.json.get(key)[object];

		let vertices = [];
		for (let i = 0; i < data.length; i++) {
			let polygon = [];
			for (let j = 0; j < data[i].shape.length; j += 2) {
				polygon[j] = data[i].shape[j];
				polygon[j + 1] = data[i].shape[j + 1];
			}

			vertices = vertices.concat(polygon);
		}

		sprite.setBody({
			type: 'fromVerts',
			verts: this.currentScene.matter.world.fromPath(vertices.join(' '))
		});
	}

	initData(sprite) {
		sprite.setData();
	}

	enableBody(sprite, debug) {
		// this.currentScene.physics.p2.enable(sprite, debug);
	}

	distanceMultiplier() {
		return 1.502636245994042;
	}

	gravityDistanceAtTime(sprite, t) {
		const gravity = this.currentScene.physics.p2.gravity.y * sprite.body.data.gravityScale;

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
			//@todo Restrict horizontally
			//@todo Restrict vertically
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

			this.currentScene.time.events.add(
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
		sprite.setVelocity(0, 0);
		sprite.setStatic(true);
		sprite.data.isFrozen = true;
	}

	unfreeze(sprite) {
		sprite.setStatic(false);
		sprite.data.isFrozen = false;
	}

	spawn(sprite, x, y) {
		sprite.setVelocity(0, 0);
		sprite.setPosition(x, y);
	}

	addPlayerEye(player, isHost, currentPolygonKey, currentPolygonObject) {
		//@todo
		// let eyeConfiguration = this.currentScene.cache.json.get(currentPolygonKey)[currentPolygonObject][0].eyeConfiguration;
		//
		// const eyeX = (isHost ? 1 : -1) * eyeConfiguration.x;
		// const eyeY = eyeConfiguration.y;
		// const eyeRadius = player.data.eyeRadius = eyeConfiguration.eyeRadius;
		// const pupilRadius = player.data.pupilRadius = eyeConfiguration.pupilRadius;
		//
		// if (player.data.eye) {
		// 	player.data.eye.pupil.destroy();
		// 	player.data.eye.destroy();
		// }
		//
		// //eyeball
		// player.data.eye = this.addGraphics({x: eyeX, y: eyeY, fillStyle: {color: 0xffffff}, lineStyle: {width: 1, color: 0x363636}});
		// player.data.eye.strokeCircle(0, 0, eyeRadius);
		// player.data.eye.fillCircle(0, 0, eyeRadius);
		//
		// //pupil
		// player.data.eye.pupil = this.addGraphics({fillStyle: {color: 0x363636}});
		// player.data.eye.pupil.fillCircle(0, 0, pupilRadius);
		//
		// player.data.eye.addChild(player.data.eye.pupil);
		// player.addChild(player.data.eye);
	}

	updatePlayerEye(player, ball) {
		//@todo
		// const eye = player.data.eye;
		// const eyeRadius = player.data.eyeRadius;
		// const pupilRadius = player.data.pupilRadius;
		//
		// const dx = player.x + eye.x - ball.x;
		// const dy = player.y + eye.y - ball.y;
		// const r = Math.sqrt(dx * dx + dy * dy);
		// const max = (eyeRadius - pupilRadius) / 2;
		// const x = (r < max) ? dx : dx * max / r;
		// const y = (r < max) ? dy : dy * max / r;
		//
		// eye.pupil.position.setTo(x * -1, y * -1);
	}

	getMass(sprite) {
		return sprite.body.mass;
	}

	setMass(sprite, mass) {
		sprite.setMass(mass);
	}

	setFixedRotation(sprite, fixedRotation) {
		sprite.setFixedRotation();
	}

	getGravity(sprite) {
		return sprite.body.data.gravityScale;
	}

	setGravity(sprite, gravity) {
		//@todo
		// sprite.body.data.gravityScale = gravity;
	}

	setDamping(sprite, damping) {
		sprite.body.damping = damping;
	}

	getHorizontalSpeed(sprite) {
		return sprite.body.velocity.x;
	}

	setHorizontalSpeed(sprite, velocityX) {
		sprite.setVelocityX(velocityX);
	}

	getVerticalSpeed(sprite) {
		return sprite.body.velocity.y;
	}

	setVerticalSpeed(sprite, velocityY) {
		sprite.setVelocityY(velocityY);
	}

	getXPosition(sprite) {
		return sprite.x;
	}

	getYPosition(sprite) {
		return sprite.y;
	}

	getHeight(sprite) {
		return sprite.height;
	}

	setAnchor(sprite, anchor) {
		sprite.anchor.set(anchor);
	}

	setMaterial(sprite, material) {
		//@todo
		// sprite.body.setMaterial(material);
	}

	setCollisionGroup(sprite, collisionGroup) {
		sprite.setCollisionCategory(collisionGroup);
	}

	collidesWith(sprite, collisionGroup, callback, scope) {
		if (sprite.data.collisionGroups === undefined) {
			//Default collision with world
			sprite.data.collisionGroups = [1];
		}
		sprite.data.collisionGroups.push(collisionGroup);

		sprite.setCollidesWith(sprite.data.collisionGroups);

		if (callback) {
			this.currentScene.matter.world.on('collisionstart', function(event, bodyA, bodyB) {
				if (
					bodyA.gameObject === sprite &&
					bodyB.collisionFilter.category === collisionGroup
				) {
					callback.call(scope, bodyA, bodyB);
				}
			});
		}
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
		for (let body of player.data.canJumpOnBodies) {
			if (
				player.body.bounds.min.y <= body.bounds.max.y &&
				player.body.bounds.max.y >= body.bounds.min.y &&
				player.body.bounds.min.x <= body.bounds.max.x &&
				player.body.bounds.max.x >= body.bounds.min.x
			) {
				return true;
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
		sprite.setAlpha(opacity);
	}

	animateSetOpacity(sprite, opacityTo, opacityFrom, duration) {
		this.setOpacity(sprite, opacityFrom);
		this.currentScene.tweens.add(
			{
				targets: [sprite],
				alpha: opacityTo,
				duration: duration
			}
		);
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
		sprite.scaleX = x;
		sprite.scaleY = y;
	}

	animateScale(sprite, xTo, yTo, xFrom, yFrom, duration) {
		this.scale(sprite, xFrom, yFrom);
		this.currentScene.tweens.add(
			{
				targets: [sprite],
				scaleX: xTo,
				scaleY: yTo,
				duration: duration
			}
		);
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
		const emitter = this.currentScene.add.emitter(x, y);
		emitter.bounce.setTo(0.5, 0.5);
		emitter.setXSpeed(xMinSpeed, xMaxSpeed);
		emitter.setYSpeed(yMinSpeed, yMaxSpeed);
		emitter.makeParticles(keys, frames, particlesQuantity);
		emitter.start(explode, lifespan, frequency, quantity);
	}

	shake(sprite, move, time) {
		this.currentScene.tweens.add({
			targets: sprite,
			x: '-=' + move,
			y: '-=' + move,
			duration: time,
			ease: 'Sine.easeInOut',
			yoyo: true,
			repeat: 6
		});
	}

	activateAnimation(sprite) {
		const duration = 250;
		const scale = 4;

		this.scale(sprite, 1, 1);
		this.setOpacity(sprite, 0.5);
		this.currentScene.add.tween(sprite.scale).to({x: scale, y: scale}, duration).start();
		this.currentScene.add.tween(sprite).to({alpha: 0}, duration).start();
		setTimeout(() => {
			sprite.destroy();
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
			canvas = this.currentScene.add.bitmapData(radius * 2, radius * 2);
			canvasContainer = this.currentScene.add.sprite(0, 0, canvas);

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

		this.setGravity(bonusSprite, bonusSprite.data.currentGravity);
		this.setDamping(bonusSprite, 0);

		return bonusSprite;
	}

	showBallHitPoint(x, y, diameter) {
		const graphics = this.addGraphics({x: x, y: y, lineStyle: {width: 2, color: 0xffffff}});
		graphics.strokeCircle(0, 0, diameter);

		this.activateAnimation(graphics);
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
}
