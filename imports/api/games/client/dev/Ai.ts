import Dev from "./Dev";
import {CLIENT_POINTS_COLUMN, CLIENT_SIDE, HOST_POINTS_COLUMN, HOST_SIDE} from '../../constants';
import Ball from "../component/Ball";

export default class Ai extends Dev {
	isStarted: boolean = false;
	slowMotion: number = 1;
	genomesFromExisting: boolean = true;

	lastHostGenerationSaved: number = 0;
	lastClientGenerationSaved: number = 0;
	pointStartTime: number = 0;

	constructor() {
		super();

		this.gameData.firstPlayerComputer = true;
		this.gameData.firstPlayerComputerMachineLearning = false;
		this.gameData.secondPlayerComputer = true;
		this.gameData.secondPlayerComputerMachineLearning = true;
	}

	beforeStart() {
		this.gameData.lastPointTaken = CLIENT_SIDE;
		this.pointStartTime = (new Date()).getTime();
		this.isStarted = true;
	}

	overrideGame() {
		super.overrideGame();

		this.mainScene.game.time.slowMotion = this.slowMotion;
		this.mainScene.artificialIntelligence.genomesFromExisting = this.genomesFromExisting;

		this.mainScene.startCountdownTimer = function() {
			setTimeout(() => this.resumeGame(), 200);
		};
	}

	resumeOnTimerEnd() {
		this.pointStartTime = (new Date()).getTime();
		this.mainScene.artificialIntelligence.startPoint();

		this.mainScene.pauseGame();
		this.resetPlayersAndBall();
		this.mainScene.startCountdownTimer();
	}

	updateGame() {
		super.updateGame();

		//If the point takes more than 2 minutes, stop it
		const pointTime = ((new Date()).getTime() - this.pointStartTime);
		if (
			pointTime > 2 * 60 * 1000 &&
			this.gameData.firstPlayerComputer &&
			this.gameData.secondPlayerComputer
		) {
			console.log('point takes too much time!');
			this.stopPoint();
		}

		//Output the genomes backend in case the computer crashes
		if (this.gameData.firstPlayerComputerMachineLearning) {
			const generation = this.mainScene.artificialIntelligence.currentGeneration('player1') - 1;
			if (this.lastHostGenerationSaved !== generation) {
				this.lastHostGenerationSaved = generation;
				Meteor.call(
					'saveHostMachineLearning',
					generation,
					this.mainScene.artificialIntelligence.getGenomes('player1')
				);
			}
		}

		if (this.gameData.secondPlayerComputerMachineLearning) {
			const generation = this.mainScene.artificialIntelligence.currentGeneration('player2') - 1;
			if (this.lastClientGenerationSaved !== generation) {
				this.lastClientGenerationSaved = generation;
				Meteor.call(
					'saveClientMachineLearning',
					generation,
					this.mainScene.artificialIntelligence.getGenomes('player2')
				);
			}
		}
	}

	stopPoint() {
		this.mainScene.gameResumed = false;

		this.gameData.lastPointAt = this.serverNormalizedTime.getServerTimestamp();

		this.mainScene.artificialIntelligence.stopPoint(null);

		if (this.mainScene.artificialIntelligence.computers['player1'].cumulatedFitness > this.mainScene.artificialIntelligence.computers['player2'].cumulatedFitness) {
			this.gameData.lastPointTaken = CLIENT_SIDE;
		} else {
			this.gameData.lastPointTaken = HOST_SIDE;
		}
		this.resumeOnTimerEnd();
	}

	onBallHitGround(ball: Ball) {
		if (this.mainScene.gameResumed === true) {
			this.mainScene.gameResumed = false;

			this.gameData.lastPointAt = this.serverNormalizedTime.getServerTimestamp();

			let pointSide = null;
			if (this.mainScene.ball.x() < this.gameConfiguration.width() / 2 - this.gameConfiguration.netWidth()) {
				pointSide = CLIENT_POINTS_COLUMN;
			} else if (ball.x() > this.gameConfiguration.width() / 2 + this.gameConfiguration.netWidth()) {
				pointSide = HOST_POINTS_COLUMN;
			}
			this.mainScene.artificialIntelligence.stopPoint(pointSide);

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
			this.mainScene.artificialIntelligence.addComputerWithKey(
				'player1',
				true,
				this.mainScene,
				this.gameConfiguration,
				isMachineLearning,
				this.gameData.firstPlayerComputerMachineLearning
			);
			this.mainScene.artificialIntelligence.startGame();
		}
	}

	enableFirstPlayerLearning(isLearning) {
		this.gameData.firstPlayerComputerLearning = isLearning;

		if (this.isStarted) {
			this.mainScene.artificialIntelligence.addComputerWithKey(
				'player1',
				true,
				this.mainScene,
				this.gameConfiguration,
				this.gameData.firstPlayerComputerMachineLearning,
				isLearning
			);
			this.mainScene.artificialIntelligence.startGame();
		}
	}

	enableSecondPlayerMachineLearning(isMachineLearning) {
		this.gameData.secondPlayerComputerMachineLearning = isMachineLearning;

		if (this.isStarted) {
			this.mainScene.artificialIntelligence.addComputerWithKey(
				'player2',
				false,
				this.mainScene,
				this.gameConfiguration,
				isMachineLearning,
				this.gameData.secondPlayerComputerLearning
			);
			this.mainScene.artificialIntelligence.startGame();
		}
	}

	enableSecondPlayerLearning(isLearning) {
		this.gameData.secondPlayerComputerLearning = isLearning;

		if (this.isStarted) {
			this.mainScene.artificialIntelligence.addComputerWithKey(
				'player2',
				false,
				this.mainScene,
				this.gameConfiguration,
				this.gameData.secondPlayerComputerMachineLearning,
				isLearning
			);
			this.mainScene.artificialIntelligence.startGame();
		}
	}

	slowDownGame() {
		this.slowMotion = 5;

		if (this.isStarted) {
			this.mainScene.game.time.slowMotion = this.slowMotion;
		}
	}

	speedUpGame() {
		this.slowMotion = 0.000001;

		if (this.isStarted) {
			this.mainScene.game.time.slowMotion = this.slowMotion;
		}
	}

	normalGameSpeed() {
		this.slowMotion = 1;

		if (this.isStarted) {
			this.mainScene.game.time.slowMotion = this.slowMotion;
		}
	}
}
