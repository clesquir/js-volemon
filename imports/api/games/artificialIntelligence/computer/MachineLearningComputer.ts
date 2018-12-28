import {CLIENT_POINTS_COLUMN, HOST_POINTS_COLUMN} from 'imports/api/games/constants';
import * as clientGenomes from '/public/assets/artificial-intelligence/client_genomes.json';
import * as hostGenomes from '/public/assets/artificial-intelligence/host_genomes.json';
import Computer from "./Computer";
import Learner from "../learner/Learner";
import SynapticLearner from "../learner/SynapticLearner";

export default class MachineLearningComputer implements Computer {
	key: string;
	isLearning: boolean = false;
	left: boolean = false;
	right: boolean = false;
	jump: boolean = false;
	dropshot: boolean = false;
	cumulatedFitness: number = 0;

	private learner: Learner;
	private pointStartTime: number = 0;
	private numberPointsForCurrentGenome: number = 0;
	private numberPointsToCalculateGenomes: number = 5;

	constructor(key, isLearning, genomesFromExisting) {
		this.key = key;
		this.isLearning = isLearning;

		this.learner = new SynapticLearner(6, 4, 6, 4, 0.2);
		this.learner.init();

		if (genomesFromExisting) {
			this.learner.loadGenomes(
				JSON.stringify(key === 'player1' || key === 'player3' ? hostGenomes : clientGenomes),
				true
			);
		}
	}

	currentGeneration(): number {
		return this.learner.generation;
	}

	getGenomes(): string {
		return this.learner.getGenomes();
	}

	startGame() {
		this.learner.startLearning();
	}

	startPoint() {
		this.pointStartTime = (new Date()).getTime();
	}

	stopPoint(pointSide: string) {
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
					Math.round(ballPosition.x / width * 100), //Ball position percentage
					this.round5(groundY - ballPosition.y), //Distance from ground
					this.round5(ballPosition.velocityX), //Ball X speed
					this.round5(ballPosition.velocityY) //Ball Y speed
				]
			)
		);
	}

	/**
	 * @param {{key: string, isMoveReversed: boolean, horizontalMoveModifier: Function, verticalMoveModifier: Function, alwaysJump: boolean, canJump: boolean, velocityXOnMove: number, velocityYOnJump: number}} modifiers
	 * @param outputs
	 */
	private applyLearnerOutput(modifiers, outputs: Array<number>) {
		if (outputs.length === 4) {
			if (outputs[0] > 0.75) {
				this.moveLeft();
			} else if (outputs[1] > 0.75) {
				this.moveRight();
			} else {
				this.stopMovingHorizontally();
			}

			this.jump = (outputs[2] > 0.75);
			this.dropshot = (outputs[3] > 0.75);

			this.applyModifiers(modifiers);
		}
	}

	private moveLeft() {
		this.left = true;
		this.right = false;
	}

	private moveRight() {
		this.right = true;
		this.left = false;
	}

	private stopMovingHorizontally() {
		this.left = false;
		this.right = false;
	}

	private isLeftPlayer(modifiers): boolean {
		return !!modifiers.isHost;
	}

	/**
	 * @param {{key: string, isMoveReversed: boolean, horizontalMoveModifier: Function, verticalMoveModifier: Function, alwaysJump: boolean, canJump: boolean, velocityXOnMove: number, velocityYOnJump: number}} modifiers
	 */
	private applyModifiers(modifiers) {
		if (modifiers.isMoveReversed !== modifiers.velocityXOnMove < 0) {
			const left = this.right;
			const right = this.left;
			this.left = left;
			this.right = right;
		}
	}

	private round5(value: number): number {
		return Math.ceil(value / 5) * 5;
	}
}
