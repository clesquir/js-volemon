import MainScene from "../scene/MainScene";
import GameConfiguration from "../../configuration/GameConfiguration";
import SkinManager from "../skin/SkinManager";
import Level from "./Level";

export default class FieldLimits {
	scene: MainScene;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;
	level: Level;
	hasNet: boolean;

	private readonly thickness = 128;
	private readonly playerFieldOptions = {isStatic: true, friction: 0, frictionStatic: 0};
	private readonly ballFieldOptions = {isStatic: true, friction: 0, frictionStatic: 0};
	private readonly bonusFieldOptions = {isStatic: true, friction: 0, frictionStatic: 0};
	private readonly worldRestitution = 1;
	private readonly ballNetRestitution = 0.1;
	private readonly bonusNetRestitution = 0.7;

	hostGround: MatterJS.Body;
	clientGround: MatterJS.Body;
	ballGround: MatterJS.Body;

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

		this.worldRestitution = this.gameConfiguration.worldRestitution();

		this.hostLimits();
		this.clientLimits();
		this.ballLimits();
		this.bonusLimits();
	}

	private hostLimits() {
		//Net
		this.applyCollisionCategory(
			this.scene.matter.add.rectangle(
				(
					this.hasNet ?
					this.gameConfiguration.width() - (this.gameConfiguration.netWidth() / 2) :
					this.gameConfiguration.width() * 1.5
				),
				this.gameConfiguration.height() / 2,
				this.gameConfiguration.width(),
				this.gameConfiguration.height() + this.thickness * 2,
				this.playerFieldOptions
			),
			this.level.collisionCategoryHostLimit,
			[this.level.collisionCategoryHost]
		);

		//Wall
		this.applyCollisionCategory(
			this.scene.matter.add.rectangle(
				-this.thickness / 2,
				this.gameConfiguration.height() / 2,
				this.thickness,
				this.gameConfiguration.height() + this.thickness * 2,
				this.playerFieldOptions
			),
			this.level.collisionCategoryHostLimit,
			[this.level.collisionCategoryHost]
		);

		//Ground
		this.hostGround = this.scene.matter.add.rectangle(
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() + this.thickness / 2,
			this.gameConfiguration.width() + this.thickness * 2,
			this.thickness,
			this.playerFieldOptions
		);
		this.applyCollisionCategory(
			this.hostGround,
			this.level.collisionCategoryHostLimit,
			[this.level.collisionCategoryHost]
		);

		//Ceiling
		this.applyCollisionCategory(
			this.scene.matter.add.rectangle(
				this.gameConfiguration.width() / 2,
				-this.thickness / 2,
				this.gameConfiguration.width() + this.thickness * 2,
				this.thickness,
				this.playerFieldOptions
			),
			this.level.collisionCategoryHostLimit,
			[this.level.collisionCategoryHost]
		);
	}

	private clientLimits() {
		//Net
		this.applyCollisionCategory(
			this.scene.matter.add.rectangle(
				(
					this.hasNet ?
					this.gameConfiguration.netWidth() / 2 :
					-this.gameConfiguration.width() / 2
				),
				this.gameConfiguration.height() / 2,
				this.gameConfiguration.width(),
				this.gameConfiguration.height() + this.thickness * 2,
				this.playerFieldOptions
			),
			this.level.collisionCategoryClientLimit,
			[this.level.collisionCategoryClient]
		);

		//Wall
		this.applyCollisionCategory(
			this.scene.matter.add.rectangle(
				this.gameConfiguration.width() + this.thickness / 2,
				this.gameConfiguration.height() / 2,
				this.thickness,
				this.gameConfiguration.height() + this.thickness * 2,
				this.playerFieldOptions
			),
			this.level.collisionCategoryClientLimit,
			[this.level.collisionCategoryClient]
		);

		//Ground
		this.clientGround = this.scene.matter.add.rectangle(
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() + this.thickness / 2,
			this.gameConfiguration.width() + this.thickness * 2,
			this.thickness,
			this.playerFieldOptions
		);
		this.applyCollisionCategory(
			this.clientGround,
			this.level.collisionCategoryClientLimit,
			[this.level.collisionCategoryClient]
		);

		//Ceiling
		this.applyCollisionCategory(
			this.scene.matter.add.rectangle(
				this.gameConfiguration.width() / 2,
				-this.thickness / 2,
				this.gameConfiguration.width() + this.thickness * 2,
				this.thickness,
				this.playerFieldOptions
			),
			this.level.collisionCategoryClientLimit,
			[this.level.collisionCategoryClient]
		);
	}

	private ballLimits() {
		this.ballGround = this.scene.matter.add.rectangle(
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() + this.thickness / 2,
			this.gameConfiguration.width() + this.thickness * 2,
			this.thickness,
			this.ballFieldOptions
		);
		this.applyWorldRestitution(this.ballGround);
		this.applyCollisionCategory(
			this.ballGround,
			this.level.collisionCategoryBallLimit,
			[this.level.collisionCategoryBall]
		);

		const ceiling = this.scene.matter.add.rectangle(
			this.gameConfiguration.width() / 2,
			-this.thickness / 2,
			this.gameConfiguration.width() + this.thickness * 2,
			this.thickness,
			this.ballFieldOptions
		);
		this.applyWorldRestitution(ceiling);
		this.applyCollisionCategory(
			ceiling,
			this.level.collisionCategoryBallLimit,
			[this.level.collisionCategoryBall]
		);

		const leftWall = this.scene.matter.add.rectangle(
			-this.thickness / 2,
			this.gameConfiguration.height() / 2,
			this.thickness,
			this.gameConfiguration.height() + this.thickness * 2,
			this.ballFieldOptions
		);
		this.applyWorldRestitution(leftWall);
		this.applyCollisionCategory(
			leftWall,
			this.level.collisionCategoryBallLimit,
			[this.level.collisionCategoryBall]
		);

		const rightWall = this.scene.matter.add.rectangle(
			this.gameConfiguration.width() + this.thickness / 2,
			this.gameConfiguration.height() / 2,
			this.thickness,
			this.gameConfiguration.height() + this.thickness * 2,
			this.ballFieldOptions
		);
		this.applyWorldRestitution(rightWall);
		this.applyCollisionCategory(
			rightWall,
			this.level.collisionCategoryBallLimit,
			[this.level.collisionCategoryBall]
		);

		if (this.hasNet) {
			const net = this.scene.matter.add.rectangle(
				this.gameConfiguration.width() / 2,
				this.gameConfiguration.height() - (this.gameConfiguration.groundHeight() + this.gameConfiguration.netHeight()) / 2,
				this.gameConfiguration.netWidth(),
				this.gameConfiguration.groundHeight() + this.gameConfiguration.netHeight(),
				{isStatic: true, friction: 0, frictionStatic: 0, restitution: 0}
			);
			this.applyRestitution(net, this.ballNetRestitution);
			this.applyCollisionCategory(
				net,
				this.level.collisionCategoryBallLimit,
				[this.level.collisionCategoryBall]
			);
		}
	}

	private bonusLimits() {
		const ground = this.scene.matter.add.rectangle(
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() + this.thickness / 2,
			this.gameConfiguration.width() + this.thickness * 2,
			this.thickness,
			this.bonusFieldOptions
		);
		this.applyWorldRestitution(ground);
		this.applyCollisionCategory(
			ground,
			this.level.collisionCategoryBonusLimit,
			[this.level.collisionCategoryBonus]
		);

		const ceiling = this.scene.matter.add.rectangle(
			this.gameConfiguration.width() / 2,
			-this.thickness / 2,
			this.gameConfiguration.width() + this.thickness * 2,
			this.thickness,
			this.bonusFieldOptions
		);
		this.applyWorldRestitution(ceiling);
		this.applyCollisionCategory(
			ceiling,
			this.level.collisionCategoryBonusLimit,
			[this.level.collisionCategoryBonus]
		);

		const rightWall = this.scene.matter.add.rectangle(
			-this.thickness / 2,
			this.gameConfiguration.height() / 2,
			this.thickness,
			this.gameConfiguration.height() + this.thickness * 2,
			this.bonusFieldOptions
		);
		this.applyWorldRestitution(rightWall);
		this.applyCollisionCategory(
			rightWall,
			this.level.collisionCategoryBonusLimit,
			[this.level.collisionCategoryBonus]
		);

		const leftWall = this.scene.matter.add.rectangle(
			this.gameConfiguration.width() + this.thickness / 2,
			this.gameConfiguration.height() / 2,
			this.thickness,
			this.gameConfiguration.height() + this.thickness * 2,
			this.bonusFieldOptions
		);
		this.applyWorldRestitution(leftWall);
		this.applyCollisionCategory(
			leftWall,
			this.level.collisionCategoryBonusLimit,
			[this.level.collisionCategoryBonus]
		);

		if (this.hasNet) {
			const net = this.scene.matter.add.rectangle(
				this.gameConfiguration.width() / 2,
				this.gameConfiguration.height() - (this.gameConfiguration.groundHeight() + this.gameConfiguration.netHeight()) / 2,
				this.gameConfiguration.netWidth(),
				this.gameConfiguration.groundHeight() + this.gameConfiguration.netHeight(),
				this.bonusFieldOptions
			);
			this.applyRestitution(net, this.bonusNetRestitution);
			this.applyCollisionCategory(
				net,
				this.level.collisionCategoryBonusLimit,
				[this.level.collisionCategoryBonus]
			);
		}
	}

	private applyWorldRestitution(limit: any) {
		this.applyRestitution(limit, this.worldRestitution);
	}

	private applyRestitution(limit: any, restitution: number) {
		limit.restitution = restitution;
	}

	private applyCollisionCategory(limit: MatterJS.Body, category: number, colliders: number[]) {
		this.setBodyCollisionCategory(limit, category);
		this.setBodyCollidesWith(limit, colliders);
	}

	setBodyCollisionCategory(body, value) {
		body.collisionFilter.category = value;
	}

	setBodyCollidesWith(body, categories) {
		let flags = 0;

		if (!Array.isArray(categories)) {
			flags = categories;
		} else {
			for (let i = 0; i < categories.length; i++) {
				flags |= categories[i];
			}
		}

		body.collisionFilter.mask = flags;
	}
}
