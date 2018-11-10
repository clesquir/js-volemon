import BonusFactory from '/imports/api/games/BonusFactory.js';
import {
	BIG_SCALE_PHYSICS_DATA,
	BONUS_GRAVITY_SCALE,
	NORMAL_SCALE_BONUS,
	NORMAL_SCALE_PHYSICS_DATA,
	PLAYER_FROZEN_MASS,
	SMALL_SCALE_PHYSICS_DATA
} from '/imports/api/games/constants.js';
import {BONUS_INTERVAL} from '/imports/api/games/emissionConstants.js';
import {getRandomInt} from '/imports/lib/utils.js';
import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';

export default class GameBonus {
	/**
	 * @param {Game} game
	 * @param {Engine} engine
	 * @param {GameData} gameData
	 * @param {GameConfiguration} gameConfiguration
	 * @param {StreamBundler} streamBundler
	 * @param {ServerNormalizedTime} serverNormalizedTime
	 */
	constructor(
		game,
		engine,
		gameData,
		gameConfiguration,
		streamBundler,
		serverNormalizedTime
	) {
		this.game = game;
		this.engine = engine;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.streamBundler = streamBundler;
		this.serverNormalizedTime = serverNormalizedTime;
		this.lastBonusUpdate = 0;
		this.lastBonusCreated = 0;
		this.bonusFrequenceTime = 0;
		this.lastGameRespawn = 0;
		this.robots = {};
		this.bonuses = [];
		this.clouds = [];
		this.activeBonuses = [];
		this.removedBonuses = [];
	}

	playerFromKey(key, includeRobot = true) {
		return this.game.getPlayerFromKey(key, includeRobot);
	}

	isPlayerHostSide(player) {
		return this.game.isPlayerHostSide(player);
	}

	playerInitialPolygonFromKey(playerKey) {
		return this.game.playerInitialPolygonFromKey(playerKey);
	}

	playerCurrentPolygonFromKey(playerKey) {
		return this.game.playerCurrentPolygonFromKey(playerKey);
	}

	getPolygonKeyFromScale(scale) {
		let polygonKey = null;

		switch (scale) {
			case NORMAL_SCALE_BONUS:
				polygonKey = NORMAL_SCALE_PHYSICS_DATA;
				break;
			case this.gameConfiguration.smallPlayerScale():
			case this.gameConfiguration.smallBallScale():
				polygonKey = SMALL_SCALE_PHYSICS_DATA;
				break;
			case this.gameConfiguration.bigPlayerScale():
			case this.gameConfiguration.bigBallScale():
				polygonKey = BIG_SCALE_PHYSICS_DATA;
				break;
		}

		return polygonKey;
	}

	getBonusSpriteFromIdentifier(bonusIdentifier) {
		for (let bonus of this.bonuses) {
			if (bonus.identifier === bonusIdentifier) {
				return bonus;
			}
		}

		return null;
	}

	createComponents() {
		this.bonusZIndexGroup = this.engine.addGroup();
		this.bonusesGroup = this.engine.addGroup();
	}

	resumeGame() {
		this.regenerateLastBonusCreatedAndFrequenceTime();
		this.applyActiveBonuses();
		this.lastGameRespawn = Date.now();
	}

	onUpdateGameOnGoing() {
		this.checkBonuses();
		this.updatePlayerBonuses();

		for (let bonus of this.bonuses) {
			this.engine.constrainVelocity(bonus, 1000);
		}

		if (this.gameData.isUserCreator()) {
			this.createBonusIfTimeHasElapsed();
			this.sendBonusesPosition();
		}
	}

	applyActiveBonuses() {
		for (let activeBonus of this.gameData.activeBonuses()) {
			let bonus = BonusFactory.fromClassName(activeBonus.activatedBonusClass, this);
			bonus.reassignBeforeActivationData(activeBonus.beforeActivationData);
			bonus.activate(activeBonus.targetPlayerKey, activeBonus.activatedAt);
			bonus.start();
			this.activeBonuses.push(bonus);
		}
	}

	updatePlayerBonuses() {
		const padding = 5;
		let player1Count = 0;
		let player2Count = 0;
		let player3Count = 0;
		let player4Count = 0;

		this.activeBonuses.forEach((bonus) => {
			if (bonus.getTargetPlayerKey() && this.game.isPlayerKey(bonus.getTargetPlayerKey(), false)) {
				let bonusSprite = this.activatedBonusSpriteWithIdentifier(bonus.activationIdentifier());

				let xModifier = 0;
				let sideCount = 0;
				switch (bonus.getTargetPlayerKey()) {
					case 'player1':
						player1Count++;
						sideCount = player1Count;
						break;
					case 'player2':
						player2Count++;
						sideCount = player2Count;
						xModifier = (this.gameConfiguration.width() / 2);
						if (this.gameData.isTwoVersusTwo()) {
							xModifier = (this.gameConfiguration.width() / 4 * 3);
						}
						break;
					case 'player3':
						player3Count++;
						sideCount = player3Count;
						xModifier = (this.gameConfiguration.width() / 4);
						break;
					case 'player4':
						player4Count++;
						sideCount = player4Count;
						xModifier = (this.gameConfiguration.width() / 2);
						break;
				}
				const x = xModifier + padding + (sideCount * ((this.gameConfiguration.bonusRadius() * 2) + padding));

				if (bonusSprite === null) {
					const bonusSprite = this.engine.drawBonus(
						x,
						this.gameConfiguration.height() - (this.gameConfiguration.groundHeight() / 2),
						BonusFactory.fromClassName(bonus.classNameToActivate(), this),
						this.getBonusProgress(bonus, bonus.getDuration())
					);
					bonusSprite.activationIdentifier = bonus.activationIdentifier();
					this.bonusesGroup.add(bonusSprite);
				} else {
					this.engine.updateBonusProgress(
						x,
						bonusSprite,
						this.getBonusProgress(bonus, bonus.getDuration())
					);
				}
			}
		});
	}

	removeActiveBonusWithIdentifier(activationIdentifier) {
		const bonus = this.activatedBonusSpriteWithIdentifier(activationIdentifier);

		if (bonus) {
			this.bonusesGroup.remove(bonus, true);
		}
	}

	activatedBonusSpriteWithIdentifier(activationIdentifier) {
		for (let i = 0; i < this.bonusesGroup.children.length; i++) {
			if (activationIdentifier === this.bonusesGroup.children[i].activationIdentifier) {
				return this.bonusesGroup.children[i];
			}
		}

		return null;
	}

	getBonusProgress(activeBonus, duration) {
		return 1 - ((this.serverNormalizedTime.getServerTimestamp() - activeBonus.activatedAt) / duration);
	}

	bonusesFullPositionData() {
		let bonusesData = [];

		for (let bonus of this.bonuses) {
			bonusesData.push(this.engine.fullPositionData(bonus));
		}

		return bonusesData;
	}

	sendBonusesPosition() {
		let bonusesData = [];

		for (let bonus of this.bonuses) {
			let bonusPositionData = this.engine.getPositionData(bonus);

			bonusPositionData = Object.assign(bonusPositionData, bonus.data.bonus.dataToStream());

			bonusesData.push([
				bonus.identifier,
				bonusPositionData
			]);
		}

		if (bonusesData.length) {
			this.lastBonusUpdate = this.streamBundler.addToBundledStreamsAtFrequence(
				this.lastBonusUpdate,
				BONUS_INTERVAL,
				'moveClientBonuses',
				bonusesData
			);
		}
	}

	gameIsOnGoing() {
		return this.gameData.isGameStatusStarted();
	}

	moveClientBonus(bonusIdentifier, data) {
		let correspondingBonusSprite = this.getBonusSpriteFromIdentifier(bonusIdentifier);

		if (!this.gameIsOnGoing()) {
			return;
		}

		if (!correspondingBonusSprite) {
			//if bonus has been removed do not recreate
			if (this.removedBonuses.indexOf(bonusIdentifier) !== -1) {
				return;
			}

			data.bonusIdentifier = bonusIdentifier;
			correspondingBonusSprite = this.createBonus(data);
		}

		let serverNormalizedTimestamp = this.serverNormalizedTime.getServerTimestamp();
		this.engine.interpolateMoveTo(correspondingBonusSprite, serverNormalizedTimestamp, data, () => {return this.gameIsOnGoing()});
	}

	onGameStop() {
		for (let bonus of this.bonuses) {
			this.engine.freeze(bonus);
		}
	}

	scaleSmallPlayer(playerKey) {
		this.scalePlayer(playerKey, this.gameConfiguration.smallPlayerScale());
	}

	scaleBigPlayer(playerKey) {
		this.scalePlayer(playerKey, this.gameConfiguration.bigPlayerScale());
	}

	scalePlayer(playerKey, scale) {
		const player = this.game.getPlayerFromKey(playerKey);
		const polygonKey = this.getPolygonKeyFromScale(scale);

		if (!player || !polygonKey) {
			return;
		}

		player.data.currentPolygonKey = polygonKey;

		this.engine.scale(player, scale, scale);
		this.engine.loadPolygon(player, player.data.currentPolygonKey, player.data.currentPolygonObject);
		this.game.setupPlayerBody(player);
	}

	resetPlayerScale(playerKey) {
		const player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		this.scalePlayer(playerKey, player.data.initialScale);
	}

	shiftPlayerShape(playerKey, playerShape) {
		const player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		let textureShape = playerShape;
		if (this.gameConfiguration.overridesCurrentPlayerShape() && this.gameData.isCurrentPlayerKey(playerKey)) {
			textureShape = this.gameConfiguration.currentPlayerShape();
		}
		player.data.currentTextureKey = 'shape-' + textureShape;
		player.data.currentPolygonObject = 'player-' + playerShape;

		this.game.updatePlayerPolygon(player);
	}

	resetPlayerShape(playerKey) {
		const player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		player.data.currentTextureKey = player.data.initialTextureKey;
		player.data.currentPolygonObject = player.data.initialPolygonObject;

		this.game.updatePlayerPolygon(player);
	}

	setPlayerGravity(playerKey, gravity) {
		const player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		player.data.currentGravity = gravity;
		this.game.setupPlayerBody(player);
	}

	resetPlayerGravity(playerKey) {
		const player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		player.data.currentGravity = player.data.initialGravity;
		this.game.setupPlayerBody(player);
	}

	scaleSmallBall() {
		this.scaleBall(this.gameConfiguration.smallBallScale());
	}

	scaleBigBall() {
		this.scaleBall(this.gameConfiguration.bigBallScale());
	}

	scaleBall(scale) {
		const polygonKey = this.getPolygonKeyFromScale(scale);

		if (!polygonKey) {
			return;
		}

		this.game.ball.data.currentPolygonKey = polygonKey;

		this.engine.scale(this.game.ball, scale, scale);
		this.engine.loadPolygon(this.game.ball, this.game.ball.data.currentPolygonKey, this.game.ball.data.currentPolygonObject);
		this.game.setupBallBody();
	}

	resetBallScale() {
		this.scaleBall(this.game.ball.data.initialScale);
	}

	setBallGravity(gravity) {
		this.game.ball.data.currentGravity = gravity;
		this.game.setupBallBody();
	}

	resetBallGravity() {
		this.game.ball.data.currentGravity = this.game.ball.data.initialGravity;
		this.game.setupBallBody();
	}

	changePlayerProperty(playerKey, property, value) {
		const player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		player.data[property] = value;
	}

	hideBall() {
		if (!this.gameData.isUserViewer()) {
			this.engine.setOpacity(this.game.ball, 0);
		} else {
			this.engine.setOpacity(this.game.ball, 0.5);
		}
	}

	showBall() {
		this.engine.setOpacity(this.game.ball, 1);
	}

	hidePlayingPlayer(playerKey) {
		let player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		player.data.isHiddenToHimself = true;

		if (!this.gameData.isUserViewer()) {
			if (this.gameData.isCurrentPlayerKey(playerKey)) {
				//Target player cannot see himself
				this.engine.setOpacity(player, 0);
			} else {
				//Opponent see transparent if he can see
				if (!player.data.isHiddenToOpponent) {
					this.engine.setOpacity(player, 0.5);
				}
			}
		} else {
			//Viewers always see transparent
			this.engine.setOpacity(player, 0.5);
		}
	}

	showPlayingPlayer(playerKey) {
		let player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		player.data.isHiddenToHimself = player.data.initialIsHiddenToHimself;

		if (player.data.isHiddenToHimself) {
			return;
		}

		if (player.data.isHiddenToOpponent) {
			if (
				this.gameData.isCurrentPlayerKey(playerKey) ||
				this.gameData.isUserViewer()
			) {
				this.engine.setOpacity(player, 0.5);
			}
		} else {
			this.engine.setOpacity(player, 1);
		}
	}

	hideFromOpponent(playerKey) {
		let player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		player.data.isHiddenToOpponent = true;

		if (!this.gameData.isUserViewer()) {
			if (!this.gameData.isCurrentPlayerKey(playerKey)) {
				//Opponent cannot see player
				this.engine.setOpacity(player, 0);
			} else {
				//Bonus player see himself transparent if not hidden to himself
				if (!player.data.isHiddenToHimself) {
					this.engine.setOpacity(player, 0.5);
				}
			}
		} else {
			//Viewers always see transparent
			this.engine.setOpacity(player, 0.5);
		}
	}

	showToOpponent(playerKey) {
		let player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		player.data.isHiddenToOpponent = player.data.initialIsHiddenToOpponent;

		if (player.data.isHiddenToOpponent) {
			return;
		}

		if (player.data.isHiddenToHimself) {
			if (!this.gameData.isCurrentPlayerKey(playerKey)) {
				this.engine.setOpacity(player, 0.5);
			}
		} else {
			this.engine.setOpacity(player, 1);
		}
	}

	freezePlayer(playerKey) {
		const player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		this.engine.freeze(player);
		player.data.currentMass = PLAYER_FROZEN_MASS;

		this.game.setupPlayerBody(player);
	}

	unFreezePlayer(playerKey) {
		const player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		this.engine.unfreeze(player);
		player.data.currentMass = player.data.initialMass;

		this.game.setupPlayerBody(player);
	}

	drawCloud() {
		if (this.clouds.length === 0) {
			this.generateClouds();
		}

		for (let cloud of this.clouds) {
			this.engine.animateSetOpacity(cloud, cloud.opacity, this.engine.getOpacity(cloud), 250);
		}
	}

	generateClouds() {
		this.clouds = [
			this.createCloud(
				this.gameConfiguration.width() / 4,
				.35 * this.gameConfiguration.height(),
				{
					scale: 0.00119 * this.gameConfiguration.width(),
					angle: 56,
					opacity: 0.925
				}
			),
			this.createCloud(
				this.gameConfiguration.width() / 4 * 3,
				.35 * this.gameConfiguration.height(),
				{
					scale: 0.00119 * this.gameConfiguration.width(),
					angle: -63,
					opacity: 0.925
				}
			),
			this.createCloud(
				this.gameConfiguration.width() / 4 * 2,
				.35 * this.gameConfiguration.height(),
				{
					scale: 0.00131 * this.gameConfiguration.width(),
					angle: 37,
					opacity: 0.925
				}
			)
		];
	}

	hideCloud() {
		for (let cloud of this.clouds) {
			this.engine.animateSetOpacity(cloud, 0, this.engine.getOpacity(cloud), 250);
		}
	}

	createCloud(xPosition, yPosition, layer) {
		const cloud = this.engine.addImage(
			xPosition,
			yPosition,
			'cloud',
			undefined,
			this.bonusZIndexGroup
		);
		cloud.createdAt = (new Date()).getTime();
		this.engine.sortBonusGroup(this.bonusZIndexGroup);
		cloud.opacity = layer.opacity;
		if (layer.angle) {
			cloud.angle = layer.angle;
		}
		this.engine.setOpacity(cloud, 0);
		this.engine.setAnchor(cloud, 0.5);
		if (layer.scale) {
			this.engine.scale(cloud, layer.scale, layer.scale);
		}

		return cloud;
	}

	drawSmokeBomb(smokeBombIdentifier, xPosition, yPosition) {
		if (this.smokeBomb === undefined) {
			this.smokeBomb = {};
		}
		this.smokeBomb[smokeBombIdentifier] = [];

		const cloud = this.createCloud(xPosition, yPosition, {angle: getRandomInt(-180, 180), opacity: 0.925});

		this.engine.animateSetOpacity(cloud, cloud.opacity, this.engine.getOpacity(cloud), 250);
		this.smokeBomb[smokeBombIdentifier].push(cloud);
	}

	hideSmokeBomb(smokeBombIdentifier) {
		if (this.smokeBomb[smokeBombIdentifier]) {
			for (let smokeBomb of this.smokeBomb[smokeBombIdentifier]) {
				this.engine.animateSetOpacity(smokeBomb, 0, this.engine.getOpacity(smokeBomb), 250);

				this.engine.createTimer(250, () => {
					smokeBomb.destroy();
				}, this).start();
			}
		}
	}

	isInvincible(playerKey) {
		return (
			this.game.getPlayerFromKey(playerKey) &&
			this.game.getPlayerFromKey(playerKey).data.isInvincible
		);
	}

	killPlayer(playerKey) {
		if (this.game.canAddGamePoint() && this.game.getPlayerFromKey(playerKey) && !this.isInvincible(playerKey)) {
			this.killAndRemovePlayer(playerKey);

			//Send to client
			const serverTimestamp = this.serverNormalizedTime.getServerTimestamp();
			this.streamBundler.emitStream(
				'killPlayer-' + this.game.gameId,
				{
					playerKey: playerKey,
					killedAt: serverTimestamp
				},
				serverTimestamp
			);
		}
	}

	killAndRemovePlayer(playerKey) {
		if (!this.killingPlayer) {
			this.killingPlayer = true;
			this.resetBonusesForPlayerKey(playerKey);
			this.engine.kill(this.game.getPlayerFromKey(playerKey));
			this.killingPlayer = false;
		}
	}

	revivePlayer(playerKey) {
		const player = this.game.getPlayerFromKey(playerKey);
		let teammatePlayers = [];

		if (this.game.isPlayerHostSide(player)) {
			teammatePlayers = this.game.hostPlayerKeys(false);
		} else if (this.game.isPlayerClientSide(player)) {
			teammatePlayers = this.game.clientPlayerKeys(false);
		}

		for (let teammatePlayerKey of teammatePlayers) {
			const teammatePlayer = this.game.getPlayerFromKey(teammatePlayerKey);

			if (teammatePlayer && !this.engine.isAlive(teammatePlayer)) {
				this.engine.revive(
					teammatePlayer,
					this.game.getPlayerInitialXFromKey(teammatePlayer.data.key, this.game.isPlayerHostSide(teammatePlayer)),
					this.gameConfiguration.playerInitialY()
				);
				this.game.resetPlayer(teammatePlayer);
				return;
			}
		}
	}

	scaleGravity(scale) {
		this.engine.setWorldGravity(this.gameConfiguration.worldGravity() * scale);
	}

	resetGravityScale() {
		this.engine.setWorldGravity(this.gameConfiguration.worldGravity());
	}

	createRobot(activatorPlayerKey, robotId) {
		const activatorPlayer = this.game.getPlayerFromKey(activatorPlayerKey);

		this.gameData.addRobot(robotId);

		if (this.game.isPlayerHostSide(activatorPlayer)) {
			this.robots[robotId] = this.game.createHostPlayer(robotId);
		} else {
			this.robots[robotId] = this.game.createClientPlayer(robotId);
		}

		this.robots[robotId].data.isRobot = true;
		this.game.addPlayerCanJumpOnBodies(this.robots[robotId]);
		this.game.artificialIntelligence.addComputerWithKey(robotId, false);
	}

	removeRobot(robotId) {
		if (this.robots[robotId]) {
			this.killAndRemovePlayer(robotId);
			delete this.robots[robotId];
		}
	}

	robotHasBeenKilled(robotId) {
		return (this.robots[robotId] && !this.engine.isAlive(this.robots[robotId]));
	}

	regenerateLastBonusCreatedAndFrequenceTime() {
		this.lastBonusCreated = Date.now();
		this.bonusFrequenceTime = getRandomInt(
			this.gameConfiguration.bonusSpawnInitialMinimumFrequence(),
			this.gameConfiguration.bonusSpawnInitialMaximumFrequence()
		);
	}

	createBonusIfTimeHasElapsed() {
		let frequenceTime = this.bonusFrequenceTime - Math.round((Date.now() - this.lastGameRespawn) / 10);

		if (frequenceTime < this.gameConfiguration.bonusSpawnMinimumFrequence()) {
			frequenceTime = this.gameConfiguration.bonusSpawnMinimumFrequence();
		}

		if (
			this.game.gameResumed &&
			Date.now() - this.lastBonusCreated >= frequenceTime &&
			this.bonuses.length < this.gameConfiguration.maximumBonusesOnScreen()
		) {
			this.createRandomBonus();
		}
	}

	createRandomBonus() {
		let bonus = BonusFactory.randomBonus(this, this.gameConfiguration);
		let data = bonus.dataToStream();
		data.initialX = this.gameConfiguration.width() / 2 + Random.choice([-6, +6]);

		//Create the bonus for host
		this.createBonus(data);
		this.regenerateLastBonusCreatedAndFrequenceTime();
		//Add to bundled stream to send to client
		this.streamBundler.addStreamToBundle('createBonus', data);

		Meteor.call(
			'createBonus',
			this.game.gameId,
			data
		);
	}

	createBonus(data) {
		const bonus = BonusFactory.fromData(data, this);
		const bonusSprite = this.engine.addBonus(
			data.initialX,
			BONUS_GRAVITY_SCALE,
			bonus,
			this.bonusZIndexGroup
		);

		bonusSprite.identifier = data.bonusIdentifier;
		bonus.createdAt = data.createdAt;
		bonusSprite.data.bonus = bonus;

		this.bonuses.push(bonusSprite);

		this.game.collisions.setupBonusBody(bonusSprite, this.onBonusCollidesPlayer, this);

		return bonusSprite;
	}

	onBonusCollidesPlayer(bonusSprite, player) {
		if (this.gameData.isUserCreator() && player.sprite.data.canActivateBonuses && bonusSprite.data.bonus.canActivate()) {
			const playerKey = this.engine.getKey(player);
			const activatedAt = this.serverNormalizedTime.getServerTimestamp();
			const payload = {
				identifier: bonusSprite.identifier,
				player: playerKey,
				activatedAt: activatedAt,
				x: this.engine.getXPosition(bonusSprite),
				y: this.engine.getYPosition(bonusSprite)
			};

			bonusSprite.data.bonus.beforeActivation(payload);
			payload.beforeActivationData = bonusSprite.data.bonus.beforeActivationData();

			//Send to client
			this.streamBundler.emitStream(
				'activateBonus-' + this.game.gameId,
				payload,
				this.serverNormalizedTime.getServerTimestamp()
			);
			//Activate bonus
			this.activateBonus(
				bonusSprite.identifier,
				playerKey,
				activatedAt,
				this.engine.getXPosition(bonusSprite),
				this.engine.getYPosition(bonusSprite),
				payload.beforeActivationData
			);
		}
	}

	activateBonus(bonusIdentifier, playerKey, activatedAt, x, y, beforeActivationData) {
		const correspondingBonusSprite = this.getBonusSpriteFromIdentifier(bonusIdentifier);

		if (!correspondingBonusSprite) {
			return;
		}

		const bonus = correspondingBonusSprite.data.bonus;
		let bonusToActivate = bonus.bonusToActivate();

		if (this.gameConfiguration.overridesBonusDuration()) {
			bonusToActivate.durationMilliseconds = this.gameConfiguration.bonusDuration();
		}

		bonusToActivate.reassignBeforeActivationData(beforeActivationData);
		bonusToActivate.activate(playerKey, activatedAt);
		bonusToActivate.start();

		//Show bonus activation animation
		this.engine.activateAnimationBonus(x, y, bonusToActivate);

		this.deactivateSimilarBonusForPlayerKey(bonusToActivate, playerKey);

		this.activeBonuses.push(bonusToActivate);
		if (this.gameData.isUserCreator()) {
			Meteor.call(
				'addActiveBonusToGame',
				this.game.gameId,
				activatedAt,
				bonus.getClassName(),
				bonusToActivate.activationData()
			);
		}

		this.removeBonusSprite(bonusIdentifier);
	}

	removeBonusSprite(bonusIdentifier) {
		const bonuses = [];

		for (let bonus of this.bonuses) {
			if (bonus.identifier === bonusIdentifier) {
				this.removedBonuses.push(bonus.identifier);
				bonus.destroy();
			} else {
				bonuses.push(bonus);
			}
		}

		this.bonuses = bonuses;
	}

	resetBonusesForPlayerKey(playerKey) {
		for (let bonus of this.activeBonuses) {
			if (bonus.getTargetPlayerKey() === playerKey && bonus.shouldBeRemovedWhenKilling()) {
				bonus.stop();

				this.removeActiveBonusWithIdentifier(bonus.activationIdentifier());
			}
		}
	}

	deactivateSimilarBonusForPlayerKey(newBonus, playerKey) {
		for (let bonus of this.activeBonuses) {
			if (bonus.isSimilarBonusForPlayerKey(newBonus, playerKey)) {
				bonus.deactivate();
			}
		}
	}

	checkBonuses() {
		const stillActiveBonuses = [];

		for (let bonus of this.activeBonuses) {
			if (bonus.check(this.serverNormalizedTime.getServerTimestamp())) {
				stillActiveBonuses.push(bonus);
			} else {
				if (this.gameData.isUserCreator()) {
					Meteor.call('removeActiveBonusFromGame', this.game.gameId, bonus.getIdentifier());
				}

				this.removeActiveBonusWithIdentifier(bonus.activationIdentifier());
			}
		}

		this.activeBonuses = stillActiveBonuses;
	}

	reset() {
		//Remove bonus sprites
		for (let bonus of this.bonuses) {
			this.removedBonuses.push(bonus.identifier);
			bonus.destroy();
		}
		this.bonuses = [];

		//Remove active bonuses
		for (let bonus of this.activeBonuses) {
			bonus.stop();

			this.removeActiveBonusWithIdentifier(bonus.activationIdentifier());
		}
		this.activeBonuses = [];
	}
}
