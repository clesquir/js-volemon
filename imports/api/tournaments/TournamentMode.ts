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
	overriddenInitialPlayerScale;
	overriddenSmallPlayerScale;
	overriddenBigPlayerScale;
	overriddenInitialBallScale;
	overriddenSmallBallScale;
	overriddenBigBallScale;
	overriddenListOfShapes;
	overriddenAllowedListOfShapes;
	overriddenCurrentPlayerShape;
	overriddenIsHiddenToHimself;
	overriddenIsHiddenToOpponent;
	overriddenNetWidth;
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

	overridesWorldGravity(): boolean {
		return this.overriddenWorldGravity !== undefined;
	}

	worldGravity(): number {
		return this.overriddenWorldGravity;
	}

	overridesWorldRestitution(): boolean {
		return this.overriddenWorldRestitution !== undefined;
	}

	worldRestitution(): number {
		return this.overriddenWorldRestitution;
	}

	overridesMaximumBonusesOnScreen(): boolean {
		return this.overriddenMaximumBonusesOnScreen !== undefined;
	}

	maximumBonusesOnScreen(): number {
		return this.overriddenMaximumBonusesOnScreen;
	}

	overridesBonusSpawnMinimumFrequence(): boolean {
		return this.overriddenBonusSpawnMinimumFrequence !== undefined;
	}

	bonusSpawnMinimumFrequence(): number {
		return this.overriddenBonusSpawnMinimumFrequence;
	}

	overridesBonusSpawnInitialMinimumFrequence(): boolean {
		return this.overriddenBonusSpawnInitialMinimumFrequence !== undefined;
	}

	bonusSpawnInitialMinimumFrequence(): number {
		return this.overriddenBonusSpawnInitialMinimumFrequence;
	}

	overridesBonusSpawnInitialMaximumFrequence(): boolean {
		return this.overriddenBonusSpawnInitialMaximumFrequence !== undefined;
	}

	bonusSpawnInitialMaximumFrequence(): number {
		return this.overriddenBonusSpawnInitialMaximumFrequence;
	}

	overridesAvailableBonuses(): boolean {
		return this.overriddenAvailableBonuses !== undefined;
	}

	availableBonuses(): string[] {
		return this.overriddenAvailableBonuses;
	}

	overridesAvailableBonusesForRandom(): boolean {
		return this.overriddenAvailableBonusesForRandom !== undefined;
	}

	availableBonusesForRandom(): string[] {
		return this.overriddenAvailableBonusesForRandom;
	}

	overridesBonusDuration(): boolean {
		return this.overriddenBonusDuration !== undefined;
	}

	bonusDuration(): number {
		return this.overriddenBonusDuration;
	}

	overridesForfeitMinimumPoints(): boolean {
		return this.overriddenForfeitMinimumPoints !== undefined;
	}

	forfeitMinimumPoints(): number {
		return this.overriddenForfeitMinimumPoints;
	}

	overridesMaximumPoints(): boolean {
		return this.overriddenMaximumPoints !== undefined;
	}

	maximumPoints(): number {
		return this.overriddenMaximumPoints;
	}

	overridesHasBonuses(): boolean {
		return this.overriddenHasBonuses !== undefined;
	}

	hasBonuses(): boolean {
		return parseInt(this.overriddenHasBonuses) === 1;
	}

	overridesInitialPlayerScale(): boolean {
		return this.overriddenInitialPlayerScale !== undefined;
	}

	initialPlayerScale(): number {
		return this.overriddenInitialPlayerScale;
	}

	overridesSmallPlayerScale(): boolean {
		return this.overriddenSmallPlayerScale !== undefined;
	}

	smallPlayerScale(): number {
		return this.overriddenSmallPlayerScale;
	}

	overridesBigPlayerScale(): boolean {
		return this.overriddenBigPlayerScale !== undefined;
	}

	bigPlayerScale(): number {
		return this.overriddenBigPlayerScale;
	}

	overridesInitialBallScale(): boolean {
		return this.overriddenInitialBallScale !== undefined;
	}

	initialBallScale(): number {
		return this.overriddenInitialBallScale;
	}

	overridesSmallBallScale(): boolean {
		return this.overriddenSmallBallScale !== undefined;
	}

	smallBallScale(): number {
		return this.overriddenSmallBallScale;
	}

	overridesBigBallScale(): boolean {
		return this.overriddenBigBallScale !== undefined;
	}

	bigBallScale(): number {
		return this.overriddenBigBallScale;
	}

	overridesListOfShapes(): boolean {
		return this.overriddenListOfShapes !== undefined;
	}

	listOfShapes(): string[] {
		return this.overriddenListOfShapes;
	}

	overridesAllowedListOfShapes(): boolean {
		return this.overriddenAllowedListOfShapes !== undefined;
	}

	allowedListOfShapes(): string[] {
		return this.overriddenAllowedListOfShapes;
	}

	overridesCurrentPlayerShape(): boolean {
		return this.overriddenCurrentPlayerShape !== undefined;
	}

	currentPlayerShape(): string {
		return this.overriddenCurrentPlayerShape;
	}

	overridesIsHiddenToHimself(): boolean {
		return this.overriddenIsHiddenToHimself !== undefined;
	}

	isHiddenToHimself(): boolean {
		return parseInt(this.overriddenIsHiddenToHimself) === 1;
	}

	overridesIsHiddenToOpponent(): boolean {
		return this.overriddenIsHiddenToOpponent !== undefined;
	}

	isHiddenToOpponent(): boolean {
		return parseInt(this.overriddenIsHiddenToOpponent) === 1;
	}

	overridesNetWidth(): boolean {
		return this.overriddenNetWidth !== undefined;
	}

	netWidth(): number {
		return parseInt(this.overriddenNetWidth);
	}

	overridesNetHeight(): boolean {
		return this.overriddenNetHeight !== undefined;
	}

	netHeight(): number {
		return parseInt(this.overriddenNetHeight);
	}

	overridesLevelSize(): boolean {
		return this.overridesLevelWidth() || this.overridesLevelHeight();
	}

	overridesLevelWidth(): boolean {
		return this.overriddenLevelWidth !== undefined;
	}

	overridesLevelHeight(): boolean {
		return this.overriddenLevelHeight !== undefined;
	}

	levelWidth(): number {
		return parseInt(this.overriddenLevelWidth);
	}

	levelHeight(): number {
		return parseInt(this.overriddenLevelHeight);
	}

	overridesPlayerXVelocity(): boolean {
		return this.overriddenPlayerXVelocity !== undefined;
	}

	playerXVelocity(): number {
		return parseInt(this.overriddenPlayerXVelocity);
	}

	overridesPlayerYVelocity(): boolean {
		return this.overriddenPlayerYVelocity !== undefined;
	}

	playerYVelocity(): number {
		return parseInt(this.overriddenPlayerYVelocity);
	}

	overridesPlayerDropshotEnabled(): boolean {
		return this.overriddenPlayerDropshotEnabled !== undefined;
	}

	playerDropshotEnabled(): boolean {
		return parseInt(this.overriddenPlayerDropshotEnabled) === 1;
	}

	overridesPlayerSmashEnabled(): boolean {
		return this.overriddenPlayerSmashEnabled !== undefined;
	}

	playerSmashEnabled(): boolean {
		return parseInt(this.overriddenPlayerSmashEnabled) === 1;
	}

	overridesBallReboundOnPlayerEnabled(): boolean {
		return this.overriddenBallReboundOnPlayerEnabled !== undefined;
	}

	ballReboundOnPlayerEnabled(): boolean {
		return parseInt(this.overriddenBallReboundOnPlayerEnabled) === 1;
	}

	overridesBallVelocityOnReboundOnPlayer(): boolean {
		return this.overriddenBallVelocityOnReboundOnPlayer !== undefined;
	}

	ballVelocityOnReboundOnPlayer(): number {
		return parseInt(this.overriddenBallVelocityOnReboundOnPlayer);
	}

	overridesPlayerMaximumBallHit(): boolean {
		return this.overriddenPlayerMaximumBallHit !== undefined;
	}

	playerMaximumBallHit(): number {
		return parseInt(this.overriddenPlayerMaximumBallHit);
	}

	overridesTeamMaximumBallHit(): boolean {
		return this.overriddenTeamMaximumBallHit !== undefined;
	}

	teamMaximumBallHit(): number {
		return parseInt(this.overriddenTeamMaximumBallHit);
	}

	overridesForcePracticeWithComputer(): boolean {
		return this.overriddenForcePracticeWithComputer !== undefined;
	}

	forcePracticeWithComputer(): boolean {
		return parseInt(this.overriddenForcePracticeWithComputer) === 1;
	}

	static fromTournament(tournament: any) {
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
		tournamentMode.overriddenInitialPlayerScale = mode.overriddenInitialPlayerScale;
		tournamentMode.overriddenSmallPlayerScale = mode.overriddenSmallPlayerScale;
		tournamentMode.overriddenBigPlayerScale = mode.overriddenBigPlayerScale;
		tournamentMode.overriddenInitialBallScale = mode.overriddenInitialBallScale;
		tournamentMode.overriddenSmallBallScale = mode.overriddenSmallBallScale;
		tournamentMode.overriddenBigBallScale = mode.overriddenBigBallScale;
		tournamentMode.overriddenListOfShapes = mode.overriddenListOfShapes;
		tournamentMode.overriddenAllowedListOfShapes = mode.overriddenAllowedListOfShapes;
		tournamentMode.overriddenCurrentPlayerShape = mode.overriddenCurrentPlayerShape;
		tournamentMode.overriddenIsHiddenToHimself = mode.overriddenIsHiddenToHimself;
		tournamentMode.overriddenIsHiddenToOpponent = mode.overriddenIsHiddenToOpponent;
		tournamentMode.overriddenNetWidth = mode.overriddenNetWidth;
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
