import Dev from '/imports/api/games/client/dev/Dev.js';
import {CLIENT_POINTS_COLUMN, CLIENT_SIDE, HOST_POINTS_COLUMN} from '/imports/api/games/constants.js';
import hostGenomes from '/public/assets/artificial-intelligence/host_genomes.json';
import clientGenomes from '/public/assets/artificial-intelligence/client_genomes.json';
import {Random} from 'meteor/random';

export default class Ai extends Dev {
	beforeStart() {
		this.gameData.firstPlayerComputer = true;
		this.gameData.firstPlayerComputerMachineLearning = true;
		this.gameData.secondPlayerComputer = true;
		this.gameData.secondPlayerComputerMachineLearning = true;
		this.gameData.lastPointTaken = CLIENT_SIDE;
		this.lastHostGenerationSaved = 0;
		this.lastClientGenerationSaved = 0;
		this.pointStartTime = (new Date()).getTime();
		this.lastBallHorizontalSpeedCheck = undefined;
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

		this.game.artificialIntelligence.loadGenomes('player1', JSON.stringify(hostGenomes));
		this.game.artificialIntelligence.loadGenomes('player2', JSON.stringify(clientGenomes));
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

		//If the ball has been horizontally stabilized for a while now, move it a bit
		const pointTime = ((new Date()).getTime() - this.pointStartTime);
		if (pointTime % 2500 < 25) {
			const currentBallHorizontalSpeed = Math.round(this.engine.getHorizontalSpeed(this.game.ball));
			if (currentBallHorizontalSpeed === 0 && this.lastBallHorizontalSpeedCheck === 0) {
				this.engine.setHorizontalSpeed(this.game.ball, 50);
				console.log('move the ball');
			}
			this.lastBallHorizontalSpeedCheck = currentBallHorizontalSpeed;
		}

		//If the point takes more than 2 minutes, stop it
		if (pointTime > 2 * 60 * 1000) {
			this.game.gameResumed = false;

			this.gameData.lastPointAt = this.serverNormalizedTime.getServerTimestamp();

			this.game.artificialIntelligence.stopPoint(null);

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

		if (isMachineLearning) {
			this.game.artificialIntelligence.loadGenomes('player1', JSON.stringify(hostGenomes));
		}

		this.game.artificialIntelligence.startGame();
	}

	enableSecondPlayerMachineLearning(isMachineLearning) {
		this.gameData.secondPlayerComputerMachineLearning = isMachineLearning;
		this.game.artificialIntelligence.addComputerWithKey('player2', isMachineLearning);

		if (isMachineLearning) {
			this.game.artificialIntelligence.loadGenomes('player2', JSON.stringify(clientGenomes));
		}

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
