import MainScene from "../scene/MainScene";
import GameData from "../../data/GameData";
import GameConfiguration from "../../configuration/GameConfiguration";
import StreamBundler from "../streamBundler/StreamBundler";
import ServerNormalizedTime from "../ServerNormalizedTime";
import Animations from "./Animations";
import Level from "./Level";
import Ball from "./Ball";
import {ArtificialIntelligencePositionData} from "../../artificialIntelligence/ArtificialIntelligencePositionData";
import {PositionData} from "./PositionData";
import {BALL_INTERVAL} from "../../emissionConstants";
import SkinManager from "./SkinManager";

export default class Balls {
	scene: MainScene;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;
	streamBundler: StreamBundler;
	serverNormalizedTime: ServerNormalizedTime;
	animations: Animations;
	level: Level;

	ballIncrement: number = 0;
	balls: {[id: string]: Ball} = {};

	lastBallPositionData: { [key: string]: PositionData } = {};
	lastBallUpdate: { [key: string]: number } = {};

	constructor(
		scene: MainScene,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		skinManager: SkinManager,
		streamBundler: StreamBundler,
		serverNormalizedTime: ServerNormalizedTime,
		animations: Animations,
		level: Level
	) {
		this.scene = scene;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.skinManager = skinManager;
		this.streamBundler = streamBundler;
		this.serverNormalizedTime = serverNormalizedTime;
		this.animations = animations;
		this.level = level;
	}

	create() {
		this.createBall(this.generateBallKey());
	}

	beforeUpdate() {
		for (let key in this.balls) {
			let ball = this.balls[key];
			if (ball.isFrozen) {
				ball.freeze();
			}
		}
	}

	update() {
		for (let key in this.balls) {
			let ball = this.balls[key];

			ball.constrainVelocity();

			if (this.gameData.isUserCreator()) {
				this.sendBallPosition(ball);
			}
		}
	}

	freeze() {
		for (let key in this.balls) {
			let ball = this.balls[key];
			ball.freeze();
		}
	}

	unfreeze() {
		for (let key in this.balls) {
			let ball = this.balls[key];

			ball.unfreeze();
		}
	}

	moveClientBall(data: PositionData) {
		let ball = this.getBallFromKey(data.key);

		if (!ball) {
			if (this.gameData.isUserViewer()) {
				ball = this.createBall(data.key);
				this.ballIncrement = data.ballIncrement;
			} else {
				return;
			}
		}

		ball.interpolate(data);
	}

	stopGame() {
		for (let key in this.balls) {
			let ball = this.balls[key];

			ball.stopGame();
		}
	}

	reset(lastPointTaken: string) {
		const firstBall = this.firstBall();

		//Remove all balls but the main one
		for (let key in this.balls) {
			let ball = this.balls[key];

			if (firstBall !== ball) {
				ball.destroy();
			}
		}

		//Reset the balls list
		this.balls = {};
		this.balls[firstBall.key] = firstBall;
		this.ballIncrement = 1;
		firstBall.reset(lastPointTaken);
	}

	scaleSmall() {
		for (let key in this.balls) {
			let ball = this.balls[key];

			ball.scaleSmall();
		}
	}

	scaleBig() {
		for (let key in this.balls) {
			let ball = this.balls[key];

			ball.scaleBig();
		}
	}

	resetScale() {
		for (let key in this.balls) {
			let ball = this.balls[key];

			ball.resetScale();
		}
	}

	hide() {
		for (let key in this.balls) {
			let ball = this.balls[key];

			ball.hide();
		}
	}

	unhide() {
		for (let key in this.balls) {
			let ball = this.balls[key];

			ball.unhide();
		}
	}

	clone() {
		const deflectionAngle = 10 * Math.PI / 180;
		const speedIncrease = 1.25;

		for (let key in this.balls) {
			const sourceBall = this.balls[key];
			const distance = sourceBall.velocityDistance();
			const angle = sourceBall.velocityAngle();

			const targetBall = this.createBall(this.generateBallKey());
			targetBall.cloneProperties(sourceBall.ballCloneData());

			const sourceAngle = angle - deflectionAngle;
			sourceBall.updateVelocity(
				Math.cos(sourceAngle) * distance * speedIncrease,
				Math.sin(sourceAngle) * distance * speedIncrease
			);

			const targetAngle = angle + deflectionAngle;
			targetBall.updateVelocity(
				Math.cos(targetAngle) * distance * speedIncrease,
				Math.sin(targetAngle) * distance * speedIncrease
			);
		}
	}

	firstBall(): Ball | null {
		for (let key in this.balls) {
			return this.balls[key];
		}

		return null;
	}

	artificialIntelligencePositionsData(): ArtificialIntelligencePositionData[] {
		const positionsData = [];

		for (let key in this.balls) {
			let ball = this.balls[key];

			positionsData.push(ball.artificialIntelligencePositionData());
		}

		return positionsData;
	}

	private generateBallKey(): string {
		return 'ball' + ++this.ballIncrement;
	}

	private createBall(key: string): Ball {
		const ball = new Ball(
			this.scene,
			this.gameData,
			this.gameConfiguration,
			this.serverNormalizedTime,
			this.skinManager,
			this.level,
			key
		);
		this.balls[key] = ball;

		this.scene.sortWorldComponents();

		return ball;
	}

	private sendBallPosition(ball: Ball) {
		let ballPositionData = Object.assign({ballIncrement: this.ballIncrement}, ball.positionData());
		let ballInterval = BALL_INTERVAL;

		const key = ball.key;

		if (JSON.stringify(this.lastBallPositionData[key]) === JSON.stringify(ballPositionData)) {
			ballInterval *= 2;
		}
		this.lastBallPositionData[key] = Object.assign({}, ballPositionData);

		this.lastBallUpdate[key] = this.streamBundler.addToBundledStreamsAtFrequence(
			this.lastBallUpdate[key] || 0,
			ballInterval,
			'moveClientBall-' + key,
			ballPositionData
		);
	}

	private getBallFromKey(key): Ball | null {
		for (let i in this.balls) {
			if (i === key) {
				return this.balls[i];
			}
		}

		return null;
	}
}
