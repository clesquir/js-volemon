import MainScene from "../scene/MainScene";
import GameConfiguration from "../../configuration/GameConfiguration";
import ServerNormalizedTime from "../ServerNormalizedTime";
import BaseBonus from "../../bonus/BaseBonus";
import {Random} from 'meteor/random';
import {DEPTH_ACTIVATION_ANIMATION} from "../../constants";
import Animations from "./Animations";

export default class BonusIndicator {
	scene: MainScene;
	gameConfiguration: GameConfiguration;
	serverNormalizedTime: ServerNormalizedTime;
	bonusReference: BaseBonus;
	initialX: number;
	initialY: number;
	identifier: string;

	bonusObject: Phaser.GameObjects.Image;

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

		this.init();
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

	destroy() {
		this.bonusObject.destroy();
	}

	private init() {
		this.bonusObject = this.scene.add.image(
			this.initialX,
			this.initialY,
			'bonus-icon',
			this.bonusReference.atlasFrame
		);
	}

	private showActivateAnimation(animations: Animations) {
		this.bonusObject.setDepth(DEPTH_ACTIVATION_ANIMATION);
		animations.activate(this.bonusObject);
	}

	private progress(duration) {
		return 1 - ((this.serverNormalizedTime.getServerTimestamp() - this.bonusReference.activatedAt) / duration);
	}
}
