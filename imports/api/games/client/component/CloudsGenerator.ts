import MainScene from "../scene/MainScene";
import GameData from "../../data/GameData";
import GameConfiguration from "../../configuration/GameConfiguration";
import {DEPTH_CLOUDS} from "../../constants";

export default class CloudsGenerator {
	scene: MainScene;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	private readonly fadeInOutDuration = 250;

	private clouds: Phaser.Image[] = [];
	private smokeBombs: {[id: string]: Phaser.Image} = {};

	constructor(
		scene: MainScene,
		gameData: GameData,
		gameConfiguration: GameConfiguration
	) {
		this.scene = scene;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
	}

	showClouds() {
		if (this.clouds.length === 0) {
			this.clouds = [
				this.createCloud(
					this.gameConfiguration.width() / 4,
					.35 * this.gameConfiguration.height(),
					56,
					0.925,
					0.00119 * this.gameConfiguration.width()
				),
				this.createCloud(
					this.gameConfiguration.width() / 4 * 3,
					.35 * this.gameConfiguration.height(),
					-63,
					0.925,
					0.00119 * this.gameConfiguration.width()
				),
				this.createCloud(
					this.gameConfiguration.width() / 4 * 2,
					.35 * this.gameConfiguration.height(),
					37,
					0.925,
					0.00131 * this.gameConfiguration.width()
				)
			];
		}

		for (let cloud of this.clouds) {
			cloud.visible = true;
			this.scene.game.add.tween(cloud).to({alpha: cloud.data.finalAlpha}, this.fadeInOutDuration).start();
		}
	}

	hideClouds() {
		for (let cloud of this.clouds) {
			cloud.alpha = 1;

			this.scene.game.add.tween(cloud)
				.to({alpha: 0}, this.fadeInOutDuration)
				.start();

			setTimeout(() => {
				if (cloud) {
					cloud.visible = false;
				}
			}, this.fadeInOutDuration);
		}
	}

	showSmokeBomb(smokeBombIdentifier: string, xPosition: number, yPosition: number, angle: number) {
		const smokeBomb = this.createCloud(xPosition, yPosition, angle, 0.925);

		this.scene.game.add.tween(smokeBomb).to({alpha: smokeBomb.data.finalAlpha}, this.fadeInOutDuration).start();

		this.smokeBombs[smokeBombIdentifier] = smokeBomb;
	}

	hideSmokeBomb(smokeBombIdentifier: string) {
		if (this.smokeBombs[smokeBombIdentifier]) {
			const smokeBomb = this.smokeBombs[smokeBombIdentifier];

			this.scene.game.add.tween(smokeBomb)
				.to({alpha: 0}, this.fadeInOutDuration)
				.start();

			setTimeout(() => {
				if (smokeBomb) {
					smokeBomb.destroy();
				}
			}, this.fadeInOutDuration);
		}
	}

	private createCloud(
		xPosition: number,
		yPosition: number,
		angle: number,
		finalAlpha: number,
		scale?: number
	): Phaser.Image {
		const cloud = this.scene.game.add.image(xPosition, yPosition, 'cloud');

		// @ts-ignore
		cloud.depth = DEPTH_CLOUDS;

		cloud.alpha = 0;
		cloud.anchor.setTo(0.5);
		cloud.angle = angle;
		if (scale) {
			cloud.scale.setTo(scale);
		}

		cloud.data.finalAlpha = finalAlpha;

		return cloud;
	}
}
