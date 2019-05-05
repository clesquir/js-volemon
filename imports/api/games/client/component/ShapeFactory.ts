import {
	PLAYER_SHAPE_CROWN,
	PLAYER_SHAPE_DOT,
	PLAYER_SHAPE_ELLIPSE,
	PLAYER_SHAPE_EQUAL,
	PLAYER_SHAPE_H,
	PLAYER_SHAPE_HALF_CIRCLE,
	PLAYER_SHAPE_HEXAGON,
	PLAYER_SHAPE_HYPHEN,
	PLAYER_SHAPE_MAGNET,
	PLAYER_SHAPE_OBELISK,
	PLAYER_SHAPE_RECTANGLE,
	PLAYER_SHAPE_RHOMBUS,
	PLAYER_SHAPE_S,
	PLAYER_SHAPE_TRIANGLE,
	PLAYER_SHAPE_TRIPLE_COLON,
	PLAYER_SHAPE_X
} from "../../shapeConstants";

declare type EyeConfig = {
	xOffset: number;
	yOffset: number;
	eyeBallRadius: number;
	pupilRadius: number;
};

export default class ShapeFactory {
	static ball(): any {
		return [
			{
				'shape': [
					24, 8,
					24, 16,
					16, 24,
					8, 24,
					0, 16,
					0, 8,
					8, 0,
					16, 0
				]
			}
		];
	}
	
	static player(shape: string, isHost: boolean): any {
		switch (shape) {
			case PLAYER_SHAPE_HALF_CIRCLE:
				return [
					{
						'shape': [
							0, 49,
							0, 35,
							9, 20,
							12, 17.5,
							24, 6,
							40, 0,
							49, 0,
							58, 0,
							74, 6,
							86, 17.5,
							89, 20,
							98, 35,
							98, 49
						]
					}
				];
			case PLAYER_SHAPE_TRIANGLE:
				return [
					{
						'shape': [
							0, 49,
							49, 0,
							98, 49
						]
					}
				];
			case PLAYER_SHAPE_X:
				return [
					{
						'shape': [
							0, 49,
							0, 39,
							83, 0,
							98, 0,
							98, 10,
							15, 49
						]
					},
					{
						'shape': [
							0, 10,
							0, 0,
							15, 0,
							98, 39,
							98, 49,
							83, 49
						]
					}
				];
			case PLAYER_SHAPE_RECTANGLE:
				return [
					{
						'shape': [
							0, 49,
							0, 0,
							98, 0,
							98, 49
						]
					}
				];
			case PLAYER_SHAPE_HYPHEN:
				return [
					{
						'shape': [
							25, 30,
							25, 19,
							73, 19,
							73, 30
						]
					}
				];
			case PLAYER_SHAPE_OBELISK:
				return [
					{
						'shape': [
							43, 48,
							43, 0,
							55, 0,
							55, 48
						]
					}
				];
			case PLAYER_SHAPE_EQUAL:
				return [
					{
						'shape': [
							0, 13,
							0, 0,
							98, 0,
							98, 13
						]
					},
					{
						'shape': [
							0, 49,
							0, 36,
							98, 36,
							98, 49
						]
					}
				];
			case PLAYER_SHAPE_MAGNET:
				if (isHost) {
					return [
						{
							'shape': [
								24.5, 13,
								13, 24.5,
								0, 24.5,
								3, 13,
								13, 3,
								24.5, 0
							]
						},
						{
							'shape': [
								24.5, 13,
								24.5, 0,
								98, 0,
								98, 13
							]
						},
						{
							'shape': [
								24.5, 49,
								13, 46,
								3, 36,
								0, 24.5,
								13, 24.5,
								24.5, 36
							]
						},
						{
							'shape': [
								24.5, 49,
								24.5, 36,
								98, 36,
								98, 49
							]
						},
						{
							'shape': [
								13, 36,
								3, 36,
								0, 24.5,
								3, 13,
								13, 13
							]
						}
					];
				} else {
					return [
						{
							'shape': [
								73.5, 0,
								85, 3,
								95, 13,
								98, 24.5,
								85, 24.5,
								73.5, 13,
							]
						},
						{
							'shape': [
								0, 13,
								0, 0,
								73.5, 0,
								73.5, 13,
							]
						},
						{
							'shape': [
								73.5, 36,
								85, 24.5,
								98, 24.5,
								95, 36,
								85, 46,
								73.5, 49,
							]
						},
						{
							'shape': [
								0, 49,
								0, 36,
								73.5, 36,
								73.5, 49,
							]
						},
						{
							'shape': [
								85, 13,
								95, 13,
								98, 24.5,
								95, 36,
								85, 36,
							]
						}
					];
				}
			case PLAYER_SHAPE_CROWN:
				return [
					{
						'shape': [
							0, 49,
							0, 0,
							24.5, 24.5,
							24.5, 49
						]
					},
					{
						'shape': [
							24.5, 49,
							24.5, 24.5,
							49, 0,
							73.5, 24.5,
							73.5, 49
						]
					},
					{
						'shape': [
							73.5, 24.5,
							98, 0,
							98, 49,
							73.5, 49
						]
					},
					{
						'shape': [
							0, 24.5,
							98, 24.5,
							98, 49,
							0, 49
						]
					}
				];
			case PLAYER_SHAPE_RHOMBUS:
				return [
					{
						'shape': [
							0, 24.5,
							49, 0,
							98, 24.5,
							49, 49
						]
					}
				];
			case PLAYER_SHAPE_HEXAGON:
				return [
					{
						'shape': [
							24.5, 49,
							0, 24.5,
							24.5, 0,
							73.5, 0,
							98, 24.5,
							73.5, 49
						]
					}
				];
			case PLAYER_SHAPE_DOT:
				return [
					{
						'shape': [
							73.5, 16,
							73.5, 32,
							56.5, 49,
							40.5, 49,
							24.5, 32,
							24.5, 16,
							40.5, 0,
							56.5, 0
						]
					}
				];
			case PLAYER_SHAPE_ELLIPSE:
				return [
					{
						'shape': [
							0, 24.5,
							7.5, 11,
							15, 7,
							32, 1.5,
							49, 0,
							66, 1.5,
							83, 7,
							90.5, 11,
							98, 24.5,
							90.5, 38,
							83, 42,
							66, 47.5,
							49, 49,
							32, 47.5,
							15, 42,
							7.5, 38
						]
					}
				];
			case PLAYER_SHAPE_TRIPLE_COLON:
				return [
					{
						'shape': [
							0, 13,
							0, 0,
							13, 0,
							13, 13
						]
					},
					{
						'shape': [
							0, 49,
							0, 36,
							13, 36,
							13, 49
						]
					},
					{
						'shape': [
							42, 13,
							42, 0,
							56, 0,
							56, 13
						]
					},
					{
						'shape': [
							42, 49,
							42, 36,
							56, 36,
							56, 49
						]
					},
					{
						'shape': [
							85, 13,
							85, 0,
							98, 0,
							98, 13
						]
					},
					{
						'shape': [
							85, 49,
							85, 36,
							98, 36,
							98, 49
						]
					}
				];
			case PLAYER_SHAPE_H:
				return [
					{
						'shape': [
							0, 33,
							0, 16,
							98, 16,
							98, 33,
						]
					},
					{
						'shape': [
							0, 0,
							17, 0,
							17, 49,
							0, 49,
						]
					},
					{
						'shape': [
							81, 0,
							98, 0,
							98, 49,
							81, 49
						]
					}
				];
			case PLAYER_SHAPE_S:
				if (isHost) {
					return [
						{
							'shape': [
								0, 49,
								0, 24.5,
								17, 24.5,
								17, 49,
							]
						},
						{
							'shape': [
								0, 49,
								0, 32,
								57, 32,
								57, 49,
							]
						},
						{
							'shape': [
								40, 48,
								40, 0,
								57, 0,
								57, 48,
							]
						},
						{
							'shape': [
								40, 17,
								40, 0,
								98, 0,
								98, 17,
							]
						},
						{
							'shape': [
								81, 24.5,
								81, 0,
								98, 0,
								98, 24.5,
							]
						},
					];
				} else {
					return [
						{
							'shape': [
								0, 24.5,
								0, 0,
								17, 0,
								17, 24.5,
							]
						},
						{
							'shape': [
								0, 17,
								0, 0,
								57, 0,
								57, 17,
							]
						},
						{
							'shape': [
								40, 48,
								40, 0,
								57, 0,
								57, 48,
							]
						},
						{
							'shape': [
								40, 49,
								40, 32,
								98, 32,
								98, 49,
							]
						},
						{
							'shape': [
								81, 49,
								81, 24.5,
								98, 24.5,
								98, 49,
							]
						},
					];
				}
		}

		throw 'No matching shape';
	}

	static playerEye(shape: string, isHost: boolean): EyeConfig {
		let xOffset;
		let yOffset;
		let eyeBallRadius;
		let eyePupilRadius;

		switch (shape) {
			case PLAYER_SHAPE_HALF_CIRCLE:
				xOffset = 26.5;
				yOffset = -2;
				eyeBallRadius = 7.5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_TRIANGLE:
				xOffset = 15;
				yOffset = 5;
				eyeBallRadius = 7.5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_X:
				xOffset = 28;
				yOffset = -14;
				eyeBallRadius = 6.25;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_RECTANGLE:
				xOffset = 34;
				yOffset = -11;
				eyeBallRadius = 7.5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_HYPHEN:
				xOffset = 14;
				yOffset = -0.5;
				eyeBallRadius = 4;
				eyePupilRadius = 2;
				break;
			case PLAYER_SHAPE_OBELISK:
				xOffset = 0;
				yOffset = -15;
				eyeBallRadius = 4;
				eyePupilRadius = 2;
				break;
			case PLAYER_SHAPE_EQUAL:
				xOffset = 28;
				yOffset = -18.5;
				eyeBallRadius = 5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_MAGNET:
				xOffset = 28;
				yOffset = -18.5;
				eyeBallRadius = 5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_CROWN:
				xOffset = 38;
				yOffset = 0;
				eyeBallRadius = 7.5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_RHOMBUS:
				xOffset = 19;
				yOffset = -3;
				eyeBallRadius = 7.5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_HEXAGON:
				xOffset = 26.5;
				yOffset = -7;
				eyeBallRadius = 7.5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_DOT:
				xOffset = 11;
				yOffset = -6;
				eyeBallRadius = 7.5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_ELLIPSE:
				xOffset = 26.5;
				yOffset = -9;
				eyeBallRadius = 7.5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_TRIPLE_COLON:
				xOffset = 42.5;
				yOffset = -18.5;
				eyeBallRadius = 5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_H:
				xOffset = 42.5;
				yOffset = -18.5;
				eyeBallRadius = 5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_S:
				xOffset = 42.5;
				yOffset = -18.5;
				eyeBallRadius = 5;
				eyePupilRadius = 2.5;
				break;
		}

		xOffset = (isHost ? 1 : -1) * xOffset;

		return {
			xOffset: xOffset,
			yOffset: yOffset,
			eyeBallRadius: eyeBallRadius,
			pupilRadius: eyePupilRadius,
		};
	}
}
