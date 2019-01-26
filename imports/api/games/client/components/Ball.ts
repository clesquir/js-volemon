import MainScene from "../scene/MainScene";
import GameConfiguration from "../../configuration/GameConfiguration";
import SkinManager from "./SkinManager";
import {CLIENT_SIDE, CONSTRAINED_VELOCITY, HOST_SIDE} from "../../constants";
import Level from "./Level";
import {ArtificialIntelligencePositionData} from "../../artificialIntelligence/ArtificialIntelligencePositionData";
import {PositionData} from "./PositionData";
import GameData from "../../data/GameData";

export default class Ball {
	scene: MainScene;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;
	level: Level;

	ballObject: Phaser.Physics.Matter.Image;

	isFrozen: boolean = false;
	initialMass: number;
	currentMass: number;
	initialScale: number;
	currentScale: number;

	constructor(
		scene: MainScene,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		skinManager: SkinManager,
		level: Level
	) {
		this.scene = scene;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.skinManager = skinManager;
		this.level = level;

		this.init();
	}

	reset(lastPointTaken: string) {
		const hostSide = this.gameConfiguration.ballInitialHostX();
		const clientSide = this.gameConfiguration.ballInitialClientX();
		let x;

		switch (lastPointTaken) {
			case CLIENT_SIDE:
				x = hostSide;
				break;
			case HOST_SIDE:
				x = clientSide;
				break;
			default:
				//First ball is randomly given
				x = Random.choice(
					[
						hostSide,
						clientSide
					]
				);
				break;
		}

		this.ballObject.setVelocity(0, 0);
		this.ballObject.setX(x);
		this.ballObject.setY(this.gameConfiguration.ballInitialY());
	}

	freeze() {
		this.isFrozen = true;
		this.ballObject.setIgnoreGravity(true);
		this.ballObject.setVelocity(0, 0);
	}

	unfreeze() {
		this.isFrozen = false;
		this.ballObject.setIgnoreGravity(false);
	}

	scaleSmall() {
		this.currentScale = this.gameConfiguration.smallBallScale();
		this.currentMass = this.gameConfiguration.smallBallMass();
		this.applyScale();
	}

	scaleBig() {
		this.currentScale = this.gameConfiguration.bigBallScale();
		this.currentMass = this.gameConfiguration.bigBallMass();
		this.applyScale();
	}

	resetScale() {
		this.currentScale = this.initialScale;
		this.currentMass = this.initialMass;
		this.applyScale();
	}

	hide() {
		if (!this.gameData.isUserViewer()) {
			this.ballObject.setAlpha(0);
		} else {
			this.ballObject.setAlpha(0.5);
		}
	}

	unhide() {
		this.ballObject.setAlpha(1);
	}

	x(): number {
		return this.ballObject.x;
	}

	y(): number {
		return this.ballObject.y;
	}

	diameter(): number {
		return this.ballObject.height;
	}

	positionData(): PositionData {
		return {
			x: this.ballObject.x,
			y: this.ballObject.y,
			velocityX: this.velocityX(),
			velocityY: this.velocityY(),
		};
	}

	artificialIntelligencePositionData(): ArtificialIntelligencePositionData {
		return {
			x: this.x(),
			y: this.y(),
			scale: this.currentScale,
			velocityX: this.velocityX(),
			velocityY: this.velocityY(),
			width: this.ballObject.width,
			height: this.ballObject.height,
		};
	}

	dropshot() {
		//Nothing to do
	}

	smash(isSmashedByHost: boolean) {
		let newVelocityX = this.velocityX();
		let newVelocityY = this.velocityY();

		//Ball direction should change if smashed the opposite way
		if (
			(isSmashedByHost && newVelocityX < 0) ||
			(!isSmashedByHost && newVelocityX > 0)
		) {
			newVelocityX = -newVelocityX;
		}

		//Ball should always go down
		if (newVelocityY < 0) {
			newVelocityY = -newVelocityY;
		}

		//Ball should go faster and down
		newVelocityX = newVelocityX * 2;
		newVelocityY = newVelocityY / 4;

		this.ballObject.setVelocity(newVelocityX, newVelocityY);
	}

	rebound() {
		this.ballObject.setVelocityY(
			this.gameConfiguration.ballVelocityOnReboundOnPlayer() *
			this.initialMass / this.currentMass
		);
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

			this.ballObject.setVelocity(vx, vy);
		}
	}

	private init() {
		this.initialMass = this.gameConfiguration.initialBallMass();
		this.currentMass = this.initialMass;
		this.initialScale = this.gameConfiguration.initialBallScale();
		this.currentScale = this.initialScale;

		this.ballObject = this.skinManager.createBallComponent(this.scene);
		this.ballObject.setBody(
			{
				type: 'fromVertices',
				verts: '24, 8, 24, 16, 16, 24, 8, 24, 0, 16, 0, 8, 8, 0, 16, 0'
			},
			{}
		);

		this.ballObject.setDataEnabled();
		this.ballObject.setData('owner', this);
		this.ballObject.setData('isBall', true);

		this.ballObject.setScale(this.initialScale);

		this.setupBody();
	}

	private setupBody() {
		this.ballObject.setIgnoreGravity(this.isFrozen);
		this.ballObject.setFriction(0, 0, 0);
		this.ballObject.setMass(this.currentMass);
		this.ballObject.setFixedRotation();

		this.ballObject.setCollisionCategory(this.level.collisionCategoryBall);
		this.ballObject.setCollidesWith([
			this.level.collisionCategoryHost,
			this.level.collisionCategoryClient,
			this.level.collisionCategoryBallLimit,
			this.level.collisionCategoryBonus,
		]);
	}

	private velocityX(): number {
		const body = <any>this.ballObject.body;

		return body.velocity.x;
	}

	private velocityY(): number {
		const body = <any>this.ballObject.body;

		return body.velocity.y;
	}

	private applyScale() {
		this.ballObject.setScale(this.currentScale);
		this.ballObject.setMass(this.currentMass);
		this.ballObject.setFixedRotation();
	}
}
