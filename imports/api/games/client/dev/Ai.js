import Dev from '/imports/api/games/client/dev/Dev.js';
import {CLIENT_POINTS_COLUMN, CLIENT_SIDE, HOST_POINTS_COLUMN, HOST_SIDE} from '/imports/api/games/constants.js';
import {Random} from 'meteor/random';

export default class Ai extends Dev {
	constructor() {
		super();

		this.isStarted = false;
		this.slowMotion = 0.000001;
		this.canJump = true;
		this.genomesFromExisting = true;
		this.gameData.firstPlayerComputer = true;
		this.gameData.firstPlayerComputerMachineLearning = false;
		this.gameData.secondPlayerComputer = true;
		this.gameData.secondPlayerComputerMachineLearning = true;
	}

	beforeStart() {
		this.gameData.lastPointTaken = CLIENT_SIDE;
		this.lastHostGenerationSaved = 0;
		this.lastClientGenerationSaved = 0;
		this.pointStartTime = (new Date()).getTime();
		this.isStarted = true;
	}

	createGame() {
		this.overrideGame();

		this.engine.game.forceSingleUpdate = false;
		this.engine.game.time.advancedTiming = true;
		this.engine.game.time.slowMotion = this.slowMotion;
		this.game.artificialIntelligence.canJump = this.canJump;
		this.game.artificialIntelligence.genomesFromExisting = this.genomesFromExisting;

		this.createComponents();
		this.gameBonus.createComponents();

		this.deviceController.startMonitoring();
		this.engine.createGame();

		this.game.gameInitiated = true;

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
		if (
			pointTime > 2 * 60 * 1000 &&
			this.gameData.firstPlayerComputer &&
			this.gameData.secondPlayerComputer
		) {
			this.game.gameResumed = false;

			this.gameData.lastPointAt = this.serverNormalizedTime.getServerTimestamp();

			console.log('point takes too much time!');
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

			let pointSide = null;
			if (ball.x < this.gameConfiguration.width() / 2 - this.gameConfiguration.netWidth()) {
				pointSide = CLIENT_POINTS_COLUMN;
			} else if (ball.x > this.gameConfiguration.width() / 2 + this.gameConfiguration.netWidth()) {
				pointSide = HOST_POINTS_COLUMN;
			}
			this.game.artificialIntelligence.stopPoint(pointSide);

			this.gameData.lastPointTaken = pointSide === HOST_POINTS_COLUMN ? HOST_SIDE : CLIENT_SIDE;
			this.resumeOnTimerEnd();
		}
	}

	enableGenomesFromExisting(genomesFromExisting) {
		this.genomesFromExisting = genomesFromExisting;
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

		if (this.isStarted) {
			this.game.artificialIntelligence.addComputerWithKey('player1', isMachineLearning, this.gameData.firstPlayerComputerMachineLearning);
			this.game.artificialIntelligence.startGame();
		}
	}

	enableFirstPlayerLearning(isLearning) {
		this.gameData.firstPlayerComputerLearning = isLearning;

		if (this.isStarted) {
			this.game.artificialIntelligence.addComputerWithKey('player1', this.gameData.firstPlayerComputerMachineLearning, isLearning);
			this.game.artificialIntelligence.startGame();
		}
	}

	enableSecondPlayerMachineLearning(isMachineLearning) {
		this.gameData.secondPlayerComputerMachineLearning = isMachineLearning;

		if (this.isStarted) {
			this.game.artificialIntelligence.addComputerWithKey('player2', isMachineLearning, this.gameData.secondPlayerComputerLearning);
			this.game.artificialIntelligence.startGame();
		}
	}

	enableSecondPlayerLearning(isLearning) {
		this.gameData.secondPlayerComputerLearning = isLearning;

		if (this.isStarted) {
			this.game.artificialIntelligence.addComputerWithKey('player2', this.gameData.secondPlayerComputerMachineLearning, isLearning);
			this.game.artificialIntelligence.startGame();
		}
	}

	speedUpGame() {
		this.slowMotion = 0.000001;

		if (this.isStarted) {
			this.engine.game.time.slowMotion = this.slowMotion;
		}
	}

	normalGameSpeed() {
		this.slowMotion = 1;

		if (this.isStarted) {
			this.engine.game.time.slowMotion = this.slowMotion;
		}
	}

	enableAiToJump(canJump) {
		this.canJump = canJump;

		if (this.isStarted) {
			this.game.artificialIntelligence.canJump = this.canJump;
		}
	}
}
