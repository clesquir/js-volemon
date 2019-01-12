import Computer from "./computer/Computer";
import MachineLearningComputer from "./computer/MachineLearningComputer";
import CalculatedComputer from "./computer/CalculatedComputer";
import GameData from "../data/GameData";
import {ArtificialIntelligenceData} from "./ArtificialIntelligenceData";
import GameConfiguration from "../configuration/GameConfiguration";
import {ArtificialIntelligencePositionData} from "./ArtificialIntelligencePositionData";

export default class ArtificialIntelligence {
	computers: { [key: string]: Computer } = {};
	genomesFromExisting = true;

	initFromData(gameData: GameData) {
		if (gameData.isFirstPlayerComputer()) {
			this.addComputerWithKey(
				'player1',
				gameData.isFirstPlayerComputerMachineLearning(),
				gameData.isFirstPlayerComputerLearning()
			);
		}
		if (gameData.isSecondPlayerComputer()) {
			this.addComputerWithKey(
				'player2',
				gameData.isSecondPlayerComputerMachineLearning(),
				gameData.isSecondPlayerComputerLearning()
			);
		}
		if (gameData.isThirdPlayerComputer()) {
			this.addComputerWithKey(
				'player3',
				gameData.isThirdPlayerComputerMachineLearning(),
				gameData.isThirdPlayerComputerLearning()
			);
		}
		if (gameData.isFourthPlayerComputer()) {
			this.addComputerWithKey(
				'player4',
				gameData.isFourthPlayerComputerMachineLearning(),
				gameData.isFourthPlayerComputerLearning()
			);
		}
	}

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

	computeMovement(
		key: string,
		modifiers: ArtificialIntelligenceData,
		computerPosition: ArtificialIntelligencePositionData,
		ballPosition: ArtificialIntelligencePositionData,
		bonusesPosition: ArtificialIntelligencePositionData[],
		gameConfiguration: GameConfiguration
	) {
		if (this.computers.hasOwnProperty(key)) {
			this.computers[key].computeMovement(
				modifiers,
				computerPosition,
				ballPosition,
				bonusesPosition,
				gameConfiguration
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
