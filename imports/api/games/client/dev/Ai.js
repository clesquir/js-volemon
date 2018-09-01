import Dev from '/imports/api/games/client/dev/Dev.js';
import {CLIENT_POINTS_COLUMN, CLIENT_SIDE, HOST_POINTS_COLUMN} from '/imports/api/games/constants.js';
import genomes from '/public/assets/artificial-intelligence/genomes.json';
import {Random} from 'meteor/random';

export default class Ai extends Dev {
	beforeStart() {
		this.gameData.firstPlayerComputer = true;
		this.gameData.firstPlayerComputerMachineLearning = false;
		this.gameData.secondPlayerComputer = true;
		this.gameData.secondPlayerComputerMachineLearning = true;
		this.gameData.lastPointTaken = CLIENT_SIDE;
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

		this.game.artificialIntelligence.loadGenomes('player1', JSON.stringify(genomes));
		this.game.artificialIntelligence.loadGenomes('player2', JSON.stringify(genomes));
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

		//If the ball is stuck - move it a bit
		const pointTime = ((new Date()).getTime() - this.pointStartTime);
		if (pointTime % 1000 < 50 && Math.round(this.engine.getHorizontalSpeed(this.game.ball)) === 0) {
			this.engine.setHorizontalSpeed(this.game.ball, 50);
		}

		//Output the genomes backend in case the computer crashes
		if (this.game.artificialIntelligence.computers['player2'].learner) {
			const generation = this.game.artificialIntelligence.computers['player2'].learner.generation;
			if (this.lastGenerationSaved !== generation && generation % 5 === 0) {
				this.lastGenerationSaved = generation;
				Meteor.call(
					'saveAi',
					generation,
					this.game.artificialIntelligence.getGenomes('player1'),
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
	}

	enableSecondPlayerMachineLearning(isMachineLearning) {
		this.gameData.secondPlayerComputerMachineLearning = isMachineLearning;
		this.game.artificialIntelligence.addComputerWithKey('player2', isMachineLearning);

		if (isMachineLearning) {
			this.game.artificialIntelligence.loadGenomes('player2', JSON.stringify(genomes));
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

	getHostGenomes() {
		return this.game.artificialIntelligence.getGenomes('player1');
	}

	getClientGenomes() {
		return this.game.artificialIntelligence.getGenomes('player2');
	}
}
