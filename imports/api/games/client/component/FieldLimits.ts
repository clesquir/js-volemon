import MainScene from "../scene/MainScene";
import GameConfiguration from "../../configuration/GameConfiguration";
import Level from "./Level";

export default class FieldLimits {
	scene: MainScene;
	gameConfiguration: GameConfiguration;
	level: Level;
	hasNet: boolean;

	private readonly thickness: number = 128;

	hostGround: Phaser.Physics.P2.Body;
	clientGround: Phaser.Physics.P2.Body;
	ballGround: Phaser.Physics.P2.Body;

	constructor(
		scene: MainScene,
		gameConfiguration: GameConfiguration,
		level: Level,
		hasNet: boolean
	) {
		this.scene = scene;
		this.gameConfiguration = gameConfiguration;
		this.level = level;
		this.hasNet = hasNet;

		this.hostLimits();
		this.clientLimits();
		this.ballLimits();
		this.bonusLimits();
	}

	private hostLimits() {
		//Net
		this.applyCollisionCategory(
			this.addBound(
				(
					this.hasNet ?
					this.gameConfiguration.width() - (this.gameConfiguration.netWidth() / 2) :
					this.gameConfiguration.width() * 1.5
				),
				this.gameConfiguration.height() / 2,
				this.gameConfiguration.width(),
				this.gameConfiguration.height() + this.thickness * 2
			),
			this.level.materialLimit,
			this.level.collisionCategoryHostLimit,
			[this.level.collisionCategoryHost]
		);

		//Wall
		this.applyCollisionCategory(
			this.addBound(
				-this.thickness / 2,
				this.gameConfiguration.height() / 2,
				this.thickness,
				this.gameConfiguration.height() + this.thickness * 2
			),
			this.level.materialLimit,
			this.level.collisionCategoryHostLimit,
			[this.level.collisionCategoryHost]
		);

		//Ground
		this.hostGround = this.addBound(
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() + this.thickness / 2,
			this.gameConfiguration.width() + this.thickness * 2,
			this.thickness
		);
		this.applyCollisionCategory(
			this.hostGround,
			this.level.materialLimit,
			this.level.collisionCategoryHostLimit,
			[this.level.collisionCategoryHost]
		);

		//Ceiling
		this.applyCollisionCategory(
			this.addBound(
				this.gameConfiguration.width() / 2,
				-this.thickness / 2,
				this.gameConfiguration.width() + this.thickness * 2,
				this.thickness
			),
			this.level.materialLimit,
			this.level.collisionCategoryHostLimit,
			[this.level.collisionCategoryHost]
		);
	}

	private clientLimits() {
		//Net
		this.applyCollisionCategory(
			this.addBound(
				(
					this.hasNet ?
					this.gameConfiguration.netWidth() / 2 :
					-this.gameConfiguration.width() / 2
				),
				this.gameConfiguration.height() / 2,
				this.gameConfiguration.width(),
				this.gameConfiguration.height() + this.thickness * 2
			),
			this.level.materialLimit,
			this.level.collisionCategoryClientLimit,
			[this.level.collisionCategoryClient]
		);

		//Wall
		this.applyCollisionCategory(
			this.addBound(
				this.gameConfiguration.width() + this.thickness / 2,
				this.gameConfiguration.height() / 2,
				this.thickness,
				this.gameConfiguration.height() + this.thickness * 2
			),
			this.level.materialLimit,
			this.level.collisionCategoryClientLimit,
			[this.level.collisionCategoryClient]
		);

		//Ground
		this.clientGround = this.addBound(
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() + this.thickness / 2,
			this.gameConfiguration.width() + this.thickness * 2,
			this.thickness
		);
		this.applyCollisionCategory(
			this.clientGround,
			this.level.materialLimit,
			this.level.collisionCategoryClientLimit,
			[this.level.collisionCategoryClient]
		);

		//Ceiling
		this.applyCollisionCategory(
			this.addBound(
				this.gameConfiguration.width() / 2,
				-this.thickness / 2,
				this.gameConfiguration.width() + this.thickness * 2,
				this.thickness
			),
			this.level.materialLimit,
			this.level.collisionCategoryClientLimit,
			[this.level.collisionCategoryClient]
		);
	}

	private ballLimits() {
		this.ballGround = this.addBound(
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() + this.thickness / 2,
			this.gameConfiguration.width() + this.thickness * 2,
			this.thickness
		);
		this.applyCollisionCategory(
			this.ballGround,
			this.level.materialLimit,
			this.level.collisionCategoryBallLimit,
			[this.level.collisionCategoryBall]
		);

		const ceiling = this.addBound(
			this.gameConfiguration.width() / 2,
			-this.thickness / 2,
			this.gameConfiguration.width() + this.thickness * 2,
			this.thickness
		);
		this.applyCollisionCategory(
			ceiling,
			this.level.materialLimit,
			this.level.collisionCategoryBallLimit,
			[this.level.collisionCategoryBall]
		);

		const leftWall = this.addBound(
			-this.thickness / 2,
			this.gameConfiguration.height() / 2,
			this.thickness,
			this.gameConfiguration.height() + this.thickness * 2
		);
		this.applyCollisionCategory(
			leftWall,
			this.level.materialLimit,
			this.level.collisionCategoryBallLimit,
			[this.level.collisionCategoryBall]
		);

		const rightWall = this.addBound(
			this.gameConfiguration.width() + this.thickness / 2,
			this.gameConfiguration.height() / 2,
			this.thickness,
			this.gameConfiguration.height() + this.thickness * 2
		);
		this.applyCollisionCategory(
			rightWall,
			this.level.materialLimit,
			this.level.collisionCategoryBallLimit,
			[this.level.collisionCategoryBall]
		);

		if (this.hasNet) {
			const net = this.addBound(
				this.gameConfiguration.width() / 2,
				this.gameConfiguration.height() - (this.gameConfiguration.groundHeight() + this.gameConfiguration.netHeight()) / 2,
				this.gameConfiguration.netWidth(),
				this.gameConfiguration.groundHeight() + this.gameConfiguration.netHeight()
			);
			this.applyCollisionCategory(
				net,
				this.level.materialNet,
				this.level.collisionCategoryBallLimit,
				[this.level.collisionCategoryBall]
			);
		}
	}

	private bonusLimits() {
		const ground = this.addBound(
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() + this.thickness / 2,
			this.gameConfiguration.width() + this.thickness * 2,
			this.thickness
		);
		this.applyCollisionCategory(
			ground,
			this.level.materialLimit,
			this.level.collisionCategoryBonusLimit,
			[this.level.collisionCategoryBonus]
		);

		const ceiling = this.addBound(
			this.gameConfiguration.width() / 2,
			-this.thickness / 2,
			this.gameConfiguration.width() + this.thickness * 2,
			this.thickness
		);
		this.applyCollisionCategory(
			ceiling,
			this.level.materialLimit,
			this.level.collisionCategoryBonusLimit,
			[this.level.collisionCategoryBonus]
		);

		const rightWall = this.addBound(
			-this.thickness / 2,
			this.gameConfiguration.height() / 2,
			this.thickness,
			this.gameConfiguration.height() + this.thickness * 2
		);
		this.applyCollisionCategory(
			rightWall,
			this.level.materialLimit,
			this.level.collisionCategoryBonusLimit,
			[this.level.collisionCategoryBonus]
		);

		const leftWall = this.addBound(
			this.gameConfiguration.width() + this.thickness / 2,
			this.gameConfiguration.height() / 2,
			this.thickness,
			this.gameConfiguration.height() + this.thickness * 2
		);
		this.applyCollisionCategory(
			leftWall,
			this.level.materialLimit,
			this.level.collisionCategoryBonusLimit,
			[this.level.collisionCategoryBonus]
		);

		if (this.hasNet) {
			const net = this.addBound(
				this.gameConfiguration.width() / 2,
				this.gameConfiguration.height() - (this.gameConfiguration.groundHeight() + this.gameConfiguration.netHeight()) / 2,
				this.gameConfiguration.netWidth(),
				this.gameConfiguration.groundHeight() + this.gameConfiguration.netHeight()
			);
			this.applyCollisionCategory(
				net,
				this.level.materialNet,
				this.level.collisionCategoryBonusLimit,
				[this.level.collisionCategoryBonus]
			);
		}
	}

	private addBound(x, y, w, h): Phaser.Physics.P2.Body {
		const bound = new Phaser.Physics.P2.Body(this.scene.game, <Phaser.Sprite>{}, x, y, 0);
		bound.setRectangleFromSprite({width: w, height: h, rotation: 0});
		this.scene.game.physics.p2.addBody(bound);
		bound.debug = this.scene.game.config.enableDebug;
		bound.static = true;

		return bound;
	}

	private applyCollisionCategory(
		limit: Phaser.Physics.P2.Body,
		material: Phaser.Physics.P2.Material,
		collisionGroup: Phaser.Physics.P2.CollisionGroup,
		colliders: Phaser.Physics.P2.CollisionGroup[]
	) {
		limit.setMaterial(material);
		limit.setCollisionGroup(collisionGroup);

		for (let i = 0; i < colliders.length; i++) {
			limit.collides(colliders[i]);
		}
	}
}
