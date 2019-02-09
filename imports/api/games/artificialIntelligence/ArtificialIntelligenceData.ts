export declare type ArtificialIntelligenceData = {
	key: string;
	isHost: boolean;
	isMoveReversed: boolean;
	horizontalMoveModifier: () => number;
	verticalMoveModifier: () => number;
	canJump: boolean;
	velocityXOnMove: number;
	velocityYOnJump: number;
};
