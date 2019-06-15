import GameOverrideMode from "./GameOverrideMode";

export default class OneVersusOneSoccer implements GameOverrideMode {
	gameModeCode(): string {
		return '1vs1soccer';
	}

	gameModeName(): string {
		return 'Soccer';
	}

	isOneVersusOne(): boolean {
		return true;
	}

	isTwoVersusTwo(): boolean {
		return false;
	}

	gameOverride(): any {
		return {
			"overriddenNetHeight": "8",
			"overriddenGroundHitEnabled": "0",
			"overriddenSoccerNetEnabled": "1",
			"overriddenHasPlayerNetLimit": "0",
			"overriddenCollidesWithOpponent": "1"
		};
	}

	static create(): OneVersusOneSoccer {
		return new this();
	}
}
