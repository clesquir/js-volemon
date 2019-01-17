import MainScene from "../scene/MainScene";
import GameObject = Phaser.GameObjects.GameObject;

export default class Animations {
	scene: MainScene;

	constructor(
		scene: MainScene
	) {
		this.scene = scene;
	}

	activate(gameObject: GameObject) {
		const duration = 250;
		const scale = 4;

		this.scene.tweens.add({
			targets: gameObject,
			duration: duration,
			scaleX: scale,
			scaleY: scale,
			alpha: {
				getStart: () => 0.5,
				getEnd: () => 0
			},
			onComplete: function () {
				if (gameObject) {
					gameObject.destroy();
				}
			}
		});
	}

	disappear(gameObject: GameObject) {
		const duration = 750;
		const scale = 0.25;
		const move = 20;
		let isLeft = true;

		this.scene.tweens.add({
			targets: gameObject,
			duration: duration,
			props: {
				alpha: 0,
				scaleX: scale,
				scaleY: scale,
				y: '-=' + (move * 4),
				x: {
					duration: duration / 8,
					yoyo: true,
					repeat: 4,
					getStart: (target, key, value) => value,
					getEnd: function (target, key, value) {
						isLeft = !isLeft;
						return value + (isLeft ? move : -move) / 2;
					}
				}
			},
			onComplete: () => {
				if (gameObject) {
					gameObject.destroy();
				}
			}
		});
	}
}
