import ServerNormalizedTime from "../ServerNormalizedTime";
import BaseBonus from "../../bonus/BaseBonus";
import {ArtificialIntelligencePositionData} from "../../artificialIntelligence/ArtificialIntelligencePositionData";
import {BonusPositionData} from "../../bonus/data/BonusPositionData";
import MainScene from "../scene/MainScene";
import GameConfiguration from "../../configuration/GameConfiguration";
import Level from "./Level";
import Bonuses from "./Bonuses";
import GameData from "../../data/GameData";
import Interpolation from "./Interpolation";
import VelocityConstraint from "./VelocityConstraint";
import {DEPTH_ALL} from "../../constants";

export default class Bonus {
	scene: MainScene;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	serverNormalizedTime: ServerNormalizedTime;
	level: Level;
	bonusReference: BaseBonus;
	initialX: number;
	identifier: string;
	interpolation: Interpolation;
	velocityConstraint: VelocityConstraint;

	bonusObject: Phaser.Sprite;

	currentGravityScale: number;

	constructor(
		scene: MainScene,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		serverNormalizedTime: ServerNormalizedTime,
		level: Level,
		bonusReference: BaseBonus,
		initialX: number,
		identifier: string
	) {
		this.scene = scene;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.serverNormalizedTime = serverNormalizedTime;
		this.level = level;
		this.bonusReference = bonusReference;
		this.initialX = initialX;
		this.identifier = identifier;

		this.interpolation = new Interpolation(
			this.scene,
			this.serverNormalizedTime
		);
		this.velocityConstraint = new VelocityConstraint();

		this.init();
	}

	destroy() {
		this.bonusObject.destroy();
	}

	canActivate(): boolean {
		return this.bonusReference.canActivate();
	}

	freeze() {
		this.bonusObject.body.data.gravityScale = 0;
		this.bonusObject.body.setZeroVelocity();
		this.bonusObject.body.fixedRotation = true;
	}

	interpolate(data: any) {
		this.interpolation.interpolateMoveTo(
			this.bonusObject,
			data,
			() => this.gameIsOnGoing(),
			false
		);
	}

	constrainVelocity() {
		this.velocityConstraint.constrain(this.bonusObject.body);
	}

	positionData(): BonusPositionData {
		const positionData = {
			x: this.bonusObject.x,
			y: this.bonusObject.y,
			velocityX: this.velocityX(),
			velocityY: this.velocityY(),
		};

		return Object.assign(positionData, this.bonusReference.dataToStream());
	}

	artificialIntelligencePositionData(): ArtificialIntelligencePositionData {
		return {
			x: this.bonusObject.x,
			y: this.bonusObject.y,
			gravityScale: this.currentGravityScale,
			velocityX: this.velocityX(),
			velocityY: this.velocityY(),
		};
	}

	payload(bonuses: Bonuses, playerKey: string) {
		const payload = {
			identifier: this.identifier,
			player: playerKey,
			activatedAt: this.serverNormalizedTime.getServerTimestamp(),
			x: this.x(),
			y: this.y(),
			beforeActivationData: {}
		};

		this.bonusReference.beforeActivation(bonuses, payload);
		payload.beforeActivationData = this.bonusReference.beforeActivationData();

		return payload;
	}

	private init() {
		this.currentGravityScale = this.gameConfiguration.bonusGravityScale();

		this.bonusObject = this.scene.game.add.sprite(
			this.initialX,
			this.gameConfiguration.bonusRadius() * this.gameConfiguration.bonusScale(),
			'bonus-icon',
			this.bonusReference.atlasFrame
		);
		this.bonusObject.anchor.setTo(0.5);
		this.scene.game.physics.p2.enable(this.bonusObject, this.scene.game.config.enableDebug);

		// @ts-ignore
		this.bonusObject.depth = DEPTH_ALL;

		this.bonusObject.scale.setTo(this.gameConfiguration.bonusScale());
		this.bonusObject.body.clearShapes();
		this.bonusObject.body.addCircle(this.gameConfiguration.bonusRadius() * this.gameConfiguration.bonusScale());

		this.bonusObject.data.owner = this;
		this.bonusObject.data.isBonus = true;

		this.bonusObject.body.mass = this.gameConfiguration.bonusMass();
		this.bonusObject.body.data.gravityScale = this.currentGravityScale;

		this.bonusObject.body.setMaterial(this.level.materialBonus);
		this.bonusObject.body.setCollisionGroup(this.level.collisionCategoryBonus);
		this.bonusObject.body.collides(this.level.collisionCategoryBonusLimit);
		this.bonusObject.body.collides(this.level.collisionCategoryBonus);
		this.bonusObject.body.collides(this.level.collisionCategoryHost, this.scene.collidePlayerBonus, this.scene);
		this.bonusObject.body.collides(this.level.collisionCategoryClient, this.scene.collidePlayerBonus, this.scene);
		this.bonusObject.body.collides(this.level.collisionCategoryBall);
	}

	private x(): number {
		return this.bonusObject.x;
	}

	private y(): number {
		return this.bonusObject.y;
	}

	private velocityX(): number {
		return this.bonusObject.body.velocity.x;
	}

	private velocityY(): number {
		return this.bonusObject.body.velocity.y;
	}

	private gameIsOnGoing(): boolean {
		return this.gameData.isGameStatusStarted();
	}
}
