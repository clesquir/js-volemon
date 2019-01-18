import Dev from "./Dev";
import {Random} from 'meteor/random';
import Ball from "../components/Ball";

export default class Environment extends Dev {
	groundHitEnabled: boolean = true;
	showBallHitCount: boolean = true;

	overrideGame() {
		super.overrideGame();

		this.gameConfiguration.overridesTeamMaximumBallHit = () => {
			return this.showBallHitCount;
		};
		this.gameConfiguration.teamMaximumBallHit = () => {
			return 3;
		};
	}

	createLevelComponents() {
		this.mainScene.level.createGround();
		this.mainScene.level.createFieldLimits(false);
	}

	onBallHitGround(ball: Ball) {
		if (this.groundHitEnabled && this.mainScene.gameResumed === true) {
			this.mainScene.showBallHitPoint(
				ball.x(),
				ball.y(),
				ball.diameter()
			);

			this.mainScene.gameResumed = false;

			this.gameData.lastPointAt = this.serverNormalizedTime.getServerTimestamp();
			this.resumeOnTimerEnd();
		}
	}

	killPlayer() {
		//@todo Bonus
		// this.gameBonus.killPlayer('player1');
	}

	revivePlayer() {
		//@todo Bonus
		// this.gameBonus.revivePlayer('player1');
	}

	createRandomBonus() {
		//@todo Bonus
		// this.gameBonus.createRandomBonus();
	}

	enableGroundHit() {
		this.groundHitEnabled = true;
	}

	disableGroundHit() {
		this.groundHitEnabled = false;
	}

	enableBallHitCount() {
		this.showBallHitCount = true;
	}

	disableBallHitCount() {
		this.showBallHitCount = false;
	}
}
