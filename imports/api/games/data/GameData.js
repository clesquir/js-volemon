export default class GameData {
	init() {
	}

	/**
	 * @param playerKey
	 * @returns string Returns the player shape or PLAYER_DEFAULT_SHAPE if no game nor player is found
	 */
	getPlayerShapeFromKey(playerKey) {
	}

	/**
	 * @param playerKey
	 * @returns string Returns the player shape or PLAYER_DEFAULT_SHAPE if no game nor player is found
	 */
	getPlayerPolygonFromKey(playerKey) {
	}

	isCurrentPlayerKey(playerKey) {
	}

	isUserHost() {
	}

	isUserClient() {
	}

	isUserViewer() {
	}

	isUserHostTargetPlayer(playerKey) {
	}

	isUserClientTargetPlayer(playerKey) {
	}

	isUserHostNotTargetPlayer(playerKey) {
	}

	isUserClientNotTargetPlayer(playerKey) {
	}

	isGameStatusOnGoing() {
	}

	isGameStatusStarted() {
	}

	hasGameStatusEndedWithAWinner() {
	}

	hasGameAborted() {
	}

	numberMaximumPoints() {
	}

	isMatchPoint() {
	}

	isDeucePoint() {
	}

	/**
	 * @returns Array
	 */
	activeBonuses() {
	}

	hasTournament() {
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
