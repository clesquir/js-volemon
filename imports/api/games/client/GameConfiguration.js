import {
	BONUS_SPAWN_MINIMUM_FREQUENCE,
	BONUS_SPAWN_INITIAL_MINIMUM_FREQUENCE,
	BONUS_SPAWN_INITIAL_MAXIMUM_FREQUENCE
} from '/imports/api/games/emissionConstants.js';

export default class GameConfiguration {
	/**
	 * @param {string} gameId
	 */
	constructor(gameId) {
		this.gameId = gameId;
		this.tournamentId = null;
		/** @type {Classic} */
		this.tournamentMode = null;
	}

	init() {
	}

	hasTournament() {
		return !!this.tournamentId;
	}

	bonusSpawnMinimumFrequence() {
		return BONUS_SPAWN_MINIMUM_FREQUENCE;
	}

	bonusSpawnInitialMinimumFrequence() {
		if (this.hasTournament()) {
			return this.tournamentMode.bonusSpawnInitialMinimumFrequence();
		}

		return BONUS_SPAWN_INITIAL_MINIMUM_FREQUENCE;
	}

	bonusSpawnInitialMaximumFrequence() {
		if (this.hasTournament()) {
			return this.tournamentMode.bonusSpawnInitialMaximumFrequence();
		}

		return BONUS_SPAWN_INITIAL_MAXIMUM_FREQUENCE;
	}
}
