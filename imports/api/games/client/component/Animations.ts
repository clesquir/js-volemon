import MainScene from "../scene/MainScene";

export default class Animations {
	scene: MainScene;

	constructor(
		scene: MainScene
	) {
		this.scene = scene;
	}

	activate(gameObject: PIXI.DisplayObjectContainer, onComplete: Function) {
		const duration = 250;
		const scale = 4;

		gameObject.alpha = 0.5;
		this.scene.game.add.tween(gameObject.scale).to({x: scale, y: scale}, duration).start();
		this.scene.game.add.tween(gameObject).to({alpha: 0}, duration).start();

		setTimeout(() => {
			onComplete();
		}, duration);
	}

	disappear(gameObject: PIXI.DisplayObjectContainer, onComplete: Function) {
		const duration = 750;
		const scale = 0.25;
		const move = 20;

		this.scene.game.add.tween(gameObject.scale).to({x: scale, y: scale}, duration).start();
		this.scene.game.add.tween(gameObject)
			.to({alpha: '-' + 0.25, x: '-' + move / 2, y: "-" + move}, duration / 4)
			.to({alpha: '-' + 0.25, x: '+' + move, y: "-" + move}, duration / 4)
			.to({alpha: '-' + 0.25, x: '-' + move, y: "-" + move}, duration / 4)
			.to({alpha: '-' + 0.25, x: '+' + move, y: "-" + move}, duration / 4)
			.start();

		setTimeout(() => {
			onComplete();
		}, duration);
	}
}
