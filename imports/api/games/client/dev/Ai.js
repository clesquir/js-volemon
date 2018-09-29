import Dev from '/imports/api/games/client/dev/Dev.js';
import {CLIENT_POINTS_COLUMN, CLIENT_SIDE, HOST_POINTS_COLUMN, HOST_SIDE} from '/imports/api/games/constants.js';
import {Random} from 'meteor/random';

export default class Ai extends Dev {
	beforeStart() {
		this.gameData.firstPlayerComputer = true;
		this.gameData.firstPlayerComputerMachineLearning = false;
		this.gameData.secondPlayerComputer = true;
		this.gameData.secondPlayerComputerMachineLearning = true;
		this.gameData.lastPointTaken = CLIENT_SIDE;
		this.lastHostGenerationSaved = 0;
		this.lastClientGenerationSaved = 0;
		this.pointStartTime = (new Date()).getTime();
		this.renderer = 3;
	}

	createGame() {
		this.overrideGame();

		this.engine.game.forceSingleUpdate = false;
		this.engine.game.time.advancedTiming = true;
		this.engine.game.time.slowMotion = 1;
		this.createComponents();
		this.gameBonus.createComponents();

		this.deviceController.startMonitoring();
		this.engine.createGame();

		this.game.gameInitiated = true;

		this.game.artificialIntelligence.isLearning = true;
		this.game.artificialIntelligence.canJump = true;
		this.game.artificialIntelligence.startGame();

		this.game.startCountdownTimer = function() {
			setTimeout(() => this.resumeGame(), 200);
		};

		this.game.resumeOnTimerEnd();

		this.onGameCreated();
	}

	resumeOnTimerEnd() {
		this.pointStartTime = (new Date()).getTime();
		this.game.artificialIntelligence.startPoint();

		this.game.pauseGame();
		this.respawnSprites();
		this.game.startCountdownTimer();
	}

	updateGame() {
		this.game.updateGame();

		//If the point takes more than 2 minutes, stop it
		const pointTime = ((new Date()).getTime() - this.pointStartTime);
		if (pointTime > 2 * 60 * 1000) {
			this.game.gameResumed = false;

			this.gameData.lastPointAt = this.serverNormalizedTime.getServerTimestamp();

			this.game.artificialIntelligence.stopPoint(null);

			if (this.game.artificialIntelligence.computers['player1'].cumulatedFitness > this.game.artificialIntelligence.computers['player2'].cumulatedFitness) {
				this.gameData.lastPointTaken = CLIENT_SIDE;
			} else {
				this.gameData.lastPointTaken = HOST_SIDE;
			}
			this.resumeOnTimerEnd();
		}

		//Output the genomes backend in case the computer crashes
		if (this.gameData.firstPlayerComputerMachineLearning) {
			const generation = this.game.artificialIntelligence.currentGeneration('player1') - 1;
			if (this.lastHostGenerationSaved !== generation) {
				this.lastHostGenerationSaved = generation;
				Meteor.call(
					'saveHostMachineLearning',
					generation,
					this.game.artificialIntelligence.getGenomes('player1')
				);
			}
		}

		if (this.gameData.secondPlayerComputerMachineLearning) {
			const generation = this.game.artificialIntelligence.currentGeneration('player2') - 1;
			if (this.lastClientGenerationSaved !== generation) {
				this.lastClientGenerationSaved = generation;
				Meteor.call(
					'saveClientMachineLearning',
					generation,
					this.game.artificialIntelligence.getGenomes('player2')
				);
			}
		}
	}

	hitGround(ball) {
		if (this.game.gameResumed === true) {
			this.game.gameResumed = false;

			this.gameData.lastPointAt = this.serverNormalizedTime.getServerTimestamp();

			let pointSide = HOST_POINTS_COLUMN;
			if (ball.x < this.gameConfiguration.width() / 2) {
				pointSide = CLIENT_POINTS_COLUMN;
			}
			this.game.artificialIntelligence.stopPoint(pointSide);

			this.gameData.lastPointTaken = pointSide === HOST_POINTS_COLUMN ? HOST_SIDE : CLIENT_SIDE;
			this.resumeOnTimerEnd();
		}
	}

	enableFirstPlayerHuman(isHuman) {
		this.gameData.firstPlayerComputer = !isHuman;
		if (isHuman) {
			this.gameData.currentPlayerKey = 'player1';
		}
	}

	enableSecondPlayerHuman(isHuman) {
		this.gameData.secondPlayerComputer = !isHuman;
		if (isHuman) {
			this.gameData.currentPlayerKey = 'player2';
		}
	}

	enableFirstPlayerMachineLearning(isMachineLearning) {
		this.gameData.firstPlayerComputerMachineLearning = isMachineLearning;
		this.game.artificialIntelligence.addComputerWithKey('player1', isMachineLearning);
		this.game.artificialIntelligence.startGame();
	}

	enableSecondPlayerMachineLearning(isMachineLearning) {
		this.gameData.secondPlayerComputerMachineLearning = isMachineLearning;
		this.game.artificialIntelligence.addComputerWithKey('player2', isMachineLearning);
		this.game.artificialIntelligence.startGame();
	}

	speedUpGame() {
		this.engine.game.time.slowMotion = 0.00001;
	}

	normalGameSpeed() {
		this.engine.game.time.slowMotion = 1;
	}

	enableAiToJump(canJump) {
		this.game.artificialIntelligence.canJump = canJump;
	}
}
