import {
	BALL_BIG_MASS,
	BALL_BIG_SCALE,
	BALL_MASS,
	BALL_SCALE,
	BALL_SMALL_MASS,
	BALL_SMALL_SCALE,
	BALL_VERTICAL_SPEED_ON_PLAYER_HIT,
	BONUS_MASS,
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
} from '/imports/api/games/constants';
import {
	BONUS_MAXIMUM_ON_SCREEN,
	BONUS_SPAWN_INITIAL_MAXIMUM_FREQUENCE,
	BONUS_SPAWN_INITIAL_MINIMUM_FREQUENCE,
	BONUS_SPAWN_MINIMUM_FREQUENCE
} from '/imports/api/games/emissionConstants.js';
import {PLAYER_ALLOWED_LIST_OF_SHAPES, PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js';

export default class GameConfiguration {
	/** @type {string|null} */
	gameMode = null;
	/** @type {string|null} */
	tournamentId = null;
	/** @type {object} */
	tournament = null;
	/** @type {TournamentMode} */
	tournamentMode = null;
	/** @type {LevelConfiguration} */
	levelConfiguration = null;

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

	/**
	 * @returns {string[]}
	 */
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

	/**
	 * @returns {boolean}
	 */
	overridesCurrentPlayerShape() {
		return (this.hasTournament() && this.tournamentMode.overridesCurrentPlayerShape());
	}

	currentPlayerShape() {
		if (!this.overridesCurrentPlayerShape()) {
			throw 'The shape is not overridden';
		}

		return this.tournamentMode.currentPlayerShape();
	}

	initialPlayerScale() {
		if (this.hasTournament() && this.tournamentMode.overridesInitialPlayerScale()) {
			return this.tournamentMode.initialPlayerScale();
		}

		return PLAYER_SCALE;
	}

	smallPlayerScale() {
		if (this.hasTournament() && this.tournamentMode.overridesSmallPlayerScale()) {
			return this.tournamentMode.smallPlayerScale();
		}

		return PLAYER_SMALL_SCALE;
	}

	bigPlayerScale() {
		if (this.hasTournament() && this.tournamentMode.overridesBigPlayerScale()) {
			return this.tournamentMode.bigPlayerScale();
		}

		return PLAYER_BIG_SCALE;
	}

	initialPlayerMass() {
		return PLAYER_MASS;
	}

	smallPlayerMass() {
		return PLAYER_SMALL_MASS;
	}

	bigPlayerMass() {
		return PLAYER_BIG_MASS;
	}

	initialVerticalMoveMultiplier() {
		return 1;
	}

	bigVerticalMoveMultiplier() {
		return 1.35;
	}

	initialHorizontalMoveMultiplier() {
		return 1;
	}

	fastHorizontalMoveMultiplier() {
		return 2;
	}

	slowHorizontalMoveMultiplier() {
		return 0.4;
	}

	initialBallScale() {
		if (this.hasTournament() && this.tournamentMode.overridesInitialBallScale()) {
			return this.tournamentMode.initialBallScale();
		}

		return BALL_SCALE;
	}

	smallBallScale() {
		if (this.hasTournament() && this.tournamentMode.overridesSmallBallScale()) {
			return this.tournamentMode.smallBallScale();
		}

		return BALL_SMALL_SCALE;
	}

	bigBallScale() {
		if (this.hasTournament() && this.tournamentMode.overridesBigBallScale()) {
			return this.tournamentMode.bigBallScale();
		}

		return BALL_BIG_SCALE;
	}

	initialBallMass() {
		return BALL_MASS;
	}

	smallBallMass() {
		return BALL_SMALL_MASS;
	}

	bigBallMass() {
		return BALL_BIG_MASS;
	}

	bonusScale() {
		return BONUS_SCALE;
	}

	bonusMass() {
		return BONUS_MASS;
	}

	isHiddenToHimself() {
		if (this.hasTournament() && this.tournamentMode.overridesIsHiddenToHimself()) {
			return this.tournamentMode.isHiddenToHimself();
		}

		return false;
	}

	isHiddenToOpponent() {
		if (this.hasTournament() && this.tournamentMode.overridesIsHiddenToOpponent()) {
			return this.tournamentMode.isHiddenToOpponent();
		}

		return false;
	}

	hasBonuses() {
		if (this.hasTournament() && this.tournamentMode.overridesHasBonuses()) {
			return this.tournamentMode.hasBonuses();
		}

		return true;
	}

	worldGravity() {
		if (this.hasTournament() && this.tournamentMode.overridesWorldGravity()) {
			return this.tournamentMode.worldGravity();
		}

		return WORLD_GRAVITY;
	}

	highGravityMultiplier() {
		return 2.75;
	}

	lowGravityMultiplier() {
		return 0.55;
	}

	worldRestitution() {
		if (this.hasTournament() && this.tournamentMode.overridesWorldRestitution()) {
			return this.tournamentMode.worldRestitution();
		}

		return WORLD_RESTITUTION;
	}

	maximumBonusesOnScreen() {
		if (this.hasTournament() && this.tournamentMode.overridesMaximumBonusesOnScreen()) {
			return this.tournamentMode.maximumBonusesOnScreen();
		}

		return BONUS_MAXIMUM_ON_SCREEN;
	}

	bonusSpawnMinimumFrequence() {
		if (this.hasTournament() && this.tournamentMode.overridesBonusSpawnMinimumFrequence()) {
			return this.tournamentMode.bonusSpawnMinimumFrequence();
		}

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

	overridesAvailableBonuses() {
		return (this.hasTournament() && this.tournamentMode.overridesAvailableBonuses());
	}

	availableBonuses() {
		if (!this.overridesAvailableBonuses()) {
			throw 'The available bonuses are not overridden';
		}

		return this.tournamentMode.availableBonuses();
	}

	overridesAvailableBonusesForRandom() {
		return (this.hasTournament() && this.tournamentMode.overridesAvailableBonusesForRandom());
	}

	availableBonusesForRandom() {
		if (!this.overridesAvailableBonusesForRandom()) {
			throw 'The available bonuses for random are not overridden';
		}

		return this.tournamentMode.availableBonusesForRandom();
	}

	overridesBonusDuration() {
		return (this.hasTournament() && this.tournamentMode.overridesBonusDuration());
	}

	bonusDuration() {
		if (!this.overridesBonusDuration()) {
			throw 'The bonus duration is not overridden';
		}

		return this.tournamentMode.bonusDuration();
	}

	overridesPlayerMaximumBallHit() {
		return (this.hasTournament() && this.tournamentMode.overridesPlayerMaximumBallHit());
	}

	playerMaximumBallHit() {
		if (!this.overridesPlayerMaximumBallHit()) {
			throw 'The playerMaximumBallHit is not overridden';
		}

		return this.tournamentMode.playerMaximumBallHit();
	}

	exceedsPlayerMaximumBallHit(numberBallHits) {
		return (
			this.overridesPlayerMaximumBallHit() &&
			numberBallHits > this.playerMaximumBallHit()
		);
	}

	overridesTeamMaximumBallHit() {
		return (this.hasTournament() && this.tournamentMode.overridesTeamMaximumBallHit());
	}

	teamMaximumBallHit() {
		if (!this.overridesTeamMaximumBallHit()) {
			throw 'The teamMaximumBallHit is not overridden';
		}

		return this.tournamentMode.teamMaximumBallHit();
	}

	exceedsTeamMaximumBallHit(numberBallHits) {
		return (
			this.overridesTeamMaximumBallHit() &&
			numberBallHits > this.teamMaximumBallHit()
		);
	}

	width() {
		return this.levelConfiguration.width;
	}

	height() {
		return this.levelConfiguration.height;
	}

	groundHeight() {
		return this.levelConfiguration.groundHeight;
	}

	netHeight() {
		if (this.hasTournament() && this.tournamentMode.overridesNetHeight()) {
			return this.tournamentMode.netHeight();
		}

		return this.levelConfiguration.netHeight;
	}

	netWidth() {
		return this.levelConfiguration.netWidth;
	}

	playerWidth() {
		return this.levelConfiguration.playerWidth();
	}

	playerHeight() {
		return this.levelConfiguration.playerHeight();
	}

	playerInitialY() {
		return this.levelConfiguration.playerInitialY();
	}

	playerInitialXFromKey(playerKey, isHost) {
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

	player1InitialX() {
		return this.levelConfiguration.player1InitialX();
	}

	player2InitialX() {
		return this.levelConfiguration.player2InitialX();
	}

	player3InitialX() {
		return this.levelConfiguration.player3InitialX();
	}

	player4InitialX() {
		return this.levelConfiguration.player4InitialX();
	}

	ballInitialY() {
		return this.levelConfiguration.ballInitialY();
	}

	ballInitialHostX() {
		return this.levelConfiguration.ballInitialHostX();
	}

	ballInitialClientX() {
		return this.levelConfiguration.ballInitialClientX();
	}

	playerXVelocity() {
		if (this.hasTournament() && this.tournamentMode.overridesPlayerXVelocity()) {
			return this.tournamentMode.playerXVelocity();
		}

		return PLAYER_VELOCITY_X_ON_MOVE;
	}

	playerYVelocity() {
		if (this.hasTournament() && this.tournamentMode.overridesPlayerYVelocity()) {
			return this.tournamentMode.playerYVelocity();
		}

		return PLAYER_VELOCITY_Y_ON_JUMP;
	}

	playerDropshotEnabled() {
		if (this.hasTournament() && this.tournamentMode.overridesPlayerDropshotEnabled()) {
			return this.tournamentMode.playerDropshotEnabled();
		}

		return true;
	}

	playerSmashEnabled() {
		if (this.hasTournament() && this.tournamentMode.overridesPlayerSmashEnabled()) {
			return this.tournamentMode.playerSmashEnabled();
		}

		return true;
	}

	ballReboundOnPlayerEnabled() {
		if (this.hasTournament() && this.tournamentMode.overridesBallReboundOnPlayerEnabled()) {
			return this.tournamentMode.ballReboundOnPlayerEnabled();
		}

		return true;
	}

	ballVelocityOnReboundOnPlayer() {
		if (this.hasTournament() && this.tournamentMode.overridesBallVelocityOnReboundOnPlayer()) {
			return this.tournamentMode.ballVelocityOnReboundOnPlayer();
		}

		return BALL_VERTICAL_SPEED_ON_PLAYER_HIT;
	}

	forcePracticeWithComputer() {
		if (this.hasTournament() && this.tournamentMode.overridesForcePracticeWithComputer()) {
			return this.tournamentMode.forcePracticeWithComputer();
		}

		return true;
	}

	canIncludeComputer() {
		if (this.hasTournament()) {
			return this.tournament.gameMode !== TWO_VS_TWO_HUMAN_CPU_GAME_MODE;
		} else {
			return this.gameMode === TWO_VS_TWO_GAME_MODE;
		}
	}
}
