import MainScene from "../scene/MainScene";
import GameConfiguration from "../../configuration/GameConfiguration";
import ServerNormalizedTime from "../ServerNormalizedTime";
import BaseBonus from "../../bonus/BaseBonus";
import {Random} from 'meteor/random';
import Animations from "./Animations";
import {DEPTH_ACTIVATION_ANIMATION, DEPTH_BONUS_INDICATOR} from "../../constants";

export default class BonusIndicator {
	private readonly initialColor: number = 0x000000;
	private readonly initialAlpha: number = 0.25;
	private readonly finalColor: number = 0xc94141;
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

	bonusObject: Phaser.Image;
	progressObject: Phaser.Graphics;
	currentProgress: number = 1;
	currentColor: number = this.initialColor;
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
		this.bonusObject = this.scene.game.add.image(
			this.initialX,
			this.initialY,
			'bonus-icon',
			this.bonusReference.getIndicatorAtlasFrame()
		);
		this.bonusObject.anchor.setTo(0.5);

		// @ts-ignore
		this.bonusObject.depth = DEPTH_BONUS_INDICATOR;
		this.scene.zIndexGroup.add(this.bonusObject);

		const radius = this.radius();
		this.progressObject = this.scene.game.add.graphics(
			this.initialX - radius,
			this.initialY + radius
		);
		this.progressObject.angle = -90;
		this.progressObject.alpha = this.currentAlpha;

		// @ts-ignore
		this.progressObject.depth = DEPTH_BONUS_INDICATOR;
		this.scene.zIndexGroup.add(this.progressObject);
	}

	updatePosition(x: number, y: number) {
		this.bonusObject.x = x;
		this.bonusObject.y = y;
		this.progressObject.x = x - this.radius();
		this.progressObject.y = y + this.radius();
	}

	updateProgress() {
		const minProgress = 0.00001;
		const maxProgress = 0.99999;
		const radius = this.radius();
		const progress = Phaser.Math.clamp(this.progress(), minProgress, maxProgress);

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
			this.progressObject.beginFill(color);

			this.progressObject.arc(
				radius,
				radius,
				radius,
				0,
				(Math.PI * 2) * progress,
				true
			);
			this.progressObject.endFill();

			this.currentProgress = progress;
			this.currentColor = color;
		}

		if (this.currentAlpha != alpha) {
			this.progressObject.alpha = alpha;

			this.currentAlpha = alpha;
		}
	}

	destroy() {
		this.bonusObject.destroy();
		this.progressObject.destroy();
	}

	private showActivateAnimation(animations: Animations) {
		this.bonusObject = this.scene.game.add.image(
			this.initialX,
			this.initialY,
			'bonus-icon',
			this.bonusReference.getAtlasFrame()
		);
		this.bonusObject.anchor.setTo(0.5);

		// @ts-ignore
		this.bonusObject.depth = DEPTH_ACTIVATION_ANIMATION;
		this.scene.zIndexGroup.add(this.bonusObject);

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
