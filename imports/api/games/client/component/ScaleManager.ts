import MainScene from "../scene/MainScene";
import GameConfiguration from "../../configuration/GameConfiguration";

export default class ScaleManager {
	private readonly scene: MainScene;
	private readonly gameConfiguration: GameConfiguration;

	constructor(scene: MainScene, gameConfiguration: GameConfiguration) {
		this.scene = scene;
		this.gameConfiguration = gameConfiguration;
	}

	init() {
		this.scene.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scene.game.scale.setResizeCallback(
			() => {
				const hScale = $(this.scene.game.scale.parentNode).width() / this.scene.game.width;
				const vScale = $(this.scene.game.scale.parentNode).height() / this.scene.game.height;

				if (
					!this.scene.game.scale.scaleFactorInversed ||
					(this.scene.game.scale.scaleFactorInversed.x !== hScale &&  this.scene.game.scale.scaleFactorInversed.y !== vScale)
				) {
					this.scene.game.scale.setUserScale(
						hScale,
						vScale
					);
				}
			},
			undefined
		);
	}

	destroy() {
	}
}
