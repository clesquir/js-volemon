export default class TournamentMode {
	overriddenWorldGravity;
	overriddenWorldRestitution;
	overriddenLevelWidth;
	overriddenLevelHeight;
	overriddenNetWidth;
	overriddenNetHeight;
	overriddenSoccerNetWidth;
	overriddenSoccerNetHeight;
	overriddenSoccerNetDistanceFromGround;
	overriddenGroundHitEnabled;
	overriddenSoccerNetEnabled;
	overriddenHasPlayerNetLimit;
	overriddenBallCollidesWithSoccerNetPosts;
	overriddenBonusCollidesWithSoccerNetPosts;
	overriddenPlayerCollidesWithSoccerNetPosts;
	overriddenCollidesWithTeammate;
	overriddenCollidesWithOpponent;

	overriddenMaximumBonusesOnScreen;
	overriddenMaximumBonusesInAPoint;
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
	overriddenInitialPlayerGravityScale;
	overriddenInitialPlayerGravityScale_player1;
	overriddenInitialPlayerGravityScale_player2;
	overriddenInitialPlayerGravityScale_player3;
	overriddenInitialPlayerGravityScale_player4;
	overriddenInitialPlayerMass;
	overriddenInitialPlayerMass_player1;
	overriddenInitialPlayerMass_player2;
	overriddenInitialPlayerMass_player3;
	overriddenInitialPlayerMass_player4;
	overriddenSmallPlayerMass;
	overriddenBigPlayerMass;
	overriddenPlayerVerticalMoveMultiplierBig;
	overriddenPlayerHorizontalMoveMultiplierSlow;
	overriddenPlayerHorizontalMoveMultiplierFast;
	overriddenInitialBallScale;
	overriddenSmallBallScale;
	overriddenBigBallScale;
	overriddenInitialBallGravityScale;
	overriddenInitialBallMass;
	overriddenSmallBallMass;
	overriddenBigBallMass;
	overriddenBonusScale;
	overriddenBonusGravityScale;
	overriddenBonusMass;
	overriddenListOfShapes;
	overriddenAllowedListOfShapes;
	overriddenCurrentPlayerShape;
	overriddenOpponentPlayerShape;
	overriddenIsHiddenToHimself;
	overriddenIsHiddenToOpponent;

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

	overridesMaximumBonusesInAPoint(): boolean {
		return this.overriddenMaximumBonusesInAPoint !== undefined;
	}

	maximumBonusesInAPoint(): number {
		return parseInt(this.overriddenMaximumBonusesInAPoint);
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

	overridesInitialPlayerGravityScale(key: string): boolean {
		return (
			this['overriddenInitialPlayerGravityScale_' + key] !== undefined ||
			this.overriddenInitialPlayerGravityScale !== undefined
		);
	}

	initialPlayerGravityScale(key: string): number {
		if (this['overriddenInitialPlayerGravityScale_' + key] !== undefined) {
			return parseFloat(this['overriddenInitialPlayerGravityScale_' + key]);
		}

		return parseFloat(this.overriddenInitialPlayerGravityScale);
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

	overridesPlayerVerticalMoveMultiplierBig(): boolean {
		return this.overriddenPlayerVerticalMoveMultiplierBig !== undefined;
	}

	playerVerticalMoveMultiplierBig(): number {
		return parseFloat(this.overriddenPlayerVerticalMoveMultiplierBig);
	}

	overridesPlayerHorizontalMoveMultiplierSlow(): boolean {
		return this.overriddenPlayerHorizontalMoveMultiplierSlow !== undefined;
	}

	playerHorizontalMoveMultiplierSlow(): number {
		return parseFloat(this.overriddenPlayerHorizontalMoveMultiplierSlow);
	}

	overridesPlayerHorizontalMoveMultiplierFast(): boolean {
		return this.overriddenPlayerHorizontalMoveMultiplierFast !== undefined;
	}

	playerHorizontalMoveMultiplierFast(): number {
		return parseFloat(this.overriddenPlayerHorizontalMoveMultiplierFast);
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

	overridesInitialBallGravityScale(): boolean {
		return this.overriddenInitialBallGravityScale !== undefined;
	}

	initialBallGravityScale(): number {
		return parseFloat(this.overriddenInitialBallGravityScale);
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

	overridesBonusGravityScale(): boolean {
		return this.overriddenBonusGravityScale !== undefined;
	}

	bonusGravityScale(): number {
		return parseFloat(this.overriddenBonusGravityScale);
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

	overridesOpponentPlayerShape(): boolean {
		return this.overriddenOpponentPlayerShape !== undefined;
	}

	opponentPlayerShape(): string {
		return this.overriddenOpponentPlayerShape;
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

	overridesSoccerNetWidth(): boolean {
		return this.overriddenSoccerNetWidth !== undefined;
	}

	soccerNetWidth(): number {
		return parseInt(this.overriddenSoccerNetWidth);
	}

	overridesSoccerNetHeight(): boolean {
		return this.overriddenSoccerNetHeight !== undefined;
	}

	soccerNetHeight(): number {
		return parseInt(this.overriddenSoccerNetHeight);
	}

	overridesSoccerNetDistanceFromGround(): boolean {
		return this.overriddenSoccerNetDistanceFromGround !== undefined;
	}

	soccerNetDistanceFromGround(): number {
		return parseInt(this.overriddenSoccerNetDistanceFromGround);
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

	overridesGroundHitEnabled(): boolean {
		return this.overriddenGroundHitEnabled !== undefined;
	}

	groundHitEnabled(): boolean {
		return parseInt(this.overriddenGroundHitEnabled) === 1;
	}

	overridesSoccerNetEnabled(): boolean {
		return this.overriddenSoccerNetEnabled !== undefined;
	}

	soccerNetEnabled(): boolean {
		return parseInt(this.overriddenSoccerNetEnabled) === 1;
	}

	overridesHasPlayerNetLimit(): boolean {
		return this.overriddenHasPlayerNetLimit !== undefined;
	}

	hasPlayerNetLimit(): boolean {
		return parseInt(this.overriddenHasPlayerNetLimit) === 1;
	}

	overridesBallCollidesWithSoccerNetPosts(): boolean {
		return this.overriddenBallCollidesWithSoccerNetPosts !== undefined;
	}

	ballCollidesWithSoccerNetPosts(): boolean {
		return parseInt(this.overriddenBallCollidesWithSoccerNetPosts) === 1;
	}

	overridesBonusCollidesWithSoccerNetPosts(): boolean {
		return this.overriddenBonusCollidesWithSoccerNetPosts !== undefined;
	}

	bonusCollidesWithSoccerNetPosts(): boolean {
		return parseInt(this.overriddenBonusCollidesWithSoccerNetPosts) === 1;
	}

	overridesPlayerCollidesWithSoccerNetPosts(): boolean {
		return this.overriddenPlayerCollidesWithSoccerNetPosts !== undefined;
	}

	playerCollidesWithSoccerNetPosts(): boolean {
		return parseInt(this.overriddenPlayerCollidesWithSoccerNetPosts) === 1;
	}

	overridesCollidesWithTeammate(): boolean {
		return this.overriddenCollidesWithTeammate !== undefined;
	}

	collidesWithTeammate(): boolean {
		return parseInt(this.overriddenCollidesWithTeammate) === 1;
	}

	overridesCollidesWithOpponent(): boolean {
		return this.overriddenCollidesWithOpponent !== undefined;
	}

	collidesWithOpponent(): boolean {
		return parseInt(this.overriddenCollidesWithOpponent) === 1;
	}

	static fromTournament(tournament: any) {
		const tournamentMode = new TournamentMode();
		const mode = tournament.mode;

		tournamentMode.overriddenWorldGravity = mode.overriddenWorldGravity;
		tournamentMode.overriddenWorldRestitution = mode.overriddenWorldRestitution;
		tournamentMode.overriddenNetWidth = mode.overriddenNetWidth;
		tournamentMode.overriddenNetHeight = mode.overriddenNetHeight;
		tournamentMode.overriddenLevelWidth = mode.overriddenLevelWidth;
		tournamentMode.overriddenLevelHeight = mode.overriddenLevelHeight;
		tournamentMode.overriddenSoccerNetWidth = mode.overriddenSoccerNetWidth;
		tournamentMode.overriddenSoccerNetHeight = mode.overriddenSoccerNetHeight;
		tournamentMode.overriddenSoccerNetDistanceFromGround = mode.overriddenSoccerNetDistanceFromGround;
		tournamentMode.overriddenGroundHitEnabled = mode.overriddenGroundHitEnabled;
		tournamentMode.overriddenSoccerNetEnabled = mode.overriddenSoccerNetEnabled;
		tournamentMode.overriddenHasPlayerNetLimit = mode.overriddenHasPlayerNetLimit;
		tournamentMode.overriddenBallCollidesWithSoccerNetPosts = mode.overriddenBallCollidesWithSoccerNetPosts;
		tournamentMode.overriddenBonusCollidesWithSoccerNetPosts = mode.overriddenBonusCollidesWithSoccerNetPosts;
		tournamentMode.overriddenPlayerCollidesWithSoccerNetPosts = mode.overriddenPlayerCollidesWithSoccerNetPosts;
		tournamentMode.overriddenCollidesWithTeammate = mode.overriddenCollidesWithTeammate;
		tournamentMode.overriddenCollidesWithOpponent = mode.overriddenCollidesWithOpponent;

		tournamentMode.overriddenMaximumBonusesOnScreen = mode.overriddenMaximumBonusesOnScreen;
		tournamentMode.overriddenMaximumBonusesInAPoint = mode.overriddenMaximumBonusesInAPoint;
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
		tournamentMode.overriddenInitialPlayerGravityScale = mode.overriddenInitialPlayerGravityScale;
		tournamentMode.overriddenInitialPlayerGravityScale_player1 = mode.overriddenInitialPlayerGravityScale_player1;
		tournamentMode.overriddenInitialPlayerGravityScale_player2 = mode.overriddenInitialPlayerGravityScale_player2;
		tournamentMode.overriddenInitialPlayerGravityScale_player3 = mode.overriddenInitialPlayerGravityScale_player3;
		tournamentMode.overriddenInitialPlayerGravityScale_player4 = mode.overriddenInitialPlayerGravityScale_player4;
		tournamentMode.overriddenInitialPlayerMass = mode.overriddenInitialPlayerMass;
		tournamentMode.overriddenInitialPlayerMass_player1 = mode.overriddenInitialPlayerMass_player1;
		tournamentMode.overriddenInitialPlayerMass_player2 = mode.overriddenInitialPlayerMass_player2;
		tournamentMode.overriddenInitialPlayerMass_player3 = mode.overriddenInitialPlayerMass_player3;
		tournamentMode.overriddenInitialPlayerMass_player4 = mode.overriddenInitialPlayerMass_player4;
		tournamentMode.overriddenSmallPlayerMass = mode.overriddenSmallPlayerMass;
		tournamentMode.overriddenBigPlayerMass = mode.overriddenBigPlayerMass;
		tournamentMode.overriddenPlayerVerticalMoveMultiplierBig = mode.overriddenPlayerVerticalMoveMultiplierBig;
		tournamentMode.overriddenPlayerHorizontalMoveMultiplierSlow = mode.overriddenPlayerHorizontalMoveMultiplierSlow;
		tournamentMode.overriddenPlayerHorizontalMoveMultiplierFast = mode.overriddenPlayerHorizontalMoveMultiplierFast;
		tournamentMode.overriddenInitialBallScale = mode.overriddenInitialBallScale;
		tournamentMode.overriddenSmallBallScale = mode.overriddenSmallBallScale;
		tournamentMode.overriddenBigBallScale = mode.overriddenBigBallScale;
		tournamentMode.overriddenInitialBallGravityScale = mode.overriddenInitialBallGravityScale;
		tournamentMode.overriddenInitialBallMass = mode.overriddenInitialBallMass;
		tournamentMode.overriddenSmallBallMass = mode.overriddenSmallBallMass;
		tournamentMode.overriddenBigBallMass = mode.overriddenBigBallMass;
		tournamentMode.overriddenBonusScale = mode.overriddenBonusScale;
		tournamentMode.overriddenBonusGravityScale = mode.overriddenBonusGravityScale;
		tournamentMode.overriddenBonusMass = mode.overriddenBonusMass;
		tournamentMode.overriddenListOfShapes = mode.overriddenListOfShapes;
		tournamentMode.overriddenAllowedListOfShapes = mode.overriddenAllowedListOfShapes;
		tournamentMode.overriddenCurrentPlayerShape = mode.overriddenCurrentPlayerShape;
		tournamentMode.overriddenOpponentPlayerShape = mode.overriddenOpponentPlayerShape;
		tournamentMode.overriddenIsHiddenToHimself = mode.overriddenIsHiddenToHimself;
		tournamentMode.overriddenIsHiddenToOpponent = mode.overriddenIsHiddenToOpponent;
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
