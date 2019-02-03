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
		$(parent).on('resize', () => {
			this.resize();
		});

		this.resize();
	}

	destroy() {
		$(parent).off('resize');
	}

	private resize() {
		const canvas = this.scene.game.renderer.canvas;
		const parent = canvas.parentElement;

		const hScale = $(parent).width() / this.gameConfiguration.width();
		const vScale = $(parent).height() / this.gameConfiguration.height();

		//Use the smallest scale
		let scale = hScale;
		if (vScale < hScale) {
			scale = vScale;
		}

		$(canvas).css('width', (this.gameConfiguration.width() * scale) + 'px');
		$(canvas).css('height', (this.gameConfiguration.height() * scale) + 'px');
	}
}
