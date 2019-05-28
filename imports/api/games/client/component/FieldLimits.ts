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
	soccerNetPosts: Phaser.Physics.P2.Body[] = [];

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
		this.ballBonusLimits();
		if (this.gameConfiguration.hasSoccerNet()) {
			this.soccerNetLimits();
		}
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

	private ballBonusLimits() {
		this.ballGround = this.addBound(
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() + this.wallsThickness / 2,
			this.gameConfiguration.width() + this.wallsThickness * 2,
			this.wallsThickness
		);
		this.applyCollisionCategory(
			this.ballGround,
			this.level.materialLimit,
			this.level.collisionCategoryBallBonusLimit,
			[
				this.level.collisionCategoryBall,
				this.level.collisionCategoryBonus
			]
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
			this.level.collisionCategoryBallBonusLimit,
			[
				this.level.collisionCategoryBall,
				this.level.collisionCategoryBonus
			]
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
			this.level.collisionCategoryBallBonusLimit,
			[
				this.level.collisionCategoryBall,
				this.level.collisionCategoryBonus
			]
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
			this.level.collisionCategoryBallBonusLimit,
			[
				this.level.collisionCategoryBall,
				this.level.collisionCategoryBonus
			]
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
				this.level.collisionCategoryBallBonusLimit,
				[
					this.level.collisionCategoryBall,
					this.level.collisionCategoryBonus
				]
			);
		}
	}

	private soccerNetLimits() {
		const soccerNetPointZoneWidth = this.gameConfiguration.soccerNetPointZoneWidth();
		const soccerNetPointZoneHeight = this.gameConfiguration.soccerNetHeight();
		const soccerNetPointZoneY = this.gameConfiguration.height() -
			this.gameConfiguration.groundHeight() -
			this.gameConfiguration.soccerNetDistanceFromGround() -
			(soccerNetPointZoneHeight / 2);
		const soccerNetWidth = this.gameConfiguration.soccerNetWidth();
		const soccerNetHorizontalPostThickness = this.gameConfiguration.soccerNetHorizontalPostThickness();
		const soccerNetTopPostY = this.gameConfiguration.height() -
			this.gameConfiguration.groundHeight() -
			this.gameConfiguration.soccerNetDistanceFromGround() -
			soccerNetPointZoneHeight -
			(soccerNetHorizontalPostThickness / 2);
		const soccerNetBottomPostY = this.gameConfiguration.height() -
			this.gameConfiguration.groundHeight() -
			this.gameConfiguration.soccerNetDistanceFromGround() +
			(soccerNetHorizontalPostThickness / 2);

		const postsColliders = [];
		if (this.gameConfiguration.ballCollidesWithSoccerNetPosts()) {
			postsColliders.push(this.level.collisionCategoryBall);
		}
		if (this.gameConfiguration.bonusCollidesWithSoccerNetPosts()) {
			postsColliders.push(this.level.collisionCategoryBonus);
		}
		if (this.gameConfiguration.playerCollidesWithSoccerNetPosts()) {
			postsColliders.push(this.level.collisionCategoryHost);
			postsColliders.push(this.level.collisionCategoryClient);
		}

		this.soccerNetHostPointZone = this.addBound(
			soccerNetPointZoneWidth / 2,
			soccerNetPointZoneY,
			soccerNetPointZoneWidth,
			soccerNetPointZoneHeight
		);
		this.applyCollisionCategory(
			this.soccerNetHostPointZone,
			this.level.materialLimit,
			this.level.collisionCategorySoccerNet,
			[this.level.collisionCategoryBall]
		);

		const soccerNetHostTopPost = this.addBound(
			soccerNetWidth / 2,
			soccerNetTopPostY,
			soccerNetWidth,
			soccerNetHorizontalPostThickness
		);
		this.applyCollisionCategory(
			soccerNetHostTopPost,
			this.level.materialLimit,
			this.level.collisionCategorySoccerNet,
			postsColliders
		);
		this.soccerNetPosts.push(soccerNetHostTopPost);

		if (this.gameConfiguration.hasSoccerNetBottomPost()) {
			const soccerNetHostBottomPost = this.addBound(
				soccerNetWidth / 2,
				soccerNetBottomPostY,
				soccerNetWidth,
				soccerNetHorizontalPostThickness
			);
			this.applyCollisionCategory(
				soccerNetHostBottomPost,
				this.level.materialLimit,
				this.level.collisionCategorySoccerNet,
				postsColliders
			);
			this.soccerNetPosts.push(soccerNetHostBottomPost);
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
			this.level.collisionCategorySoccerNet,
			[this.level.collisionCategoryBall]
		);

		const soccerNetClientTopPost = this.addBound(
			this.gameConfiguration.width() - soccerNetWidth / 2,
			soccerNetTopPostY,
			soccerNetWidth,
			soccerNetHorizontalPostThickness
		);
		this.applyCollisionCategory(
			soccerNetClientTopPost,
			this.level.materialLimit,
			this.level.collisionCategorySoccerNet,
			postsColliders
		);
		this.soccerNetPosts.push(soccerNetClientTopPost);

		if (this.gameConfiguration.hasSoccerNetBottomPost()) {
			const soccerNetClientBottomPost = this.addBound(
				this.gameConfiguration.width() - soccerNetWidth / 2,
				soccerNetBottomPostY,
				soccerNetWidth,
				soccerNetHorizontalPostThickness
			);
			this.applyCollisionCategory(
				soccerNetClientBottomPost,
				this.level.materialLimit,
				this.level.collisionCategorySoccerNet,
				postsColliders
			);
			this.soccerNetPosts.push(soccerNetClientBottomPost);
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
