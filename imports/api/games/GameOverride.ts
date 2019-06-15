export default class GameOverride {
	overriddenForfeitMinimumPoints;
	overriddenMaximumPoints;
	overriddenPlayerMaximumBallHit;
	overriddenTeamMaximumBallHit;
	overriddenForcePracticeWithComputer;

	overriddenWorldGravity;
	overriddenWorldRestitution;
	overriddenLevelWidth;
	overriddenLevelHeight;
	overriddenNetWidth;
	overriddenNetHeight;

	overriddenSoccerNetEnabled;
	overriddenSoccerNetDistanceFromGround;
	overriddenSoccerNetWidth;
	overriddenSoccerNetHeight;

	overriddenGroundHitEnabled;
	overriddenHasPlayerNetLimit;
	overriddenCollidesWithTeammate;
	overriddenCollidesWithOpponent;
	overriddenBallCollidesWithSoccerNetPosts;
	overriddenBonusCollidesWithSoccerNetPosts;
	overriddenPlayerCollidesWithSoccerNetPosts;

	overriddenAllowedListOfShapes;
	overriddenListOfShapes;
	overriddenCurrentPlayerShape;
	overriddenOpponentPlayerShape;

	overriddenPlayerInitialDistanceFromWall;
	overriddenTeammateInitialDistanceFromWall;
	overriddenPlayerInitialDistanceFromGround;
	overriddenTeammateInitialDistanceFromGround;

	overriddenIsHiddenToHimself;
	overriddenIsHiddenToOpponent;
	overriddenInitialPlayerScale;
	overriddenSmallPlayerScale;
	overriddenBigPlayerScale;
	overriddenInitialPlayerScale_player1;
	overriddenInitialPlayerScale_player2;
	overriddenInitialPlayerScale_player3;
	overriddenInitialPlayerScale_player4;
	overriddenInitialPlayerGravityScale;
	overriddenInitialPlayerGravityScale_player1;
	overriddenInitialPlayerGravityScale_player2;
	overriddenInitialPlayerGravityScale_player3;
	overriddenInitialPlayerGravityScale_player4;
	overriddenInitialPlayerMass;
	overriddenSmallPlayerMass;
	overriddenBigPlayerMass;
	overriddenInitialPlayerMass_player1;
	overriddenInitialPlayerMass_player2;
	overriddenInitialPlayerMass_player3;
	overriddenInitialPlayerMass_player4;
	overriddenPlayerXVelocity;
	overriddenPlayerYVelocity;
	overriddenPlayerDropshotEnabled;
	overriddenPlayerSmashEnabled;
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
	overriddenBallReboundOnPlayerEnabled;
	overriddenBallVelocityOnReboundOnPlayer;

	overriddenAvailableBonuses;
	overriddenAvailableBonusesForRandom;
	overriddenHasBonuses;
	overriddenBonusDuration;
	overriddenMaximumBonusesOnScreen;
	overriddenMaximumBonusesInAPoint;
	overriddenBonusSpawnMinimumFrequence;
	overriddenBonusSpawnInitialMinimumFrequence;
	overriddenBonusSpawnInitialMaximumFrequence;
	overriddenBonusScale;
	overriddenBonusGravityScale;
	overriddenBonusMass;

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

	overridesLevelSize(): boolean {
		return this.overridesLevelWidth() || this.overridesLevelHeight();
	}

	overridesLevelWidth(): boolean {
		return this.overriddenLevelWidth !== undefined;
	}

	levelWidth(): number {
		return parseInt(this.overriddenLevelWidth);
	}

	overridesLevelHeight(): boolean {
		return this.overriddenLevelHeight !== undefined;
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

	overridesSoccerNetEnabled(): boolean {
		return this.overriddenSoccerNetEnabled !== undefined;
	}

	soccerNetEnabled(): boolean {
		return parseInt(this.overriddenSoccerNetEnabled) === 1;
	}

	overridesSoccerNetDistanceFromGround(): boolean {
		return this.overriddenSoccerNetDistanceFromGround !== undefined;
	}

	soccerNetDistanceFromGround(): number {
		return parseInt(this.overriddenSoccerNetDistanceFromGround);
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

	overridesGroundHitEnabled(): boolean {
		return this.overriddenGroundHitEnabled !== undefined;
	}

	groundHitEnabled(): boolean {
		return parseInt(this.overriddenGroundHitEnabled) === 1;
	}

	overridesHasPlayerNetLimit(): boolean {
		return this.overriddenHasPlayerNetLimit !== undefined;
	}

	hasPlayerNetLimit(): boolean {
		return parseInt(this.overriddenHasPlayerNetLimit) === 1;
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

	overridesAllowedListOfShapes(): boolean {
		return this.overriddenAllowedListOfShapes !== undefined;
	}

	allowedListOfShapes(): string[] {
		return this.overriddenAllowedListOfShapes;
	}

	overridesListOfShapes(): boolean {
		return this.overriddenListOfShapes !== undefined;
	}

	listOfShapes(): string[] {
		return this.overriddenListOfShapes;
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

	overridesPlayerInitialDistanceFromWall(): boolean {
		return this.overriddenPlayerInitialDistanceFromWall !== undefined;
	}

	playerInitialDistanceFromWall(): number {
		return parseInt(this.overriddenPlayerInitialDistanceFromWall);
	}

	overridesTeammateInitialDistanceFromWall(): boolean {
		return this.overriddenTeammateInitialDistanceFromWall !== undefined;
	}

	teammateInitialDistanceFromWall(): number {
		return parseInt(this.overriddenTeammateInitialDistanceFromWall);
	}

	overridesPlayerInitialDistanceFromGround(): boolean {
		return this.overriddenPlayerInitialDistanceFromGround !== undefined;
	}

	playerInitialDistanceFromGround(): number {
		return parseInt(this.overriddenPlayerInitialDistanceFromGround);
	}

	overridesTeammateInitialDistanceFromGround(): boolean {
		return this.overriddenTeammateInitialDistanceFromGround !== undefined;
	}

	teammateInitialDistanceFromGround(): number {
		return parseInt(this.overriddenTeammateInitialDistanceFromGround);
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

	overridesHasBonuses(): boolean {
		return this.overriddenHasBonuses !== undefined;
	}

	hasBonuses(): boolean {
		return parseInt(this.overriddenHasBonuses) === 1;
	}

	overridesBonusDuration(): boolean {
		return this.overriddenBonusDuration !== undefined;
	}

	bonusDuration(): number {
		return parseInt(this.overriddenBonusDuration);
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

	static fromData(data: any): GameOverride {
		const gameOverride = new GameOverride();

		gameOverride.overriddenForfeitMinimumPoints = data.overriddenForfeitMinimumPoints;
		gameOverride.overriddenMaximumPoints = data.overriddenMaximumPoints;
		gameOverride.overriddenPlayerMaximumBallHit = data.overriddenPlayerMaximumBallHit;
		gameOverride.overriddenTeamMaximumBallHit = data.overriddenTeamMaximumBallHit;
		gameOverride.overriddenForcePracticeWithComputer = data.overriddenForcePracticeWithComputer;

		gameOverride.overriddenWorldGravity = data.overriddenWorldGravity;
		gameOverride.overriddenWorldRestitution = data.overriddenWorldRestitution;
		gameOverride.overriddenLevelWidth = data.overriddenLevelWidth;
		gameOverride.overriddenLevelHeight = data.overriddenLevelHeight;
		gameOverride.overriddenNetWidth = data.overriddenNetWidth;
		gameOverride.overriddenNetHeight = data.overriddenNetHeight;

		gameOverride.overriddenSoccerNetEnabled = data.overriddenSoccerNetEnabled;
		gameOverride.overriddenSoccerNetDistanceFromGround = data.overriddenSoccerNetDistanceFromGround;
		gameOverride.overriddenSoccerNetWidth = data.overriddenSoccerNetWidth;
		gameOverride.overriddenSoccerNetHeight = data.overriddenSoccerNetHeight;

		gameOverride.overriddenGroundHitEnabled = data.overriddenGroundHitEnabled;
		gameOverride.overriddenHasPlayerNetLimit = data.overriddenHasPlayerNetLimit;
		gameOverride.overriddenCollidesWithOpponent = data.overriddenCollidesWithOpponent;
		gameOverride.overriddenCollidesWithTeammate = data.overriddenCollidesWithTeammate;
		gameOverride.overriddenBallCollidesWithSoccerNetPosts = data.overriddenBallCollidesWithSoccerNetPosts;
		gameOverride.overriddenBonusCollidesWithSoccerNetPosts = data.overriddenBonusCollidesWithSoccerNetPosts;
		gameOverride.overriddenPlayerCollidesWithSoccerNetPosts = data.overriddenPlayerCollidesWithSoccerNetPosts;

		gameOverride.overriddenAllowedListOfShapes = data.overriddenAllowedListOfShapes;
		gameOverride.overriddenListOfShapes = data.overriddenListOfShapes;
		gameOverride.overriddenCurrentPlayerShape = data.overriddenCurrentPlayerShape;
		gameOverride.overriddenOpponentPlayerShape = data.overriddenOpponentPlayerShape;

		gameOverride.overriddenPlayerInitialDistanceFromWall = data.overriddenPlayerInitialDistanceFromWall;
		gameOverride.overriddenTeammateInitialDistanceFromWall = data.overriddenTeammateInitialDistanceFromWall;
		gameOverride.overriddenPlayerInitialDistanceFromGround = data.overriddenPlayerInitialDistanceFromGround;
		gameOverride.overriddenTeammateInitialDistanceFromGround = data.overriddenTeammateInitialDistanceFromGround;

		gameOverride.overriddenIsHiddenToHimself = data.overriddenIsHiddenToHimself;
		gameOverride.overriddenIsHiddenToOpponent = data.overriddenIsHiddenToOpponent;
		gameOverride.overriddenPlayerXVelocity = data.overriddenPlayerXVelocity;
		gameOverride.overriddenPlayerYVelocity = data.overriddenPlayerYVelocity;
		gameOverride.overriddenPlayerDropshotEnabled = data.overriddenPlayerDropshotEnabled;
		gameOverride.overriddenPlayerSmashEnabled = data.overriddenPlayerSmashEnabled;
		gameOverride.overriddenBallReboundOnPlayerEnabled = data.overriddenBallReboundOnPlayerEnabled;
		gameOverride.overriddenBallVelocityOnReboundOnPlayer = data.overriddenBallVelocityOnReboundOnPlayer;
		gameOverride.overriddenInitialPlayerScale = data.overriddenInitialPlayerScale;
		gameOverride.overriddenSmallPlayerScale = data.overriddenSmallPlayerScale;
		gameOverride.overriddenBigPlayerScale = data.overriddenBigPlayerScale;
		gameOverride.overriddenInitialPlayerScale_player1 = data.overriddenInitialPlayerScale_player1;
		gameOverride.overriddenInitialPlayerScale_player2 = data.overriddenInitialPlayerScale_player2;
		gameOverride.overriddenInitialPlayerScale_player3 = data.overriddenInitialPlayerScale_player3;
		gameOverride.overriddenInitialPlayerScale_player4 = data.overriddenInitialPlayerScale_player4;
		gameOverride.overriddenInitialPlayerGravityScale = data.overriddenInitialPlayerGravityScale;
		gameOverride.overriddenInitialPlayerGravityScale_player1 = data.overriddenInitialPlayerGravityScale_player1;
		gameOverride.overriddenInitialPlayerGravityScale_player2 = data.overriddenInitialPlayerGravityScale_player2;
		gameOverride.overriddenInitialPlayerGravityScale_player3 = data.overriddenInitialPlayerGravityScale_player3;
		gameOverride.overriddenInitialPlayerGravityScale_player4 = data.overriddenInitialPlayerGravityScale_player4;
		gameOverride.overriddenInitialPlayerMass = data.overriddenInitialPlayerMass;
		gameOverride.overriddenSmallPlayerMass = data.overriddenSmallPlayerMass;
		gameOverride.overriddenBigPlayerMass = data.overriddenBigPlayerMass;
		gameOverride.overriddenInitialPlayerMass_player1 = data.overriddenInitialPlayerMass_player1;
		gameOverride.overriddenInitialPlayerMass_player2 = data.overriddenInitialPlayerMass_player2;
		gameOverride.overriddenInitialPlayerMass_player3 = data.overriddenInitialPlayerMass_player3;
		gameOverride.overriddenInitialPlayerMass_player4 = data.overriddenInitialPlayerMass_player4;
		gameOverride.overriddenPlayerVerticalMoveMultiplierBig = data.overriddenPlayerVerticalMoveMultiplierBig;
		gameOverride.overriddenPlayerHorizontalMoveMultiplierSlow = data.overriddenPlayerHorizontalMoveMultiplierSlow;
		gameOverride.overriddenPlayerHorizontalMoveMultiplierFast = data.overriddenPlayerHorizontalMoveMultiplierFast;

		gameOverride.overriddenInitialBallScale = data.overriddenInitialBallScale;
		gameOverride.overriddenSmallBallScale = data.overriddenSmallBallScale;
		gameOverride.overriddenBigBallScale = data.overriddenBigBallScale;
		gameOverride.overriddenInitialBallGravityScale = data.overriddenInitialBallGravityScale;
		gameOverride.overriddenInitialBallMass = data.overriddenInitialBallMass;
		gameOverride.overriddenSmallBallMass = data.overriddenSmallBallMass;
		gameOverride.overriddenBigBallMass = data.overriddenBigBallMass;
		gameOverride.overriddenBonusScale = data.overriddenBonusScale;
		gameOverride.overriddenBonusGravityScale = data.overriddenBonusGravityScale;
		gameOverride.overriddenBonusMass = data.overriddenBonusMass;

		gameOverride.overriddenAvailableBonuses = data.overriddenAvailableBonuses;
		gameOverride.overriddenAvailableBonusesForRandom = data.overriddenAvailableBonusesForRandom;
		gameOverride.overriddenHasBonuses = data.overriddenHasBonuses;
		gameOverride.overriddenBonusDuration = data.overriddenBonusDuration;
		gameOverride.overriddenMaximumBonusesOnScreen = data.overriddenMaximumBonusesOnScreen;
		gameOverride.overriddenMaximumBonusesInAPoint = data.overriddenMaximumBonusesInAPoint;
		gameOverride.overriddenBonusSpawnMinimumFrequence = data.overriddenBonusSpawnMinimumFrequence;
		gameOverride.overriddenBonusSpawnInitialMinimumFrequence = data.overriddenBonusSpawnInitialMinimumFrequence;
		gameOverride.overriddenBonusSpawnInitialMaximumFrequence = data.overriddenBonusSpawnInitialMaximumFrequence;

		return gameOverride;
	}
}
