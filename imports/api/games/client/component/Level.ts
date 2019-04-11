import SkinManager from "./SkinManager";
import GameConfiguration from "../../configuration/GameConfiguration";
import {PLAYER_LIST_OF_SHAPES} from "../../shapeConstants";
import FieldLimits from "./FieldLimits";
import MainScene from "../scene/MainScene";

export default class Level {
	scene: MainScene;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;

	collisionCategoryHost: Phaser.Physics.P2.CollisionGroup;
	collisionCategoryHostLimit: Phaser.Physics.P2.CollisionGroup;
	collisionCategoryClient: Phaser.Physics.P2.CollisionGroup;
	collisionCategoryClientLimit: Phaser.Physics.P2.CollisionGroup;
	collisionCategoryBall: Phaser.Physics.P2.CollisionGroup;
	collisionCategoryBallLimit: Phaser.Physics.P2.CollisionGroup;
	collisionCategoryBonus: Phaser.Physics.P2.CollisionGroup;
	collisionCategoryBonusLimit: Phaser.Physics.P2.CollisionGroup;
	collisionCategoryNet: Phaser.Physics.P2.CollisionGroup;

	materialPlayer: Phaser.Physics.P2.Material;
	materialBall: Phaser.Physics.P2.Material;
	materialBonus: Phaser.Physics.P2.Material;
	materialLimit: Phaser.Physics.P2.Material;
	materialNet: Phaser.Physics.P2.Material;

	groundComponents: Phaser.TileSprite[] = [];
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
			this.scene.game.load.image('shape-' + shape, '/assets/component/shape/player-' + shape + '.png');
		}
		this.scene.game.load.atlas('bonus-icon', '/assets/bonus/texture-atlas.png', '/assets/bonus/texture-atlas.json');
		this.scene.game.load.image('cloud', '/assets/bonus/cloud.png');
		this.scene.game.load.image('shape-hidden', '/assets/component/shape/player-hidden.png');
		this.scene.game.load.physics('physicsData', '/assets/component/shape/physicsData.json');
	}

	createCollisionGroups() {
		this.collisionCategoryHost = this.scene.game.physics.p2.createCollisionGroup();
		this.collisionCategoryHostLimit = this.scene.game.physics.p2.createCollisionGroup();
		this.collisionCategoryClient = this.scene.game.physics.p2.createCollisionGroup();
		this.collisionCategoryClientLimit = this.scene.game.physics.p2.createCollisionGroup();
		this.collisionCategoryBall = this.scene.game.physics.p2.createCollisionGroup();
		this.collisionCategoryBallLimit = this.scene.game.physics.p2.createCollisionGroup();
		this.collisionCategoryBonus = this.scene.game.physics.p2.createCollisionGroup();
		this.collisionCategoryBonusLimit = this.scene.game.physics.p2.createCollisionGroup();
		this.collisionCategoryNet = this.scene.game.physics.p2.createCollisionGroup();
	}

	createMaterials() {
		this.materialPlayer = this.scene.game.physics.p2.createMaterial('player');
		this.materialBall = this.scene.game.physics.p2.createMaterial('ball');
		this.materialBonus = this.scene.game.physics.p2.createMaterial('bonus');
		this.materialLimit = this.scene.game.physics.p2.createMaterial('limit');
		this.materialNet = this.scene.game.physics.p2.createMaterial('net');
	}

	createContactMaterials() {
		this.scene.game.physics.p2.createContactMaterial(
			this.materialBall,
			this.materialLimit,
			<p2.ContactMaterialOptions>{restitution: this.gameConfiguration.worldRestitution()}
		);

		this.scene.game.physics.p2.createContactMaterial(
			this.materialPlayer,
			this.materialPlayer,
			<p2.ContactMaterialOptions>{stiffness: 1e20, relaxation: 3, friction: 0}
		);
		this.scene.game.physics.p2.createContactMaterial(
			this.materialPlayer,
			this.materialLimit,
			<p2.ContactMaterialOptions>{stiffness: 1e20, relaxation: 3, friction: 0}
		);

		this.scene.game.physics.p2.createContactMaterial(
			this.materialBonus,
			this.materialLimit,
			<p2.ContactMaterialOptions>{restitution: this.gameConfiguration.worldRestitution()}
		);
		this.scene.game.physics.p2.createContactMaterial(
			this.materialBonus,
			this.materialNet,
			<p2.ContactMaterialOptions>{restitution: 0.7}
		);
	}

	createGround() {
		this.groundComponents = this.skinManager.createGroundComponents(this.scene);
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

	hostGround(): Phaser.Physics.P2.Body {
		return this.fieldLimits.hostGround;
	}

	clientGround(): Phaser.Physics.P2.Body {
		return this.fieldLimits.clientGround;
	}

	ballGround(): Phaser.Physics.P2.Body {
		return this.fieldLimits.ballGround;
	}

	shakeGround() {
		const move = 5;
		const time = 20;

		for (let groundComponent of this.groundComponents) {
			const initialX = groundComponent.x;
			const initialY = groundComponent.y;

			this.scene.game.add.tween(groundComponent)
				.to({y: "-" + move}, time).to({y: "+" + move * 2}, time * 2).to({y: "-" + move}, time)
				.to({y: "-" + move}, time).to({y: "+" + move * 2}, time * 2).to({y: "-" + move}, time)
				.to({y: "-" + move / 2}, time).to({y: "+" + move}, time * 2).to({y: "-" + move / 2}, time)
				.to({y: initialY}, time)
				.start();

			this.scene.game.add.tween(groundComponent)
				.to({x: "-" + move}, time).to({x: "+" + move * 2}, time * 2).to({x: "-" + move}, time)
				.to({x: "-" + move}, time).to({x: "+" + move * 2}, time * 2).to({x: "-" + move}, time)
				.to({x: "-" + move / 2}, time).to({x: "+" + move}, time * 2).to({x: "-" + move / 2}, time)
				.to({x: initialX}, time)
				.start();
		}
	}
}
