import {Meteor} from 'meteor/meteor';
import {Games} from '/collections/games.js';
import {Players} from '/collections/players.js';
import {
	isGameStatusOnGoing,
	isGameStatusStarted,
	isGameStatusTimeout,
	isGameStatusFinished,
	isMatchPoint,
	isDeucePoint
} from '/imports/game/utils.js';
import {Constants} from '/imports/lib/constants.js';

export default class GameData {

	/**
	 * @param {string} gameId
	 */
	constructor(gameId) {
		this.gameId = gameId;

		this.hasBonuses = false;
		this.activeBonuses = [];
	}

	/**
	 * @param playerKey
	 * @returns string Returns the player shape or PLAYER_DEFAULT_SHAPE if no game nor player is found
	 */
	getPlayerShapeFromKey(playerKey) {
		let player;

		if (playerKey == 'player1') {
			player = this.hostPlayer;
		} else {
			player = this.clientPlayer;
		}

		if (!player) {
			return Constants.PLAYER_DEFAULT_SHAPE;
		}

		return player.shape;
	}

	isUserHost() {
		return (this.createdBy === Meteor.userId() && !!this.currentPlayer);
	}

	isUserClient() {
		return (this.createdBy !== Meteor.userId() && !!this.currentPlayer);
	}

	isUserViewer() {
		return (!this.isUserHost() && !this.isUserClient());
	}

	isUserHostTargetPlayer(playerKey) {
		return this.isUserHost() && playerKey == 'player1';
	}

	isUserClientTargetPlayer(playerKey) {
		return this.isUserClient() && playerKey == 'player2';
	}

	isUserHostNotTargetPlayer(playerKey) {
		return this.isUserHost() && playerKey == 'player2';
	}

	isUserClientNotTargetPlayer(playerKey) {
		return this.isUserClient() && playerKey == 'player1';
	}

	isGameStatusOnGoing() {
		return isGameStatusOnGoing(this.status);
	}

	isGameStatusStarted() {
		return isGameStatusStarted(this.status);
	}

	isGameStatusFinished() {
		return isGameStatusFinished(this.status);
	}

	isGameStatusTimeout() {
		return isGameStatusTimeout(this.status);
	}

	isMatchPoint() {
		return isMatchPoint(this.hostPoints, this.clientPoints);
	}

	isDeucePoint() {
		return isDeucePoint(this.hostPoints, this.clientPoints);
	}

	init() {
		let game = this.fetchGame();

		this.createdBy = game.createdBy;

		this.updateStartedAt(game.startedAt);
		this.updateHostPoints(game.hostPoints);
		this.updateClientPoints(game.clientPoints);
		this.updateLastPointTaken(game.lastPointTaken);
		this.updateLastPointAt(game.lastPointAt);
		this.updateStatus(game.status);
		this.updateHasBonuses(game.hasBonuses);
		this.updateActiveBonuses(game.activeBonuses);

		this.initPlayers();
	}

	initPlayers() {
		let players = Players.find({gameId: this.gameId});

		this.currentPlayer = null;
		this.hostPlayer = null;
		this.clientPlayer = null;

		players.forEach((player) => {
			if (player.userId == Meteor.userId()) {
				this.currentPlayer = player;
			}

			if (player.userId == this.createdBy) {
				this.hostPlayer = player;
			} else {
				this.clientPlayer = player;
			}
		});
	}

	fetchGame() {
		return Games.findOne({_id: this.gameId});
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

	updateHasBonuses(hasBonuses) {
		this.hasBonuses = hasBonuses;
	}

	updateActiveBonuses(activeBonuses) {
		this.activeBonuses = activeBonuses;
	}

}
