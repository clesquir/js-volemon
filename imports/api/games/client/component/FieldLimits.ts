import MainScene from "../scene/MainScene";
import GameConfiguration from "../../configuration/GameConfiguration";
import Level from "./Level";

export default class FieldLimits {
	scene: MainScene;
	gameConfiguration: GameConfiguration;
	level: Level;
	hasNet: boolean;

	private readonly wallsThickness: number = 128;

	hostGround: Phaser.Physics.P2.Body;
	clientGround: Phaser.Physics.P2.Body;
	ballGround: Phaser.Physics.P2.Body;
	soccerNetHostPointZone: Phaser.Physics.P2.Body;
	soccerNetClientPointZone: Phaser.Physics.P2.Body;

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
					this.hasNet && this.gameConfiguration.hasPlayerNetLimit() ?
					this.gameConfiguration.width() - (this.gameConfiguration.netWidth() / 2) :
					this.gameConfiguration.width() * 1.5
				),
				this.gameConfiguration.height() / 2,
				this.gameConfiguration.width(),
				this.gameConfiguration.height() + this.wallsThickness * 2
			),
			this.level.materialLimit,
			this.level.collisionCategoryHostLimit,
			[this.level.collisionCategoryHost]
		);

		//Wall
		this.applyCollisionCategory(
			this.addBound(
				-this.wallsThickness / 2,
				this.gameConfiguration.height() / 2,
				this.wallsThickness,
				this.gameConfiguration.height() + this.wallsThickness * 2
			),
			this.level.materialLimit,
			this.level.collisionCategoryHostLimit,
			[this.level.collisionCategoryHost]
		);

		//Ground
		this.hostGround = this.addBound(
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() + this.wallsThickness / 2,
			this.gameConfiguration.width() + this.wallsThickness * 2,
			this.wallsThickness
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
				-this.wallsThickness / 2,
				this.gameConfiguration.width() + this.wallsThickness * 2,
				this.wallsThickness
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
					this.hasNet && this.gameConfiguration.hasPlayerNetLimit() ?
					this.gameConfiguration.netWidth() / 2 :
					-this.gameConfiguration.width() / 2
				),
				this.gameConfiguration.height() / 2,
				this.gameConfiguration.width(),
				this.gameConfiguration.height() + this.wallsThickness * 2
			),
			this.level.materialLimit,
			this.level.collisionCategoryClientLimit,
			[this.level.collisionCategoryClient]
		);

		//Wall
		this.applyCollisionCategory(
			this.addBound(
				this.gameConfiguration.width() + this.wallsThickness / 2,
				this.gameConfiguration.height() / 2,
				this.wallsThickness,
				this.gameConfiguration.height() + this.wallsThickness * 2
			),
			this.level.materialLimit,
			this.level.collisionCategoryClientLimit,
			[this.level.collisionCategoryClient]
		);

		//Ground
		this.clientGround = this.addBound(
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() + this.wallsThickness / 2,
			this.gameConfiguration.width() + this.wallsThickness * 2,
			this.wallsThickness
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
				-this.wallsThickness / 2,
				this.gameConfiguration.width() + this.wallsThickness * 2,
				this.wallsThickness
			),
			this.level.materialLimit,
			this.level.collisionCategoryClientLimit,
			[this.level.collisionCategoryClient]
		);
	}

	private ballLimits() {
		this.ballGround = this.addBound(
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() + this.wallsThickness / 2,
			this.gameConfiguration.width() + this.wallsThickness * 2,
			this.wallsThickness
		);
		this.applyCollisionCategory(
			this.ballGround,
			this.level.materialLimit,
			this.level.collisionCategoryBallLimit,
			[this.level.collisionCategoryBall]
		);

		if (this.gameConfiguration.hasSoccerNet()) {
			const soccerNetPointZoneWidth = this.gameConfiguration.soccerNetPointZoneWidth();
			const soccerNetPointZoneHeight = this.gameConfiguration.soccerNetHeight();
			const soccerNetPointZoneY = this.gameConfiguration.height() -
				this.gameConfiguration.groundHeight() -
				this.gameConfiguration.soccerNetDistanceFromGround() -
				(soccerNetPointZoneHeight / 2);
			const soccerNetWidth = this.gameConfiguration.soccerNetWidth();
			const soccerNetPostThickness = this.gameConfiguration.soccerNetPostThickness();
			const soccerNetTopPostY = this.gameConfiguration.height() -
				this.gameConfiguration.groundHeight() -
				this.gameConfiguration.soccerNetDistanceFromGround() -
				soccerNetPointZoneHeight -
				(soccerNetPostThickness / 2);
			const soccerNetBottomPostY = this.gameConfiguration.height() -
				this.gameConfiguration.groundHeight() -
				this.gameConfiguration.soccerNetDistanceFromGround() +
				(soccerNetPostThickness / 2);
			this.soccerNetHostPointZone = this.addBound(
				soccerNetPointZoneWidth / 2,
				soccerNetPointZoneY,
				soccerNetPointZoneWidth,
				soccerNetPointZoneHeight
			);
			this.applyCollisionCategory(
				this.soccerNetHostPointZone,
				this.level.materialLimit,
				this.level.collisionCategoryBallLimit,
				[this.level.collisionCategoryBall]
			);
			const soccerNetHostTopPost = this.addBound(
				soccerNetWidth / 2,
				soccerNetTopPostY,
				soccerNetWidth,
				soccerNetPostThickness
			);
			this.applyCollisionCategory(
				soccerNetHostTopPost,
				this.level.materialLimit,
				this.level.collisionCategoryBallLimit,
				[this.level.collisionCategoryBall]
			);
			if (this.gameConfiguration.hasSoccerNetBottomPost()) {
				const soccerNetHostBottomPost = this.addBound(
					soccerNetWidth / 2,
					soccerNetBottomPostY,
					soccerNetWidth,
					soccerNetPostThickness
				);
				this.applyCollisionCategory(
					soccerNetHostBottomPost,
					this.level.materialLimit,
					this.level.collisionCategoryBallLimit,
					[this.level.collisionCategoryBall]
				);
			}
			this.soccerNetClientPointZone = this.addBound(
				this.gameConfiguration.width() - soccerNetPointZoneWidth / 2,
				soccerNetPointZoneY,
				soccerNetPointZoneWidth,
				soccerNetPointZoneHeight
			);
			this.applyCollisionCategory(
				this.soccerNetClientPointZone,
				this.level.materialLimit,
				this.level.collisionCategoryBallLimit,
				[this.level.collisionCategoryBall]
			);
			const soccerNetClientTopPost = this.addBound(
				this.gameConfiguration.width() - soccerNetWidth / 2,
				soccerNetTopPostY,
				soccerNetWidth,
				soccerNetPostThickness
			);
			this.applyCollisionCategory(
				soccerNetClientTopPost,
				this.level.materialLimit,
				this.level.collisionCategoryBallLimit,
				[this.level.collisionCategoryBall]
			);
			if (this.gameConfiguration.hasSoccerNetBottomPost()) {
				const soccerNetClientBottomPost = this.addBound(
					this.gameConfiguration.width() - soccerNetWidth / 2,
					soccerNetBottomPostY,
					soccerNetWidth,
					soccerNetPostThickness
				);
				this.applyCollisionCategory(
					soccerNetClientBottomPost,
					this.level.materialLimit,
					this.level.collisionCategoryBallLimit,
					[this.level.collisionCategoryBall]
				);
			}
		}

		const ceiling = this.addBound(
			this.gameConfiguration.width() / 2,
			-this.wallsThickness / 2,
			this.gameConfiguration.width() + this.wallsThickness * 2,
			this.wallsThickness
		);
		this.applyCollisionCategory(
			ceiling,
			this.level.materialLimit,
			this.level.collisionCategoryBallLimit,
			[this.level.collisionCategoryBall]
		);

		const leftWall = this.addBound(
			-this.wallsThickness / 2,
			this.gameConfiguration.height() / 2,
			this.wallsThickness,
			this.gameConfiguration.height() + this.wallsThickness * 2
		);
		this.applyCollisionCategory(
			leftWall,
			this.level.materialLimit,
			this.level.collisionCategoryBallLimit,
			[this.level.collisionCategoryBall]
		);

		const rightWall = this.addBound(
			this.gameConfiguration.width() + this.wallsThickness / 2,
			this.gameConfiguration.height() / 2,
			this.wallsThickness,
			this.gameConfiguration.height() + this.wallsThickness * 2
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
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() + this.wallsThickness / 2,
			this.gameConfiguration.width() + this.wallsThickness * 2,
			this.wallsThickness
		);
		this.applyCollisionCategory(
			ground,
			this.level.materialLimit,
			this.level.collisionCategoryBonusLimit,
			[this.level.collisionCategoryBonus]
		);

		const ceiling = this.addBound(
			this.gameConfiguration.width() / 2,
			-this.wallsThickness / 2,
			this.gameConfiguration.width() + this.wallsThickness * 2,
			this.wallsThickness
		);
		this.applyCollisionCategory(
			ceiling,
			this.level.materialLimit,
			this.level.collisionCategoryBonusLimit,
			[this.level.collisionCategoryBonus]
		);

		const rightWall = this.addBound(
			-this.wallsThickness / 2,
			this.gameConfiguration.height() / 2,
			this.wallsThickness,
			this.gameConfiguration.height() + this.wallsThickness * 2
		);
		this.applyCollisionCategory(
			rightWall,
			this.level.materialLimit,
			this.level.collisionCategoryBonusLimit,
			[this.level.collisionCategoryBonus]
		);

		const leftWall = this.addBound(
			this.gameConfiguration.width() + this.wallsThickness / 2,
			this.gameConfiguration.height() / 2,
			this.wallsThickness,
			this.gameConfiguration.height() + this.wallsThickness * 2
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
