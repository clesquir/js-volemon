export const GAME_FORFEIT_MINIMUM_POINTS = 3;
export const GAME_MAXIMUM_POINTS = 5;
export const HOST_POINTS_COLUMN = 'hostPoints';
export const CLIENT_POINTS_COLUMN = 'clientPoints';
export const HOST_SIDE = 'host';
export const CLIENT_SIDE = 'client';

export const PLAYER_VELOCITY_X_ON_MOVE = 6;
export const PLAYER_VELOCITY_Y_ON_JUMP = 6;
export const PLAYER_MASS = 100;
export const PLAYER_SMALL_MASS = 70;
export const PLAYER_BIG_MASS = 200;
export const PLAYER_SCALE = 1;
export const PLAYER_SMALL_SCALE = 0.5;
export const PLAYER_BIG_SCALE = 1.5;

export const BALL_VERTICAL_SPEED_ON_PLAYER_HIT = -6.5;
export const BALL_MASS = 0.1;
export const BALL_SMALL_MASS = 0.07;
export const BALL_BIG_MASS = 0.2;
export const BALL_SCALE = 1;
export const BALL_SMALL_SCALE = 0.75;
export const BALL_BIG_SCALE = 1.5;
export const BALL_AIR_FRICTION = 0.001;

export const BONUS_INDICATOR_RADIUS = 15;
export const BONUS_RADIUS = 17;
export const BONUS_MASS = 0.1;
export const BONUS_SCALE = 1;
export const BONUS_AIR_FRICTION = 0;

export const WORLD_GRAVITY = 0.6;
export const WORLD_RESTITUTION = 1;
export const CONSTRAINED_VELOCITY = 20;

export const DEPTH_CLOUDS = 1;
export const DEPTH_BONUS_INDICATOR = 2;
export const DEPTH_ACTIVATION_ANIMATION = 3;

export const ONE_VS_COMPUTER_GAME_MODE = '1vsCPU';
export const ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE = '1vsMLCPU';
export const ONE_VS_ONE_GAME_MODE = '1vs1';
export const TWO_VS_TWO_GAME_MODE = '2vs2';
export const TWO_VS_TWO_HUMAN_CPU_GAME_MODE = '2vs2-human-CPU';
export const TOURNAMENT_GAME_SELECTION = 'tournament';

export const isTwoVersusTwoGameMode = function(gameMode) {
	return (
		gameMode === TWO_VS_TWO_GAME_MODE ||
		gameMode === TWO_VS_TWO_HUMAN_CPU_GAME_MODE
	);
};
