import MainScene from "../scene/MainScene";
import GameData from "../../data/GameData";
import GameConfiguration from "../../configuration/GameConfiguration";
import {DEPTH_CLOUDS} from "../../constants";

export default class CloudsGenerator {
	scene: MainScene;
	gameData: GameData;
	gameConfiguration: GameConfiguration;

	clouds: Phaser.GameObjects.Image[] = [];
	smokeBombs: {[id: string]: Phaser.GameObjects.Image} = {};

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
			cloud.setVisible(true);
			this.scene.tweens.add({
				targets: cloud,
				duration: 250,
				alpha: {
					getStart: () => cloud.alpha,
					getEnd: () => cloud.getData('finalAlpha')
				}
			});
		}
	}

	hideClouds() {
		for (let cloud of this.clouds) {
			this.scene.tweens.add({
				targets: cloud,
				duration: 250,
				alpha: {
					getStart: () => cloud.alpha,
					getEnd: () => 0
				},
				onComplete: function() {
					if (cloud) {
						cloud.setVisible(false);
					}
				}
			});
		}
	}

	showSmokeBomb(smokeBombIdentifier: string, xPosition: number, yPosition: number, angle: number) {
		const smokeBomb = this.createCloud(xPosition, yPosition, angle, 0.925);

		this.scene.tweens.add({
			targets: smokeBomb,
			duration: 250,
			alpha: {
				getStart: () => smokeBomb.alpha,
				getEnd: () => smokeBomb.getData('finalAlpha')
			}
		});

		this.smokeBombs[smokeBombIdentifier] = smokeBomb;
	}

	hideSmokeBomb(smokeBombIdentifier: string) {
		if (this.smokeBombs[smokeBombIdentifier]) {
			const smokeBomb = this.smokeBombs[smokeBombIdentifier];

			this.scene.tweens.add({
				targets: smokeBomb,
				duration: 250,
				alpha: {
					getStart: () => smokeBomb.alpha,
					getEnd: () => 0
				},
				onComplete: function() {
					if (smokeBomb) {
						smokeBomb.destroy();
					}
				}
			});
		}
	}

	private createCloud(
		xPosition: number,
		yPosition: number,
		angle: number,
		finalAlpha: number,
		scale?: number
	): Phaser.GameObjects.Image {
		const cloud = this.scene.add.image(xPosition, yPosition, 'cloud');

		cloud.setDepth(DEPTH_CLOUDS);
		cloud.setAlpha(0);
		cloud.setOrigin(0.5);
		cloud.setAngle(angle);
		if (scale) {
			cloud.setScale(scale);
		}

		cloud.setDataEnabled();
		cloud.setData('finalAlpha', finalAlpha);

		return cloud;
	}
}
