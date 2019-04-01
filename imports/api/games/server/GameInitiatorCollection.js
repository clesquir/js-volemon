/** @type {ServerGameInitiator[]} */
let gameInitiators = {};

export default class GameInitiatorCollection {
	static get() {
		return gameInitiators;
	}

	static unset(gameId) {
		if (gameInitiators[gameId]) {
			gameInitiators[gameId].stop();
			delete gameInitiators[gameId];
		}
	}
}
