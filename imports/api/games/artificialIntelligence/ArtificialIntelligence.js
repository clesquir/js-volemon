import CalculatedComputer from '/imports/api/games/artificialIntelligence/CalculatedComputer';
import MachineLearningComputer from '/imports/api/games/artificialIntelligence/MachineLearningComputer';

export default class ArtificialIntelligence {
	/** @var { [key: string]: Computer } */
	computers = {};

	addComputerWithKey(key, machineLearning = false, isLearning = false) {
		if (machineLearning) {
			this.computers[key] = new MachineLearningComputer(key, isLearning);
		} else {
			this.computers[key] = new CalculatedComputer(key);
		}
	}

	currentGeneration(key) {
		if (this.computers.hasOwnProperty(key)) {
			return this.computers[key].currentGeneration();
		}

		return 1;
	}

	getGenomes(key) {
		if (this.computers[key]) {
			return this.computers[key].getGenomes();
		}

		return '';
	}

	startGame() {
		for (let key in this.computers) {
			if (this.computers.hasOwnProperty(key)) {
				this.computers[key].startGame();
			}
		}
	}

	startPoint() {
		for (let key in this.computers) {
			if (this.computers.hasOwnProperty(key)) {
				this.computers[key].startPoint();
			}
		}
	}

	stopPoint(pointSide) {
		for (let key in this.computers) {
			if (this.computers.hasOwnProperty(key)) {
				this.computers[key].stopPoint(pointSide);
			}
		}
	}

	/**
	 * @param {string} key
	 * @param {{key: string, isMoveReversed: boolean, horizontalMoveModifier: Function, verticalMoveModifier: Function, alwaysJump: boolean, canJump: boolean, velocityXOnMove: number, velocityYOnJump: number}} modifiers
	 * @param {{x: number, y: number, scale: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}} computerPosition
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}} ballPosition
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}[]} bonusesPosition
	 * @param {GameConfiguration} gameConfiguration
	 * @param {Engine} engine
	 */
	computeMovement(key, modifiers, computerPosition, ballPosition, bonusesPosition, gameConfiguration, engine) {
		if (this.computers.hasOwnProperty(key)) {
			this.computers[key].computeMovement(
				modifiers,
				computerPosition,
				ballPosition,
				bonusesPosition,
				gameConfiguration,
				engine
			);
		}
	}

	movesLeft(key) {
		if (this.computers.hasOwnProperty(key)) {
			return this.computers[key].left;
		}

		return false;
	}

	movesRight(key) {
		if (this.computers.hasOwnProperty(key)) {
			return this.computers[key].right;
		}

		return false;
	}

	jumps(key) {
		if (this.computers.hasOwnProperty(key)) {
			return this.computers[key].jump;
		}

		return false;
	}

	dropshots(key) {
		if (this.computers.hasOwnProperty(key)) {
			return this.computers[key].dropshot;
		}

		return false;
	}
}
