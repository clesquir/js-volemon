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
	BIG_SCALE_PHYSICS_DATA
} from '/imports/api/games/constants.js';
import {
	BONUS_INTERVAL,
	BONUS_MINIMUM_FREQUENCE,
	BONUS_MINIMUM_INTERVAL,
	BONUS_MAXIMUM_INTERVAL
} from '/imports/api/games/emissionConstants.js';
import BonusFactory from '/imports/api/games/BonusFactory.js';
import {getRandomInt, getRandomFloat, getUTCTimeStamp} from '/imports/lib/utils.js';

export default class GameBonus {

	/**
	 * @param {Game} game
	 * @param {PhaserEngine} engine
	 * @param {GameData} gameData
	 * @param {GameStreamBundler} gameStreamBundler
	 * @param {ServerNormalizedTime} serverNormalizedTime
	 */
	constructor(game, engine, gameData, gameStreamBundler, serverNormalizedTime) {
		this.game = game;
		this.engine = engine;
		this.gameData = gameData;
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
		this.engine.loadImage('cloud', 'assets/cloud.png');
		this.engine.loadImage('dark-cloud', 'assets/dark-cloud.png');
		this.engine.loadImage('white-cloud', 'assets/white-cloud.png');
		this.engine.loadImage('bonus-environment', 'assets/bonus-environment.png');
		this.engine.loadImage('bonus-environment-positive', 'assets/bonus-environment-positive.png');
		this.engine.loadImage('bonus-environment-negative', 'assets/bonus-environment-negative.png');
		this.engine.loadImage('bonus-target', 'assets/bonus-target.png');
		this.engine.loadImage('bonus-target-positive', 'assets/bonus-target-positive.png');
		this.engine.loadImage('bonus-target-negative', 'assets/bonus-target-negative.png');
		this.engine.loadSpriteSheet('bonus-icons', 'assets/bonus-icons.png', 20, 20);
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
		player.activeGravity = null;
		player.isInvincible = false;
	}

	isPlayerInvincible(player) {
		return player.isInvincible;
	}

	resumeGame() {
		this.regenerateLastBonusCreatedAndFrequenceTime();
		this.applyActiveBonuses();
		this.lastGameRespawn = getUTCTimeStamp();
	}

	onUpdateGameOnGoing() {
		this.checkBonuses();
		this.updatePlayerBonuses();

		if (this.gameData.isUserHost() && this.gameData.hasBonuses) {
			this.createBonusIfTimeHasElapsed();
			this.sendBonusesPosition();
		}
	}

	applyActiveBonuses() {
		for (let activeBonus of this.gameData.activeBonuses) {
			let bonus = BonusFactory.fromClassName(activeBonus.activatedBonusClass, this);
			bonus.activate(activeBonus.targetPlayerKey, activeBonus.activatedAt);
			bonus.start();
			this.activeBonuses.push(bonus);
		}
	}

	updatePlayerBonuses() {
		this.bonusesGroup.removeAll(true);

		let padding = 5;
		let player1Count = 0;
		let player2Count = 0;

		for (let activeBonus of this.gameData.activeBonuses) {
			let bonus = BonusFactory.fromClassName(activeBonus.activatedBonusClass, this);

			switch (activeBonus.targetPlayerKey) {
				case 'player1':
					player1Count++;
					this.bonusesGroup.add(this.engine.drawBonus(
						padding + (player1Count * ((BONUS_RADIUS * 2) + padding)),
						this.ySize - (this.groundHeight / 2),
						bonus,
						this.getBonusProgress(activeBonus, bonus.getDuration())
					));
					break;
				case 'player2':
					player2Count++;
					this.bonusesGroup.add(this.engine.drawBonus(
						(this.xSize / 2) + padding + (player2Count * ((BONUS_RADIUS * 2) + padding)),
						this.ySize - (this.groundHeight / 2),
						bonus,
						this.getBonusProgress(activeBonus, bonus.getDuration())
					));
					break;
			}
		}
	}

	getBonusProgress(activeBonus, duration) {
		return 1 - ((this.serverNormalizedTime.getServerNormalizedTimestamp() - activeBonus.activatedAt) / duration);
	}

	sendBonusesPosition() {
		let bonusesData = [];

		for (let bonus of this.bonuses) {
			let bonusPositionData = this.engine.getPositionData(bonus);

			bonusPositionData = Object.assign(bonusPositionData, bonus.bonus.dataToStream());
			bonusPositionData['timestamp'] = this.serverNormalizedTime.getServerNormalizedTimestamp();

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

		data = this.engine.interpolateFromTimestamp(this.serverNormalizedTime.getServerNormalizedTimestampForInterpolation(), correspondingBonusSprite, data);

		this.engine.move(correspondingBonusSprite, data);
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

		this.engine.scale(player, scale, scale);
		this.engine.loadPolygon(player, polygonKey, player.polygonObject);
		this.game.setupPlayerBody(player);
	}

	resetPlayerScale(playerKey) {
		const player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		this.scalePlayer(playerKey, 1);
	}

	setPlayerGravity(playerKey, gravity) {
		const player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		if (!player.isFrozen) {
			this.engine.setGravity(player, gravity);
		}
	}

	resetPlayerGravity(playerKey) {
		const player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		if (!player.isFrozen) {
			this.engine.setGravity(player, player.initialGravity);
		}
	}

	scaleBall(scale) {
		const polygonKey = this.getPolygonKeyFromScale(scale);

		if (!polygonKey) {
			return;
		}

		this.engine.scale(this.game.ball, scale, scale);
		this.engine.loadPolygon(this.game.ball, polygonKey, this.game.ball.polygonObject);
		this.game.setupBallBody();
	}

	resetBallScale() {
		this.scaleBall(NORMAL_SCALE_BONUS);
	}

	setBallGravity(gravity) {
		this.engine.setGravity(this.game.ball, gravity);
	}

	resetBallGravity() {
		this.setBallGravity(this.game.ball.initialGravity);
	}

	changePlayerProperty(playerKey, property, value) {
		const player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		player[property] = value;
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

		this.engine.setMass(player, 2000);
		this.engine.freeze(player);
		player.isFrozen = true;
	}

	unFreezePlayer(playerKey) {
		const player = this.game.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		this.engine.setMass(player, player.initialMass);
		if (player.activeGravity !== null) {
			this.engine.setGravity(player, player.activeGravity);
		} else {
			this.engine.setGravity(player, player.initialGravity);
		}
		player.isFrozen = false;
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
				let cloud = this.engine.addSprite(x, 200, layer, undefined);
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
		this.bonusFrequenceTime = getRandomInt(BONUS_MINIMUM_INTERVAL, BONUS_MAXIMUM_INTERVAL);
	}

	createBonusIfTimeHasElapsed() {
		let frequenceTime = this.bonusFrequenceTime - Math.round((getUTCTimeStamp() - this.lastGameRespawn) / 10);

		if (frequenceTime < BONUS_MINIMUM_FREQUENCE) {
			frequenceTime = BONUS_MINIMUM_FREQUENCE;
		}

		if (getUTCTimeStamp() - this.lastBonusCreated >= frequenceTime) {
			let bonus = BonusFactory.randomBonus(this);
			let data = bonus.dataToStream();
			data.initialX = this.xSize / 2 + Random.choice([-6, +6]);

			//Create the bonus the host
			this.createBonus(data);
			this.regenerateLastBonusCreatedAndFrequenceTime();
			//Add to bundled stream to send
			this.gameStreamBundler.addStreamToBundle('createBonus', data);
		}
	}

	createBonus(data) {
		const bonus = BonusFactory.fromData(data, this);
		const bonusSprite = this.engine.addBonus(
			data.initialX, BONUS_GRAVITY_SCALE, this.bonusMaterial, this.bonusCollisionGroup, bonus
		);

		bonusSprite.identifier = data.bonusIdentifier;
		bonusSprite.bonus = bonus;

		this.bonuses.push(bonusSprite);

		this.game.collidesWithPlayer(bonusSprite, (bonusItem, player) => {
			if (this.gameData.isUserHost()) {
				const activatedAt = this.serverNormalizedTime.getServerNormalizedTimestamp();
				//Activate bonus
				this.activateBonus(bonusSprite.identifier, this.engine.getKey(player), activatedAt);
				//Send to client
				this.gameStreamBundler.emitStream('activateBonus-' + this.game.gameId, {identifier: bonusSprite.identifier, player: this.engine.getKey(player), activatedAt: activatedAt});
			}
		}, this);
		this.game.collidesWithNetHitDelimiter(bonusSprite);
		this.game.collidesWithGroundHitDelimiter(bonusSprite);
		this.game.collidesWithBall(bonusSprite);
		this.engine.collidesWith(bonusSprite, this.bonusCollisionGroup);

		return bonusSprite;
	}

	activateBonus(bonusIdentifier, playerKey, activatedAt) {
		const correspondingBonusSprite = this.getBonusSpriteFromIdentifier(bonusIdentifier);

		if (!correspondingBonusSprite) {
			return;
		}

		const bonus = correspondingBonusSprite.bonus;
		let bonusToActivate = bonus.bonusToActivate();

		bonusToActivate.activate(playerKey, activatedAt);
		bonusToActivate.start();

		this.deactivateSimilarBonusForPlayerKey(bonusToActivate, playerKey);

		this.activeBonuses.push(bonusToActivate);
		if (this.gameData.isUserHost()) {
			Meteor.call(
				'addActiveBonusToGame',
				this.game.gameId,
				bonusToActivate.getIdentifier(),
				bonusToActivate.classNameToActivate(),
				activatedAt,
				bonusToActivate.getTargetPlayerKey(),
				bonusToActivate.getClassName(),
				bonusToActivate.getActivatorPlayerKey(),
				bonus.getClassName()
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
			if (bonus.check(this.serverNormalizedTime.getServerNormalizedTimestamp())) {
				stillActiveBonuses.push(bonus);
			} else if (this.gameData.isUserHost()) {
				Meteor.call('removeActiveBonusFromGame', this.game.gameId, bonus.getIdentifier());
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
		}
		this.activeBonuses = [];
	}

}
