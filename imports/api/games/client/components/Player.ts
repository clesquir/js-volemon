import GameData from "../../data/GameData";
import GameConfiguration from "../../configuration/GameConfiguration";
import MainScene from "../scene/MainScene";
import {
	PLAYER_SHAPE_CROWN,
	PLAYER_SHAPE_DOT,
	PLAYER_SHAPE_ELLIPSE,
	PLAYER_SHAPE_EQUAL,
	PLAYER_SHAPE_HALF_CIRCLE,
	PLAYER_SHAPE_HEXAGON,
	PLAYER_SHAPE_HYPHEN,
	PLAYER_SHAPE_MAGNET,
	PLAYER_SHAPE_OBELISK,
	PLAYER_SHAPE_RECTANGLE,
	PLAYER_SHAPE_RHOMBUS,
	PLAYER_SHAPE_TRIANGLE,
	PLAYER_SHAPE_TRIPLE_COLON,
	PLAYER_SHAPE_X
} from "../../shapeConstants";
import {PLAYER_MASS} from "../../constants";
import Ball from "./Ball";
import Level from "./Level";
import {ArtificialIntelligenceData} from "../../artificialIntelligence/ArtificialIntelligenceData";
import {ArtificialIntelligencePositionData} from "../../artificialIntelligence/ArtificialIntelligencePositionData";
import {PositionData} from "./PositionData";

export default class Player {
	scene: MainScene;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	level: Level;
	key: string;
	color: string;
	isHost: boolean;

	container: Phaser.GameObjects.Container;
	containerPhysics: Phaser.Physics.Matter.MatterPhysics | Phaser.Physics.Matter.Image | any;
	playerObject: Phaser.Physics.Matter.Image;

	eyeBall: Phaser.GameObjects.Graphics;
	eyePupil: Phaser.GameObjects.Graphics;
	eyeBallXOffset: number;
	eyeBallYOffset: number;
	eyeBallRadius: number;
	eyePupilRadius: number;

	dropShots: boolean = false;
	isFrozen: boolean = false;
	horizontalMoveMultiplier: number;
	verticalMoveMultiplier: number;
	isMoveReversed: boolean = false;
	canJump: boolean = true;
	alwaysJump: boolean = false;
	velocityXOnMove: number;
	velocityYOnJump: number;

	initialXLocation: number;
	initialYLocation: number;
	initialMass: number;
	currentMass: number;
	initialGravity: number;
	currentGravity: number;
	initialShape: string;
	currentShape: string;
	initialTextureKey: string;
	currentTextureKey: string;
	initialPolygonObject: string;
	currentPolygonObject: string;
	initialPolygonKey: string;
	currentPolygonKey: string;
	initialScale: number;
	currentScale: number;
	initialIsHiddenToHimself: boolean;
	isHiddenToHimself: boolean;
	initialIsHiddenToOpponent: boolean;
	isHiddenToOpponent: boolean;

	lastBallHit: number = 0;
	numberBallHits: number = 0;
	canJumpOnBodies: any[] = [];
	isInvincible: boolean = false;
	canActivateBonuses: boolean = true;

	private sensors: any[] = [];
	private hasBottomTouching: boolean = true;
	private isJumping: boolean = false;
	private isJumpingTimer;

	constructor (
		scene: MainScene,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		level: Level,
		key: string,
		color: string,
		isHost: boolean
	) {
		this.scene = scene;
		this.gameConfiguration = gameConfiguration;
		this.gameData = gameData;
		this.level = level;
		this.key = key;
		this.color = color;
		this.isHost = isHost;

		scene.matter.world.on("beforeupdate", () => this.hasBottomTouching = false, this);
		this.scene.eventEmitter.on('collisionstart', this.onCollide, this);
		this.scene.eventEmitter.on('collisionactive', this.onCollide, this);

		const x = this.gameConfiguration.playerInitialXFromKey(key, isHost);
		const y = this.gameConfiguration.playerInitialY();

		let shapeKey = this.playerShapeFromKey();

		this.container = this.scene.add.container(x, y);

		this.containerPhysics = this.scene.matter.add.gameObject(this.container);
		this.containerPhysics.setDataEnabled();
		this.containerPhysics.setData('owner', this);
		this.containerPhysics.setData('isPlayer', true);
		this.containerPhysics.setData('isHost', isHost);

		this.playerObject = this.scene.add.image(0, 0, 'shape-' + shapeKey);
		this.playerObject.setTint(Phaser.Display.Color.ValueToColor(color).color);

		this.container.add(this.playerObject);

		this.init(x, y);
	}

	reset() {
		this.resetBallHits();
		this.resetPosition();
	}

	resetBallHits() {
		this.numberBallHits = 0;
	}

	resetPosition() {
		this.containerPhysics.setVelocity(0, 0);
		this.containerPhysics.setX(this.initialXLocation);
		this.containerPhysics.setY(this.initialYLocation);
	}

	movePlayer(movesLeft: boolean, movesRight: boolean, jumps: boolean, dropshots: boolean) {
		this.dropShots = false;

		if (this.isFrozen) {
			this.containerPhysics.setVelocity(0, 0);
		} else {
			const horizontalMoveMultiplier = this.horizontalMoveMultiplier;
			const moveReversal = (this.isMoveReversed ? -1 : 1);

			if (movesLeft) {
				this.containerPhysics.setVelocityX(horizontalMoveMultiplier * moveReversal * -this.velocityXOnMove);
			} else if (movesRight) {
				this.containerPhysics.setVelocityX(horizontalMoveMultiplier * moveReversal * this.velocityXOnMove);
			} else {
				this.containerPhysics.setVelocityX(0);
			}

			if (this.hasBottomTouching && !this.isJumping) {
				if (this.alwaysJump || (jumps && this.canJump)) {
					const verticalMoveMultiplier = this.verticalMoveMultiplier;

					this.containerPhysics.setVelocityY(verticalMoveMultiplier * -this.velocityYOnJump);

					this.isJumping = true;
					this.isJumpingTimer = this.scene.time.addEvent({
						delay: 250,
						callback: () => {
							this.isJumping = false;
						}
					});
				}
			} else {
				this.dropShots = dropshots;
			}
		}
	}

	updateEye(ball: Ball) {
		//Move eyePupil
		const dx = this.containerPhysics.x - ball.x();
		const dy = this.containerPhysics.y - ball.y();
		const r = Math.sqrt(dx * dx + dy * dy);
		const max = this.eyeBallRadius - this.eyePupilRadius;
		const x = (r < max) ? dx : dx * max / r;
		const y = (r < max) ? dy : dy * max / r;
		this.eyePupil.setPosition(
			this.eyeBall.x + x * -1,
			this.eyeBall.y + y * -1
		);
	}

	freeze() {
		this.isFrozen = true;
		this.containerPhysics.setIgnoreGravity(true);
		this.containerPhysics.setVelocity(0, 0);
	}

	unfreeze() {
		this.isFrozen = false;
		this.containerPhysics.setIgnoreGravity(false);
	}

	isSmashing(ballX: number): boolean {
		return this.isJumpingForward() && this.isInFrontOfPlayer(ballX);
	}

	isBallBelow(ballY: number): boolean {
		return (
			ballY > this.containerPhysics.y + (this.playerObject.height / 2)
		);
	}

	artificialIntelligenceData(): ArtificialIntelligenceData {
		return {
			key: this.key,
			isHost: this.isHost,
			isMoveReversed: this.isMoveReversed,
			horizontalMoveMultiplier: this.horizontalMoveMultiplier,
			verticalMoveMultiplier: this.verticalMoveMultiplier,
			canJump: this.canJump,
			velocityXOnMove: this.velocityXOnMove,
			velocityYOnJump: this.velocityYOnJump,
		};
	}

	positionData(): PositionData {
		return {
			key: this.key,
			x: this.containerPhysics.x,
			y: this.containerPhysics.y,
			velocityX: this.velocityX(),
			velocityY: this.velocityY(),
			isHost: this.isHost,
			isClient: !this.isHost,
			doingDropShot: this.dropShots,
		};
	}

	artificialIntelligencePositionData(): ArtificialIntelligencePositionData {
		return {
			x: this.containerPhysics.x,
			y: this.containerPhysics.y,
			scale: this.currentScale,
			velocityX: this.velocityX(),
			velocityY: this.velocityY(),
			gravityScale: this.currentGravity,
			width: this.playerObject.width,
			height: this.playerObject.height,
		};
	}

	private init(x: number, y: number) {
		this.initialXLocation = x;
		this.initialYLocation = y;
		this.initialMass = PLAYER_MASS;
		this.currentMass = this.initialMass;
		this.initialGravity = this.gameConfiguration.initialPlayerGravityScale();
		this.currentGravity = this.initialGravity;
		this.velocityXOnMove = this.gameConfiguration.playerXVelocity();
		this.velocityYOnJump = this.gameConfiguration.playerYVelocity();

		//Bonus
		this.horizontalMoveMultiplier = 1;
		this.verticalMoveMultiplier = 1;
		this.initialIsHiddenToHimself = this.gameConfiguration.isHiddenToHimself();
		this.isHiddenToHimself = this.gameConfiguration.isHiddenToHimself();
		this.initialIsHiddenToOpponent = this.gameConfiguration.isHiddenToOpponent();
		this.isHiddenToOpponent = this.gameConfiguration.isHiddenToOpponent();

		this.initialTextureKey = 'shape-' + this.playerShapeFromKey();
		this.currentTextureKey = this.initialTextureKey;
		this.initialShape = this.gameData.getPlayerShapeFromKey(this.key);
		this.currentShape = this.initialShape;

		this.initPlayerPolygon();
		this.applyPlayerPolygon();

		if (this.isHiddenToHimself) {
			//@todo Bonus
			// this.gameBonus.hidePlayingPlayer(this.key);
		}
		if (this.isHiddenToOpponent) {
			//@todo Bonus
			// this.gameBonus.hideFromOpponent(this.key);
		}
	}

	private playerShapeFromKey(): string {
		//Override shape only if game is running and for current player (hidden shape)
		if (
			this.gameConfiguration.overridesCurrentPlayerShape() &&
			this.gameData.isGameStatusStarted() &&
			this.gameData.isCurrentPlayerKey(this.key)
		) {
			return this.gameConfiguration.currentPlayerShape();
		} else {
			return this.gameData.getPlayerShapeFromKey(this.key);
		}
	}

	private initPlayerPolygon() {
		//@todo get rid of PolygonObject and PolygonKey
		this.initialPolygonObject = 'player-' + this.gameData.getPlayerPolygonFromKey(this.key);
		this.currentPolygonObject = this.initialPolygonObject;
		this.initialPolygonKey = this.gameConfiguration.initialPlayerPolygonKey();
		this.currentPolygonKey = this.initialPolygonKey;
		this.initialScale = this.gameConfiguration.initialPlayerScale();
		this.currentScale = this.initialScale;
		this.containerPhysics.setScale(this.initialScale);
	}

	private applyPlayerPolygon() {
		this.initBody();
		this.setupBody();
		this.initEye();
	}

	private initBody() {
		const x = this.containerPhysics.x;
		const y = this.containerPhysics.y;
		const bodies = [];
		const counterweights = [];
		const sensors = [];

		const matterFromPath = this.scene.matter.verts.fromPath;
		const matterFromVertices = this.matter().Bodies.fromVertices;
		const matterRectangle = this.matter().Bodies.rectangle;
		const matterCircle = this.matter().Bodies.circle;
		switch (this.currentShape) {
			case PLAYER_SHAPE_HALF_CIRCLE:
				bodies.push(matterFromVertices(x, y, matterFromPath('0 49 0 35 9 20 12 17.5 24 6 40 0 49 0 58 0 74 6 86 17.5 89 20 98 35 98 49')));
				counterweights.push(matterFromVertices(x, y - 16, matterFromPath('12 20 12 17.5 24 6 40 0 49 0 58 0 74 6 86 17.5 86 20')));
				sensors.push(matterRectangle(x, y + 20, 98, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_TRIANGLE:
				bodies.push(matterFromVertices(x, y, matterFromPath('0 49 49 0 98 49')));
				counterweights.push(matterFromVertices(x, y - 12, matterFromPath('25 23 49 0 73 23 49 35')));
				counterweights.push(matterFromVertices(x, y - 12, matterFromPath('25 23 49 0 73 23 49 35')));
				counterweights.push(matterFromVertices(x, y - 12, matterFromPath('25 23 49 0 73 23 49 35')));
				sensors.push(matterRectangle(x, y + 17, 98, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_X:
				bodies.push(matterFromVertices(x, y, matterFromPath('0 49 0 39 83 0 98 0 98 10 15 49')));
				bodies.push(matterFromVertices(x, y, matterFromPath('0 10 0 0 15 0 98 39 98 49 83 49')));
				sensors.push(matterRectangle(x - 39, y + 24, 20, 2, { isSensor: true }));
				sensors.push(matterRectangle(x, y + 15, 35, 10, { isSensor: true }));
				sensors.push(matterRectangle(x + 39, y + 24, 20, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_RECTANGLE:
				bodies.push(matterRectangle(x, y, 98, 49));
				sensors.push(matterRectangle(x, y + 24, 98, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_HYPHEN:
				bodies.push(matterRectangle(x, y, 48, 11));
				sensors.push(matterRectangle(x, y + 6, 48, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_OBELISK:
				bodies.push(matterRectangle(x, y, 11, 48));
				sensors.push(matterRectangle(x, y + 24, 11, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_EQUAL:
				bodies.push(matterRectangle(x, y - 18, 98, 13));
				bodies.push(matterRectangle(x, y + 20, 98, 13));
				sensors.push(matterRectangle(x, y + 26, 98, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_MAGNET:
				bodies.push(matterRectangle(x + 12.25, y - 18, 73.5, 13));
				bodies.push(matterRectangle(x + 12.25, y + 20, 73.5, 13));
				bodies.push(matterFromVertices(x - 35, y, matterFromPath('0 33 0 16 24.5 0 24.5 49')));
				sensors.push(matterCircle(x - 37, y + 17, 8, { isSensor: true }));
				sensors.push(matterRectangle(x + 12.25, y + 26, 73.5, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_CROWN:
				bodies.push(matterFromVertices(x - 38, y, matterFromPath('0 49 0 0 24.5 24.5 24.5 49')));
				bodies.push(matterFromVertices(x, y, matterFromPath('24.5 49 24.5 24.5 49 0 73.5 24.5 73.5 49')));
				bodies.push(matterFromVertices(x + 38, y, matterFromPath('73.5 24.5 98 0 98 49 73.5 49')));
				bodies.push(matterFromVertices(x + 41, y - 14, matterFromPath('73.5 24.5 98 0 98 24.5 73.5 24.5')));
				bodies.push(matterRectangle(x - 24, y + 8, 5, 20));
				bodies.push(matterRectangle(x + 24, y + 8, 5, 20));
				counterweights.push(matterFromVertices(x - 41, y - 14, matterFromPath('0 24.5 0 0 24.5 24.5 24.5 24.5')));
				counterweights.push(matterFromVertices(x, y - 14, matterFromPath('24.5 24.5 24.5 24.5 49 0 73.5 24.5 73.5 24.5')));
				counterweights.push(matterFromVertices(x, y - 14, matterFromPath('24.5 24.5 24.5 24.5 49 0 73.5 24.5 73.5 24.5')));
				sensors.push(matterRectangle(x, y + 19, 98, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_RHOMBUS:
				bodies.push(matterFromVertices(x, y, matterFromPath('0 24.5 49 0 98 24.5 49 49')));
				sensors.push(matterCircle(x - 25, y + 12.5, 8, { isSensor: true }));
				sensors.push(matterRectangle(x, y + 23, 10, 5, { isSensor: true }));
				sensors.push(matterCircle(x + 25, y + 12.5, 8, { isSensor: true }));
				break;
			case PLAYER_SHAPE_HEXAGON:
				bodies.push(matterFromVertices(x, y, matterFromPath('24.5 49 0 24.5 24.5 0 73.5 0 98 24.5 73.5 49')));
				sensors.push(matterCircle(x - 35, y + 12.5, 8, { isSensor: true }));
				sensors.push(matterRectangle(x, y + 24, 49, 2, { isSensor: true }));
				sensors.push(matterCircle(x + 35, y + 12.5, 8, { isSensor: true }));
				break;
			case PLAYER_SHAPE_DOT:
				bodies.push(matterCircle(x, y, 24.5));
				sensors.push(matterRectangle(x, y + 24, 28, 5, { isSensor: true }));
				break;
			case PLAYER_SHAPE_ELLIPSE:
				bodies.push(matterFromVertices(x, y, matterFromPath('0 24.5 7.5 11 15 7 32 1.5 49 0 66 1.5 83 7 90.5 11 98 24.5 90.5 38 83 42 66 47.5 49 49 32 47.5 15 42 7.5 38')));
				counterweights.push(matterFromVertices(x, y - 18, matterFromPath('7.5 11 15 7 32 1.5 49 0 66 1.5 83 7 90.5 11')));
				sensors.push(matterRectangle(x, y + 21, 80, 10, { isSensor: true }));
				break;
			case PLAYER_SHAPE_TRIPLE_COLON:
				bodies.push(matterRectangle(x - 42.5, y - 18, 13, 13));
				bodies.push(matterRectangle(x - 42.5, y + 20, 13, 13));
				bodies.push(matterRectangle(x, y - 18, 13, 13));
				bodies.push(matterRectangle(x, y + 20, 13, 13));
				bodies.push(matterRectangle(x + 42.5, y - 18, 13, 13));
				bodies.push(matterRectangle(x + 42.5, y + 20, 13, 13));
				counterweights.push(matterRectangle(x - 42.5, y - 18, 13, 4));
				counterweights.push(matterRectangle(x, y - 18, 13, 4));
				counterweights.push(matterRectangle(x + 42.5, y - 18, 13, 4));
				sensors.push(matterRectangle(x - 42.5, y + 25, 13, 5, { isSensor: true }));
				sensors.push(matterRectangle(x, y + 25, 13, 5, { isSensor: true }));
				sensors.push(matterRectangle(x + 42.5, y + 25, 13, 5, { isSensor: true }));
				break;
		}

		this.containerPhysics.setExistingBody(
			this.matter().Body.create({
				parts: bodies.concat(counterweights, sensors)
			})
		);

		this.sensors = sensors;
	}

	private setupBody() {
		this.playerObject.setTexture(this.currentTextureKey);
		this.containerPhysics.setFixedRotation();
		this.containerPhysics.setIgnoreGravity(this.isFrozen);
		this.containerPhysics.setFriction(0, 0, 0);
		this.containerPhysics.setMass(this.currentMass);

		const collisionCategory = this.isHost ? this.level.collisionCategoryHost : this.level.collisionCategoryClient;
		const collisionLimit = this.isHost ? this.level.collisionCategoryHostLimit : this.level.collisionCategoryClientLimit;
		this.containerPhysics.setCollisionCategory(collisionCategory);
		this.containerPhysics.setCollidesWith([
			collisionCategory,
			collisionLimit,
			this.level.collisionCategoryBall,
			this.level.collisionCategoryBonus,
		]);
	}

	private initEye() {
		let eyeBallXOffset;
		let eyeBallYOffset;
		let eyeBallRadius;
		let eyePupilRadius;

		switch (this.currentShape) {
			case PLAYER_SHAPE_HALF_CIRCLE:
				eyeBallXOffset = 26.5;
				eyeBallYOffset = -2;
				eyeBallRadius = 7.5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_TRIANGLE:
				eyeBallXOffset = 15;
				eyeBallYOffset = 5;
				eyeBallRadius = 7.5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_X:
				eyeBallXOffset = 28;
				eyeBallYOffset = -14;
				eyeBallRadius = 6.25;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_RECTANGLE:
				eyeBallXOffset = 34;
				eyeBallYOffset = -11;
				eyeBallRadius = 7.5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_HYPHEN:
				eyeBallXOffset = 14;
				eyeBallYOffset = -0.5;
				eyeBallRadius = 4;
				eyePupilRadius = 2;
				break;
			case PLAYER_SHAPE_OBELISK:
				eyeBallXOffset = 0;
				eyeBallYOffset = -15;
				eyeBallRadius = 4;
				eyePupilRadius = 2;
				break;
			case PLAYER_SHAPE_EQUAL:
				eyeBallXOffset = 28;
				eyeBallYOffset = -18.5;
				eyeBallRadius = 5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_MAGNET:
				eyeBallXOffset = 28;
				eyeBallYOffset = -18.5;
				eyeBallRadius = 5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_CROWN:
				eyeBallXOffset = 38;
				eyeBallYOffset = 0;
				eyeBallRadius = 7.5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_RHOMBUS:
				eyeBallXOffset = 19;
				eyeBallYOffset = -3;
				eyeBallRadius = 7.5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_HEXAGON:
				eyeBallXOffset = 26.5;
				eyeBallYOffset = -7;
				eyeBallRadius = 7.5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_DOT:
				eyeBallXOffset = 11;
				eyeBallYOffset = -6;
				eyeBallRadius = 7.5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_ELLIPSE:
				eyeBallXOffset = 26.5;
				eyeBallYOffset = -9;
				eyeBallRadius = 7.5;
				eyePupilRadius = 2.5;
				break;
			case PLAYER_SHAPE_TRIPLE_COLON:
				eyeBallXOffset = 42.5;
				eyeBallYOffset = -18.5;
				eyeBallRadius = 5;
				eyePupilRadius = 2.5;
				break;
		}

		this.eyeBallXOffset = (this.isHost ? 1 : -1) * eyeBallXOffset;
		this.eyeBallYOffset = eyeBallYOffset;
		this.eyeBallRadius = eyeBallRadius;
		this.eyePupilRadius = eyePupilRadius;

		this.eyeBall = this.scene.add.graphics(
			{
				x: this.eyeBallXOffset,
				y: this.eyeBallYOffset
			}
		);
		this.eyeBall.fillStyle(0xffffff, 1);
		this.eyeBall.lineStyle(1, 0x363636);
		this.eyeBall.strokeCircle(
			0,
			0,
			this.eyeBallRadius
		);
		this.eyeBall.fillCircle(
			0,
			0,
			this.eyeBallRadius
		);

		this.eyePupil = this.scene.add.graphics(
			{
				x: this.eyeBallXOffset,
				y: this.eyeBallYOffset
			}
		);
		this.eyePupil.fillStyle(0x363636, 1);
		this.eyePupil.fillCircle(
			0,
			0,
			this.eyePupilRadius
		);

		this.container.add(this.eyeBall);
		this.container.add(this.eyePupil);
	}

	private onCollide({bodyA, bodyB}) {
		for (let sensor of this.sensors) {
			if (
				bodyA === sensor &&
				(
					bodyB === this.level.hostGround() ||
					bodyB === this.level.clientGround() ||
					(bodyB.gameObject && bodyB.gameObject.getData('isHost') === this.isHost)
				)
			) {
				this.hasBottomTouching = true;
			}
		}
	}

	private isJumpingForward(): boolean {
		return (
			Math.round(this.velocityY()) < 0 &&
			!this.hasBottomTouching &&
			(
				(this.isHost && Math.round(this.velocityX()) > 0) ||
				(!this.isHost && Math.round(this.velocityX()) < 0)
			)
		);
	}

	private isInFrontOfPlayer(ballX: number): boolean {
		return (
			(this.isHost && this.containerPhysics.x < ballX) ||
			(!this.isHost && ballX < this.containerPhysics.x)
		);
	}

	private matter(): any {
		const matter = <any>Phaser.Physics.Matter;

		return matter.Matter;
	}

	private velocityX(): number {
		const body = <any>this.containerPhysics.body;

		return body.velocity.x;
	}

	private velocityY(): number {
		const body = <any>this.containerPhysics.body;

		return body.velocity.y;
	}
}
