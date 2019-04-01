import MainScene from "../scene/MainScene";
import GameConfiguration from "../../configuration/GameConfiguration";
import ServerNormalizedTime from "../ServerNormalizedTime";
import BaseBonus from "../../bonus/BaseBonus";
import {Random} from 'meteor/random';
import {DEPTH_BONUS_INDICATOR, DEPTH_ACTIVATION_ANIMATION} from "../../constants";
import Animations from "./Animations";

export default class BonusIndicator {
	private readonly initialColor: string = '#000000';
	private readonly initialAlpha: number = 0.25;
	private readonly finalColor: string = '#c94141';
	private readonly finalAlpha: number = 0.5;
	private readonly progressFinalThreshold = 0.1;
	private readonly progressThreshold: number = 0.008;

	scene: MainScene;
	gameConfiguration: GameConfiguration;
	serverNormalizedTime: ServerNormalizedTime;
	bonusReference: BaseBonus;
	initialX: number;
	initialY: number;
	identifier: string;

	bonusObject: Phaser.GameObjects.Image;
	progressObject: Phaser.GameObjects.Graphics;
	currentProgress: number = 1;
	currentColor: string = this.initialColor;
	currentAlpha: number = this.initialAlpha;

	constructor(
		scene: MainScene,
		gameConfiguration: GameConfiguration,
		serverNormalizedTime: ServerNormalizedTime,
		bonusReference: BaseBonus,
		initialX: number,
		initialY: number,
		identifier: string
	) {
		this.scene = scene;
		this.gameConfiguration = gameConfiguration;
		this.serverNormalizedTime = serverNormalizedTime;
		this.bonusReference = bonusReference;
		this.initialX = initialX;
		this.initialY = initialY;
		this.identifier = identifier;
	}

	static activateAnimation(
		scene: MainScene,
		gameConfiguration: GameConfiguration,
		serverNormalizedTime: ServerNormalizedTime,
		bonusReference: BaseBonus,
		initialX: number,
		initialY: number,
		animations: Animations
	) {
		const bonusIndicator = new BonusIndicator(
			scene,
			gameConfiguration,
			serverNormalizedTime,
			bonusReference,
			initialX,
			initialY,
			Random.id()
		);
		bonusIndicator.showActivateAnimation(animations);
	}

	init() {
		this.bonusObject = this.scene.add.image(
			this.initialX,
			this.initialY,
			'bonus-icon',
			this.bonusReference.getIndicatorAtlasFrame()
		);
		this.bonusObject.setDepth(DEPTH_BONUS_INDICATOR);

		const radius = this.radius();
		this.progressObject = this.scene.add.graphics(
			{
				x: this.initialX - radius,
				y: this.initialY + radius
			}
		);
		this.progressObject.setDepth(DEPTH_BONUS_INDICATOR);
		this.progressObject.setAngle(-90);
		this.progressObject.setAlpha(this.currentAlpha);
	}

	updatePosition(x: number, y: number) {
		this.bonusObject.setPosition(x, y);
		this.progressObject.setPosition(x - this.radius(), y + this.radius());
	}

	updateProgress() {
		const minProgress = 0.00001;
		const maxProgress = 0.99999;
		const radius = this.radius();
		const progress = Phaser.Math.Clamp(this.progress(), minProgress, maxProgress);

		let color = this.initialColor;
		let alpha = this.initialAlpha;
		if (progress <= this.progressFinalThreshold) {
			color = this.finalColor;
			alpha = this.finalAlpha;
		}

		if (
			this.currentProgress - progress > this.progressThreshold ||
			this.currentColor !== color
		) {
			this.progressObject.clear();
			this.progressObject.fillStyle(Phaser.Display.Color.ValueToColor(color).color);

			this.progressObject.slice(
				radius,
				radius,
				radius,
				0,
				(Math.PI * 2) * progress,
				true
			);
			this.progressObject.fillPath();

			this.currentProgress = progress;
			this.currentColor = color;
		}

		if (this.currentAlpha != alpha) {
			this.progressObject.setAlpha(alpha);

			this.currentAlpha = alpha;
		}
	}

	destroy() {
		this.bonusObject.destroy();
		this.progressObject.destroy();
	}

	private showActivateAnimation(animations: Animations) {
		this.bonusObject = this.scene.add.image(
			this.initialX,
			this.initialY,
			'bonus-icon',
			this.bonusReference.getAtlasFrame()
		);
		this.bonusObject.setDepth(DEPTH_ACTIVATION_ANIMATION);

		animations.activate(
			this.bonusObject,
			() => {
				this.bonusObject.destroy();
			}
		);
	}

	private radius(): number {
		return this.gameConfiguration.bonusIndicatorRadius();
	}

	private progress(): number {
		return 1 - (
			(this.serverNormalizedTime.getServerTimestamp() - this.bonusReference.activatedAt) /
			this.bonusReference.getDuration()
		);
	}
}
