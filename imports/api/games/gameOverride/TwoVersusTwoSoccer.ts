import GameOverrideMode from "./GameOverrideMode";

export default class TwoVersusTwoSoccer implements GameOverrideMode {
	gameModeCode(): string {
		return '2vs2soccer';
	}

	gameModeName(): string {
		return 'Soccer';
	}

	isOneVersusOne(): boolean {
		return false;
	}

	isTwoVersusTwo(): boolean {
		return true;
	}

	gameOverride(): any {
		return {
			"overriddenNetHeight": "10",
			"overriddenGroundHitEnabled": "0",
			"overriddenSoccerNetEnabled": "1",
			"overriddenHasPlayerNetLimit": "0",
			"overriddenCollidesWithOpponent": "1"
		};
	}

	static create(): TwoVersusTwoSoccer {
		return new this();
	}
}
