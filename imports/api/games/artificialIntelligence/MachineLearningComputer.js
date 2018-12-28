import Computer from '/imports/api/games/artificialIntelligence/Computer.js';
import SynapticLearner from '/imports/api/games/artificialIntelligence/SynapticLearner.js';
import {CLIENT_POINTS_COLUMN, HOST_POINTS_COLUMN} from '/imports/api/games/constants.js';
import clientGenomes from '/public/assets/artificial-intelligence/client_genomes.json';
import hostGenomes from '/public/assets/artificial-intelligence/host_genomes.json';

export default class MachineLearningComputer extends Computer {
	isLearning = false;
	learner;
	pointStartTime = 0;
	cumulatedFitness = 0;
	numberPointsForCurrentGenome = 0;
	numberPointsToCalculateGenomes = 5;
	genomesFromExisting = true;

	constructor(key, isLearning) {
		super();
		this.key = key;
		this.isLearning = isLearning;

		this.learner = new SynapticLearner(6, 2, 12, 4, 0.2);
		this.learner.init();

		if (this.genomesFromExisting) {
			this.learner.loadGenomes(
				JSON.stringify(key === 'player1' || key === 'player3' ? hostGenomes : clientGenomes),
				true
			);
		}
	}

	currentGeneration() {
		return this.learner.generation;
	}

	getGenomes() {
		return this.learner.getGenomes();
	}

	startGame() {
		this.learner.startLearning();
	}

	startPoint() {
		this.pointStartTime = (new Date()).getTime();
	}

	stopPoint(pointSide) {
		if (!this.isLearning) {
			return;
		}

		const pointTime = ((new Date()).getTime() - this.pointStartTime);
		let fitness = 0;

		//When it has the point, the shortest the point, the better
		//When it doesn't, the longest the point, the better. Negative value
		if (pointSide === HOST_POINTS_COLUMN) {
			if (this.key === 'player2') {
				fitness = -1 / pointTime * 10000000;
			} else {
				//fitness = 1 / pointTime * 10000000;
				console.log('SCORED!');
			}
		} else if (pointSide === CLIENT_POINTS_COLUMN) {
			if (this.key === 'player1') {
				fitness = -1 / pointTime * 10000000;
			} else {
				//fitness = 1 / pointTime * 10000000;
				console.log('SCORED!');
			}
		}

		this.cumulatedFitness += fitness;
		this.numberPointsForCurrentGenome++;

		if (this.numberPointsForCurrentGenome >= this.numberPointsToCalculateGenomes) {
			this.learner.applyGenomeFitness(this.cumulatedFitness);

			//Reset
			this.numberPointsForCurrentGenome = 0;
			this.cumulatedFitness = 0;
		}
	}

	/**
	 * @param {{key: string, isMoveReversed: boolean, horizontalMoveModifier: Function, verticalMoveModifier: Function, alwaysJump: boolean, canJump: boolean, velocityXOnMove: number, velocityYOnJump: number}} modifiers
	 * @param {{x: number, y: number, scale: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}} computerPosition
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}} ballPosition
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}[]} bonusesPosition
	 * @param {GameConfiguration} gameConfiguration
	 * @param {Engine} engine
	 */
	computeMovement(modifiers, computerPosition, ballPosition, bonusesPosition, gameConfiguration, engine) {
		const isLeft = this.isLeftPlayer(modifiers);
		const width = gameConfiguration.width();
		const halfWidth = (width / 2);
		const height = gameConfiguration.height();
		const groundY = height - gameConfiguration.groundHeight();

		if (
			Math.round(ballPosition.velocityX) === 0 &&
			isLeft === (ballPosition.x < halfWidth)
		) {
			//Reduce fitness if ball stalled horizontally on player's side
			this.cumulatedFitness -= 10;
		}
		if (isLeft === (ballPosition.x > halfWidth)) {
			//Increase fitness if ball is not on player's side
			this.cumulatedFitness += 1;
		} else {
			//Reduce fitness if ball is on player's side
			this.cumulatedFitness -= 1;
		}

		this.applyLearnerOutput(
			modifiers,
			this.learner.emitData(
				[
					this.round5(computerPosition.x - ballPosition.x), //Distance X from ball
					this.round5(computerPosition.y - ballPosition.y), //Distance Y from ball
					Math.round(ballPosition.x / width * 100),
					this.round5(groundY - ballPosition.y), //Distance from ground
					this.round5(ballPosition.velocityX), //Ball X speed
					this.round5(ballPosition.velocityY) //Ball Y speed
				]
			)
		);
	}

	/**
	 * @private
	 * @param {{key: string, isMoveReversed: boolean, horizontalMoveModifier: Function, verticalMoveModifier: Function, alwaysJump: boolean, canJump: boolean, velocityXOnMove: number, velocityYOnJump: number}} modifiers
	 * @param outputs
	 */
	applyLearnerOutput(modifiers, outputs) {
		if (outputs.length === 2) {
			if (outputs[0] < 0.33) {
				this.moveLeft();
			} else if (outputs[0] > 0.66) {
				this.moveRight();
			} else {
				this.stopMovingHorizontally();
			}

			this.jump = false;
			this.dropshot = false;

			if (outputs[1] < 0.33) {
				this.jump = true;
			} else if (outputs[1] > 0.66) {
				this.dropshot = true;
			}

			this.applyModifiers(modifiers);
		}
	}

	/**
	 * @private
	 */
	moveLeft() {
		this.left = true;
		this.right = false;
	}

	/**
	 * @private
	 */
	moveRight() {
		this.right = true;
		this.left = false;
	}

	/**
	 * @private
	 */
	stopMovingHorizontally() {
		this.left = false;
		this.right = false;
	}

	/**
	 * @private
	 * @param modifiers
	 * @returns {boolean}
	 */
	isLeftPlayer(modifiers) {
		return !!modifiers.isHost;
	}

	/**
	 * @private
	 * @param {{key: string, isMoveReversed: boolean, horizontalMoveModifier: Function, verticalMoveModifier: Function, alwaysJump: boolean, canJump: boolean, velocityXOnMove: number, velocityYOnJump: number}} modifiers
	 */
	applyModifiers(modifiers) {
		if (modifiers.isMoveReversed !== modifiers.velocityXOnMove < 0) {
			const left = this.right;
			const right = this.left;
			this.left = left;
			this.right = right;
		}
	}

	/**
	 * @private
	 * @param {number} value
	 * @returns {number}
	 */
	round5(value) {
		return Math.ceil(value / 5) * 5;
	}
}
