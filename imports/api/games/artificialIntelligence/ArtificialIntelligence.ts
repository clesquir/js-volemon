import Computer from "./computer/Computer";
import MachineLearningComputer from "./computer/MachineLearningComputer";
import CalculatedComputer from "./computer/CalculatedComputer";

export default class ArtificialIntelligence {
	computers: { [key: string]: Computer } = {};
	genomesFromExisting = true;

	addComputerWithKey(key: string, machineLearning: boolean = false, isLearning: boolean = false) {
		if (machineLearning) {
			this.computers[key] = new MachineLearningComputer(key, isLearning, this.genomesFromExisting);
		} else {
			this.computers[key] = new CalculatedComputer(key);
		}
	}

	currentGeneration(key: string): number {
		if (this.computers.hasOwnProperty(key)) {
			return this.computers[key].currentGeneration();
		}

		return 1;
	}

	getGenomes(key: string): string {
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

	stopPoint(pointSide: string) {
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
	computeMovement(key: string, modifiers, computerPosition, ballPosition, bonusesPosition, gameConfiguration, engine) {
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

	movesLeft(key: string): boolean {
		if (this.computers.hasOwnProperty(key)) {
			return this.computers[key].left;
		}

		return false;
	}

	movesRight(key: string): boolean {
		if (this.computers.hasOwnProperty(key)) {
			return this.computers[key].right;
		}

		return false;
	}

	jumps(key: string): boolean {
		if (this.computers.hasOwnProperty(key)) {
			return this.computers[key].jump;
		}

		return false;
	}

	dropshots(key: string): boolean {
		if (this.computers.hasOwnProperty(key)) {
			return this.computers[key].dropshot;
		}

		return false;
	}
}
