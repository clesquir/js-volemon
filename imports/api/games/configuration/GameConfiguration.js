import {
	GAME_FORFEIT_MINIMUM_POINTS,
	GAME_MAXIMUM_POINTS,
	BONUS_RADIUS,
	WORLD_GRAVITY,
	WORLD_RESTITUTION
} from '/imports/api/games/constants.js';
import {
	BONUS_SPAWN_MINIMUM_FREQUENCE,
	BONUS_SPAWN_INITIAL_MINIMUM_FREQUENCE,
	BONUS_SPAWN_INITIAL_MAXIMUM_FREQUENCE
} from '/imports/api/games/emissionConstants.js';
import {PLAYER_LIST_OF_SHAPES, PLAYER_ALLOWED_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js';

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

	forfeitMinimumPoints() {
		if (this.hasTournament() && this.tournamentMode.overridesForfeitMinimumPoints()) {
			return this.tournamentMode.forfeitMinimumPoints();
		}

		return GAME_FORFEIT_MINIMUM_POINTS;
	}

	maximumPoints() {
		if (this.hasTournament() && this.tournamentMode.overridesMaximumPoints()) {
			return this.tournamentMode.maximumPoints();
		}

		return GAME_MAXIMUM_POINTS;
	}

	listOfShapes() {
		if (this.hasTournament() && this.tournamentMode.overridesListOfShapes()) {
			return this.tournamentMode.listOfShapes();
		}

		return PLAYER_LIST_OF_SHAPES;
	}

	allowedListOfShapes() {
		if (this.hasTournament() && this.tournamentMode.overridesAllowedListOfShapes()) {
			return this.tournamentMode.allowedListOfShapes();
		}

		return PLAYER_ALLOWED_LIST_OF_SHAPES;
	}

	overridesCurrentPlayerShape() {
		return (this.hasTournament() && this.tournamentMode.overridesCurrentPlayerShape());
	}

	currentPlayerShape() {
		if (!this.overridesCurrentPlayerShape()) {
			throw 'The shape is not overridden';
		}

		return this.tournamentMode.currentPlayerShape();
	}

	hasBonuses() {
		if (this.hasTournament() && this.tournamentMode.overridesHasBonuses()) {
			return this.tournamentMode.hasBonuses();
		}

		return true;
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

	worldRestitution() {
		if (this.hasTournament() && this.tournamentMode.overridesWorldRestitution()) {
			return this.tournamentMode.worldRestitution();
		}

		return WORLD_RESTITUTION;
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
