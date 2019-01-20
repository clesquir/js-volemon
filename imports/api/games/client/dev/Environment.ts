import Dev from "./Dev";
import {Random} from 'meteor/random';
import Ball from "../components/Ball";
import BonusFactory from "../../BonusFactory";

export default class Environment extends Dev {
	groundHitEnabled: boolean = true;
	showBallHitCount: boolean = true;
	isMatchPoint: boolean = false;
	isDeucePoint: boolean = false;

	overrideGame() {
		super.overrideGame();

		this.gameConfiguration.overridesTeamMaximumBallHit = () => {
			return this.showBallHitCount;
		};
		this.gameConfiguration.teamMaximumBallHit = () => {
			return 3;
		};
		this.gameData.isMatchPoint = () => {
			return this.isMatchPoint;
		};
		this.gameData.isDeucePoint = () => {
			return this.isDeucePoint;
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
		this.mainScene.killPlayer('player1', (new Date()).getTime());
	}

	revivePlayer() {
		this.mainScene.players.reviveTeammatePlayer('player1');
	}

	createBonus(bonusName) {
		//@todo Bonus
		const bonus = BonusFactory.fromClassName(bonusName, this.mainScene);
		// this.gameBonus.createBonus(bonus.dataToStream());
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

	enableMatchPoint() {
		this.isMatchPoint = true;
	}

	disableMatchPoint() {
		this.isMatchPoint = false;
	}

	enableDeucePoint() {
		this.isDeucePoint = true;
	}

	disableDeucePoint() {
		this.isDeucePoint = false;
	}
}
