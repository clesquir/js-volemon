import MainScene from "../scene/MainScene";
import GameConfiguration from "../../configuration/GameConfiguration";
import SkinManager from "./SkinManager";
import {CLIENT_SIDE, DEPTH_ALL, HOST_SIDE} from "../../constants";
import Level from "./Level";
import {ArtificialIntelligencePositionData} from "../../artificialIntelligence/ArtificialIntelligencePositionData";
import {PositionData} from "./PositionData";
import GameData from "../../data/GameData";
import Interpolation from "./Interpolation";
import ServerNormalizedTime from "../ServerNormalizedTime";
import VelocityConstraint from "./VelocityConstraint";

export default class Ball {
	scene: MainScene;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	serverNormalizedTime: ServerNormalizedTime;
	skinManager: SkinManager;
	level: Level;
	interpolation: Interpolation;
	velocityConstraint: VelocityConstraint;

	ballObject: Phaser.Sprite;

	isFrozen: boolean = false;
	initialGravityScale: number;
	currentGravityScale: number;
	initialMass: number;
	currentMass: number;
	initialScale: number;
	currentScale: number;
	velocityOnReboundOnPlayer: number;

	constructor(
		scene: MainScene,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		serverNormalizedTime: ServerNormalizedTime,
		skinManager: SkinManager,
		level: Level
	) {
		this.scene = scene;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.serverNormalizedTime = serverNormalizedTime;
		this.skinManager = skinManager;
		this.level = level;

		this.interpolation = new Interpolation(
			this.scene,
			this.serverNormalizedTime
		);
		this.velocityConstraint = new VelocityConstraint();

		this.init();
	}

	reset(lastPointTaken: string) {
		this.ballObject.destroy();

		this.init();

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

		this.ballObject.body.setZeroVelocity();
		this.ballObject.reset(x, this.gameConfiguration.ballInitialY());
	}

	stopGame() {
		this.freeze();
	}

	freeze() {
		this.isFrozen = true;
		this.ballObject.body.data.gravityScale = 0;
		this.ballObject.body.setZeroVelocity();
	}

	unfreeze() {
		this.isFrozen = false;
		this.ballObject.body.data.gravityScale = this.currentGravityScale;
	}

	scaleSmall() {
		this.currentScale = this.gameConfiguration.smallBallScale();
		this.currentMass = this.gameConfiguration.smallBallMass();
		this.currentGravityScale = this.gameConfiguration.smallBallGravityScale();
		this.applyScale();
	}

	scaleBig() {
		this.currentScale = this.gameConfiguration.bigBallScale();
		this.currentMass = this.gameConfiguration.bigBallMass();
		this.currentGravityScale = this.gameConfiguration.bigBallGravityScale();
		this.applyScale();
	}

	resetScale() {
		this.currentScale = this.initialScale;
		this.currentMass = this.initialMass;
		this.currentGravityScale = this.initialGravityScale;
		this.applyScale();
	}

	hide() {
		if (!this.gameData.isUserViewer()) {
			this.ballObject.alpha = 0;
		} else {
			this.ballObject.alpha = 0.5;
		}
	}

	unhide() {
		this.ballObject.alpha = 1;
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
			gravityScale: this.currentGravityScale,
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

		this.ballObject.body.velocity.x = newVelocityX;
		this.ballObject.body.velocity.y = newVelocityY;
	}

	rebound() {
		this.ballObject.body.velocity.y = this.velocityOnReboundOnPlayer;
	}

	constrainVelocity() {
		this.velocityConstraint.constrain(this.ballObject.body);
	}

	interpolate(data: any) {
		this.interpolation.interpolateMoveTo(
			this.ballObject,
			data,
			() => this.gameIsOnGoing(),
			false
		);
	}

	private init() {
		this.initialGravityScale = this.gameConfiguration.initialBallGravityScale();
		this.currentGravityScale = this.initialGravityScale;
		this.initialMass = this.gameConfiguration.initialBallMass();
		this.currentMass = this.initialMass;
		this.initialScale = this.gameConfiguration.initialBallScale();
		this.currentScale = this.initialScale;
		this.velocityOnReboundOnPlayer = this.gameConfiguration.ballVelocityOnReboundOnPlayer();

		this.ballObject = this.skinManager.createBallComponent(this.scene);
		this.scene.game.physics.p2.enable(this.ballObject, this.scene.game.config.enableDebug);
		this.ballObject.data.owner = this;
		this.ballObject.data.isBall = true;

		// @ts-ignore
		this.ballObject.depth = DEPTH_ALL;

		this.ballObject.scale.setTo(this.initialScale);
		this.ballObject.body.clearShapes();
		this.ballObject.body.loadPolygon('physicsData', 'ball', this.initialScale);

		this.setupBody();
	}

	private setupBody() {
		this.ballObject.body.fixedRotation = true;
		this.ballObject.body.damping = 0.1;
		this.ballObject.body.mass = this.currentMass;

		if (this.isFrozen) {
			this.ballObject.body.data.gravityScale = 0;
		} else {
			this.ballObject.body.data.gravityScale = this.currentGravityScale;
		}

		this.ballObject.body.setMaterial(this.level.materialBall);
		this.ballObject.body.setCollisionGroup(this.level.collisionCategoryBall);
		this.ballObject.body.collides(this.level.collisionCategoryBallLimit, this.scene.collideBallGround, this.scene);
		this.ballObject.body.collides(this.level.collisionCategoryBall);
		this.ballObject.body.collides(this.level.collisionCategoryHost, this.scene.collidePlayerBall, this.scene);
		this.ballObject.body.collides(this.level.collisionCategoryClient, this.scene.collidePlayerBall, this.scene);
		this.ballObject.body.collides(this.level.collisionCategoryBonus);
	}

	private velocityX(): number {
		return this.ballObject.body.velocity.x;
	}

	private velocityY(): number {
		return this.ballObject.body.velocity.y;
	}

	private applyScale() {
		this.ballObject.scale.setTo(this.currentScale);
		this.ballObject.body.clearShapes();
		this.ballObject.body.loadPolygon('physicsData', 'ball', this.currentScale);

		this.setupBody();
	}

	private gameIsOnGoing(): boolean {
		return this.gameData.isGameStatusStarted();
	}
}
