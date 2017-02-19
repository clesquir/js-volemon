import { Config } from '/imports/lib/config.js';
import { Constants } from '/imports/lib/constants.js';
import { round } from '/imports/lib/utils.js';

export default class PhaserEngine {

	start(width, height, parent, preloadGame, createGame, updateGame, scope) {
		this.game = new Phaser.Game({
			width: width,
			height: height,
			renderer: Phaser.CANVAS,
			parent: parent
		});

		this.game.state.add('play', {
			preload: preloadGame.bind(scope),
			create: createGame.bind(scope),
			update: updateGame.bind(scope)
		});

		this.game.state.start('play');
	}

	stop() {
		this.removeKeyControllers();
		this.game.state.destroy();
	}

	onGameEnd() {
		this.removeKeyControllers();
	}

	preloadGame() {
		this.game.stage.backgroundColor = '#9ad3de';
		this.game.stage.disableVisibilityChange = true;
	}

	createGame() {
		for (let shape of Constants.PLAYER_LIST_OF_SHAPES) {
			this.loadScaledPhysics(Constants.NORMAL_SCALE_PHYSICS_DATA, Constants.SMALL_SCALE_PHYSICS_DATA, 'player-' + shape, Constants.SMALL_SCALE_PLAYER_BONUS);
			this.loadScaledPhysics(Constants.NORMAL_SCALE_PHYSICS_DATA, Constants.BIG_SCALE_PHYSICS_DATA, 'player-' + shape, Constants.BIG_SCALE_BONUS);
		}
		this.loadScaledPhysics(Constants.NORMAL_SCALE_PHYSICS_DATA, Constants.SMALL_SCALE_PHYSICS_DATA, 'ball', Constants.SMALL_SCALE_BALL_BONUS);
		this.loadScaledPhysics(Constants.NORMAL_SCALE_PHYSICS_DATA, Constants.BIG_SCALE_PHYSICS_DATA, 'ball', Constants.BIG_SCALE_BONUS);

		this.game.physics.startSystem(Phaser.Physics.P2JS);
		this.game.physics.p2.setImpactEvents(true);
		this.game.physics.p2.gravity.y = Config.worldGravity;
		this.game.physics.p2.world.defaultContactMaterial.friction = 0;
		this.game.physics.p2.world.setGlobalStiffness(1e10);
		this.game.physics.p2.restitution = 0;
	}

	loadScaledPhysics(originalPhysicsKey, newPhysicsKey, shapeKey, scale) {
		let newData = [];
		let data = this.game.cache.getPhysicsData(originalPhysicsKey, shapeKey);

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

	loadData(key, path, data) {
		this.game.load.physics(key, path, data);
	}

	addKeyControllers() {
		this.cursor = this.game.input.keyboard.createCursorKeys();
		this.cursor['a'] = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
		this.cursor['w'] = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
		this.cursor['d'] = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
		this.cursor['s'] = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
		this.cursor['spacebar'] = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	}

	removeKeyControllers() {
		this.game.input.keyboard.clearCaptures();
	}

	addGroup() {
		let group = this.game.add.group();

		group.enableBody = true;

		return group;
	}

	addSprite(x, y, width, height, key, disableBody) {
		let sprite = this.game.add.sprite(x, y, key);

		if (!disableBody) {
			this.enableBody(sprite);
		}

		return sprite;
	}

	addTileSprite(x, y, width, height, key, group, disableBody) {
		let tileSprite = this.game.add.tileSprite(
			x,
			y,
			width,
			height,
			key,
			undefined,
			group
		);

		if (!disableBody) {
			this.enableBody(tileSprite);
		}

		return tileSprite;
	}

	addGraphics(x, y, group) {
		return this.game.add.graphics(x, y, group);
	}

	addText(x, y, text, style, group) {
		let textObject = this.game.add.text(x, y, text, style, group);

		textObject.smoothed = true;
		this.setAnchor(textObject, 0.5);

		return textObject;
	}

	startTimer(seconds, fn, scope) {
		let timer = this.game.time.create();

		timer.add(Phaser.Timer.SECOND * seconds, fn, scope);
		timer.start();

		return timer;
	}

	createCollisionGroup() {
		return this.game.physics.p2.createCollisionGroup();
	}

	createMaterial(material) {
		return this.game.physics.p2.createMaterial(material);
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
		return spriteBody.sprite.key;
	}

	updateContactMaterials(ballMaterial, playerMaterial, playerDelimiterMaterial,
		bonusMaterial, netDelimiterMaterial, groundDelimiterMaterial) {
		let worldMaterial = this.createMaterial('world');

		this.game.physics.p2.updateBoundsCollisionGroup();
		this.game.physics.p2.setWorldMaterial(worldMaterial);

		this.game.physics.p2.createContactMaterial(
			ballMaterial,
			worldMaterial,
			{restitution: 1}
		);
		this.game.physics.p2.createContactMaterial(
			ballMaterial,
			groundDelimiterMaterial,
			{restitution: 1}
		);

		this.game.physics.p2.createContactMaterial(
			playerMaterial,
			worldMaterial,
			{stiffness: 1e20, relaxation: 3, friction: 0}
		);
		this.game.physics.p2.createContactMaterial(
			playerMaterial,
			playerDelimiterMaterial,
			{stiffness: 1e20, relaxation: 3, friction: 0}
		);

		this.game.physics.p2.createContactMaterial(
			bonusMaterial,
			worldMaterial,
			{restitution: 1}
		);
		this.game.physics.p2.createContactMaterial(
			bonusMaterial,
			netDelimiterMaterial,
			{restitution: 0.7}
		);
		this.game.physics.p2.createContactMaterial(
			bonusMaterial,
			groundDelimiterMaterial,
			{restitution: 1}
		);
	}

	loadPolygon(sprite, key, object) {
		sprite.body.clearShapes();
		sprite.body.loadPolygon(key, object);
	}

	enableBody(sprite) {
		this.game.physics.p2.enable(sprite);
	}

	interpolateFromTimestamp(currentTimestamp, sprite, data) {
		let t = (currentTimestamp - data.timestamp) / 1000;
		let gravity = this.game.physics.p2.gravity.y * sprite.body.data.gravityScale;
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
			x: round(body.x - sprite.width / 2, 2),
			y: round(body.y - sprite.height / 2, 2),
			velocityX: body.velocity.x,
			velocityY: body.velocity.y
		};
	}

	move(sprite, data) {
		if (!sprite.body) {
			return;
		}

		sprite.body.x = data.x + sprite.width / 2;
		sprite.body.y = data.y + sprite.height / 2;
		sprite.body.velocity.x = data.velocityX;
		sprite.body.velocity.y = data.velocityY;
	}

	freeze(sprite) {
		let body = sprite.body;

		body.setZeroRotation();
		body.setZeroVelocity();
		this.setGravity(sprite, 0);
	}
	
	unfreeze(sprite) {
		this.setGravity(sprite, sprite.initialGravity);
	}

	spawn(sprite, x, y) {
		sprite.body.setZeroRotation();
		sprite.body.setZeroVelocity();
		sprite.reset(x, y);
	}

	setMass(sprite, mass) {
		sprite.body.mass = mass;
	}

	setFixedRotation(sprite, fixedRotation) {
		sprite.body.fixedRotation = fixedRotation;
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

	isSpeedDirectionLeft(sprite) {
		return this.getHorizontalSpeed(sprite) < 0;
	}

	isSpeedDirectionRight(sprite) {
		return this.getHorizontalSpeed(sprite) > 0;
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

	getBottom(sprite) {
		return sprite.bottom;
	}

	hasXPositionBefore(spriteA, spriteB) {
		return this.getXPosition(spriteA) < this.getXPosition(spriteB);
	}

	getXPosition(sprite) {
		return sprite.body.x;
	}

	getYPosition(sprite) {
		return sprite.body.y;
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
		let body = sprite.body;
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

	shake(sprite, move, time) {
		this.game.add.tween(sprite)
			.to({y: "-" + move}, time).to({y: "+" + move * 2}, time * 2).to({y: "-" + move}, time)
			.to({y: "-" + move}, time).to({y: "+" + move * 2}, time * 2).to({y: "-" + move}, time)
			.to({y: "-" + move / 2}, time).to({y: "+" + move}, time * 2).to({y: "-" + move / 2}, time)
			.start();

		this.game.add.tween(sprite)
			.to({x: "-" + move}, time).to({x: "+" + move * 2}, time * 2).to({x: "-" + move}, time)
			.to({x: "-" + move}, time).to({x: "+" + move * 2}, time * 2).to({x: "-" + move}, time)
			.to({x: "-" + move / 2}, time).to({x: "+" + move}, time * 2).to({x: "-" + move / 2}, time)
			.start();
	}

	drawBonus(x, y, bonusLetter, bonusFontSize, bonusSpriteBorderKey, bonusProgress) {
		let bonusSprite = this.getBonusSprite(x, y, bonusLetter, bonusFontSize, bonusSpriteBorderKey);

		//Add pie progress
		let radius = 14;
		let pieProgress = this.game.add.bitmapData(radius * 2, radius * 2);

		//Calculate progress
		let progress = Phaser.Math.clamp(bonusProgress, 0.00001, 0.99999);

		let color = '#000000';
		let opacity = 0.25;
		if (progress <= 0.1) {
			color = '#c94141';
			opacity = 0.5;
		}
		pieProgress.ctx.fillStyle = color;
		pieProgress.ctx.beginPath();
		pieProgress.ctx.arc(radius, radius, radius, 0, (Math.PI * 2) * progress, true);
		pieProgress.ctx.lineTo(radius, radius);
		pieProgress.ctx.closePath();
		pieProgress.ctx.fill();

		let pieProgressSprite = this.game.add.sprite(0, 0, pieProgress);
		this.setAnchor(pieProgressSprite, 0.5);
		this.setOpacity(pieProgressSprite, opacity);
		pieProgressSprite.angle = -90;

		bonusSprite.addChild(pieProgressSprite);

		bonusSprite.bringToTop();
		this.setStatic(bonusSprite, true);

		return bonusSprite;
	}

	addBonus(x, bonusGravityScale, bonusMaterial, bonusCollisionGroup,
		bonusLetter, bonusFontSize, bonusSpriteBorderKey) {
		let bonusSprite = this.getBonusSprite(x, 0, bonusLetter, bonusFontSize, bonusSpriteBorderKey);

		bonusSprite.initialGravity = bonusGravityScale;
		bonusSprite.sendToBack();

		this.setFixedRotation(bonusSprite, false);
		this.setGravity(bonusSprite, bonusSprite.initialGravity);
		this.setDamping(bonusSprite, 0);
		this.setMaterial(bonusSprite, bonusMaterial);
		this.setCollisionGroup(bonusSprite, bonusCollisionGroup);

		return bonusSprite;
	}

	getBonusSprite(x, y, bonusLetter, bonusFontSize, bonusSpriteBorderKey) {
		let bonusSprite = this.addSprite(x, y, 28, 28, 'delimiter'),
			bonusGraphics, bonusText, bonusBorder;

		bonusGraphics = this.addGraphics(0, 0);

		bonusGraphics.beginFill(0xFFFFFF);
		bonusGraphics.drawCircle(0, 0, 28);
		bonusGraphics.endFill();

		bonusText = this.addText(0, 3, bonusLetter, {
			font: 'FontAwesome',
			fontWeight: 'normal',
			fontSize: bonusFontSize,
			fill: '#363636',
			align: 'center'
		});

		bonusBorder = this.addSprite(0, 0, 28, 28, bonusSpriteBorderKey, true);
		this.setAnchor(bonusBorder, 0.5);

		bonusSprite.body.clearShapes();
		bonusSprite.body.addCircle(Config.bonusRadius);

		bonusSprite.addChild(bonusGraphics);
		bonusSprite.addChild(bonusText);
		bonusSprite.addChild(bonusBorder);

		return bonusSprite;
	}

}
