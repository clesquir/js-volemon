import SkinManager from "./SkinManager";
import GameConfiguration from "../../configuration/GameConfiguration";
import {PLAYER_LIST_OF_SHAPES, PLAYER_LIST_OF_SHAPES_CLIENT} from "../../shapeConstants";
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
	collisionCategoryBonus: Phaser.Physics.P2.CollisionGroup;
	collisionCategoryBallBonusLimit: Phaser.Physics.P2.CollisionGroup;
	collisionCategorySoccerNet: Phaser.Physics.P2.CollisionGroup;
	collisionCategoryBumper: Phaser.Physics.P2.CollisionGroup;

	materialPlayer: Phaser.Physics.P2.Material;
	materialBall: Phaser.Physics.P2.Material;
	materialBonus: Phaser.Physics.P2.Material;
	materialLimit: Phaser.Physics.P2.Material;
	materialNet: Phaser.Physics.P2.Material;
	materialBumper: Phaser.Physics.P2.Material;

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
			this.scene.game.load.image('shape-' + shape + '-host', '/assets/component/shape/player-' + shape + '.png');

			if (PLAYER_LIST_OF_SHAPES_CLIENT.indexOf(shape) === -1) {
				this.scene.game.load.image('shape-' + shape + '-client', '/assets/component/shape/player-' + shape + '.png');
			} else {
				this.scene.game.load.image('shape-' + shape + '-client', '/assets/component/shape/player-' + shape + '-client.png');
			}
		}
		this.scene.game.load.atlas('bonus-icon', '/assets/bonus/texture-atlas.png', '/assets/bonus/texture-atlas.json');
		this.scene.game.load.image('cloud', '/assets/bonus/cloud.png');
		this.scene.game.load.image('shape-hidden-host', '/assets/component/shape/player-hidden.png');
		this.scene.game.load.image('shape-hidden-client', '/assets/component/shape/player-hidden.png');
	}

	createComponentsPrerequisites() {
		this.createCollisionGroups();
		this.createMaterials();
		this.createContactMaterials();
	}

	createGround() {
		this.groundComponents = this.skinManager.createGroundComponents(this.scene);
	}

	createNet() {
		this.skinManager.createNetComponent(this.scene);
	}

	createSoccerNet() {
		if (this.gameConfiguration.hasSoccerNet()) {
			this.skinManager.createSoccerNetComponent(this.scene);
		}
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

	soccerNetHostPointZone(): Phaser.Physics.P2.Body {
		return this.fieldLimits.soccerNetHostPointZone;
	}

	soccerNetClientPointZone(): Phaser.Physics.P2.Body {
		return this.fieldLimits.soccerNetClientPointZone;
	}

	isSoccerNetPost(body: Phaser.Physics.P2.Body): boolean {
		for (let soccerNetPost of this.fieldLimits.soccerNetPosts) {
			if (soccerNetPost === body) {
				return true;
			}
		}

		return false;
	}

	nuke() {
		this.scene.game.camera.flash(0xffffff, 1000);
		this.shakeGround();
	}

	shakeGround(time: number = 20, move: number = 5) {
		for (let groundComponent of this.groundComponents) {
			if (groundComponent.data.initialX === undefined) {
				groundComponent.data.initialX = groundComponent.x;
			}
			if (groundComponent.data.initialY === undefined) {
				groundComponent.data.initialY = groundComponent.y;
			}

			const initialX = groundComponent.data.initialX;
			const initialY = groundComponent.data.initialY;

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

	private createCollisionGroups() {
		this.collisionCategoryHost = this.scene.game.physics.p2.createCollisionGroup();
		this.collisionCategoryHostLimit = this.scene.game.physics.p2.createCollisionGroup();
		this.collisionCategoryClient = this.scene.game.physics.p2.createCollisionGroup();
		this.collisionCategoryClientLimit = this.scene.game.physics.p2.createCollisionGroup();
		this.collisionCategoryBall = this.scene.game.physics.p2.createCollisionGroup();
		this.collisionCategoryBonus = this.scene.game.physics.p2.createCollisionGroup();
		this.collisionCategoryBallBonusLimit = this.scene.game.physics.p2.createCollisionGroup();
		this.collisionCategorySoccerNet = this.scene.game.physics.p2.createCollisionGroup();
		this.collisionCategoryBumper = this.scene.game.physics.p2.createCollisionGroup();
	}

	private createMaterials() {
		this.materialPlayer = this.scene.game.physics.p2.createMaterial('player');
		this.materialBall = this.scene.game.physics.p2.createMaterial('ball');
		this.materialBonus = this.scene.game.physics.p2.createMaterial('bonus');
		this.materialLimit = this.scene.game.physics.p2.createMaterial('limit');
		this.materialNet = this.scene.game.physics.p2.createMaterial('net');
		this.materialBumper = this.scene.game.physics.p2.createMaterial('bumper');
	}

	private createContactMaterials() {
		this.scene.game.physics.p2.createContactMaterial(
			this.materialBall,
			this.materialLimit,
			<p2.ContactMaterialOptions>{restitution: this.gameConfiguration.worldRestitution()}
		);
		this.scene.game.physics.p2.createContactMaterial(
			this.materialBall,
			this.materialNet,
			<p2.ContactMaterialOptions>{restitution: this.gameConfiguration.netBallRestitution()}
		);
		this.scene.game.physics.p2.createContactMaterial(
			this.materialBall,
			this.materialBumper,
			<p2.ContactMaterialOptions>{restitution: this.gameConfiguration.bumperRestitution()}
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
			this.materialPlayer,
			this.materialBumper,
			<p2.ContactMaterialOptions>{restitution: this.gameConfiguration.bumperRestitution()}
		);

		this.scene.game.physics.p2.createContactMaterial(
			this.materialBonus,
			this.materialLimit,
			<p2.ContactMaterialOptions>{restitution: this.gameConfiguration.worldRestitution()}
		);
		this.scene.game.physics.p2.createContactMaterial(
			this.materialBonus,
			this.materialNet,
			<p2.ContactMaterialOptions>{restitution: this.gameConfiguration.netBonusRestitution()}
		);
		this.scene.game.physics.p2.createContactMaterial(
			this.materialBonus,
			this.materialBumper,
			<p2.ContactMaterialOptions>{restitution: this.gameConfiguration.bumperRestitution()}
		);
	}
}
