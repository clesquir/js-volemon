import {PLAYER_DEFAULT_SHAPE} from '../shapeConstants';
import GameData from "./GameData";

export default class StaticGameData implements GameData {
	gameId: string;
	currentPlayerKey: string = 'player1';
	firstPlayerComputer: boolean = false;
	secondPlayerComputer: boolean = false;
	thirdPlayerComputer: boolean = false;
	fourthPlayerComputer: boolean = false;
	firstPlayerComputerMachineLearning: boolean = false;
	secondPlayerComputerMachineLearning: boolean = false;
	thirdPlayerComputerMachineLearning: boolean = false;
	fourthPlayerComputerMachineLearning: boolean = false;
	firstPlayerComputerLearning: boolean = false;
	secondPlayerComputerLearning: boolean = false;
	thirdPlayerComputerLearning: boolean = false;
	fourthPlayerComputerLearning: boolean = false;
	maximumPoints: number = 1;
	hasBonuses: boolean = false;
	createdBy: string;
	tournamentId: string | null = null;
	lastPointAt: number;
	lastPointTaken: string;

	init() {
		this.createdBy = Random.id();
	}

	addRobot(id: string) {
	}

	getPlayerShapeFromKey(playerKey: string): string {
		return PLAYER_DEFAULT_SHAPE;
	}

	getCurrentPlayerKey(): string {
		return this.currentPlayerKey;
	}

	isCurrentPlayerKey(playerKey: string): boolean {
		return this.getCurrentPlayerKey() === playerKey;
	}

	isFirstPlayerComputer(): boolean {
		return this.firstPlayerComputer;
	}

	isSecondPlayerComputer(): boolean {
		return this.secondPlayerComputer;
	}

	isThirdPlayerComputer(): boolean {
		return this.thirdPlayerComputer;
	}

	isFourthPlayerComputer(): boolean {
		return this.fourthPlayerComputer;
	}

	isFirstPlayerComputerMachineLearning(): boolean {
		return this.firstPlayerComputerMachineLearning;
	}

	isSecondPlayerComputerMachineLearning(): boolean {
		return this.secondPlayerComputerMachineLearning;
	}

	isThirdPlayerComputerMachineLearning(): boolean {
		return this.thirdPlayerComputerMachineLearning;
	}

	isFourthPlayerComputerMachineLearning(): boolean {
		return this.fourthPlayerComputerMachineLearning;
	}

	isFirstPlayerComputerLearning(): boolean {
		return this.firstPlayerComputerLearning;
	}

	isSecondPlayerComputerLearning(): boolean {
		return this.secondPlayerComputerLearning;
	}

	isThirdPlayerComputerLearning(): boolean {
		return this.thirdPlayerComputerLearning;
	}

	isFourthPlayerComputerLearning(): boolean {
		return this.fourthPlayerComputerLearning;
	}

	isTwoVersusTwo(): boolean {
		return false;
	}

	isUserCreator(): boolean {
		return true;
	}

	isUserHost(): boolean {
		return true;
	}

	isUserClient(): boolean {
		return false;
	}

	isUserPlayer(): boolean {
		return false;
	}

	isUserViewer(): boolean {
		return false;
	}

	isGameStatusOnGoing(): boolean {
		return false;
	}

	isGameStatusStarted(): boolean {
		return true;
	}

	hasGameStatusEndedWithAWinner(): boolean {
		return false;
	}

	hasGameAborted(): boolean {
		return false;
	}

	numberMaximumPoints(): number {
		return 5;
	}

	isMatchPoint(): boolean {
		return false;
	}

	isDeucePoint(): boolean {
		return false;
	}

	activeBonuses(): any[] {
		return [];
	}

	hasTournament(): boolean {
		return false;
	}

	isTournamentPractice(): boolean {
		return false;
	}

	updateHostPoints(hostPoints: number) {
	}

	updateClientPoints(clientPoints: number) {
	}

	updateLastPointTaken(lastPointTaken: string) {
	}

	updateLastPointAt(lastPointAt: number) {
	}

	updateStatus(status) {
	}

	updateActiveBonuses(activeBonuses) {
	}
}
