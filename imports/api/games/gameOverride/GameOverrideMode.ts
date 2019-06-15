export default interface GameOverrideMode {
	gameModeCode(): string;

	gameModeName(): string;

	isOneVersusOne(): boolean;

	isTwoVersusTwo(): boolean;

	gameOverride(): any;
}
