import Dev from "./Dev";
import {Random} from 'meteor/random';
import Ball from "../components/Ball";
import BonusFactory from "../../BonusFactory";
import RandomBonus from "../../bonus/RandomBonus";

export default class Environment extends Dev {
	groundHitEnabled: boolean = false;
	showBallHitCount: boolean = false;
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
		this.gameData.hasBonuses = true;
	}

	createPlayersComponents() {
		this.mainScene.players.player1 = this.mainScene.players.createPlayer('player1', '#a73030', true);
		this.mainScene.players.player2 = this.mainScene.players.createPlayer('player2', '#274b7a', false);
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
			this.mainScene.level.shakeGround();
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
		const bonus = BonusFactory.fromClassName(bonusName);

		if (bonus instanceof RandomBonus) {
			let availableBonusesForRandom = BonusFactory.availableBonusesForRandom();
			bonus.setRandomBonus(BonusFactory.fromClassName(Random.choice(availableBonusesForRandom)));
		}

		this.mainScene.createBonus(
			Object.assign(
				{initialX: this.gameConfiguration.width() / 2},
				bonus.dataToStream()
			)
		);
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
