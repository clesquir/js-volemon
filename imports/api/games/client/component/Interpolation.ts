import MainScene from "../scene/MainScene";
import ServerNormalizedTime from "../ServerNormalizedTime";
import GameConfiguration from "../../configuration/GameConfiguration";

export default class Interpolation {
	private readonly scene: MainScene;
	private readonly gameConfiguration: GameConfiguration;
	private readonly serverNormalizedTime: ServerNormalizedTime;

	private readonly minimumForInterpolation = 15;
	private readonly minimumForSlidingInterpolation = 25;

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
		const serverNormalizedTimestamp = this.serverNormalizedTime.getServerTimestamp();
		const difference = serverNormalizedTimestamp - data.timestamp;

		if (difference < this.minimumForInterpolation) {
			this.moveToInterpolatedPosition(gameObject, data, canMoveCallback);
		} else if (!slideToLocation) {
			const interpolatedData = Object.assign({}, data);
			this.interpolateFromTimestamp(serverNormalizedTimestamp, interpolatedData);

			this.moveToInterpolatedPosition(gameObject, interpolatedData, canMoveCallback);
		} else {
			let maxTime = 0;

			if (difference > this.minimumForSlidingInterpolation) {
				//+25 for fast sliding to interpolated location
				maxTime = 25;
			}

			const interpolatedData = Object.assign({}, data);
			this.interpolateFromTimestamp(serverNormalizedTimestamp + maxTime, interpolatedData);

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
				this.moveToInterpolatedPosition,
				[
					gameObject,
					interpolatedData,
					canMoveCallback
				],
				this
			);
		}
	}

	private moveToInterpolatedPosition(
		gameObject: Phaser.Physics.Matter.Image,
		interpolatedData: any,
		canMoveCallback: Function
	) {
		if (gameObject && canMoveCallback()) {
			this.move(gameObject, interpolatedData);
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
