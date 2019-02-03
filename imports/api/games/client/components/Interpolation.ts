import MainScene from "../scene/MainScene";
import ServerNormalizedTime from "../ServerNormalizedTime";
import GameConfiguration from "../../configuration/GameConfiguration";

export default class Interpolation {
	scene: MainScene;
	gameConfiguration: GameConfiguration;
	serverNormalizedTime: ServerNormalizedTime;

	constructor(
		scene: MainScene,
		gameConfiguration: GameConfiguration,
		serverNormalizedTime: ServerNormalizedTime
	) {
		this.scene = scene;
		this.gameConfiguration = gameConfiguration;
		this.serverNormalizedTime = serverNormalizedTime;
	}

	interpolateMoveTo(
		gameObject: Phaser.Physics.Matter.Image,
		data: any,
		canMoveCallback: Function,
		slideToLocation: boolean = false
	) {
		let serverNormalizedTimestamp = this.serverNormalizedTime.getServerTimestamp();

		let maxTime = 0;

		const minimumForInterpolation = 25;
		if (slideToLocation && serverNormalizedTimestamp - data.timestamp > minimumForInterpolation) {
			//+25 for fast sliding to interpolated location
			maxTime = 25;
		}

		const interpolatedData = Object.assign({}, data);
		this.interpolateFromTimestamp(serverNormalizedTimestamp + maxTime, interpolatedData);

		const moveToInterpolatedPosition = () => {
			if (gameObject && canMoveCallback.call(this)) {
				this.move(gameObject, interpolatedData);
			}
		};

		if (slideToLocation) {
			const t = maxTime / 1000;
			const distanceX = (interpolatedData.x - gameObject.x);
			const velocityX = distanceX / t;
			gameObject.setVelocityX(velocityX * this.distanceMultiplier());

			const distanceY = (interpolatedData.y - gameObject.y);
			const distanceGravityY = this.gravityDistanceAtTime(t);
			const velocityY = (distanceY - distanceGravityY) / t;
			gameObject.setVelocityY(velocityY * this.distanceMultiplier());

			this.scene.time.delayedCall(
				maxTime,
				moveToInterpolatedPosition
			);
		} else {
			moveToInterpolatedPosition();
		}
	}

	private move(gameObject: Phaser.Physics.Matter.Image, data: any) {
		if (!gameObject.body) {
			return;
		}

		gameObject.setPosition(data.x, data.y);
		gameObject.setVelocity(data.velocityX, data.velocityY);
	}

	private distanceMultiplier() {
		return 1.502636245994042;
	}

	private gravityDistanceAtTime(t) {
		const gravity = this.gameConfiguration.worldGravity();

		return 0.5 * gravity * t * t;
	}

	private interpolateFromTimestamp(
		currentTimestamp: number,
		data: any
	): any {
		const t = (currentTimestamp - data.timestamp) / 1000;
		const distanceX = data.velocityX / this.distanceMultiplier() * t;
		let distanceY = 0;

		if (data.velocityY != 0) {
			distanceY = (data.velocityY / this.distanceMultiplier() * t) + this.gravityDistanceAtTime(t);
		}

		data.x = data.x + distanceX;
		data.y = data.y + distanceY;

		return data;
	}
}
