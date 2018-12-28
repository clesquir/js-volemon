export default class Computer {
	key;
	left = false;
	right = false;
	jump = false;
	dropshot = false;

	currentGeneration() {
	}

	getGenomes() {
	}

	startGame() {
	}

	startPoint() {
	}

	stopPoint(pointSide) {
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
	}
}
