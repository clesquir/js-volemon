import Dev from "./Dev";
import {Random} from 'meteor/random';
import Ball from "../component/Ball";
import BonusFactory from "../../BonusFactory";
import RandomBonus from "../../bonus/RandomBonus";
import LevelConfiguration from "../../levelConfiguration/LevelConfiguration";

export default class Environment extends Dev {
	groundHitEnabled: boolean = false;
	showBallHitCount: boolean = false;
	isMatchPoint: boolean = false;
	isDeucePoint: boolean = false;

	constructor() {
		super();

		this.gameData.secondPlayerComputer = true;
	}

	beforeStart() {
		this.groundHitEnabled = Session.get('dev.environment.groundHitEnabled');
		this.showBallHitCount = Session.get('dev.environment.ballHitCountEnabled');
		this.isMatchPoint = Session.get('dev.environment.matchPointEnabled');
		this.isDeucePoint = Session.get('dev.environment.deucePointEnabled');
		this.gameConfiguration.levelConfiguration = LevelConfiguration.fromMode(Session.get('dev.environment.currentMode'));
	}

	overrideGame() {
		super.overrideGame();

		this.gameConfiguration.hasPlayerNetLimit = () => {
			return Session.get('dev.environment.hasNet');
		};
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

	createLevelComponents() {
		this.mainScene.level.createGround();
		this.mainScene.level.createFieldLimits(Session.get('dev.environment.hasNet'));
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
		this.mainScene.killPlayer('player1');
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

		const distanceFromCenter = this.gameConfiguration.netWidth() / 2 + 2;
		const data = {
			initialX: this.gameConfiguration.width() / 2 + <number><any>Random.choice([-distanceFromCenter, distanceFromCenter])
		};

		this.mainScene.createBonus(Object.assign(data, bonus.dataToStream()));
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
