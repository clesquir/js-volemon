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
	overriddenInitialPlayerScale_player1;
	overriddenInitialPlayerScale_player2;
	overriddenInitialPlayerScale_player3;
	overriddenInitialPlayerScale_player4;
	overriddenSmallPlayerScale;
	overriddenBigPlayerScale;
	overriddenInitialPlayerMass;
	overriddenInitialPlayerMass_player1;
	overriddenInitialPlayerMass_player2;
	overriddenInitialPlayerMass_player3;
	overriddenInitialPlayerMass_player4;
	overriddenSmallPlayerMass;
	overriddenBigPlayerMass;
	overriddenInitialBallScale;
	overriddenSmallBallScale;
	overriddenBigBallScale;
	overriddenBallAirFriction;
	overriddenInitialBallMass;
	overriddenSmallBallMass;
	overriddenBigBallMass;
	overriddenBonusScale;
	overriddenBonusAirFriction;
	overriddenBonusMass;
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
		return parseFloat(this.overriddenWorldGravity);
	}

	overridesWorldRestitution(): boolean {
		return this.overriddenWorldRestitution !== undefined;
	}

	worldRestitution(): number {
		return parseFloat(this.overriddenWorldRestitution);
	}

	overridesMaximumBonusesOnScreen(): boolean {
		return this.overriddenMaximumBonusesOnScreen !== undefined;
	}

	maximumBonusesOnScreen(): number {
		return parseInt(this.overriddenMaximumBonusesOnScreen);
	}

	overridesBonusSpawnMinimumFrequence(): boolean {
		return this.overriddenBonusSpawnMinimumFrequence !== undefined;
	}

	bonusSpawnMinimumFrequence(): number {
		return parseInt(this.overriddenBonusSpawnMinimumFrequence);
	}

	overridesBonusSpawnInitialMinimumFrequence(): boolean {
		return this.overriddenBonusSpawnInitialMinimumFrequence !== undefined;
	}

	bonusSpawnInitialMinimumFrequence(): number {
		return parseInt(this.overriddenBonusSpawnInitialMinimumFrequence);
	}

	overridesBonusSpawnInitialMaximumFrequence(): boolean {
		return this.overriddenBonusSpawnInitialMaximumFrequence !== undefined;
	}

	bonusSpawnInitialMaximumFrequence(): number {
		return parseInt(this.overriddenBonusSpawnInitialMaximumFrequence);
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
		return parseInt(this.overriddenBonusDuration);
	}

	overridesForfeitMinimumPoints(): boolean {
		return this.overriddenForfeitMinimumPoints !== undefined;
	}

	forfeitMinimumPoints(): number {
		return parseInt(this.overriddenForfeitMinimumPoints);
	}

	overridesMaximumPoints(): boolean {
		return this.overriddenMaximumPoints !== undefined;
	}

	maximumPoints(): number {
		return parseInt(this.overriddenMaximumPoints);
	}

	overridesHasBonuses(): boolean {
		return this.overriddenHasBonuses !== undefined;
	}

	hasBonuses(): boolean {
		return parseInt(this.overriddenHasBonuses) === 1;
	}

	overridesInitialPlayerScale(key: string): boolean {
		return (
			this['overriddenInitialPlayerScale_' + key] !== undefined ||
			this.overriddenInitialPlayerScale !== undefined
		);
	}

	initialPlayerScale(key: string): number {
		if (this['overriddenInitialPlayerScale_' + key] !== undefined) {
			return parseFloat(this['overriddenInitialPlayerScale_' + key]);
		}

		return parseFloat(this.overriddenInitialPlayerScale);
	}

	overridesSmallPlayerScale(): boolean {
		return this.overriddenSmallPlayerScale !== undefined;
	}

	smallPlayerScale(): number {
		return parseFloat(this.overriddenSmallPlayerScale);
	}

	overridesBigPlayerScale(): boolean {
		return this.overriddenBigPlayerScale !== undefined;
	}

	bigPlayerScale(): number {
		return parseFloat(this.overriddenBigPlayerScale);
	}

	overridesInitialPlayerMass(key: string): boolean {
		return (
			this['overriddenInitialPlayerMass_' + key] !== undefined ||
			this.overriddenInitialPlayerMass !== undefined
		);
	}

	initialPlayerMass(key: string): number {
		if (this['overriddenInitialPlayerMass_' + key] !== undefined) {
			return parseFloat(this['overriddenInitialPlayerMass_' + key]);
		}

		return parseFloat(this.overriddenInitialPlayerMass);
	}

	overridesSmallPlayerMass(): boolean {
		return this.overriddenSmallPlayerMass !== undefined;
	}

	smallPlayerMass(): number {
		return parseFloat(this.overriddenSmallPlayerMass);
	}

	overridesBigPlayerMass(): boolean {
		return this.overriddenBigPlayerMass !== undefined;
	}

	bigPlayerMass(): number {
		return parseFloat(this.overriddenBigPlayerMass);
	}

	overridesInitialBallScale(): boolean {
		return this.overriddenInitialBallScale !== undefined;
	}

	initialBallScale(): number {
		return parseFloat(this.overriddenInitialBallScale);
	}

	overridesSmallBallScale(): boolean {
		return this.overriddenSmallBallScale !== undefined;
	}

	smallBallScale(): number {
		return parseFloat(this.overriddenSmallBallScale);
	}

	overridesBigBallScale(): boolean {
		return this.overriddenBigBallScale !== undefined;
	}

	bigBallScale(): number {
		return parseFloat(this.overriddenBigBallScale);
	}

	overridesBallAirFriction(): boolean {
		return this.overriddenBallAirFriction !== undefined;
	}

	ballAirFriction(): number {
		return parseFloat(this.overriddenBallAirFriction);
	}

	overridesInitialBallMass(): boolean {
		return this.overriddenInitialBallMass !== undefined;
	}

	initialBallMass(): number {
		return parseFloat(this.overriddenInitialBallMass);
	}

	overridesSmallBallMass(): boolean {
		return this.overriddenSmallBallMass !== undefined;
	}

	smallBallMass(): number {
		return parseFloat(this.overriddenSmallBallMass);
	}

	overridesBigBallMass(): boolean {
		return this.overriddenBigBallMass !== undefined;
	}

	bigBallMass(): number {
		return parseFloat(this.overriddenBigBallMass);
	}

	overridesBonusScale(): boolean {
		return this.overriddenBonusScale !== undefined;
	}

	bonusScale(): number {
		return parseFloat(this.overriddenBonusScale);
	}

	overridesBonusAirFriction(): boolean {
		return this.overriddenBonusAirFriction !== undefined;
	}

	bonusAirFriction(): number {
		return parseFloat(this.overriddenBonusAirFriction);
	}

	overridesBonusMass(): boolean {
		return this.overriddenBonusMass !== undefined;
	}

	bonusMass(): number {
		return parseFloat(this.overriddenBonusMass);
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
		tournamentMode.overriddenInitialPlayerScale_player1 = mode.overriddenInitialPlayerScale_player1;
		tournamentMode.overriddenInitialPlayerScale_player2 = mode.overriddenInitialPlayerScale_player2;
		tournamentMode.overriddenInitialPlayerScale_player3 = mode.overriddenInitialPlayerScale_player3;
		tournamentMode.overriddenInitialPlayerScale_player4 = mode.overriddenInitialPlayerScale_player4;
		tournamentMode.overriddenSmallPlayerScale = mode.overriddenSmallPlayerScale;
		tournamentMode.overriddenBigPlayerScale = mode.overriddenBigPlayerScale;
		tournamentMode.overriddenInitialPlayerMass = mode.overriddenInitialPlayerMass;
		tournamentMode.overriddenInitialPlayerMass_player1 = mode.overriddenInitialPlayerMass_player1;
		tournamentMode.overriddenInitialPlayerMass_player2 = mode.overriddenInitialPlayerMass_player2;
		tournamentMode.overriddenInitialPlayerMass_player3 = mode.overriddenInitialPlayerMass_player3;
		tournamentMode.overriddenInitialPlayerMass_player4 = mode.overriddenInitialPlayerMass_player4;
		tournamentMode.overriddenSmallPlayerMass = mode.overriddenSmallPlayerMass;
		tournamentMode.overriddenBigPlayerMass = mode.overriddenBigPlayerMass;
		tournamentMode.overriddenInitialBallScale = mode.overriddenInitialBallScale;
		tournamentMode.overriddenSmallBallScale = mode.overriddenSmallBallScale;
		tournamentMode.overriddenBigBallScale = mode.overriddenBigBallScale;
		tournamentMode.overriddenBallAirFriction = mode.overriddenBallAirFriction;
		tournamentMode.overriddenInitialBallMass = mode.overriddenInitialBallMass;
		tournamentMode.overriddenSmallBallMass = mode.overriddenSmallBallMass;
		tournamentMode.overriddenBigBallMass = mode.overriddenBigBallMass;
		tournamentMode.overriddenBonusScale = mode.overriddenBonusScale;
		tournamentMode.overriddenBonusAirFriction = mode.overriddenBonusAirFriction;
		tournamentMode.overriddenBonusMass = mode.overriddenBonusMass;
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
