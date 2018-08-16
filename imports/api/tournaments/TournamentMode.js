export default class TournamentMode {
	overriddenWorldGravity;
	overriddenWorldRestitution;
	overriddenBonusSpawnInitialMinimumFrequence;
	overriddenBonusSpawnInitialMaximumFrequence;
	overriddenAvailableBonuses;
	overriddenAvailableBonusesForRandom;
	overriddenBonusDuration;
	overriddenForfeitMinimumPoints;
	overriddenMaximumPoints;
	overriddenHasBonuses;
	overriddenListOfShapes;
	overriddenAllowedListOfShapes;
	overriddenCurrentPlayerShape;
	overriddenNetHeight;
	overriddenLevelWidth;
	overriddenLevelHeight;
	overriddenPlayerXVelocity;
	overriddenPlayerYVelocity;

	constructor() {
	}

	overridesWorldGravity() {
		return this.overriddenWorldGravity !== undefined;
	}

	worldGravity() {
		return this.overriddenWorldGravity;
	}

	overridesWorldRestitution() {
		return this.overriddenWorldRestitution !== undefined;
	}

	worldRestitution() {
		return this.overriddenWorldRestitution;
	}

	overridesBonusSpawnInitialMinimumFrequence() {
		return this.overriddenBonusSpawnInitialMinimumFrequence !== undefined;
	}

	bonusSpawnInitialMinimumFrequence() {
		return this.overriddenBonusSpawnInitialMinimumFrequence;
	}

	overridesBonusSpawnInitialMaximumFrequence() {
		return this.overriddenBonusSpawnInitialMaximumFrequence !== undefined;
	}

	bonusSpawnInitialMaximumFrequence() {
		return this.overriddenBonusSpawnInitialMaximumFrequence;
	}

	overridesAvailableBonuses() {
		return this.overriddenAvailableBonuses !== undefined;
	}

	availableBonuses() {
		return this.overriddenAvailableBonuses;
	}

	overridesAvailableBonusesForRandom() {
		return this.overriddenAvailableBonusesForRandom !== undefined;
	}

	availableBonusesForRandom() {
		return this.overriddenAvailableBonusesForRandom;
	}

	overridesBonusDuration() {
		return this.overriddenBonusDuration !== undefined;
	}

	bonusDuration(bonusDuration) {
		return this.overriddenBonusDuration;
	}

	overridesForfeitMinimumPoints() {
		return this.overriddenForfeitMinimumPoints !== undefined;
	}

	forfeitMinimumPoints() {
		return this.overriddenForfeitMinimumPoints;
	}

	overridesMaximumPoints() {
		return this.overriddenMaximumPoints !== undefined;
	}

	maximumPoints() {
		return this.overriddenMaximumPoints;
	}

	overridesHasBonuses() {
		return this.overriddenHasBonuses !== undefined;
	}

	hasBonuses() {
		return this.overriddenHasBonuses;
	}

	overridesListOfShapes() {
		return this.overriddenListOfShapes !== undefined;
	}

	listOfShapes() {
		return this.overriddenListOfShapes;
	}

	overridesAllowedListOfShapes() {
		return this.overriddenAllowedListOfShapes !== undefined;
	}

	allowedListOfShapes() {
		return this.overriddenAllowedListOfShapes;
	}

	overridesCurrentPlayerShape() {
		return this.overriddenCurrentPlayerShape !== undefined;
	}

	currentPlayerShape() {
		return this.overriddenCurrentPlayerShape;
	}

	overridesNetHeight() {
		return this.overriddenNetHeight !== undefined;
	}

	netHeight() {
		return this.overriddenNetHeight;
	}

	overridesLevelSize() {
		return this.overridesLevelWidth() || this.overridesLevelHeight();
	}

	overridesLevelWidth() {
		return this.overriddenLevelWidth !== undefined;
	}

	overridesLevelHeight() {
		return this.overriddenLevelHeight !== undefined;
	}

	/**
	 * @returns {int}
	 */
	levelWidth() {
		return this.overriddenLevelWidth;
	}

	/**
	 * @returns {int}
	 */
	levelHeight() {
		return this.overriddenLevelHeight;
	}

	overridesPlayerXVelocity() {
		return this.overriddenPlayerXVelocity !== undefined;
	}

	playerXVelocity() {
		return this.overriddenPlayerXVelocity;
	}

	overridesPlayerYVelocity() {
		return this.overriddenPlayerYVelocity !== undefined;
	}

	playerYVelocity() {
		return this.overriddenPlayerYVelocity;
	}

	static fromTournament(tournament) {
		const tournamentMode = new TournamentMode();
		const mode = tournament.mode;

		tournamentMode.overriddenWorldGravity = mode.overriddenWorldGravity;
		tournamentMode.overriddenWorldRestitution = mode.overriddenWorldRestitution;
		tournamentMode.overriddenBonusSpawnInitialMinimumFrequence = mode.overriddenBonusSpawnInitialMinimumFrequence;
		tournamentMode.overriddenBonusSpawnInitialMaximumFrequence = mode.overriddenBonusSpawnInitialMaximumFrequence;
		tournamentMode.overriddenAvailableBonuses = mode.overriddenAvailableBonuses;
		tournamentMode.overriddenAvailableBonusesForRandom = mode.overriddenAvailableBonusesForRandom;
		tournamentMode.overriddenBonusDuration = mode.overriddenBonusDuration;
		tournamentMode.overriddenForfeitMinimumPoints = mode.overriddenForfeitMinimumPoints;
		tournamentMode.overriddenMaximumPoints = mode.overriddenMaximumPoints;
		tournamentMode.overriddenHasBonuses = mode.overriddenHasBonuses;
		tournamentMode.overriddenListOfShapes = mode.overriddenListOfShapes;
		tournamentMode.overriddenAllowedListOfShapes = mode.overriddenAllowedListOfShapes;
		tournamentMode.overriddenCurrentPlayerShape = mode.overriddenCurrentPlayerShape;
		tournamentMode.overriddenNetHeight = mode.overriddenNetHeight;
		tournamentMode.overriddenLevelWidth = mode.overriddenLevelWidth;
		tournamentMode.overriddenLevelHeight = mode.overriddenLevelHeight;
		tournamentMode.overriddenPlayerXVelocity = mode.overriddenPlayerXVelocity;
		tournamentMode.overriddenPlayerYVelocity = mode.overriddenPlayerYVelocity;

		return tournamentMode;
	}
}
