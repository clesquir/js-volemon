import Game from '/imports/game/Game.js';
import BonusFactory from '/imports/game/BonusFactory.js';
import {Config} from '/imports/lib/config.js';
import {Constants} from '/imports/lib/constants.js';
import {getUTCTimeStamp, isEmpty} from '/imports/lib/utils.js';
import PhysicsData from '/public/assets/physicsData.json';

export default class ClientGame extends Game {

	constructor(...args) {
		super(...args);
		this.lastPlayerUpdate = 0;
		this.serverOffset = TimeSync.serverOffset();
	}

	isUserHost() {
		return (this.gameCreatedBy === Meteor.userId() && !!this.currentPlayer);
	}

	isUserClient() {
		return (this.gameCreatedBy !== Meteor.userId() && !!this.currentPlayer);
	}

	getCurrentPlayer() {
		let player;

		if (this.isUserHost()) {
			player = this.player1;
		} else if (this.isUserClient()) {
			player = this.player2;
		}

		return player;
	}

	getServerNormalizedTimestamp() {
		return getUTCTimeStamp() + this.serverOffset;
	}

	createEnvironmentElements() {
		super.createEnvironmentElements();

		/**
		 * Countdown text
		 */
		this.countdownText = this.engine.addText(this.engine.getCenterX(), this.engine.getCenterY(), '', {
			font: "75px 'Oxygen Mono', sans-serif",
			fill: '#363636',
			align: 'center'
		});

		this.engine.addKeyControllers();
	}

	preloadGame() {
		this.engine.preloadGame();

		this.engine.loadImage('player1', 'assets/player-' + this.getPlayerShapeFromKey('player1') + '.png');
		this.engine.loadImage('player2', 'assets/player-' + this.getPlayerShapeFromKey('player2') + '.png');
		this.engine.loadImage('ball', 'assets/ball.png');
		this.engine.loadImage('net', 'assets/net.png');
		this.engine.loadImage('ground', 'assets/ground.png');
		this.engine.loadImage('cloud', 'assets/cloud.png');

		this.engine.loadImage('delimiter', 'assets/clear.png');
		this.engine.loadImage('bonus-environment', 'assets/bonus-environment.png');
		this.engine.loadImage('bonus-environment-positive', 'assets/bonus-environment-positive.png');
		this.engine.loadImage('bonus-environment-negative', 'assets/bonus-environment-negative.png');
		this.engine.loadImage('bonus-target', 'assets/bonus-target.png');
		this.engine.loadImage('bonus-target-positive', 'assets/bonus-target-positive.png');
		this.engine.loadImage('bonus-target-negative', 'assets/bonus-target-negative.png');
		this.engine.loadData(Constants.NORMAL_SCALE_PHYSICS_DATA, 'assets/physicsData.json', PhysicsData);
	}

	updateGame() {
		this.resetBundledStreams();

		this.applyIfBallIsFrozen();

		if (this.isGameOnGoing()) {
			this.inputs();
			this.updateCountdown();
			this.engine.constrainVelocity(this.ball, 900);

			if (this.gameHasBonuses) {
				this.checkBonuses();
				this.updatePlayerBonuses();
			}
		}

		this.stopGameOnTimeout();

		this.sendBundledStreams();
	}

	sendBundledStreams() {
		//Send bundled streams if there is streams to send
		if (!isEmpty(this.bundledStreamsToEmit)) {
			ClientStream.emit('sendClientBundledData-' + this.gameId, this.bundledStreamsToEmit);
		}
	}

	render() {
		// Render scene
		this.engine.render();
	}

	loadGroundLevel() {
		/**
		 * Look
		 */
		this.engine.addTileSprite(
			0,
			this.ySize - Constants.GAME_GROUND_HEIGHT,
			this.xSize,
			Constants.GAME_GROUND_HEIGHT,
			'ground',
			this.level,
			true
		);

		super.loadGroundLevel();
	}

	loadNetLevel() {
		/**
		 * Look
		 */
		this.engine.addTileSprite(
			(this.xSize / 2) - (Constants.GAME_NET_WIDTH / 2),
			this.ySize - Constants.GAME_GROUND_HEIGHT - Constants.GAME_NET_HEIGHT,
			Constants.GAME_NET_WIDTH,
			Constants.GAME_NET_HEIGHT,
			'net',
			this.level,
			true
		);

		super.loadNetLevel();
	}

	updatePlayerBonuses() {
		this.bonusesGroup.removeAll(true);

		let padding = 5;
		let player1Count = 0;
		let player2Count = 0;

		for (let activeBonus of this.gameActiveBonuses) {
			let bonus = BonusFactory.getInstance(activeBonus.bonusClass, this);

			switch (activeBonus.targetPlayerKey) {
				case 'player1':
					player1Count++;
					this.bonusesGroup.add(this.engine.drawBonus(
						padding + (player1Count * ((Config.bonusRadius * 2) + padding)),
						this.ySize - (Constants.GAME_GROUND_HEIGHT / 2),
						bonus.getLetter(), bonus.getFontSize(), bonus.getSpriteBorderKey(),
						this.getBonusProgress(activeBonus, bonus)
					));
					break;
				case 'player2':
					player2Count++;
					this.bonusesGroup.add(this.engine.drawBonus(
						(this.xSize / 2) + padding + (player2Count * ((Config.bonusRadius * 2) + padding)),
						this.ySize - (Constants.GAME_GROUND_HEIGHT / 2),
						bonus.getLetter(), bonus.getFontSize(), bonus.getSpriteBorderKey(),
						this.getBonusProgress(activeBonus, bonus)
					));
					break;
			}
		}
	}

	getBonusProgress(activeBonus, bonus) {
		return 1 - ((this.getServerNormalizedTimestamp() - activeBonus.activatedAt) / bonus.getDuration());
	}

	updateCountdown() {
		if (this.countdownTimer && this.engine.isTimerRunning(this.countdownTimer)) {
			let countdownText = Math.ceil(this.engine.getTimerRemainingDuration(this.countdownTimer) / 1000),
				scaleTo = 7;

			if (countdownText == 4 && this.isMatchPoint()) {
				countdownText = 'MATCH POINT';
				scaleTo = 3;

				if (this.isDeucePoint()) {
					countdownText = 'DEUCE';
				}
			}

			countdownText = this.engine.updateText(this.countdownText, countdownText);

			//Zoom numbers
			if (countdownText != this.lastCountdownNumber) {
				this.engine.animateScale(this.countdownText, scaleTo, scaleTo, 1, 1, 500);
				this.engine.animateSetOpacity(this.countdownText, 0, 1, 500);
			}

			this.lastCountdownNumber = countdownText;
		}
	}

	sendPlayerPosition(player) {
		let playerPositionData = this.engine.getPositionData(player);

		playerPositionData.isHost = this.isUserHost();
		playerPositionData.doingDropShot = player.doingDropShot;
		playerPositionData = this.addServerNormalizedTimestampToPositionData(playerPositionData);

		this.lastPlayerUpdate = this.addToBundledStreamsAtFrequence(
			this.lastPlayerUpdate,
			Config.playerInterval,
			'moveOppositePlayer',
			playerPositionData
		);
	}

	inputs() {
		let player = this.getCurrentPlayer();

		if (!player) {
			return false;
		}

		player.doingDropShot = false;

		if (player.isFrozen) {
			this.engine.setHorizontalSpeed(player, 0);
			this.engine.setVerticalSpeed(player, 0);
		} else {
			if (this.isLeftKeyDown()) {
				this.engine.setHorizontalSpeed(player, player.leftMoveModifier * player.velocityXOnMove);
			} else if (this.isRightKeyDown()) {
				this.engine.setHorizontalSpeed(player, player.rightMoveModifier * player.velocityXOnMove);
			} else {
				this.engine.setHorizontalSpeed(player, 0);
			}

			if (this.isPlayerAtGroundLevel(player)) {
				if (this.isUpKeyDown()) {
					this.engine.setVerticalSpeed(player, -player.velocityYOnJump);
				} else {
					this.engine.setVerticalSpeed(player, 0);
				}
			} else {
				player.doingDropShot = this.isDropShotKeyDown();
			}
		}

		this.sendPlayerPosition(player);

		return true;
	}

	isLeftKeyDown() {
		return (
			this.engine.isLeftKeyDown() || this.engine.isAKeyDown()
		);
	}

	isRightKeyDown() {
		return (
			this.engine.isRightKeyDown() || this.engine.isDKeyDown()
		);
	}

	isUpKeyDown() {
		return (
			this.engine.isUpKeyDown() || this.engine.isWKeyDown()
		);
	}

	isDropShotKeyDown() {
		return (
			this.engine.isDownKeyDown() || this.engine.isSKeyDown() || this.engine.isSpacebarKeyDown()
		);
	}

	moveClientBall(data) {
		if (!this.ball) {
			return;
		}

		data = this.engine.interpolateFromTimestamp(this.getServerNormalizedTimestamp(), this.ball, data);

		this.engine.move(this.ball, data);
	}

	moveClientBonus(bonusIdentifier, data) {
		let correspondingBonus = this.getBonusFromIdentifier(bonusIdentifier);

		if (!correspondingBonus) {
			return;
		}

		data = this.engine.interpolateFromTimestamp(this.getServerNormalizedTimestamp(), correspondingBonus, data);

		this.engine.move(correspondingBonus, data);
	}

	resumeGame() {
		super.resumeGame();

		this.countdownText.text = '';
		this.countdownTimer.stop();
	}

	hidePlayingPlayer(playerKey) {
		let player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		if (
			(this.isUserHost() && playerKey == 'player1') ||
			(this.isUserClient() && playerKey == 'player2')
		) {
			this.engine.setOpacity(player, 0);
		} else {
			this.engine.setOpacity(player, 0.5);
		}
	}

	showPlayingPlayer(playerKey) {
		let player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		this.engine.setOpacity(player, 1);
	}

	drawCloud() {
		if (!this.cloudBonus) {
			this.cloudBonus = this.engine.addTileSprite(this.xSize / 2, this.ySize / 2, this.xSize, this.ySize, 'cloud');
			this.engine.setStatic(this.cloudBonus, true);
			this.engine.setOpacity(this.cloudBonus, 0);
		}

		this.engine.animateSetOpacity(this.cloudBonus, 1, this.engine.getOpacity(this.cloudBonus), 250);
	}

	hideCloud() {
		this.engine.animateSetOpacity(this.cloudBonus, 0, 1, 250);
	}

	shakeLevel() {
		this.engine.shake(this.level, 5, 20);
	}

};
