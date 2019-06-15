import GameOverrideFactory from '/imports/api/games/GameOverrideFactory';

export const GAME_FORFEIT_MINIMUM_POINTS = 3;
export const GAME_MAXIMUM_POINTS = 5;
export const HOST_POINTS_COLUMN = 'hostPoints';
export const CLIENT_POINTS_COLUMN = 'clientPoints';
export const HOST_SIDE = 'host';
export const CLIENT_SIDE = 'client';

export const PLAYER_VELOCITY_X_ON_MOVE = 280;
export const PLAYER_VELOCITY_Y_ON_JUMP = 420;
export const PLAYER_MASS = 200;
export const PLAYER_SMALL_MASS = 140;
export const PLAYER_BIG_MASS = 400;
export const PLAYER_SCALE = 1;
export const PLAYER_SMALL_SCALE = 0.5;
export const PLAYER_BIG_SCALE = 1.5;
export const PLAYER_GRAVITY_SCALE = 1;
export const PLAYER_BIG_GRAVITY_SCALE = 3.75;
export const PLAYER_SMALL_GRAVITY_SCALE = 0.7;
export const PLAYER_VERTICAL_MOVE_MULTIPLIER_INITIAL = 1;
export const PLAYER_VERTICAL_MOVE_MULTIPLIER_BIG = 1.35;
export const PLAYER_HORIZONTAL_MOVE_MULTIPLIER_INITIAL = 1;
export const PLAYER_HORIZONTAL_MOVE_MULTIPLIER_SLOW = 0.4;
export const PLAYER_HORIZONTAL_MOVE_MULTIPLIER_FAST = 2;
export const PLAYER_DEFAULT_WIDTH = 98;
export const PLAYER_DEFAULT_HEIGHT = 49;
export const PLAYER_DISTANCE_FROM_WALL = 140;
export const PLAYER_TEAMMATE_DISTANCE_FROM_WALL = 340;

export const BALL_VERTICAL_SPEED_ON_PLAYER_HIT = -410;
export const BALL_MASS = 1;
export const BALL_SMALL_MASS = 0.7;
export const BALL_BIG_MASS = 2;
export const BALL_SCALE = 1;
export const BALL_SMALL_SCALE = 0.75;
export const BALL_BIG_SCALE = 1.5;
export const BALL_GRAVITY_SCALE = 0.75;
export const BALL_BIG_GRAVITY_SCALE = 1.2;
export const BALL_SMALL_GRAVITY_SCALE = 0.5;
export const BALL_DEFAULT_RADIUS = 12;
export const BALL_PROPORTION_FROM_HEIGHT = 0.3875;

export const BONUS_INDICATOR_RADIUS = 15;
export const BONUS_RADIUS = 15;
export const BONUS_MASS = 1;
export const BONUS_SCALE = 1;
export const BONUS_GRAVITY_SCALE = 0.5;

export const WORLD_GRAVITY = 770;
export const WORLD_RESTITUTION = 1;
export const NET_RESTITUTION = 0.7;
export const CONSTRAINED_VELOCITY = 1000;
export const HIGH_GRAVITY_MULTIPLIER = 2.71;
export const LOW_GRAVITY_MULTIPLIER = 0.54;

export const DEPTH_COMPONENTS = 0;
export const DEPTH_LEVEL = 1;
export const DEPTH_CLOUDS = 2;
export const DEPTH_BONUS_INDICATOR = 3;
export const DEPTH_ACTIVATION_ANIMATION = 4;

export const ONE_VS_COMPUTER_GAME_MODE = '1vsCPU';
export const ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE = '1vsMLCPU';
export const ONE_VS_ONE_GAME_MODE = '1vs1';
export const TWO_VS_TWO_GAME_MODE = '2vs2';
export const TOURNAMENT_GAME_SELECTION = 'tournament';

export const isTwoVersusTwoGameMode = function(gameMode) {
	return (
		gameMode === TWO_VS_TWO_GAME_MODE ||
		(GameOverrideFactory.gameModeHasGameOverride(gameMode) && GameOverrideFactory.isTwoVersusTwoGameMode(gameMode))
	);
};
