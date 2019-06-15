import {
	BALL_BIG_GRAVITY_SCALE,
	BALL_BIG_MASS,
	BALL_BIG_SCALE,
	BALL_DEFAULT_RADIUS,
	BALL_GRAVITY_SCALE,
	BALL_MASS,
	BALL_PROPORTION_FROM_HEIGHT,
	BALL_SCALE,
	BALL_SMALL_GRAVITY_SCALE,
	BALL_SMALL_MASS,
	BALL_SMALL_SCALE,
	BALL_VERTICAL_SPEED_ON_PLAYER_HIT,
	BONUS_GRAVITY_SCALE,
	BONUS_INDICATOR_RADIUS,
	BONUS_MASS,
	BONUS_RADIUS,
	BONUS_SCALE,
	GAME_FORFEIT_MINIMUM_POINTS,
	GAME_MAXIMUM_POINTS,
	HIGH_GRAVITY_MULTIPLIER,
	LOW_GRAVITY_MULTIPLIER,
	NET_RESTITUTION,
	ONE_VS_COMPUTER_GAME_MODE,
	ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE,
	PLAYER_BIG_GRAVITY_SCALE,
	PLAYER_BIG_MASS,
	PLAYER_BIG_SCALE,
	PLAYER_DEFAULT_HEIGHT,
	PLAYER_DEFAULT_WIDTH,
	PLAYER_DISTANCE_FROM_WALL,
	PLAYER_GRAVITY_SCALE,
	PLAYER_HORIZONTAL_MOVE_MULTIPLIER_FAST,
	PLAYER_HORIZONTAL_MOVE_MULTIPLIER_INITIAL,
	PLAYER_HORIZONTAL_MOVE_MULTIPLIER_SLOW,
	PLAYER_MASS,
	PLAYER_SCALE,
	PLAYER_SMALL_GRAVITY_SCALE,
	PLAYER_SMALL_MASS,
	PLAYER_SMALL_SCALE,
	PLAYER_TEAMMATE_DISTANCE_FROM_WALL,
	PLAYER_VELOCITY_X_ON_MOVE,
	PLAYER_VELOCITY_Y_ON_JUMP,
	PLAYER_VERTICAL_MOVE_MULTIPLIER_BIG,
	PLAYER_VERTICAL_MOVE_MULTIPLIER_INITIAL,
	WORLD_GRAVITY,
	WORLD_RESTITUTION
} from '../constants';
import {
	BONUS_MAXIMUM_ON_SCREEN,
	BONUS_SPAWN_INITIAL_MAXIMUM_FREQUENCE,
	BONUS_SPAWN_INITIAL_MINIMUM_FREQUENCE,
	BONUS_SPAWN_MINIMUM_FREQUENCE
} from '../emissionConstants';
import {PLAYER_ALLOWED_LIST_OF_SHAPES, PLAYER_LIST_OF_SHAPES} from '../shapeConstants';
import GameOverride from "../GameOverride";
import LevelConfiguration from "../levelConfiguration/LevelConfiguration";

export default abstract class GameConfiguration {
	gameMode: string = null;
	tournamentId: string = null;
	tournament: any = null;
	gameOverride: GameOverride = null;
	levelConfiguration: LevelConfiguration = null;

	hasTournament(): boolean {
		return !!this.tournamentId;
	}

	hasGameOverride(): boolean {
		return !!this.gameOverride;
	}

	forfeitMinimumPoints(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesForfeitMinimumPoints()) {
			return this.gameOverride.forfeitMinimumPoints();
		}

		return GAME_FORFEIT_MINIMUM_POINTS;
	}

	maximumPoints(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesMaximumPoints()) {
			return this.gameOverride.maximumPoints();
		}

		return GAME_MAXIMUM_POINTS;
	}

	listOfShapes(): string[] {
		if (this.hasGameOverride() && this.gameOverride.overridesListOfShapes()) {
			return this.gameOverride.listOfShapes();
		}

		return PLAYER_LIST_OF_SHAPES;
	}

	allowedListOfShapes(): string[] {
		if (this.hasGameOverride() && this.gameOverride.overridesAllowedListOfShapes()) {
			return this.gameOverride.allowedListOfShapes();
		}

		return PLAYER_ALLOWED_LIST_OF_SHAPES;
	}

	overridesCurrentPlayerShape(): boolean {
		return (this.hasGameOverride() && this.gameOverride.overridesCurrentPlayerShape());
	}

	currentPlayerShape(): string {
		if (!this.overridesCurrentPlayerShape()) {
			throw 'The shape is not overridden';
		}

		return this.gameOverride.currentPlayerShape();
	}

	overridesOpponentPlayerShape(): boolean {
		return (this.hasGameOverride() && this.gameOverride.overridesOpponentPlayerShape());
	}

	opponentPlayerShape(): string {
		if (!this.overridesOpponentPlayerShape()) {
			throw 'The shape is not overridden';
		}

		return this.gameOverride.opponentPlayerShape();
	}

	initialPlayerScale(key: string): number {
		if (this.hasGameOverride() && this.gameOverride.overridesInitialPlayerScale(key)) {
			return this.gameOverride.initialPlayerScale(key);
		}

		return PLAYER_SCALE;
	}

	smallPlayerScale(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesSmallPlayerScale()) {
			return this.gameOverride.smallPlayerScale();
		}

		return PLAYER_SMALL_SCALE;
	}

	bigPlayerScale(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesBigPlayerScale()) {
			return this.gameOverride.bigPlayerScale();
		}

		return PLAYER_BIG_SCALE;
	}

	initialPlayerGravityScale(key: string): number {
		if (this.hasGameOverride() && this.gameOverride.overridesInitialPlayerGravityScale(key)) {
			return this.gameOverride.initialPlayerGravityScale(key);
		}

		return PLAYER_GRAVITY_SCALE;
	}

	smallPlayerGravityScale(): number {
		return PLAYER_SMALL_GRAVITY_SCALE;
	}

	bigPlayerGravityScale(): number {
		return PLAYER_BIG_GRAVITY_SCALE;
	}

	initialPlayerMass(key: string): number {
		if (this.hasGameOverride() && this.gameOverride.overridesInitialPlayerMass(key)) {
			return this.gameOverride.initialPlayerMass(key);
		}

		return PLAYER_MASS;
	}

	smallPlayerMass(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesSmallPlayerMass()) {
			return this.gameOverride.smallPlayerMass();
		}

		return PLAYER_SMALL_MASS;
	}

	bigPlayerMass(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesBigPlayerMass()) {
			return this.gameOverride.bigPlayerMass();
		}

		return PLAYER_BIG_MASS;
	}

	initialVerticalMoveMultiplier(): number {
		return PLAYER_VERTICAL_MOVE_MULTIPLIER_INITIAL;
	}

	bigVerticalMoveMultiplier(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesPlayerVerticalMoveMultiplierBig()) {
			return this.gameOverride.playerVerticalMoveMultiplierBig();
		}

		return PLAYER_VERTICAL_MOVE_MULTIPLIER_BIG;
	}

	initialHorizontalMoveMultiplier(): number {
		return PLAYER_HORIZONTAL_MOVE_MULTIPLIER_INITIAL;
	}

	slowHorizontalMoveMultiplier(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesPlayerHorizontalMoveMultiplierSlow()) {
			return this.gameOverride.playerHorizontalMoveMultiplierSlow();
		}

		return PLAYER_HORIZONTAL_MOVE_MULTIPLIER_SLOW;
	}

	fastHorizontalMoveMultiplier(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesPlayerHorizontalMoveMultiplierFast()) {
			return this.gameOverride.playerHorizontalMoveMultiplierFast();
		}

		return PLAYER_HORIZONTAL_MOVE_MULTIPLIER_FAST;
	}

	initialBallScale(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesInitialBallScale()) {
			return this.gameOverride.initialBallScale();
		}

		return BALL_SCALE;
	}

	smallBallScale(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesSmallBallScale()) {
			return this.gameOverride.smallBallScale();
		}

		return BALL_SMALL_SCALE;
	}

	bigBallScale(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesBigBallScale()) {
			return this.gameOverride.bigBallScale();
		}

		return BALL_BIG_SCALE;
	}

	initialBallGravityScale(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesInitialBallGravityScale()) {
			return this.gameOverride.initialBallGravityScale();
		}

		return BALL_GRAVITY_SCALE;
	}

	smallBallGravityScale(): number {
		return BALL_SMALL_GRAVITY_SCALE;
	}

	bigBallGravityScale(): number {
		return BALL_BIG_GRAVITY_SCALE;
	}

	initialBallMass(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesInitialBallMass()) {
			return this.gameOverride.initialBallMass();
		}

		return BALL_MASS;
	}

	smallBallMass(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesSmallBallMass()) {
			return this.gameOverride.smallBallMass();
		}

		return BALL_SMALL_MASS;
	}

	bigBallMass(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesBigBallMass()) {
			return this.gameOverride.bigBallMass();
		}

		return BALL_BIG_MASS;
	}

	bonusIndicatorRadius(): number {
		return BONUS_INDICATOR_RADIUS;
	}

	bonusRadius(): number {
		return BONUS_RADIUS;
	}

	bonusScale(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesBonusScale()) {
			return this.gameOverride.bonusScale();
		}

		return BONUS_SCALE;
	}

	bonusGravityScale(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesBonusGravityScale()) {
			return this.gameOverride.bonusGravityScale();
		}

		return BONUS_GRAVITY_SCALE;
	}

	bonusMass(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesBonusMass()) {
			return this.gameOverride.bonusMass();
		}

		return BONUS_MASS;
	}

	isHiddenToHimself(): boolean {
		if (this.hasGameOverride() && this.gameOverride.overridesIsHiddenToHimself()) {
			return this.gameOverride.isHiddenToHimself();
		}

		return false;
	}

	isHiddenToOpponent(): boolean {
		if (this.hasGameOverride() && this.gameOverride.overridesIsHiddenToOpponent()) {
			return this.gameOverride.isHiddenToOpponent();
		}

		return false;
	}

	hasBonuses(): boolean {
		if (this.hasGameOverride() && this.gameOverride.overridesHasBonuses()) {
			return this.gameOverride.hasBonuses();
		}

		return true;
	}

	worldGravity(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesWorldGravity()) {
			return this.gameOverride.worldGravity();
		}

		return WORLD_GRAVITY;
	}

	highGravityMultiplier(): number {
		return HIGH_GRAVITY_MULTIPLIER;
	}

	lowGravityMultiplier(): number {
		return LOW_GRAVITY_MULTIPLIER;
	}

	worldRestitution(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesWorldRestitution()) {
			return this.gameOverride.worldRestitution();
		}

		return WORLD_RESTITUTION;
	}

	netRestitution(): number {
		return NET_RESTITUTION;
	}

	maximumBonusesOnScreen(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesMaximumBonusesOnScreen()) {
			return this.gameOverride.maximumBonusesOnScreen();
		}

		return BONUS_MAXIMUM_ON_SCREEN;
	}

	overridesMaximumBonusesInAPoint(): boolean {
		return (this.hasGameOverride() && this.gameOverride.overridesMaximumBonusesInAPoint());
	}

	maximumBonusesInAPoint(): number {
		if (!this.overridesMaximumBonusesInAPoint()) {
			throw 'The maximum bonuses in a point is not overridden';
		}

		return this.gameOverride.maximumBonusesInAPoint();
	}

	bonusSpawnMinimumFrequence(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesBonusSpawnMinimumFrequence()) {
			return this.gameOverride.bonusSpawnMinimumFrequence();
		}

		return BONUS_SPAWN_MINIMUM_FREQUENCE;
	}

	bonusSpawnInitialMinimumFrequence(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesBonusSpawnInitialMinimumFrequence()) {
			return this.gameOverride.bonusSpawnInitialMinimumFrequence();
		}

		return BONUS_SPAWN_INITIAL_MINIMUM_FREQUENCE;
	}

	bonusSpawnInitialMaximumFrequence(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesBonusSpawnInitialMaximumFrequence()) {
			return this.gameOverride.bonusSpawnInitialMaximumFrequence();
		}

		return BONUS_SPAWN_INITIAL_MAXIMUM_FREQUENCE;
	}

	overridesAvailableBonuses(): boolean {
		return (this.hasGameOverride() && this.gameOverride.overridesAvailableBonuses());
	}

	availableBonuses(): string[] {
		if (!this.overridesAvailableBonuses()) {
			throw 'The available bonuses are not overridden';
		}

		return this.gameOverride.availableBonuses();
	}

	overridesAvailableBonusesForRandom(): boolean {
		return (this.hasGameOverride() && this.gameOverride.overridesAvailableBonusesForRandom());
	}

	availableBonusesForRandom(): string[] {
		if (!this.overridesAvailableBonusesForRandom()) {
			throw 'The available bonuses for random are not overridden';
		}

		return this.gameOverride.availableBonusesForRandom();
	}

	overridesBonusDuration(): boolean {
		return (this.hasGameOverride() && this.gameOverride.overridesBonusDuration());
	}

	bonusDuration(): number {
		if (!this.overridesBonusDuration()) {
			throw 'The bonus duration is not overridden';
		}

		return this.gameOverride.bonusDuration();
	}

	overridesPlayerMaximumBallHit(): boolean {
		return (this.hasGameOverride() && this.gameOverride.overridesPlayerMaximumBallHit());
	}

	playerMaximumBallHit(): number {
		if (!this.overridesPlayerMaximumBallHit()) {
			throw 'The playerMaximumBallHit is not overridden';
		}

		return this.gameOverride.playerMaximumBallHit();
	}

	exceedsPlayerMaximumBallHit(numberBallHits): boolean {
		return (
			this.overridesPlayerMaximumBallHit() &&
			numberBallHits > this.playerMaximumBallHit()
		);
	}

	overridesTeamMaximumBallHit(): boolean {
		return (this.hasGameOverride() && this.gameOverride.overridesTeamMaximumBallHit());
	}

	teamMaximumBallHit(): number {
		if (!this.overridesTeamMaximumBallHit()) {
			throw 'The teamMaximumBallHit is not overridden';
		}

		return this.gameOverride.teamMaximumBallHit();
	}

	exceedsTeamMaximumBallHit(numberBallHits): boolean {
		return (
			this.overridesTeamMaximumBallHit() &&
			numberBallHits > this.teamMaximumBallHit()
		);
	}

	width(): number {
		return this.levelConfiguration.width;
	}

	height(): number {
		return this.levelConfiguration.height;
	}

	groundHeight(): number {
		return this.levelConfiguration.groundHeight;
	}

	netWidth(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesNetWidth()) {
			return this.gameOverride.netWidth();
		}

		return this.levelConfiguration.netWidth;
	}

	netHeight(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesNetHeight()) {
			return this.gameOverride.netHeight();
		}

		return this.levelConfiguration.netHeight;
	}

	groundHitEnabled(): boolean {
		if (this.hasGameOverride() && this.gameOverride.overridesGroundHitEnabled()) {
			return this.gameOverride.groundHitEnabled();
		}

		return true;
	}

	hasSoccerNet(): boolean {
		if (this.hasGameOverride() && this.gameOverride.overridesSoccerNetEnabled()) {
			return this.gameOverride.soccerNetEnabled();
		}

		return false;
	}

	soccerNetPointZoneWidth(): number {
		return this.levelConfiguration.soccerNetPointZoneWidth;
	}

	soccerNetHorizontalPostThickness(): number {
		return this.levelConfiguration.soccerNetHorizontalPostThickness;
	}

	soccerNetVerticalPostThickness(): number {
		return this.levelConfiguration.soccerNetVerticalPostThickness;
	}

	soccerNetWidth(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesSoccerNetWidth()) {
			return this.gameOverride.soccerNetWidth();
		}

		return this.levelConfiguration.soccerNetWidth;
	}

	soccerNetHeight(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesSoccerNetHeight()) {
			return this.gameOverride.soccerNetHeight();
		}

		return this.levelConfiguration.soccerNetHeight;
	}

	soccerNetDistanceFromGround(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesSoccerNetDistanceFromGround()) {
			return this.gameOverride.soccerNetDistanceFromGround();
		}

		return 0;
	}

	hasSoccerNetBottomPost(): boolean {
		return this.soccerNetDistanceFromGround() > 0;
	}

	playerWidth(): number {
		return PLAYER_DEFAULT_WIDTH;
	}

	playerHeight(): number {
		return PLAYER_DEFAULT_HEIGHT;
	}

	playerInitialYFromKey(playerKey: string, isHost: boolean): number {
		switch (playerKey) {
			case 'player1':
				return this.player1InitialY();
			case 'player2':
				return this.player2InitialY();
			case 'player3':
				return this.player3InitialY();
			case 'player4':
				return this.player4InitialY();
		}

		if (isHost) {
			return this.player1InitialY();
		} else {
			return this.player2InitialY();
		}
	}

	playerInitialXFromKey(playerKey: string, isHost: boolean): number {
		switch (playerKey) {
			case 'player1':
				return this.player1InitialX();
			case 'player2':
				return this.player2InitialX();
			case 'player3':
				return this.player3InitialX();
			case 'player4':
				return this.player4InitialX();
		}

		if (isHost) {
			return this.player1InitialX();
		} else {
			return this.player2InitialX();
		}
	}

	ballRadius(): number {
		return BALL_DEFAULT_RADIUS;
	}

	ballInitialY(): number {
		return Math.round(BALL_PROPORTION_FROM_HEIGHT * (this.height() - this.groundHeight()));
	}

	ballInitialHostX(): number {
		return this.player1InitialX() + (this.playerWidth() / 4) + this.ballRadius();
	}

	ballInitialClientX(): number {
		return this.player2InitialX() - (this.playerWidth() / 4) - this.ballRadius();
	}

	playerXVelocity(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesPlayerXVelocity()) {
			return this.gameOverride.playerXVelocity();
		}

		return PLAYER_VELOCITY_X_ON_MOVE;
	}

	playerYVelocity(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesPlayerYVelocity()) {
			return this.gameOverride.playerYVelocity();
		}

		return PLAYER_VELOCITY_Y_ON_JUMP;
	}

	playerDropshotEnabled(): boolean {
		if (this.hasGameOverride() && this.gameOverride.overridesPlayerDropshotEnabled()) {
			return this.gameOverride.playerDropshotEnabled();
		}

		return true;
	}

	playerSmashEnabled(): boolean {
		if (this.hasGameOverride() && this.gameOverride.overridesPlayerSmashEnabled()) {
			return this.gameOverride.playerSmashEnabled();
		}

		return true;
	}

	ballReboundOnPlayerEnabled(): boolean {
		if (this.hasGameOverride() && this.gameOverride.overridesBallReboundOnPlayerEnabled()) {
			return this.gameOverride.ballReboundOnPlayerEnabled();
		}

		return true;
	}

	ballVelocityOnReboundOnPlayer(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesBallVelocityOnReboundOnPlayer()) {
			return this.gameOverride.ballVelocityOnReboundOnPlayer();
		}

		return BALL_VERTICAL_SPEED_ON_PLAYER_HIT;
	}

	forcePracticeWithComputer(): boolean {
		if (this.hasGameOverride() && this.gameOverride.overridesForcePracticeWithComputer()) {
			return this.gameOverride.forcePracticeWithComputer();
		}

		return true;
	}

	canIncludeComputer(): boolean {
		return (
			this.gameMode !== ONE_VS_COMPUTER_GAME_MODE &&
			this.gameMode !== ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE
		);
	}

	hasPlayerNetLimit(): boolean {
		if (this.hasGameOverride() && this.gameOverride.overridesHasPlayerNetLimit()) {
			return this.gameOverride.hasPlayerNetLimit();
		}

		return true;
	}

	ballCollidesWithSoccerNetPosts(): boolean {
		if (this.hasSoccerNet() === false) {
			return false;
		}

		if (this.hasGameOverride() && this.gameOverride.overridesBallCollidesWithSoccerNetPosts()) {
			return this.gameOverride.ballCollidesWithSoccerNetPosts();
		}

		return true;
	}

	bonusCollidesWithSoccerNetPosts(): boolean {
		if (this.hasSoccerNet() === false) {
			return false;
		}

		if (this.hasGameOverride() && this.gameOverride.overridesBonusCollidesWithSoccerNetPosts()) {
			return this.gameOverride.bonusCollidesWithSoccerNetPosts();
		}

		return true;
	}

	playerCollidesWithSoccerNetPosts(): boolean {
		if (this.hasSoccerNet() === false) {
			return false;
		}

		if (this.hasGameOverride() && this.gameOverride.overridesPlayerCollidesWithSoccerNetPosts()) {
			return this.gameOverride.playerCollidesWithSoccerNetPosts();
		}

		return false;
	}

	collidesWithTeammate(): boolean {
		if (this.hasGameOverride() && this.gameOverride.overridesCollidesWithTeammate()) {
			return this.gameOverride.collidesWithTeammate();
		}

		return true;
	}

	collidesWithOpponent(): boolean {
		if (this.hasGameOverride() && this.gameOverride.overridesCollidesWithOpponent()) {
			return this.gameOverride.collidesWithOpponent();
		}

		return false;
	}

	private player1InitialX(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesPlayerInitialDistanceFromWall()) {
			return this.gameOverride.playerInitialDistanceFromWall();
		}

		return PLAYER_DISTANCE_FROM_WALL;
	}

	private player2InitialX(): number {
		let distanceFromWall = PLAYER_DISTANCE_FROM_WALL;

		if (this.hasGameOverride() && this.gameOverride.overridesPlayerInitialDistanceFromWall()) {
			distanceFromWall = this.gameOverride.playerInitialDistanceFromWall();
		}

		return this.width() - distanceFromWall;
	}

	private player3InitialX(): number {
		if (this.hasGameOverride() && this.gameOverride.overridesTeammateInitialDistanceFromWall()) {
			return this.gameOverride.teammateInitialDistanceFromWall();
		}

		return PLAYER_TEAMMATE_DISTANCE_FROM_WALL;
	}

	private player4InitialX(): number {
		let distanceFromWall = PLAYER_TEAMMATE_DISTANCE_FROM_WALL;

		if (this.hasGameOverride() && this.gameOverride.overridesTeammateInitialDistanceFromWall()) {
			distanceFromWall = this.gameOverride.teammateInitialDistanceFromWall();
		}

		return this.width() - distanceFromWall;
	}

	private player1InitialY(): number {
		let distanceFromGround = 0;

		if (this.hasGameOverride() && this.gameOverride.overridesPlayerInitialDistanceFromGround()) {
			distanceFromGround = this.gameOverride.playerInitialDistanceFromGround();
		}

		return this.height() - this.groundHeight() - (this.playerHeight() / 2) - distanceFromGround;
	}

	private player2InitialY(): number {
		let distanceFromGround = 0;

		if (this.hasGameOverride() && this.gameOverride.overridesPlayerInitialDistanceFromGround()) {
			distanceFromGround = this.gameOverride.playerInitialDistanceFromGround();
		}

		return this.height() - this.groundHeight() - (this.playerHeight() / 2) - distanceFromGround;
	}

	private player3InitialY(): number {
		let distanceFromGround = 0;

		if (this.hasGameOverride() && this.gameOverride.overridesTeammateInitialDistanceFromGround()) {
			distanceFromGround = this.gameOverride.teammateInitialDistanceFromGround();
		}

		return this.height() - this.groundHeight() - (this.playerHeight() / 2) - distanceFromGround;
	}

	private player4InitialY(): number {
		let distanceFromGround = 0;

		if (this.hasGameOverride() && this.gameOverride.overridesTeammateInitialDistanceFromGround()) {
			distanceFromGround = this.gameOverride.teammateInitialDistanceFromGround();
		}

		return this.height() - this.groundHeight() - (this.playerHeight() / 2) - distanceFromGround;
	}
}
