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
		this.skinManager.createGroundComponents(this.scene);
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
