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
		if (!this.scene.game.renderer) {
			return;
		}

		const canvas = this.scene.game.renderer.canvas;
		const parent = canvas.parentElement;

		//Set height scale first
		const vScale = $(parent).height() / this.gameConfiguration.height();

		$(canvas).css('width', (this.gameConfiguration.width() * vScale) + 'px');
		$(canvas).css('height', (this.gameConfiguration.height() * vScale) + 'px');

		//Then set width scale
		const hScale = $(parent).width() / this.gameConfiguration.width();

		$(canvas).css('width', (this.gameConfiguration.width() * hScale) + 'px');
		$(canvas).css('height', (this.gameConfiguration.height() * hScale) + 'px');
	}
}
