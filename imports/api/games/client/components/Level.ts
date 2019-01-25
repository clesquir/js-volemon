import SkinManager from "../skin/SkinManager";
import GameConfiguration from "../../configuration/GameConfiguration";
import {PLAYER_LIST_OF_SHAPES} from "../../shapeConstants";
import FieldLimits from "./FieldLimits";
import MainScene from "../scene/MainScene";

export default class Level {
	scene: MainScene;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;

	collisionCategoryHost: number;
	collisionCategoryHostLimit: number;
	collisionCategoryClient: number;
	collisionCategoryClientLimit: number;
	collisionCategoryBall: number;
	collisionCategoryBallLimit: number;
	collisionCategoryBonus: number;
	collisionCategoryBonusLimit: number;
	collisionCategoryNet: number;
	groundComponents: Phaser.GameObjects.TileSprite[] = [];
	fieldLimits: FieldLimits;

	constructor(
		scene: MainScene,
		gameConfiguration: GameConfiguration,
		skinManager: SkinManager
	) {
		this.scene = scene;
		this.gameConfiguration = gameConfiguration;
		this.skinManager = skinManager;
	}

	preload() {
		for (let shape of PLAYER_LIST_OF_SHAPES) {
			this.scene.load.image('shape-' + shape, '/assets/component/shape/player-' + shape + '.png');
		}
		this.scene.load.atlas('bonus-icon', '/assets/bonus/texture-atlas.png', '/assets/bonus/texture-atlas.json');
		this.scene.load.image('cloud', '/assets/bonus/cloud.png');
		this.scene.load.image('shape-hidden', '/assets/component/shape/player-hidden.png');
	}

	createCollisionCategories() {
		this.collisionCategoryHost = this.scene.matter.world.nextCategory();
		this.collisionCategoryHostLimit = this.scene.matter.world.nextCategory();
		this.collisionCategoryClient = this.scene.matter.world.nextCategory();
		this.collisionCategoryClientLimit = this.scene.matter.world.nextCategory();
		this.collisionCategoryBall = this.scene.matter.world.nextCategory();
		this.collisionCategoryBallLimit = this.scene.matter.world.nextCategory();
		this.collisionCategoryBonus = this.scene.matter.world.nextCategory();
		this.collisionCategoryBonusLimit = this.scene.matter.world.nextCategory();
		this.collisionCategoryNet = this.scene.matter.world.nextCategory();
	}

	createGround() {
		this.groundComponents = this.skinManager.createGroundComponents(this.scene);
	}

	shakeGround() {
		const move = 5;
		const time = 20;

		for (let groundComponent of this.groundComponents) {
			const initialX = groundComponent.x;
			const initialY = groundComponent.y;

			this.scene.tweens.createTimeline()
				.add({targets: groundComponent, x: "-=" + move, y: "-=" + move, duration: time})
				.add({targets: groundComponent, x: "+=" + move * 2, y: "+=" + move * 2, duration: time * 2})
				.add({targets: groundComponent, x: "-=" + move * 2, y: "-=" + move * 2, duration: time * 2})
				.add({targets: groundComponent, x: "+=" + move * 2, y: "+=" + move * 2, duration: time * 2})
				.add({targets: groundComponent, x: "-=" + move * 1.5, y: "-=" + move * 1.5, duration: time * 2})
				.add({targets: groundComponent, x: "+=" + move, y: "+=" + move, duration: time * 2})
				.add({targets: groundComponent, x: "-=" + move / 2, y: "-=" + move / 2, duration: time})
				.add({targets: groundComponent, x: initialX, y: initialY, duration: time})
				.play();
		}
	}

	createNet() {
		this.skinManager.createNetComponent(this.scene);
	}

	createFieldLimits(hasNet: boolean) {
		this.fieldLimits = new FieldLimits(
			this.scene,
			this.gameConfiguration,
			this,
			hasNet
		);
	}

	hostGround(): MatterJS.Body {
		return this.fieldLimits.hostGround;
	}

	clientGround(): MatterJS.Body {
		return this.fieldLimits.clientGround;
	}

	ballGround(): MatterJS.Body {
		return this.fieldLimits.ballGround;
	}
}
