export const Constants = {
	GAME_STATUS_REGISTRATION: 'registration',
	GAME_STATUS_STARTED: 'started',
	GAME_STATUS_TIMEOUT: 'timeout',
	GAME_STATUS_FINISHED: 'finished',

	GAME_X_SIZE: 840,
	GAME_Y_SIZE: 560,
	GAME_GROUND_HEIGHT: 70,

	MAXIMUM_POINTS: 5,
	HOST_POINTS_COLUMN: 'hostPoints',
	CLIENT_POINTS_COLUMN: 'clientPoints',

	LAST_POINT_TAKEN_HOST: 'host',
	LAST_POINT_TAKEN_CLIENT: 'client',

	PLAYER_SHAPE_HALF_CIRCLE: 'half-circle',
	PLAYER_SHAPE_TRIANGLE: 'triangle',
	PLAYER_SHAPE_RECTANGLE: 'rectangle',
	PLAYER_SHAPE_RHOMBUS: 'rhombus',
	PLAYER_SHAPE_HEXAGON: 'hexagon',

	PLAYER_WIDTH: 98,
	PLAYER_HEIGHT: 49,
	BALL_RADIUS: 12,
	BALL_VERTICAL_SPEED_ON_PLAYER_HIT: -280,

	PLAYER_MASS: 200,
	PLAYER_GRAVITY_SCALE: 1,
	PLAYER_BIG_GRAVITY_SCALE: 3.75,
	PLAYER_SMALL_GRAVITY_SCALE: 0.7,
	BALL_GRAVITY_SCALE: 0.3636363636,
	BALL_BIG_GRAVITY_SCALE: 0.6,
	BALL_SMALL_GRAVITY_SCALE: 0.2,

	TOO_SHORT_PASSWORD_ERROR_MESSAGE: 'Password must be at least 6 characters long',
	CONFIRMATION_MATCH_PASSWORD_ERROR_MESSAGE: 'The password confirmation must match the password',

	NORMAL_SCALE_BONUS: 1,
	NORMAL_SCALE_PHYSICS_DATA: 'physicsData',
	SMALL_SCALE_PLAYER_BONUS: 0.5,
	SMALL_SCALE_BALL_BONUS: 0.75,
	SMALL_SCALE_PHYSICS_DATA: 'physicsDataSmall',
	BIG_SCALE_BONUS: 1.5,
	BIG_SCALE_PHYSICS_DATA: 'physicsDataBig',

	BONUS_SMALL_BALL: 'SmallBallBonus',
	BONUS_BIG_BALL: 'BigBallBonus',
	BONUS_SMALL_MONSTER: 'SmallMonsterBonus',
	BONUS_BIG_MONSTER: 'BigMonsterBonus',
	BONUS_BIG_JUMP_MONSTER: 'BigJumpMonsterBonus',
	BONUS_SLOW_MONSTER: 'SlowMonsterBonus',
	BONUS_FAST_MONSTER: 'FastMonsterBonus',
	BONUS_FREEZE_MONSTER: 'FreezeMonsterBonus',
	BONUS_REVERSE_MOVE_MONSTER: 'ReverseMoveMonsterBonus',
	BONUS_INVISIBLE_MONSTER: 'InvisibleMonsterBonus',
	BONUS_INVISIBLE_OPPONENT_MONSTER: 'InvisibleOpponentMonsterBonus',
	BONUS_CLOUD: 'CloudBonus',
	BONUS_NO_JUMP_MONSTER: 'NoJumpMonsterBonus',
	BONUS_BOUNCE_MONSTER: 'BounceMonsterBonus',
	BONUS_CLOAKED_MONSTER: 'CloakedMonsterBonus',
	RANDOM_BONUS: 'RandomBonus'
};

Constants.PLAYER_DEFAULT_SHAPE = Constants.PLAYER_SHAPE_HALF_CIRCLE;
Constants.PLAYER_LIST_OF_SHAPES = [
	Constants.PLAYER_SHAPE_HALF_CIRCLE,
	Constants.PLAYER_SHAPE_TRIANGLE,
	Constants.PLAYER_SHAPE_RECTANGLE,
	Constants.PLAYER_SHAPE_RHOMBUS,
	Constants.PLAYER_SHAPE_HEXAGON
];
