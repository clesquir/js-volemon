export default class TournamentMode {
	overriddenWorldGravity;
	overriddenWorldRestitution;
	overriddenMaximumBonusesOnScreen;
	overriddenBonusSpawnMinimumFrequence;
	overriddenBonusSpawnInitialMinimumFrequence;
	overriddenBonusSpawnInitialMaximumFrequence;
	overriddenAvailableBonuses;
	overriddenAvailableBonusesForRandom;
	overriddenBonusDuration;
	overriddenForfeitMinimumPoints;
	overriddenMaximumPoints;
	overriddenHasBonuses;
	overriddenInitialPlayerPolygonKey;
	overriddenInitialBallPolygonKey;
	overriddenListOfShapes;
	overriddenAllowedListOfShapes;
	overriddenCurrentPlayerShape;
	overriddenIsHiddenToHimself;
	overriddenIsHiddenToOpponent;
	overriddenNetHeight;
	overriddenLevelWidth;
	overriddenLevelHeight;
	overriddenPlayerXVelocity;
	overriddenPlayerYVelocity;
	overriddenPlayerDropshotEnabled;
	overriddenPlayerSmashEnabled;
	overriddenBallReboundOnPlayerEnabled;
	overriddenBallVelocityOnReboundOnPlayer;
	overriddenPlayerMaximumBallHit;
	overriddenTeamMaximumBallHit;
	overriddenForcePracticeWithComputer;

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

	overridesMaximumBonusesOnScreen() {
		return this.overriddenMaximumBonusesOnScreen !== undefined;
	}

	maximumBonusesOnScreen() {
		return this.overriddenMaximumBonusesOnScreen;
	}

	overridesBonusSpawnMinimumFrequence() {
		return this.overriddenBonusSpawnMinimumFrequence !== undefined;
	}

	bonusSpawnMinimumFrequence() {
		return this.overriddenBonusSpawnMinimumFrequence;
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

	bonusDuration() {
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
		return parseInt(this.overriddenHasBonuses) === 1;
	}

	overridesInitialPlayerPolygonKey() {
		return this.overriddenInitialPlayerPolygonKey !== undefined;
	}

	initialPlayerPolygonKey() {
		return this.overriddenInitialPlayerPolygonKey;
	}

	overridesInitialBallPolygonKey() {
		return this.overriddenInitialBallPolygonKey !== undefined;
	}

	initialBallPolygonKey() {
		return this.overriddenInitialBallPolygonKey;
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

	overridesIsHiddenToHimself() {
		return this.overriddenIsHiddenToHimself !== undefined;
	}

	isHiddenToHimself() {
		return parseInt(this.overriddenIsHiddenToHimself) === 1;
	}

	overridesIsHiddenToOpponent() {
		return this.overriddenIsHiddenToOpponent !== undefined;
	}

	isHiddenToOpponent() {
		return parseInt(this.overriddenIsHiddenToOpponent) === 1;
	}

	overridesNetHeight() {
		return this.overriddenNetHeight !== undefined;
	}

	netHeight() {
		return parseInt(this.overriddenNetHeight);
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
		return parseInt(this.overriddenLevelWidth);
	}

	/**
	 * @returns {int}
	 */
	levelHeight() {
		return parseInt(this.overriddenLevelHeight);
	}

	overridesPlayerXVelocity() {
		return this.overriddenPlayerXVelocity !== undefined;
	}

	playerXVelocity() {
		return parseInt(this.overriddenPlayerXVelocity);
	}

	overridesPlayerYVelocity() {
		return this.overriddenPlayerYVelocity !== undefined;
	}

	playerYVelocity() {
		return parseInt(this.overriddenPlayerYVelocity);
	}

	overridesPlayerDropshotEnabled() {
		return this.overriddenPlayerDropshotEnabled !== undefined;
	}

	playerDropshotEnabled() {
		return parseInt(this.overriddenPlayerDropshotEnabled) === 1;
	}

	overridesPlayerSmashEnabled() {
		return this.overriddenPlayerSmashEnabled !== undefined;
	}

	playerSmashEnabled() {
		return parseInt(this.overriddenPlayerSmashEnabled) === 1;
	}

	overridesBallReboundOnPlayerEnabled() {
		return this.overriddenBallReboundOnPlayerEnabled !== undefined;
	}

	ballReboundOnPlayerEnabled() {
		return parseInt(this.overriddenBallReboundOnPlayerEnabled) === 1;
	}

	overridesBallVelocityOnReboundOnPlayer() {
		return this.overriddenBallVelocityOnReboundOnPlayer !== undefined;
	}

	ballVelocityOnReboundOnPlayer() {
		return parseInt(this.overriddenBallVelocityOnReboundOnPlayer);
	}

	overridesPlayerMaximumBallHit() {
		return this.overriddenPlayerMaximumBallHit !== undefined;
	}

	playerMaximumBallHit() {
		return parseInt(this.overriddenPlayerMaximumBallHit);
	}

	overridesTeamMaximumBallHit() {
		return this.overriddenTeamMaximumBallHit !== undefined;
	}

	teamMaximumBallHit() {
		return parseInt(this.overriddenTeamMaximumBallHit);
	}

	overridesForcePracticeWithComputer() {
		return this.overriddenForcePracticeWithComputer !== undefined;
	}

	forcePracticeWithComputer() {
		return parseInt(this.overriddenForcePracticeWithComputer) === 1;
	}

	static fromTournament(tournament) {
		const tournamentMode = new TournamentMode();
		const mode = tournament.mode;

		tournamentMode.overriddenWorldGravity = mode.overriddenWorldGravity;
		tournamentMode.overriddenWorldRestitution = mode.overriddenWorldRestitution;
		tournamentMode.overriddenMaximumBonusesOnScreen = mode.overriddenMaximumBonusesOnScreen;
		tournamentMode.overriddenBonusSpawnMinimumFrequence = mode.overriddenBonusSpawnMinimumFrequence;
		tournamentMode.overriddenBonusSpawnInitialMinimumFrequence = mode.overriddenBonusSpawnInitialMinimumFrequence;
		tournamentMode.overriddenBonusSpawnInitialMaximumFrequence = mode.overriddenBonusSpawnInitialMaximumFrequence;
		tournamentMode.overriddenAvailableBonuses = mode.overriddenAvailableBonuses;
		tournamentMode.overriddenAvailableBonusesForRandom = mode.overriddenAvailableBonusesForRandom;
		tournamentMode.overriddenBonusDuration = mode.overriddenBonusDuration;
		tournamentMode.overriddenForfeitMinimumPoints = mode.overriddenForfeitMinimumPoints;
		tournamentMode.overriddenMaximumPoints = mode.overriddenMaximumPoints;
		tournamentMode.overriddenHasBonuses = mode.overriddenHasBonuses;
		tournamentMode.overriddenInitialPlayerPolygonKey = mode.overriddenInitialPlayerPolygonKey;
		tournamentMode.overriddenInitialBallPolygonKey = mode.overriddenInitialBallPolygonKey;
		tournamentMode.overriddenListOfShapes = mode.overriddenListOfShapes;
		tournamentMode.overriddenAllowedListOfShapes = mode.overriddenAllowedListOfShapes;
		tournamentMode.overriddenCurrentPlayerShape = mode.overriddenCurrentPlayerShape;
		tournamentMode.overriddenIsHiddenToHimself = mode.overriddenIsHiddenToHimself;
		tournamentMode.overriddenIsHiddenToOpponent = mode.overriddenIsHiddenToOpponent;
		tournamentMode.overriddenNetHeight = mode.overriddenNetHeight;
		tournamentMode.overriddenLevelWidth = mode.overriddenLevelWidth;
		tournamentMode.overriddenLevelHeight = mode.overriddenLevelHeight;
		tournamentMode.overriddenPlayerXVelocity = mode.overriddenPlayerXVelocity;
		tournamentMode.overriddenPlayerYVelocity = mode.overriddenPlayerYVelocity;
		tournamentMode.overriddenPlayerDropshotEnabled = mode.overriddenPlayerDropshotEnabled;
		tournamentMode.overriddenPlayerSmashEnabled = mode.overriddenPlayerSmashEnabled;
		tournamentMode.overriddenBallReboundOnPlayerEnabled = mode.overriddenBallReboundOnPlayerEnabled;
		tournamentMode.overriddenBallVelocityOnReboundOnPlayer = mode.overriddenBallVelocityOnReboundOnPlayer;
		tournamentMode.overriddenPlayerMaximumBallHit = mode.overriddenPlayerMaximumBallHit;
		tournamentMode.overriddenTeamMaximumBallHit = mode.overriddenTeamMaximumBallHit;
		tournamentMode.overriddenForcePracticeWithComputer = mode.overriddenForcePracticeWithComputer;

		return tournamentMode;
	}
}
