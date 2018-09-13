import {
	BALL_BIG_GRAVITY_SCALE,
	BALL_GRAVITY_SCALE,
	BALL_SMALL_GRAVITY_SCALE,
	BIG_SCALE_BONUS,
	BIG_SCALE_PHYSICS_DATA,
	BONUS_RADIUS,
	GAME_FORFEIT_MINIMUM_POINTS,
	GAME_MAXIMUM_POINTS,
	NORMAL_SCALE_BONUS,
	NORMAL_SCALE_PHYSICS_DATA,
	PLAYER_BIG_GRAVITY_SCALE,
	PLAYER_GRAVITY_SCALE,
	PLAYER_SMALL_GRAVITY_SCALE,
	PLAYER_VELOCITY_X_ON_MOVE,
	PLAYER_VELOCITY_Y_ON_JUMP,
	SMALL_SCALE_BALL_BONUS,
	SMALL_SCALE_PHYSICS_DATA,
	SMALL_SCALE_PLAYER_BONUS,
	WORLD_GRAVITY,
	WORLD_RESTITUTION
} from '/imports/api/games/constants.js';
import {
	BONUS_MAXIMUM_ON_SCREEN,
	BONUS_SPAWN_INITIAL_MAXIMUM_FREQUENCE,
	BONUS_SPAWN_INITIAL_MINIMUM_FREQUENCE,
	BONUS_SPAWN_MINIMUM_FREQUENCE
} from '/imports/api/games/emissionConstants.js';
import {PLAYER_ALLOWED_LIST_OF_SHAPES, PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js';

export default class GameConfiguration {
	tournamentId = null;
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

	overridesCurrentPlayerShape() {
		return (this.hasTournament() && this.tournamentMode.overridesCurrentPlayerShape());
	}

	currentPlayerShape() {
		if (!this.overridesCurrentPlayerShape()) {
			throw 'The shape is not overridden';
		}

		return this.tournamentMode.currentPlayerShape();
	}

	initialPlayerPolygonKey() {
		if (this.hasTournament() && this.tournamentMode.overridesInitialPlayerPolygonKey()) {
			return this.tournamentMode.initialPlayerPolygonKey();
		}

		return NORMAL_SCALE_PHYSICS_DATA;
	}

	initialPlayerGravityScale() {
		if (this.hasTournament() && this.tournamentMode.overridesInitialPlayerPolygonKey()) {
			switch (this.tournamentMode.initialPlayerPolygonKey()) {
				case SMALL_SCALE_PHYSICS_DATA:
					return PLAYER_SMALL_GRAVITY_SCALE;
				case BIG_SCALE_PHYSICS_DATA:
					return PLAYER_BIG_GRAVITY_SCALE;
			}
		}

		return PLAYER_GRAVITY_SCALE;
	}

	initialPlayerScale() {
		if (this.hasTournament() && this.tournamentMode.overridesInitialPlayerPolygonKey()) {
			switch (this.tournamentMode.initialPlayerPolygonKey()) {
				case SMALL_SCALE_PHYSICS_DATA:
					return SMALL_SCALE_PLAYER_BONUS;
				case BIG_SCALE_PHYSICS_DATA:
					return BIG_SCALE_BONUS;
			}
		}

		return NORMAL_SCALE_BONUS;
	}

	initialBallPolygonKey() {
		if (this.hasTournament() && this.tournamentMode.overridesInitialBallPolygonKey()) {
			return this.tournamentMode.initialBallPolygonKey();
		}

		return NORMAL_SCALE_PHYSICS_DATA;
	}

	initialBallGravityScale() {
		if (this.hasTournament() && this.tournamentMode.overridesInitialBallPolygonKey()) {
			switch (this.tournamentMode.initialBallPolygonKey()) {
				case SMALL_SCALE_PHYSICS_DATA:
					return BALL_SMALL_GRAVITY_SCALE;
				case BIG_SCALE_PHYSICS_DATA:
					return BALL_BIG_GRAVITY_SCALE;
			}
		}

		return BALL_GRAVITY_SCALE;
	}

	initialBallScale() {
		if (this.hasTournament() && this.tournamentMode.overridesInitialBallPolygonKey()) {
			switch (this.tournamentMode.initialBallPolygonKey()) {
				case SMALL_SCALE_PHYSICS_DATA:
					return SMALL_SCALE_BALL_BONUS;
				case BIG_SCALE_PHYSICS_DATA:
					return BIG_SCALE_BONUS;
			}
		}

		return NORMAL_SCALE_BONUS;
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

	bonusRadius() {
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

	bonusDuration(bonusDuration) {
		if (!this.overridesBonusDuration()) {
			throw 'The bonus duration is not overridden';
		}

		return this.tournamentMode.bonusDuration(bonusDuration);
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

	playerInitialY() {
		return this.levelConfiguration.playerInitialY();
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
}
