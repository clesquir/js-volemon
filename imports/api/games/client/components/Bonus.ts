import ServerNormalizedTime from "../ServerNormalizedTime";
import BaseBonus from "../../bonus/BaseBonus";
import {ArtificialIntelligencePositionData} from "../../artificialIntelligence/ArtificialIntelligencePositionData";
import {BonusPositionData} from "../../bonus/data/BonusPositionData";
import MainScene from "../scene/MainScene";
import GameConfiguration from "../../configuration/GameConfiguration";
import Level from "./Level";
import {CONSTRAINED_VELOCITY} from "../../constants";
import Bonuses from "./Bonuses";

export default class Bonus {
	scene: MainScene;
	gameConfiguration: GameConfiguration;
	serverNormalizedTime: ServerNormalizedTime;
	level: Level;
	bonusReference: BaseBonus;
	initialX: number;
	identifier: string;

	bonusObject: Phaser.Physics.Matter.Image;

	constructor(
		scene: MainScene,
		gameConfiguration: GameConfiguration,
		serverNormalizedTime: ServerNormalizedTime,
		level: Level,
		bonusReference: BaseBonus,
		initialX: number,
		identifier: string
	) {
		this.scene = scene;
		this.gameConfiguration = gameConfiguration;
		this.serverNormalizedTime = serverNormalizedTime;
		this.level = level;
		this.bonusReference = bonusReference;
		this.initialX = initialX;
		this.identifier = identifier;

		this.init();
	}

	destroy() {
		this.bonusObject.destroy();
	}

	canActivate(): boolean {
		return this.bonusReference.canActivate();
	}

	freeze() {
		this.bonusObject.setIgnoreGravity(true);
		this.bonusObject.setVelocity(0, 0);
	}

	constrainVelocity() {
		const maxVelocity = CONSTRAINED_VELOCITY;
		let vx = this.velocityX();
		let vy = this.velocityY();
		let currVelocitySqr = vx * vx + vy * vy;

		if (currVelocitySqr > maxVelocity * maxVelocity) {
			let angle = Math.atan2(vy, vx);

			vx = Math.cos(angle) * maxVelocity;
			vy = Math.sin(angle) * maxVelocity;

			this.bonusObject.setVelocity(vx, vy);
		}
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
			velocityX: this.velocityX(),
			velocityY: this.velocityY(),
		};
	}

	payload(bonuses: Bonuses, playerKey: string) {
		//@todo Bonus - declare type
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
		this.bonusObject = this.scene.matter.add.image(
			this.initialX,
			0,
			'bonus-icon',
			this.bonusReference.atlasFrame,
			{
				shape: 'circle'
			}
		);

		this.bonusObject.setDataEnabled();
		this.bonusObject.setData('owner', this);
		this.bonusObject.setData('isBonus', true);

		this.bonusObject.setScale(this.gameConfiguration.bonusScale());
		this.bonusObject.setFriction(0, 0, 0);
		this.bonusObject.setMass(this.gameConfiguration.bonusMass());

		this.bonusObject.setCollisionCategory(this.level.collisionCategoryBonus);
		this.bonusObject.setCollidesWith([
			this.level.collisionCategoryHost,
			this.level.collisionCategoryClient,
			this.level.collisionCategoryBonusLimit,
			this.level.collisionCategoryBonus,
			this.level.collisionCategoryBall,
		]);
	}

	private x(): number {
		return this.bonusObject.x;
	}

	private y(): number {
		return this.bonusObject.y;
	}

	private velocityX(): number {
		const body = <any>this.bonusObject.body;

		return body.velocity.x;
	}

	private velocityY(): number {
		const body = <any>this.bonusObject.body;

		return body.velocity.y;
	}
}
