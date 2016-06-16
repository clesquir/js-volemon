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
		this.game.state.destroy();
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
		var newData = [],
			data = this.game.cache.getPhysicsData(originalPhysicsKey, shapeKey);

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

	loadData(key, path) {
		this.game.load.physics(key, path);
	}

	addKeyControllers() {
		this.cursor = this.game.input.keyboard.createCursorKeys();
		this.game.input.keyboard.addKeyCapture([
			Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.RIGHT, Phaser.Keyboard.LEFT
		]);
	}

	addGroup() {
		var group = this.game.add.group();

		group.enableBody = true;

		return group;
	}

	addSprite(x, y, key, group, disableBody) {
		var sprite = this.game.add.sprite(x, y, key, undefined, group);

		if (!disableBody) {
			this.enableBody(sprite);
		}

		return sprite;
	}

	addTileSprite(x, y, width, height, key, group, disableBody) {
		var tileSprite = this.game.add.tileSprite(
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
		var textObject = this.game.add.text(x, y, text, style, group);

		textObject.smoothed = true;
		this.setAnchor(textObject, 0.5);

		return textObject;
	}

	createTimer(seconds, fn, scope) {
		var timer = this.game.time.create();

		timer.add(Phaser.Timer.SECOND * seconds, fn, scope);

		return timer;
	}

	createCollisionGroup() {
		return this.game.physics.p2.createCollisionGroup();
	}

	createMaterial(material) {
		return this.game.physics.p2.createMaterial(material);
	}

	isKeyLeftDown() {
		return this.cursor.left.isDown;
	}

	isKeyRightDown() {
		return this.cursor.right.isDown;
	}

	isKeyUpDown() {
		return this.cursor.up.isDown;
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
		return spriteBody.sprite.key;
	}

	getPositionData(sprite) {
		var body = sprite.body;

		return {
			x: body.x,
			y: body.y,
			velocityX: body.velocity.x,
			velocityY: body.velocity.y
		};
	}

	updateContactMaterials(ballMaterial, playerMaterial, playerDelimiterMaterial,
		bonusMaterial, netDelimiterMaterial, groundDelimiterMaterial) {
		var worldMaterial = this.createMaterial('world');

		this.game.physics.p2.updateBoundsCollisionGroup();
		this.game.physics.p2.setWorldMaterial(worldMaterial);

		this.game.physics.p2.createContactMaterial(ballMaterial, worldMaterial,
			{restitution: 1});
		this.game.physics.p2.createContactMaterial(ballMaterial, groundDelimiterMaterial,
			{restitution: 1});

		this.game.physics.p2.createContactMaterial(playerMaterial, worldMaterial,
			{stiffness: 1e20, relaxation: 3, friction: 0});
		this.game.physics.p2.createContactMaterial(playerMaterial, playerDelimiterMaterial,
			{stiffness: 1e20, relaxation: 3, friction: 0});

		this.game.physics.p2.createContactMaterial(bonusMaterial, worldMaterial,
			{restitution: 1});
		this.game.physics.p2.createContactMaterial(bonusMaterial, netDelimiterMaterial,
			{restitution: 0.7});
		this.game.physics.p2.createContactMaterial(bonusMaterial, groundDelimiterMaterial,
			{restitution: 1});
	}

	loadPolygon(sprite, key, object) {
		sprite.body.clearShapes();
		sprite.body.loadPolygon(key, object);
	}

	enableBody(sprite) {
		this.game.physics.p2.enable(sprite);
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

	freeze(sprite) {
		var body = sprite.body;

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

	setHorizontalSpeed(sprite, velocityX) {
		sprite.body.velocity.x = velocityX;
	}

	setVerticalSpeed(sprite, velocityY) {
		sprite.body.velocity.y = velocityY;
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

	constrainVelocity(body, maxVelocity) {
		var angle, currVelocitySqr, vx, vy;

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
		var multilineText = text;

		if (!Array.isArray(multilineText)) {
			multilineText = [multilineText];
		}

		multilineText = multilineText.map(line => {return '    ' + line + '    ';});

		return textComponent.text = multilineText.join('\n');
	}

	reboundOrSmashOnPlayerHitBall(ball, player, ballVelocityYOnPlayerHit) {
		var key = player.sprite.key;

		//Player is jumping forward and ball is in front of him (smash)
		if (
			Math.round(player.velocity.y) < 0 &&
			(
				(key === 'player1' && Math.round(player.velocity.x) > 0 && player.x < ball.x) ||
				(key === 'player2' && Math.round(player.velocity.x) < 0 && ball.x < player.x)
			)
		) {
			//Ball should go faster and down
			ball.velocity.x *= 2;
			ball.velocity.y /= 4;

			//Ball should always go down
			if (ball.velocity.y < 0) {
				ball.velocity.y = -ball.velocity.y;
			}

			this.constrainVelocity(ball, 1000);
		} else {
			//Ball rebounds on player
			ball.velocity.y = ballVelocityYOnPlayerHit;
		}
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

	addBonus(x, bonusGravityScale, bonusMaterial, bonusCollisionGroup,
		bonusLetter, bonusFontSize, bonusSpriteBorderKey) {
		var bonusSprite = this.addSprite(x, 0, 'delimiter'),
			bonusGraphics, bonusText, bonusBorder;

		bonusSprite.initialGravity = bonusGravityScale;
		bonusSprite.sendToBack();

		bonusGraphics = this.addGraphics(0, 0);

		bonusGraphics.beginFill(0xFFFFFF);
		bonusGraphics.drawCircle(0, 0, 30);
		bonusGraphics.endFill();

		bonusText = this.addText(0, 3, bonusLetter, {
			font: 'FontAwesome',
			fontWeight: 'normal',
			fontSize: bonusFontSize,
			fill: '#363636',
			align: 'center'
		});

		bonusBorder = this.addSprite(0, 0, bonusSpriteBorderKey, undefined, true);
		this.setAnchor(bonusBorder, 0.5);

		bonusSprite.body.clearShapes();
		bonusSprite.body.addCircle(15);
		this.setFixedRotation(bonusSprite, false);
		this.setGravity(bonusSprite, bonusSprite.initialGravity);
		this.setDamping(bonusSprite, 0);
		this.setMaterial(bonusSprite, bonusMaterial);
		this.setCollisionGroup(bonusSprite, bonusCollisionGroup);

		bonusSprite.addChild(bonusGraphics);
		bonusSprite.addChild(bonusText);
		bonusSprite.addChild(bonusBorder);

		return bonusSprite;
	}

}
