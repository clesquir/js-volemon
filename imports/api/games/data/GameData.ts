export default interface GameData {
	gameId: string;
	hasBonuses: boolean;
	tournamentId: string | null;
	startedAt: number;
	lastPointAt: number;
	lastPointTaken: string;
	hostPoints: number;
	clientPoints: number;

	init();

	addRobot(id: string);

	getPlayerShapeFromKey(playerKey: string): string;

	getPlayerNameFromKey(playerKey: string): string;

	getCurrentPlayerKey(): string;

	isCurrentPlayerKey(playerKey: string): boolean;

	isFirstPlayerComputer(): boolean;

	isSecondPlayerComputer(): boolean;

	isThirdPlayerComputer(): boolean;

	isFourthPlayerComputer(): boolean;

	isFirstPlayerComputerMachineLearning(): boolean;

	isSecondPlayerComputerMachineLearning(): boolean;

	isThirdPlayerComputerMachineLearning(): boolean;

	isFourthPlayerComputerMachineLearning(): boolean;

	isFirstPlayerComputerLearning(): boolean;

	isSecondPlayerComputerLearning(): boolean;

	isThirdPlayerComputerLearning(): boolean;

	isFourthPlayerComputerLearning(): boolean;

	isTwoVersusTwo(): boolean;

	isUserCreator(): boolean;

	isUserHost(): boolean;

	isUserClient(): boolean;

	isUserPlayer(): boolean;

	isUserViewer(): boolean;

	isGameStatusOnGoing(): boolean;

	isGameStatusStarted(): boolean;

	hasGameStatusEndedWithAWinner(): boolean;

	hasGameAborted(): boolean;

	numberMaximumPoints(): number;

	isMatchPoint(): boolean;

	isDeucePoint(): boolean;

	activeBonuses(): any[];

	hasTournament(): boolean;

	isTournamentPractice(): boolean;

	updateHostPoints(hostPoints: number);

	updateClientPoints(clientPoints: number);

	updateLastPointTaken(lastPointTaken: string);

	updateLastPointAt(lastPointAt: number);

	updateStatus(status);

	updateActiveBonuses(activeBonuses);
}
