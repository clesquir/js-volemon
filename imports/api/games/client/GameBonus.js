import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import {
	GAME_X_SIZE,
	GAME_Y_SIZE,
	GAME_GROUND_HEIGHT,
	BONUS_RADIUS,
	BONUS_GRAVITY_SCALE,
	NORMAL_SCALE_BONUS,
	SMALL_SCALE_PLAYER_BONUS,
	SMALL_SCALE_BALL_BONUS,
	BIG_SCALE_BONUS,
	NORMAL_SCALE_PHYSICS_DATA,
	SMALL_SCALE_PHYSICS_DATA,
	BIG_SCALE_PHYSICS_DATA,
	PLAYER_FROZEN_MASS
} from '/imports/api/games/constants.js';
import {
	BONUS_INTERVAL
} from '/imports/api/games/emissionConstants.js';
import BonusFactory from '/imports/api/games/BonusFactory.js';
import {getRandomInt, getRandomFloat, getUTCTimeStamp} from '/imports/lib/utils.js';

export default class GameBonus {
	/**
	 * @param {Game} game
	 * @param {PhaserEngine} engine
	 * @param {GameData} gameData
	 * @param {GameConfiguration} gameConfiguration
	 * @param {GameStreamBundler} gameStreamBundler
	 * @param {ServerNormalizedTime} serverNormalizedTime
	 */
	constructor(game, engine, gameData, gameConfiguration, gameStreamBundler, serverNormalizedTime) {
		this.game = game;
		this.engine = engine;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.gameStreamBundler = gameStreamBundler;
		this.serverNormalizedTime = serverNormalizedTime;
		this.lastBonusUpdate = 0;
		this.lastBonusCreated = 0;
		this.bonusFrequenceTime = 0;
		this.lastGameRespawn = 0;
		this.bonuses = [];
		this.clouds = [];
		this.activeBonuses = [];

		this.xSize = GAME_X_SIZE;
		this.ySize = GAME_Y_SIZE;
		this.groundHeight = GAME_GROUND_HEIGHT;
	}

	playerInitialShapeFromKey(playerKey) {
		return this.game.playerInitialShapeFromKey(playerKey);
	}

	playerCurrentShapeFromKey(playerKey) {
		return this.game.playerCurrentShapeFromKey(playerKey);
	}

	getPolygonKeyFromScale(scale) {
		let polygonKey = null;

		switch (scale) {
			case NORMAL_SCALE_BONUS:
				polygonKey = NORMAL_SCALE_PHYSICS_DATA;
				break;
			case SMALL_SCALE_PLAYER_BONUS:
			case SMALL_SCALE_BALL_BONUS:
				polygonKey = SMALL_SCALE_PHYSICS_DATA;
				break;
			case BIG_SCALE_BONUS:
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

	preload() {
		this.engine.loadImage('cloud', '/assets/cloud.png');
		this.engine.loadImage('dark-cloud', '/assets/dark-cloud.png');
		this.engine.loadImage('white-cloud', '/assets/white-cloud.png');
		this.engine.loadImage('bonus-environment', '/assets/bonus-environment.png');
		this.engine.loadImage('bonus-environment-positive', '/assets/bonus-environment-positive.png');
		this.engine.loadImage('bonus-environment-negative', '/assets/bonus-environment-negative.png');
		this.engine.loadImage('bonus-target', '/assets/bonus-target.png');
		this.engine.loadImage('bonus-target-positive', '/assets/bonus-target-positive.png');
		this.engine.loadImage('bonus-target-negative', '/assets/bonus-target-negative.png');
		this.engine.loadSpriteSheet('bonus-icons', '/assets/bonus-icons.png', 20, 20);
	}

	createCollisionGroupsAndMaterials() {
		this.bonusCollisionGroup = this.engine.createCollisionGroup();
		this.bonusMaterial = this.engine.createMaterial('bonus');

		this.engine.createWorldContactMaterial(this.bonusMaterial, {restitution: 1});
		this.game.createContactMaterialWithNetDelimiter(this.bonusMaterial, {restitution: 0.7});
		this.game.createContactMaterialWithGroundDelimiter(this.bonusMaterial, {restitution: 1});
	}

	createComponents() {
		this.bonusesGroup = this.engine.addGroup();
	}

	collidesWithBonus(sprite, callback, scope) {
		this.engine.collidesWith(sprite, this.bonusCollisionGroup, callback, scope);
	}

	initPlayerProperties(player) {
		player.data.isInvincible = false;
	}

	isPlayerInvincible(player) {
		return player.data.isInvincible;
	}

	resumeGame() {
		this.regenerateLastBonusCreatedAndFrequenceTime();
		this.applyActiveBonuses();
		this.lastGameRespawn = getUTCTimeStamp();
	}

	onUpdateGameOnGoing() {
		this.checkBonuses();
		this.updatePlayerBonuses();

		if (this.gameData.isUserHost()) {
			this.createBonusIfTimeHasElapsed();
			this.sendBonusesPosition();
		}
	}

	applyActiveBonuses() {
		for (let activeBonus of this.gameData.activeBonuses) {
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

		this.activeBonuses.forEach((bonus) => {
			if (bonus.getTargetPlayerKey()) {
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
						xModifier = (this.xSize / 2);
						sideCount = player2Count;
						break;
				}
				const x = xModifier + padding + (sideCount * ((BONUS_RADIUS * 2) + padding));

				if (bonusSprite === null) {
					const bonusSprite = this.engine.drawBonus(
						x,
						this.ySize - (this.groundHeight / 2),
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

	sendBonusesPosition() {
		let bonusesData = [];

		for (let bonus of this.bonuses) {
			let bonusPositionData = this.engine.getPositionData(bonus);

			bonusPositionData = Object.assign(bonusPositionData, bonus.data.bonus.dataToStream());
			bonusPositionData['timestamp'] = this.serverNormalizedTime.getServerTimestamp();

			bonusesData.push([
				bonus.identifier,
				bonusPositionData
			]);
		}

		if (bonusesData.length) {
			this.lastBonusUpdate = this.gameStreamBundler.addToBundledStreamsAtFrequence(
				this.lastBonusUpdate,
				BONUS_INTERVAL,
				'moveClientBonuses',
				bonusesData
			);
		}
	}

	moveClientBonus(bonusIdentifier, data) {
		let correspondingBonusSprite = this.getBonusSpriteFromIdentifier(bonusIdentifier);

		if (!correspondingBonusSprite) {
			data.bonusIdentifier = bonusIdentifier;
			correspondingBonusSprite = this.createBonus(data);
		}

		let serverNormalizedTimestamp = this.serverNormalizedTime.getServerTimestamp();
		this.engine.interpolateMoveTo(correspondingBonusSprite, serverNormalizedTimestamp, data);
	}

	onGameStop() {
		for (let bonus of this.bonuses) {
			this.engine.freeze(bonus);
		}
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

		this.scalePlayer(playerKey, NORMAL_SCALE_BONUS);
	}

	shiftPlayerShape(playerKey, playerShape) {
		const player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		player.data.currentTextureKey = 'shape-' + playerShape;
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
		this.scaleBall(NORMAL_SCALE_BONUS);
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

		player.isHiddenToHimself = true;

		if (!this.gameData.isUserViewer()) {
			if (
				this.gameData.isUserHostTargetPlayer(playerKey) ||
				this.gameData.isUserClientTargetPlayer(playerKey)
			) {
				//Target player cannot see himself
				this.engine.setOpacity(player, 0);
			} else {
				//Opponent see transparent if he can see
				if (!player.isHiddenToOpponent) {
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

		player.isHiddenToHimself = false;

		if (player.isHiddenToOpponent) {
			if (
				this.gameData.isUserHostTargetPlayer(playerKey) ||
				this.gameData.isUserClientTargetPlayer(playerKey) ||
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

		player.isHiddenToOpponent = true;

		if (!this.gameData.isUserViewer()) {
			if (
				this.gameData.isUserHostNotTargetPlayer(playerKey) ||
				this.gameData.isUserClientNotTargetPlayer(playerKey)
			) {
				//Opponent cannot see player
				this.engine.setOpacity(player, 0);
			} else {
				//Bonus player see himself transparent if not hidden to himself
				if (!player.isHiddenToHimself) {
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

		player.isHiddenToOpponent = false;

		if (player.isHiddenToHimself) {
			if (
				this.gameData.isUserHostNotTargetPlayer(playerKey) ||
				this.gameData.isUserClientNotTargetPlayer(playerKey) ||
				this.gameData.isUserViewer()
			) {
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
		if (!this.cloudBonus) {
			this.cloudBonus = this.engine.addTileSprite(this.xSize / 2, this.ySize / 2, this.xSize, this.ySize, 'cloud');
			this.engine.setStatic(this.cloudBonus, true);
			this.engine.setOpacity(this.cloudBonus, 0);

			this.generateClouds();
		}

		this.engine.animateSetOpacity(this.cloudBonus, 0.7, this.engine.getOpacity(this.cloudBonus), 250);
		for (let cloud of this.clouds) {
			this.engine.rotateLeft(cloud, cloud.rotateSpeed);
			this.engine.animateSetOpacity(cloud, cloud.opacity, this.engine.getOpacity(cloud), 250);
		}
	}

	generateClouds() {
		this.clouds = [];

		const layers = ['white-cloud', 'white-cloud', 'dark-cloud', 'dark-cloud'];
		for (let i = 1; i < 6; i++) {
			let x = GAME_X_SIZE / 6 * i;

			for (let layer of layers) {
				let scale = getRandomFloat(1, 2);
				let cloud = this.engine.addSprite(x, 200, layer);
				cloud.opacity = getRandomFloat(0.25, 0.30);
				cloud.rotateSpeed = getRandomFloat(-6, 6);
				this.engine.setStatic(cloud, true);
				this.engine.setOpacity(cloud, 0);
				this.engine.setAnchor(cloud, 0.5);
				this.engine.setFixedRotation(cloud, false);
				this.engine.scale(cloud, scale, scale);
				this.clouds.push(cloud);
			}
		}
	}

	hideCloud() {
		for (let cloud of this.clouds) {
			this.engine.animateSetOpacity(cloud, 0, this.engine.getOpacity(cloud), 250);
			this.engine.rotateLeft(cloud, 0);
		}
		this.engine.animateSetOpacity(this.cloudBonus, 0, this.engine.getOpacity(this.cloudBonus), 250);
	}

	regenerateLastBonusCreatedAndFrequenceTime() {
		this.lastBonusCreated = getUTCTimeStamp();
		this.bonusFrequenceTime = getRandomInt(
			this.gameConfiguration.bonusSpawnInitialMinimumFrequence(),
			this.gameConfiguration.bonusSpawnInitialMaximumFrequence()
		);
	}

	createBonusIfTimeHasElapsed() {
		let frequenceTime = this.bonusFrequenceTime - Math.round((getUTCTimeStamp() - this.lastGameRespawn) / 10);

		if (frequenceTime < this.gameConfiguration.bonusSpawnMinimumFrequence()) {
			frequenceTime = this.gameConfiguration.bonusSpawnMinimumFrequence();
		}

		if (getUTCTimeStamp() - this.lastBonusCreated >= frequenceTime) {
			this.createRandomBonus();
		}
	}

	createRandomBonus() {
		let bonus = BonusFactory.randomBonus(this, this.gameConfiguration);
		let data = bonus.dataToStream();
		data.initialX = this.xSize / 2 + Random.choice([-6, +6]);

		//Create the bonus for host
		this.createBonus(data);
		this.regenerateLastBonusCreatedAndFrequenceTime();
		//Add to bundled stream to send to client
		this.gameStreamBundler.addStreamToBundle('createBonus', data);

		Meteor.call(
			'createBonus',
			this.game.gameId,
			data
		);
	}

	createBonus(data) {
		const bonus = BonusFactory.fromData(data, this);
		const bonusSprite = this.engine.addBonus(
			data.initialX, BONUS_GRAVITY_SCALE, this.bonusMaterial, this.bonusCollisionGroup, bonus
		);

		bonusSprite.identifier = data.bonusIdentifier;
		bonusSprite.data.bonus = bonus;

		this.bonuses.push(bonusSprite);

		this.game.collidesWithPlayer(bonusSprite, (bonusItem, player) => {
			if (this.gameData.isUserHost()) {
				const playerKey = this.engine.getKey(player);
				const activatedAt = this.serverNormalizedTime.getServerTimestamp();

				bonusSprite.data.bonus.beforeActivation(playerKey, activatedAt);
				const beforeActivationData = bonusSprite.data.bonus.beforeActivationData();

				//Send to client
				this.gameStreamBundler.emitStream(
					'activateBonus-' + this.game.gameId,
					{
						identifier: bonusSprite.identifier,
						player: playerKey,
						activatedAt: activatedAt,
						x: this.engine.getXPosition(bonusSprite),
						y: this.engine.getYPosition(bonusSprite),
						beforeActivationData: beforeActivationData
					}
				);
				//Activate bonus
				this.activateBonus(
					bonusSprite.identifier,
					playerKey,
					activatedAt,
					this.engine.getXPosition(bonusSprite),
					this.engine.getYPosition(bonusSprite),
					beforeActivationData
				);
			}
		}, this);
		this.game.collidesWithNetHitDelimiter(bonusSprite);
		this.game.collidesWithGroundHitDelimiter(bonusSprite);
		this.game.collidesWithBall(bonusSprite);
		this.engine.collidesWith(bonusSprite, this.bonusCollisionGroup);

		return bonusSprite;
	}

	activateBonus(bonusIdentifier, playerKey, activatedAt, x, y, beforeActivationData) {
		const correspondingBonusSprite = this.getBonusSpriteFromIdentifier(bonusIdentifier);

		if (!correspondingBonusSprite) {
			return;
		}

		const bonus = correspondingBonusSprite.data.bonus;
		let bonusToActivate = bonus.bonusToActivate();

		bonusToActivate.reassignBeforeActivationData(beforeActivationData);
		bonusToActivate.activate(playerKey, activatedAt);
		bonusToActivate.start();

		//Show bonus activation animation
		this.engine.activateAnimationBonus(x, y, bonusToActivate);

		this.deactivateSimilarBonusForPlayerKey(bonusToActivate, playerKey);

		this.activeBonuses.push(bonusToActivate);
		if (this.gameData.isUserHost()) {
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
				bonus.destroy();
			} else {
				bonuses.push(bonus);
			}
		}

		this.bonuses = bonuses;
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
				if (this.gameData.isUserHost()) {
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
