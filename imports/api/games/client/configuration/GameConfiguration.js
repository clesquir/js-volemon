import {
	BONUS_RADIUS,
	WORLD_GRAVITY
} from '/imports/api/games/constants.js';
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

	bonusRadius() {
		if (this.hasTournament() && this.tournamentMode.overridesBonusRadius()) {
			return this.tournamentMode.bonusRadius();
		}

		return BONUS_RADIUS;
	}

	worldGravity() {
		if (this.hasTournament() && this.tournamentMode.overridesWorldGravity()) {
			return this.tournamentMode.worldGravity();
		}

		return WORLD_GRAVITY;
	}

	bonusSpawnMinimumFrequence() {
		return BONUS_SPAWN_MINIMUM_FREQUENCE;
	}

	bonusSpawnInitialMinimumFrequence() {
		if (this.hasTournament() && this.tournamentMode.overridesBonusSpawnInitialMinimumFrequence()) {
			return this.tournamentMode.bonusSpawnInitialMinimumFrequence();
		}

		return BONUS_SPAWN_INITIAL_MINIMUM_FREQUENCE;
	}

	bonusSpawnInitialMaximumFrequence() {
		if (this.hasTournament() && this.tournamentMode.overridesBonusSpawnInitialMaximumFrequence()) {
			return this.tournamentMode.bonusSpawnInitialMaximumFrequence();
		}

		return BONUS_SPAWN_INITIAL_MAXIMUM_FREQUENCE;
	}

	overridesRandomBonusKeyList() {
		return (this.hasTournament() && this.tournamentMode.overridesRandomBonusKeyList());
	}

	randomBonusKeyList() {
		if (!this.overridesRandomBonusKeyList()) {
			throw 'The random bonus key list is not overridden';
		}

		return this.tournamentMode.randomBonusKeyList();
	}

	overridesAvailableBonuses() {
		return (this.hasTournament() && this.tournamentMode.overridesAvailableBonuses());
	}

	availableBonuses() {
		if (!this.overridesAvailableBonuses()) {
			throw 'The available bonuses are not overridden';
		}

		return this.tournamentMode.availableBonuses();
	}
}
