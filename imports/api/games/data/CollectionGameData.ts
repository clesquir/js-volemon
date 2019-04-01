import {isTwoVersusTwoGameMode} from '../constants';
import {PLAYER_DEFAULT_SHAPE} from '../shapeConstants';
import {
	hasGameAborted,
	hasGameStatusEndedWithAWinner,
	isDeucePoint,
	isGameStatusOnGoing,
	isGameStatusStarted,
	isMatchPoint
} from '../utils';
import {Tournaments} from '../../tournaments/tournaments';
import GameData from "./GameData";
import {Players} from "../players";
import {Games} from "../games";

export default class CollectionGameData implements GameData {
	gameId: string;
	currentUserId: string;
	_activeBonuses: any[] = [];
	robots: {[id: string]: {id: string}} = {};
	tournament: any = null;

	gameMode: string;
	maximumPoints: number;
	hasBonuses: boolean;
	createdBy: string;
	tournamentId: string | null;

	currentPlayerKey: string;
	currentPlayer;
	currentGamePlayer;
	firstGamePlayer;
	secondGamePlayer;
	thirdGamePlayer;
	fourthGamePlayer;
	firstPlayer;
	secondPlayer;
	thirdPlayer;
	fourthPlayer;
	hostUserIds: string[];
	clientUserIds: string[];
	status: string;
	hostPoints: number;
	clientPoints: number;
	startedAt: number;
	lastPointAt: number;
	lastPointTaken: string;

	constructor(gameId: string, currentUserId: string) {
		this.gameId = gameId;
		this.currentUserId = currentUserId;
	}

	init() {
		//Init before starting game to gather newly joined players
		let game = this.fetchGame();

		this.gameMode = game.gameMode;
		this.maximumPoints = game.maximumPoints;
		this.hasBonuses = game.hasBonuses;
		this.createdBy = game.createdBy;
		this.tournamentId = game.tournamentId;

		this.updateStartedAt(game.startedAt);
		this.updateHostPoints(game.hostPoints);
		this.updateClientPoints(game.clientPoints);
		this.updateLastPointTaken(game.lastPointTaken);
		this.updateLastPointAt(game.lastPointAt);
		this.updateStatus(game.status);
		this.updateActiveBonuses(game.activeBonuses);

		this.initPlayers(game);
		this.initTournament();
	}

	addRobot(id: string) {
		this.robots[id] = {id: id};
	}

	getPlayerShapeFromKey(playerKey: string): string {
		let player = this.gamePlayerFromKey(playerKey);

		if (!player || !player.shape) {
			return PLAYER_DEFAULT_SHAPE;
		}

		return player.shape;
	}

	getCurrentPlayerKey(): string {
		return this.currentPlayerKey;
	}

	isCurrentPlayerKey(playerKey: string): boolean {
		let player = this.playerFromKey(playerKey);

		return player && this.currentPlayer && player._id === this.currentPlayer._id;
	}

	isFirstPlayerComputer(): boolean {
		return this.firstGamePlayer && this.firstGamePlayer.id === 'CPU';
	}

	isSecondPlayerComputer(): boolean {
		return this.secondGamePlayer && this.secondGamePlayer.id === 'CPU';
	}

	isThirdPlayerComputer(): boolean {
		return this.thirdGamePlayer && this.thirdGamePlayer.id === 'CPU';
	}

	isFourthPlayerComputer(): boolean {
		return this.fourthGamePlayer && this.fourthGamePlayer.id === 'CPU';
	}

	isFirstPlayerComputerMachineLearning(): boolean {
		return this.firstGamePlayer && this.firstGamePlayer.isMachineLearning === true;
	}

	isSecondPlayerComputerMachineLearning(): boolean {
		return this.secondGamePlayer && this.secondGamePlayer.isMachineLearning === true;
	}

	isThirdPlayerComputerMachineLearning(): boolean {
		return this.thirdGamePlayer && this.thirdGamePlayer.isMachineLearning === true;
	}

	isFourthPlayerComputerMachineLearning(): boolean {
		return this.fourthGamePlayer && this.fourthGamePlayer.isMachineLearning === true;
	}

	isFirstPlayerComputerLearning(): boolean {
		return false;
	}

	isSecondPlayerComputerLearning(): boolean {
		return false;
	}

	isThirdPlayerComputerLearning(): boolean {
		return false;
	}

	isFourthPlayerComputerLearning(): boolean {
		return false;
	}

	isTwoVersusTwo(): boolean {
		return isTwoVersusTwoGameMode(this.gameMode);
	}

	isUserCreator(): boolean {
		return (this.createdBy === this.currentUserId);
	}

	isUserHost(): boolean {
		return this.currentUserId && this.hostUserIds.indexOf(this.currentUserId) !== -1;
	}

	isUserClient(): boolean {
		return this.currentUserId && this.clientUserIds.indexOf(this.currentUserId) !== -1;
	}

	isUserPlayer(): boolean {
		return this.isUserHost() || this.isUserClient();
	}

	isUserViewer(): boolean {
		return !this.isUserPlayer();
	}

	isGameStatusOnGoing(): boolean {
		return isGameStatusOnGoing(this.status);
	}

	isGameStatusStarted(): boolean {
		return isGameStatusStarted(this.status);
	}

	hasGameStatusEndedWithAWinner(): boolean {
		return hasGameStatusEndedWithAWinner(this.status);
	}

	hasGameAborted(): boolean {
		return hasGameAborted(this.status);
	}

	numberMaximumPoints(): number {
		return this.maximumPoints;
	}

	isMatchPoint(): boolean {
		return isMatchPoint(this.hostPoints, this.clientPoints, this.maximumPoints);
	}

	isDeucePoint(): boolean {
		return isDeucePoint(this.hostPoints, this.clientPoints, this.maximumPoints);
	}

	activeBonuses(): any[] {
		return this._activeBonuses;
	}

	hasTournament(): boolean {
		return !!this.tournamentId;
	}

	isTournamentPractice(): boolean {
		return this.hasTournament() && this.tournament.status.id !== 'approved';
	}

	updateHostPoints(hostPoints: number) {
		this.hostPoints = hostPoints;
	}

	updateClientPoints(clientPoints: number) {
		this.clientPoints = clientPoints;
	}

	updateLastPointTaken(lastPointTaken: string) {
		this.lastPointTaken = lastPointTaken;
	}

	updateLastPointAt(lastPointAt: number) {
		this.lastPointAt = lastPointAt;
	}

	updateStatus(status: string) {
		this.status = status;
	}

	updateActiveBonuses(activeBonuses) {
		this._activeBonuses = activeBonuses;
	}

	private gamePlayerFromKey(playerKey: string) {
		if (playerKey === 'player1') {
			return this.firstGamePlayer;
		} else if (playerKey === 'player2') {
			return this.secondGamePlayer;
		} else if (playerKey === 'player3') {
			return this.thirdGamePlayer;
		} else if (playerKey === 'player4') {
			return this.fourthGamePlayer;
		} else if (this.robots.hasOwnProperty(playerKey)) {
			return this.robots[playerKey];
		}

		return null;
	}

	private playerFromKey(playerKey: string) {
		if (playerKey === 'player1') {
			return this.firstPlayer;
		} else if (playerKey === 'player2') {
			return this.secondPlayer;
		} else if (playerKey === 'player3') {
			return this.thirdPlayer;
		} else if (playerKey === 'player4') {
			return this.fourthPlayer;
		} else if (this.robots.hasOwnProperty(playerKey)) {
			return this.robots[playerKey];
		}

		return null;
	}

	private initPlayers(game) {
		let players = Players.find({gameId: this.gameId});

		this.currentGamePlayer = null;
		this.firstGamePlayer = game.players[0];
		this.secondGamePlayer = game.players[1];
		this.thirdGamePlayer = game.players[2];
		this.fourthGamePlayer = game.players[3];

		for (let player of game.players) {
			if (player.id === this.currentUserId) {
				this.currentGamePlayer = player;
				break;
			}
		}

		this.currentPlayer = null;
		this.currentPlayerKey = null;
		this.firstPlayer = null;
		this.secondPlayer = null;
		this.thirdPlayer = null;
		this.fourthPlayer = null;
		this.hostUserIds = [];
		this.clientUserIds = [];

		players.forEach((player) => {
			if (player.userId === this.currentUserId) {
				this.currentPlayer = player;

				if (player.userId === game.players[0].id) {
					this.currentPlayerKey = 'player1';
				} else if (player.userId === game.players[1].id) {
					this.currentPlayerKey = 'player2';
				} else if (player.userId === game.players[2].id) {
					this.currentPlayerKey = 'player3';
				} else if (player.userId === game.players[3].id) {
					this.currentPlayerKey = 'player4';
				}
			}

			if (player.userId === game.players[0].id) {
				this.firstPlayer = player;
				this.hostUserIds.push(player.userId);
			} else if (player.userId === game.players[1].id) {
				this.secondPlayer = player;
				this.clientUserIds.push(player.userId);
			} else if (player.userId === game.players[2].id) {
				this.thirdPlayer = player;
				this.hostUserIds.push(player.userId);
			} else if (player.userId === game.players[3].id) {
				this.fourthPlayer = player;
				this.clientUserIds.push(player.userId);
			}
		});
	}

	private fetchGame() {
		return Games.findOne({_id: this.gameId});
	}

	private initTournament() {
		this.tournament = Tournaments.findOne({_id: this.tournamentId});
	}

	private updateStartedAt(startedAt: number) {
		this.startedAt = startedAt;
	}
}
