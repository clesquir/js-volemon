import {
	BALL_AIR_FRICTION,
	BALL_BIG_MASS,
	BALL_BIG_SCALE,
	BALL_MASS,
	BALL_SCALE,
	BALL_SMALL_MASS,
	BALL_SMALL_SCALE,
	BALL_VERTICAL_SPEED_ON_PLAYER_HIT,
	BONUS_MASS,
	BONUS_RADIUS,
	BONUS_SCALE,
	GAME_FORFEIT_MINIMUM_POINTS,
	GAME_MAXIMUM_POINTS,
	PLAYER_BIG_MASS,
	PLAYER_BIG_SCALE,
	PLAYER_MASS,
	PLAYER_SCALE,
	PLAYER_SMALL_MASS,
	PLAYER_SMALL_SCALE,
	PLAYER_VELOCITY_X_ON_MOVE,
	PLAYER_VELOCITY_Y_ON_JUMP,
	TWO_VS_TWO_GAME_MODE,
	TWO_VS_TWO_HUMAN_CPU_GAME_MODE,
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
import TournamentMode from "../../tournaments/TournamentMode";
import LevelConfiguration from "../levelConfiguration/LevelConfiguration";

export default abstract class GameConfiguration {
	gameMode: string = null;
	tournamentId: string = null;
	tournament: any = null;
	tournamentMode: TournamentMode = null;
	levelConfiguration: LevelConfiguration = null;

	hasTournament(): boolean {
		return !!this.tournamentId;
	}

	forfeitMinimumPoints(): number {
		if (this.hasTournament() && this.tournamentMode.overridesForfeitMinimumPoints()) {
			return this.tournamentMode.forfeitMinimumPoints();
		}

		return GAME_FORFEIT_MINIMUM_POINTS;
	}

	maximumPoints(): number {
		if (this.hasTournament() && this.tournamentMode.overridesMaximumPoints()) {
			return this.tournamentMode.maximumPoints();
		}

		return GAME_MAXIMUM_POINTS;
	}

	listOfShapes(): string[] {
		if (this.hasTournament() && this.tournamentMode.overridesListOfShapes()) {
			return this.tournamentMode.listOfShapes();
		}

		return PLAYER_LIST_OF_SHAPES;
	}

	allowedListOfShapes(): string[] {
		if (this.hasTournament() && this.tournamentMode.overridesAllowedListOfShapes()) {
			return this.tournamentMode.allowedListOfShapes();
		}

		return PLAYER_ALLOWED_LIST_OF_SHAPES;
	}

	overridesCurrentPlayerShape(): boolean {
		return (this.hasTournament() && this.tournamentMode.overridesCurrentPlayerShape());
	}

	currentPlayerShape(): string {
		if (!this.overridesCurrentPlayerShape()) {
			throw 'The shape is not overridden';
		}

		return this.tournamentMode.currentPlayerShape();
	}

	initialPlayerScale(): number {
		if (this.hasTournament() && this.tournamentMode.overridesInitialPlayerScale()) {
			return this.tournamentMode.initialPlayerScale();
		}

		return PLAYER_SCALE;
	}

	smallPlayerScale(): number {
		if (this.hasTournament() && this.tournamentMode.overridesSmallPlayerScale()) {
			return this.tournamentMode.smallPlayerScale();
		}

		return PLAYER_SMALL_SCALE;
	}

	bigPlayerScale(): number {
		if (this.hasTournament() && this.tournamentMode.overridesBigPlayerScale()) {
			return this.tournamentMode.bigPlayerScale();
		}

		return PLAYER_BIG_SCALE;
	}

	initialPlayerMass(): number {
		return PLAYER_MASS;
	}

	smallPlayerMass(): number {
		return PLAYER_SMALL_MASS;
	}

	bigPlayerMass(): number {
		return PLAYER_BIG_MASS;
	}

	initialVerticalMoveMultiplier(): number {
		return 1;
	}

	bigVerticalMoveMultiplier(): number {
		return 1.35;
	}

	initialHorizontalMoveMultiplier(): number {
		return 1;
	}

	fastHorizontalMoveMultiplier(): number {
		return 2;
	}

	slowHorizontalMoveMultiplier(): number {
		return 0.4;
	}

	initialBallScale(): number {
		if (this.hasTournament() && this.tournamentMode.overridesInitialBallScale()) {
			return this.tournamentMode.initialBallScale();
		}

		return BALL_SCALE;
	}

	smallBallScale(): number {
		if (this.hasTournament() && this.tournamentMode.overridesSmallBallScale()) {
			return this.tournamentMode.smallBallScale();
		}

		return BALL_SMALL_SCALE;
	}

	bigBallScale(): number {
		if (this.hasTournament() && this.tournamentMode.overridesBigBallScale()) {
			return this.tournamentMode.bigBallScale();
		}

		return BALL_BIG_SCALE;
	}

	initialBallMass(): number {
		return BALL_MASS;
	}

	smallBallMass(): number {
		return BALL_SMALL_MASS;
	}

	bigBallMass(): number {
		return BALL_BIG_MASS;
	}

	ballAirFriction(): number {
		return BALL_AIR_FRICTION;
	}

	bonusIndicatorRadius(): number {
		return BONUS_RADIUS;
	}

	bonusScale(): number {
		return BONUS_SCALE;
	}

	bonusMass(): number {
		return BONUS_MASS;
	}

	isHiddenToHimself(): boolean {
		if (this.hasTournament() && this.tournamentMode.overridesIsHiddenToHimself()) {
			return this.tournamentMode.isHiddenToHimself();
		}

		return false;
	}

	isHiddenToOpponent(): boolean {
		if (this.hasTournament() && this.tournamentMode.overridesIsHiddenToOpponent()) {
			return this.tournamentMode.isHiddenToOpponent();
		}

		return false;
	}

	hasBonuses(): boolean {
		if (this.hasTournament() && this.tournamentMode.overridesHasBonuses()) {
			return this.tournamentMode.hasBonuses();
		}

		return true;
	}

	worldGravity(): number {
		if (this.hasTournament() && this.tournamentMode.overridesWorldGravity()) {
			return this.tournamentMode.worldGravity();
		}

		return WORLD_GRAVITY;
	}

	highGravityMultiplier(): number {
		return 2.75;
	}

	lowGravityMultiplier(): number {
		return 0.55;
	}

	worldRestitution(): number {
		if (this.hasTournament() && this.tournamentMode.overridesWorldRestitution()) {
			return this.tournamentMode.worldRestitution();
		}

		return WORLD_RESTITUTION;
	}

	maximumBonusesOnScreen(): number {
		if (this.hasTournament() && this.tournamentMode.overridesMaximumBonusesOnScreen()) {
			return this.tournamentMode.maximumBonusesOnScreen();
		}

		return BONUS_MAXIMUM_ON_SCREEN;
	}

	bonusSpawnMinimumFrequence(): number {
		if (this.hasTournament() && this.tournamentMode.overridesBonusSpawnMinimumFrequence()) {
			return this.tournamentMode.bonusSpawnMinimumFrequence();
		}

		return BONUS_SPAWN_MINIMUM_FREQUENCE;
	}

	bonusSpawnInitialMinimumFrequence(): number {
		if (this.hasTournament() && this.tournamentMode.overridesBonusSpawnInitialMinimumFrequence()) {
			return this.tournamentMode.bonusSpawnInitialMinimumFrequence();
		}

		return BONUS_SPAWN_INITIAL_MINIMUM_FREQUENCE;
	}

	bonusSpawnInitialMaximumFrequence(): number {
		if (this.hasTournament() && this.tournamentMode.overridesBonusSpawnInitialMaximumFrequence()) {
			return this.tournamentMode.bonusSpawnInitialMaximumFrequence();
		}

		return BONUS_SPAWN_INITIAL_MAXIMUM_FREQUENCE;
	}

	overridesAvailableBonuses(): boolean {
		return (this.hasTournament() && this.tournamentMode.overridesAvailableBonuses());
	}

	availableBonuses(): string[] {
		if (!this.overridesAvailableBonuses()) {
			throw 'The available bonuses are not overridden';
		}

		return this.tournamentMode.availableBonuses();
	}

	overridesAvailableBonusesForRandom(): boolean {
		return (this.hasTournament() && this.tournamentMode.overridesAvailableBonusesForRandom());
	}

	availableBonusesForRandom(): string[] {
		if (!this.overridesAvailableBonusesForRandom()) {
			throw 'The available bonuses for random are not overridden';
		}

		return this.tournamentMode.availableBonusesForRandom();
	}

	overridesBonusDuration(): boolean {
		return (this.hasTournament() && this.tournamentMode.overridesBonusDuration());
	}

	bonusDuration(): number {
		if (!this.overridesBonusDuration()) {
			throw 'The bonus duration is not overridden';
		}

		return this.tournamentMode.bonusDuration();
	}

	overridesPlayerMaximumBallHit(): boolean {
		return (this.hasTournament() && this.tournamentMode.overridesPlayerMaximumBallHit());
	}

	playerMaximumBallHit(): number {
		if (!this.overridesPlayerMaximumBallHit()) {
			throw 'The playerMaximumBallHit is not overridden';
		}

		return this.tournamentMode.playerMaximumBallHit();
	}

	exceedsPlayerMaximumBallHit(numberBallHits): boolean {
		return (
			this.overridesPlayerMaximumBallHit() &&
			numberBallHits > this.playerMaximumBallHit()
		);
	}

	overridesTeamMaximumBallHit(): boolean {
		return (this.hasTournament() && this.tournamentMode.overridesTeamMaximumBallHit());
	}

	teamMaximumBallHit(): number {
		if (!this.overridesTeamMaximumBallHit()) {
			throw 'The teamMaximumBallHit is not overridden';
		}

		return this.tournamentMode.teamMaximumBallHit();
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

	netHeight(): number {
		if (this.hasTournament() && this.tournamentMode.overridesNetHeight()) {
			return this.tournamentMode.netHeight();
		}

		return this.levelConfiguration.netHeight;
	}

	netWidth(): number {
		if (this.hasTournament() && this.tournamentMode.overridesNetWidth()) {
			return this.tournamentMode.netWidth();
		}

		return this.levelConfiguration.netWidth;
	}

	playerWidth(): number {
		return this.levelConfiguration.playerWidth();
	}

	playerHeight(): number {
		return this.levelConfiguration.playerHeight();
	}

	playerInitialY(): number {
		return this.levelConfiguration.playerInitialY();
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

	ballInitialY(): number {
		return this.levelConfiguration.ballInitialY();
	}

	ballInitialHostX(): number {
		return this.levelConfiguration.ballInitialHostX();
	}

	ballInitialClientX(): number {
		return this.levelConfiguration.ballInitialClientX();
	}

	playerXVelocity(): number {
		if (this.hasTournament() && this.tournamentMode.overridesPlayerXVelocity()) {
			return this.tournamentMode.playerXVelocity();
		}

		return PLAYER_VELOCITY_X_ON_MOVE;
	}

	playerYVelocity(): number {
		if (this.hasTournament() && this.tournamentMode.overridesPlayerYVelocity()) {
			return this.tournamentMode.playerYVelocity();
		}

		return PLAYER_VELOCITY_Y_ON_JUMP;
	}

	playerDropshotEnabled(): boolean {
		if (this.hasTournament() && this.tournamentMode.overridesPlayerDropshotEnabled()) {
			return this.tournamentMode.playerDropshotEnabled();
		}

		return true;
	}

	playerSmashEnabled(): boolean {
		if (this.hasTournament() && this.tournamentMode.overridesPlayerSmashEnabled()) {
			return this.tournamentMode.playerSmashEnabled();
		}

		return true;
	}

	ballReboundOnPlayerEnabled(): boolean {
		if (this.hasTournament() && this.tournamentMode.overridesBallReboundOnPlayerEnabled()) {
			return this.tournamentMode.ballReboundOnPlayerEnabled();
		}

		return true;
	}

	ballVelocityOnReboundOnPlayer(): number {
		if (this.hasTournament() && this.tournamentMode.overridesBallVelocityOnReboundOnPlayer()) {
			return this.tournamentMode.ballVelocityOnReboundOnPlayer();
		}

		return BALL_VERTICAL_SPEED_ON_PLAYER_HIT;
	}

	forcePracticeWithComputer(): boolean {
		if (this.hasTournament() && this.tournamentMode.overridesForcePracticeWithComputer()) {
			return this.tournamentMode.forcePracticeWithComputer();
		}

		return true;
	}

	canIncludeComputer(): boolean {
		if (this.hasTournament()) {
			return this.tournament.gameMode !== TWO_VS_TWO_HUMAN_CPU_GAME_MODE;
		} else {
			return this.gameMode === TWO_VS_TWO_GAME_MODE;
		}
	}

	private player1InitialX(): number {
		return this.levelConfiguration.player1InitialX();
	}

	private player2InitialX(): number {
		return this.levelConfiguration.player2InitialX();
	}

	private player3InitialX(): number {
		return this.levelConfiguration.player3InitialX();
	}

	private player4InitialX(): number {
		return this.levelConfiguration.player4InitialX();
	}
}
