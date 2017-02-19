import Game from '/imports/game/Game.js';
import BonusFactory from '/imports/game/BonusFactory.js';
import { Config } from '/imports/lib/config.js';
import { Constants } from '/imports/lib/constants.js';
import { getRandomInt, getUTCTimeStamp, isEmpty } from '/imports/lib/utils.js';

export default class ServerGame extends Game {

	constructor(...args) {
		super(...args);
		this.lastBallUpdate = 0;
		this.lastBonusCreated = 0;
		this.lastBonusUpdate = 0;
		this.bonusFrequenceTime = 0;
		this.lastGameRespawn = 0;
	}

	resumeIfGameIsOnGoing() {
		super.resumeIfGameIsOnGoing();
		this.regenerateLastBonusCreatedAndFrequenceTime();
		this.lastGameRespawn = this.getServerNormalizedTimestamp();
	}

	updateGame() {
		this.resetBundledStreams();

		this.applyIfBallIsFrozen();

		if (this.isGameOnGoing()) {
			this.engine.constrainVelocity(this.ball, 900);
			this.sendBallPosition();

			if (this.gameHasBonuses) {
				this.checkBonuses();
				this.createBonusIfTimeHasElapsed();
				this.sendBonusesPosition();
			}
		}

		this.stopGameOnTimeout();

		this.sendBundledStreams();
	}

	sendBundledStreams() {
		//Send bundled streams if there is streams to send
		if (!isEmpty(this.bundledStreamsToEmit)) {
			ServerStream.emit('sendServerBundledData-' + this.gameId, this.bundledStreamsToEmit);
		}
	}

	sendBallPosition() {
		let ballPositionData = this.engine.getPositionData(this.ball);

		ballPositionData = this.addServerNormalizedTimestampToPositionData(ballPositionData);

		this.lastBallUpdate = this.addToBundledStreamsAtFrequence(
			this.lastBallUpdate,
			Config.ballInterval,
			'moveClientBall',
			ballPositionData
		);
	}

	sendBonusesPosition() {
		let bonusesData = [];

		for (let bonus of this.bonuses) {
			let bonusPositionData = this.engine.getPositionData(bonus);

			bonusesData.push([
				bonus.identifier,
				this.addServerNormalizedTimestampToPositionData(bonusPositionData)
			]);
		}

		if (bonusesData.length) {
			this.lastBonusUpdate = this.addToBundledStreamsAtFrequence(
				this.lastBonusUpdate,
				Config.bonusInterval,
				'moveClientBonuses',
				bonusesData
			);
		}
	}

	hitGround(ball) {
		if (this.gameResumed == true) {
			let pointSide;

			if (this.engine.getXPosition(ball.sprite) < this.xSize / 2) {
				pointSide = Constants.CLIENT_POINTS_COLUMN;
			} else {
				pointSide = Constants.HOST_POINTS_COLUMN;
			}

			this.gameResumed = false;
			Meteor.apply('addGamePoints', [this.gameId, pointSide], {noRetry: true}, () => {});
		}
	}

	regenerateLastBonusCreatedAndFrequenceTime() {
		this.lastBonusCreated = getUTCTimeStamp();
		this.bonusFrequenceTime = getRandomInt(Config.bonusMinimumInterval, Config.bonusMaximumInterval);
	}

	createBonusIfTimeHasElapsed() {
		let frequenceTime = this.bonusFrequenceTime - Math.round((getUTCTimeStamp() - this.lastGameRespawn) / 10);

		if (frequenceTime < Config.bonusMinimumFrequence) {
			frequenceTime = Config.bonusMinimumFrequence;
		}

		if (getUTCTimeStamp() - this.lastBonusCreated >= frequenceTime) {
			//Host choose position and bonusCls
			let bonusClass = BonusFactory.getRandomBonusKey();
			let data = {
				initialX: this.xSize / 2 + Random.choice([-6, +6]),
				bonusKey: bonusClass,
				bonusIdentifier: bonusClass + '_' + this.getServerNormalizedTimestamp()
			};

			//Create the bonus the host
			this.createBonus(data);
			this.regenerateLastBonusCreatedAndFrequenceTime();
			//Add to bundled stream to send
			this.bundledStreamsToEmit.createBonus = data;
		}
	}

	createBonus(data) {
		let bonusSprite = super.createBonus(data);

		this.engine.collidesWith(bonusSprite, this.playerCollisionGroup, (bonusItem, player) => {
			//Activate bonus
			this.activateBonus(bonusSprite.identifier, this.engine.getKey(player));
			//Send to client
			ServerStream.emit('activateBonus-' + this.gameId, {identifier: bonusSprite.identifier, player: this.engine.getKey(player)});
		}, this);
	}

	activateBonus(bonusIdentifier, playerKey) {
		let bonus = super.activateBonus(bonusIdentifier, playerKey);

		Meteor.call(
			'addActiveBonusToGame',
			this.gameId,
			bonus.getIdentifier(),
			bonus.getClassName(),
			bonus.getActivatedAt(),
			bonus.getTargetPlayerKey()
		);
	}

	removeBonus(bonus) {
		Meteor.call('removeActiveBonusFromGame', this.gameId, bonus.getIdentifier());
	}

}
