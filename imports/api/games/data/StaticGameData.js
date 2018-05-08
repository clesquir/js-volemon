import GameData from '/imports/api/games/data/GameData.js';
import {PLAYER_DEFAULT_SHAPE} from '/imports/api/games/shapeConstants.js';

export default class StaticGameData extends GameData {
	init() {
		this.maximumPoints = 1;
		this.hasBonuses = false;
		this.createdBy = Random.id();
		this.tournamentId = null;
	}

	/**
	 * @param playerKey
	 * @returns string Returns the player shape or PLAYER_DEFAULT_SHAPE if no game nor player is found
	 */
	getPlayerShapeFromKey(playerKey) {
		return PLAYER_DEFAULT_SHAPE;
	}

	/**
	 * @param playerKey
	 * @returns string Returns the player shape or PLAYER_DEFAULT_SHAPE if no game nor player is found
	 */
	getPlayerPolygonFromKey(playerKey) {
		return PLAYER_DEFAULT_SHAPE;
	}

	getCurrentPlayerKey() {
		return 'player1';
	}

	isCurrentPlayerKey(playerKey) {
		return false;
	}

	isTwoVersusTwo() {
		return false;
	}

	isUserCreator() {
		return true;
	}

	isUserHost() {
		return false;
	}

	isUserClient() {
		return false;
	}

	isUserViewer() {
		return false;
	}

	isGameStatusOnGoing() {
		return false;
	}

	isGameStatusStarted() {
		return false;
	}

	hasGameStatusEndedWithAWinner() {
		return false;
	}

	hasGameAborted() {
		return false;
	}

	numberMaximumPoints() {
		return 1;
	}

	isMatchPoint() {
		return false;
	}

	isDeucePoint() {
		return false;
	}

	/**
	 * @returns Array
	 */
	activeBonuses() {
		return [];
	}

	hasTournament() {
		return false;
	}

	updateHostPoints(hostPoints) {
	}

	updateClientPoints(clientPoints) {
	}

	updateLastPointTaken(lastPointTaken) {
	}

	updateLastPointAt(lastPointAt) {
	}

	updateStatus(status) {
	}

	updateActiveBonuses(activeBonuses) {
	}
}
