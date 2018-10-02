import {TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import GameData from '/imports/api/games/data/GameData.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {PLAYER_DEFAULT_SHAPE} from '/imports/api/games/shapeConstants.js';
import {
	hasGameAborted,
	hasGameStatusEndedWithAWinner,
	isDeucePoint,
	isGameStatusOnGoing,
	isGameStatusStarted,
	isMatchPoint
} from '/imports/api/games/utils.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';

export default class CollectionGameData extends GameData {
	tournament = null;

	/**
	 * @param {string} gameId
	 * @param {string} currentUserId
	 */
	constructor(gameId, currentUserId) {
		super();
		this.gameId = gameId;
		this.currentUserId = currentUserId;
		this._activeBonuses = [];
	}

	/**
	 * Init before starting game to gather newly joined players
	 */
	init() {
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

	gamePlayerFromKey(playerKey) {
		if (playerKey === 'player1') {
			return this.firstGamePlayer;
		} else if (playerKey === 'player2') {
			return this.secondGamePlayer;
		} else if (playerKey === 'player3') {
			return this.thirdGamePlayer;
		} else if (playerKey === 'player4') {
			return this.fourthGamePlayer;
		}

		return null;
	}

	playerFromKey(playerKey) {
		if (playerKey === 'player1') {
			return this.firstPlayer;
		} else if (playerKey === 'player2') {
			return this.secondPlayer;
		} else if (playerKey === 'player3') {
			return this.thirdPlayer;
		} else if (playerKey === 'player4') {
			return this.fourthPlayer;
		}

		return null;
	}

	/**
	 * @param playerKey
	 * @returns string Returns the player shape or PLAYER_DEFAULT_SHAPE if no game nor player is found
	 */
	getPlayerShapeFromKey(playerKey) {
		let player = this.gamePlayerFromKey(playerKey);

		if (!player) {
			return PLAYER_DEFAULT_SHAPE;
		}

		return player.shape;
	}

	/**
	 * @param playerKey
	 * @returns string Returns the player shape or PLAYER_DEFAULT_SHAPE if no game nor player is found
	 */
	getPlayerPolygonFromKey(playerKey) {
		let player = this.gamePlayerFromKey(playerKey);

		if (!player) {
			return PLAYER_DEFAULT_SHAPE;
		}

		return player.shape;
	}

	getCurrentPlayerKey() {
		return this.currentPlayerKey;
	}

	isCurrentPlayerKey(playerKey) {
		let player = this.playerFromKey(playerKey);

		return player && this.currentPlayer && player._id === this.currentPlayer._id;
	}

	isFirstPlayerComputer() {
		return this.firstGamePlayer && this.firstGamePlayer.id === 'CPU';
	}

	isSecondPlayerComputer() {
		return this.secondGamePlayer && this.secondGamePlayer.id === 'CPU';
	}

	isThirdPlayerComputer() {
		return this.thirdGamePlayer && this.thirdGamePlayer.id === 'CPU';
	}

	isFourthPlayerComputer() {
		return this.fourthGamePlayer && this.fourthGamePlayer.id === 'CPU';
	}

	isFirstPlayerComputerMachineLearning() {
		return this.firstGamePlayer && this.firstGamePlayer.isMachineLearning === true;
	}

	isSecondPlayerComputerMachineLearning() {
		return this.secondGamePlayer && this.secondGamePlayer.isMachineLearning === true;
	}

	isThirdPlayerComputerMachineLearning() {
		return this.thirdGamePlayer && this.thirdGamePlayer.isMachineLearning === true;
	}

	isFourthPlayerComputerMachineLearning() {
		return this.fourthGamePlayer && this.fourthGamePlayer.isMachineLearning === true;
	}

	isTwoVersusTwo() {
		return this.gameMode === TWO_VS_TWO_GAME_MODE;
	}

	isUserCreator() {
		return (this.createdBy === this.currentUserId);
	}

	isUserHost() {
		return this.currentUserId && this.hostUserIds.indexOf(this.currentUserId) !== -1;
	}

	isUserClient() {
		return this.currentUserId && this.clientUserIds.indexOf(this.currentUserId) !== -1;
	}

	isUserPlayer() {
		return this.isUserHost() || this.isUserClient();
	}

	isUserViewer() {
		return !this.isUserPlayer();
	}

	isGameStatusOnGoing() {
		return isGameStatusOnGoing(this.status);
	}

	isGameStatusStarted() {
		return isGameStatusStarted(this.status);
	}

	hasGameStatusEndedWithAWinner() {
		return hasGameStatusEndedWithAWinner(this.status);
	}

	hasGameAborted() {
		return hasGameAborted(this.status);
	}

	numberMaximumPoints() {
		return this.maximumPoints;
	}

	isMatchPoint() {
		return isMatchPoint(this.hostPoints, this.clientPoints, this.maximumPoints);
	}

	isDeucePoint() {
		return isDeucePoint(this.hostPoints, this.clientPoints, this.maximumPoints);
	}

	/**
	 * @returns Array
	 */
	activeBonuses() {
		return this._activeBonuses;
	}

	initPlayers(game) {
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

	fetchGame() {
		return Games.findOne({_id: this.gameId});
	}

	initTournament() {
		this.tournament = Tournaments.findOne({_id: this.tournamentId});
	}

	hasTournament() {
		return !!this.tournamentId;
	}

	isTournamentPractice() {
		return this.hasTournament() && this.tournament.status.id !== 'approved';
	}

	updateStartedAt(startedAt) {
		this.startedAt = startedAt;
	}

	updateHostPoints(hostPoints) {
		this.hostPoints = hostPoints;
	}

	updateClientPoints(clientPoints) {
		this.clientPoints = clientPoints;
	}

	updateLastPointTaken(lastPointTaken) {
		this.lastPointTaken = lastPointTaken;
	}

	updateLastPointAt(lastPointAt) {
		this.lastPointAt = lastPointAt;
	}

	updateStatus(status) {
		this.status = status;
	}

	updateActiveBonuses(activeBonuses) {
		this._activeBonuses = activeBonuses;
	}
}
