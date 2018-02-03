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

export default class CollectionGameData extends GameData {
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

		this.initPlayers();
	}

	/**
	 * @param playerKey
	 * @returns string Returns the player shape or PLAYER_DEFAULT_SHAPE if no game nor player is found
	 */
	getPlayerShapeFromKey(playerKey) {
		let player;

		if (playerKey === 'player1') {
			player = this.hostPlayer;
		} else {
			player = this.clientPlayer;
		}

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
		let player;

		if (playerKey === 'player1') {
			player = this.hostPlayer;
		} else {
			player = this.clientPlayer;
		}

		if (!player) {
			return PLAYER_DEFAULT_SHAPE;
		}

		return player.shape;
	}

	isCurrentPlayerKey(playerKey) {
		return (
			(playerKey === 'player1' && this.isUserHost()) ||
			(playerKey === 'player2' && this.isUserClient())
		);
	}

	isUserCreator() {
		return (this.createdBy === this.currentUserId);
	}

	isUserHost() {
		return (this.isUserCreator() && !!this.currentPlayer);
	}

	isUserClient() {
		return (!this.isUserCreator() && !!this.currentPlayer);
	}

	isUserViewer() {
		return (!this.isUserHost() && !this.isUserClient());
	}

	isUserHostTargetPlayer(playerKey) {
		return this.isUserHost() && playerKey === 'player1';
	}

	isUserClientTargetPlayer(playerKey) {
		return this.isUserClient() && playerKey === 'player2';
	}

	isUserHostNotTargetPlayer(playerKey) {
		return this.isUserHost() && playerKey === 'player2';
	}

	isUserClientNotTargetPlayer(playerKey) {
		return this.isUserClient() && playerKey === 'player1';
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

	initPlayers() {
		let players = Players.find({gameId: this.gameId});

		this.currentPlayer = null;
		this.hostPlayer = null;
		this.clientPlayer = null;

		players.forEach((player) => {
			if (player.userId === this.currentUserId) {
				this.currentPlayer = player;
			}

			if (player.userId === this.createdBy) {
				this.hostPlayer = player;
			} else {
				this.clientPlayer = player;
			}
		});
	}

	fetchGame() {
		return Games.findOne({_id: this.gameId});
	}

	hasTournament() {
		return !!this.tournamentId;
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
