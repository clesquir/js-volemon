/** @type {ServerGameInitiator[]} */
let gameInitiators = {};

export default class GameInitiatorCollection {
	static get() {
		return gameInitiators;
	}

	static stop(gameId) {
		if (gameInitiators[gameId]) {
			gameInitiators[gameId].stop();
		}
	}

	static unset(gameId) {
		if (gameInitiators[gameId]) {
			gameInitiators[gameId].destroy();
			delete gameInitiators[gameId];
		}
	}
}
