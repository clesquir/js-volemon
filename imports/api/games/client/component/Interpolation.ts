import MainScene from "../scene/MainScene";
import ServerNormalizedTime from "../ServerNormalizedTime";

export default class Interpolation {
	private readonly scene: MainScene;
	private readonly serverNormalizedTime: ServerNormalizedTime;

	private readonly minimumForInterpolation = 10;
	private readonly minimumForSlidingInterpolation = 25;

	constructor(
		scene: MainScene,
		serverNormalizedTime: ServerNormalizedTime
	) {
		this.scene = scene;
		this.serverNormalizedTime = serverNormalizedTime;
	}

	interpolateMoveTo(
		gameObject: Phaser.Sprite,
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
			this.interpolateFromTimestamp(gameObject, serverNormalizedTimestamp, interpolatedData);

			this.moveToInterpolatedPosition(gameObject, interpolatedData, canMoveCallback);
		} else {
			let maxTime = 0;

			if (difference > this.minimumForSlidingInterpolation) {
				//+25 for fast sliding to interpolated location
				maxTime = 25;
			}

			const interpolatedData = Object.assign({}, data);
			this.interpolateFromTimestamp(gameObject, serverNormalizedTimestamp + maxTime, interpolatedData);

			const t = maxTime / 1000;
			const distanceX = (interpolatedData.x - gameObject.x);
			gameObject.body.velocity.x = distanceX / t * this.distanceMultiplier();

			const distanceY = (interpolatedData.y - gameObject.y);
			const distanceGravityY = this.gravityDistanceAtTime(gameObject, t);
			gameObject.body.velocity.y = (distanceY - distanceGravityY) / t * this.distanceMultiplier();

			this.scene.game.time.events.add(
				maxTime,
				() => {
					this.moveToInterpolatedPosition(
						gameObject,
						interpolatedData,
						canMoveCallback
					);
				},
				this
			);
		}
	}

	private moveToInterpolatedPosition(
		gameObject: Phaser.Sprite,
		interpolatedData: any,
		canMoveCallback: Function
	) {
		if (gameObject && canMoveCallback()) {
			this.move(gameObject, interpolatedData);
		}
	}

	private move(gameObject: Phaser.Sprite, data: any) {
		if (!gameObject.body) {
			return;
		}

		gameObject.body.x = data.x;
		gameObject.body.y = data.y;
		gameObject.body.velocity.x = data.velocityX;
		gameObject.body.velocity.y = data.velocityY;
	}

	private gravityDistanceAtTime(gameObject: Phaser.Sprite, t: number) {
		const gravity = this.scene.game.physics.p2.gravity.y * gameObject.body.data.gravityScale;

		return 0.5 * gravity * t * t;
	}

	private interpolateFromTimestamp(
		gameObject: Phaser.Sprite,
		currentTimestamp: number,
		data: any
	): any {
		const t = (currentTimestamp - data.timestamp) / 1000;
		const distanceX = data.velocityX / this.distanceMultiplier() * t;
		let distanceY = 0;

		if (data.velocityY != 0) {
			distanceY = (data.velocityY / this.distanceMultiplier() * t) + this.gravityDistanceAtTime(gameObject, t);
		}

		data.x = data.x + distanceX;
		data.y = data.y + distanceY;

		return data;
	}

	private distanceMultiplier() {
		return 1.502636245994042;
	}
}
