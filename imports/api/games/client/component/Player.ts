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
import Ball from "./Ball";
import Level from "./Level";
import {ArtificialIntelligenceData} from "../../artificialIntelligence/ArtificialIntelligenceData";
import {ArtificialIntelligencePositionData} from "../../artificialIntelligence/ArtificialIntelligencePositionData";
import {PositionData} from "./PositionData";
import Animations from "./Animations";
import Interpolation from "./Interpolation";
import ServerNormalizedTime from "../ServerNormalizedTime";

export default class Player {
	scene: MainScene;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	serverNormalizedTime: ServerNormalizedTime;
	animations: Animations;
	level: Level;
	key: string;
	color: string;
	isHost: boolean;
	interpolation: Interpolation;

	container: Phaser.GameObjects.Container | any;
	containerPhysics: Phaser.Physics.Matter.MatterPhysics | any;
	playerObject: Phaser.GameObjects.Image;

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
	initialShape: string;
	currentShape: string;
	initialTextureKey: string;
	currentTextureKey: string;
	initialScale: number;
	currentScale: number;
	initialIsHiddenToHimself: boolean;
	isHiddenToHimself: boolean;
	initialIsHiddenToOpponent: boolean;
	isHiddenToOpponent: boolean;

	lastBallHit: number = 0;
	numberBallHits: number = 0;
	isInvincible: boolean = false;
	canActivateBonuses: boolean = true;
	killed: boolean = false;
	killing: boolean = false;

	private sensorsJump: any[] = [];
	private sensorsBall: any[] = [];
	private hasBottomTouchingGround: boolean = false;
	private hasBottomTouchingPlayer: boolean = false;
	private hasBottomTouchingBall: boolean = false;
	private isJumping: boolean = false;
	private isJumpingTimer;

	constructor(
		scene: MainScene,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		serverNormalizedTime: ServerNormalizedTime,
		animations: Animations,
		level: Level,
		key: string,
		color: string,
		isHost: boolean
	) {
		this.scene = scene;
		this.gameConfiguration = gameConfiguration;
		this.gameData = gameData;
		this.serverNormalizedTime = serverNormalizedTime;
		this.animations = animations;
		this.level = level;
		this.key = key;
		this.color = color;
		this.isHost = isHost;

		this.interpolation = new Interpolation(
			this.scene,
			this.serverNormalizedTime
		);

		this.scene.eventEmitter.on('beforebeforeupdate', () => {
			this.hasBottomTouchingGround = false;
			this.hasBottomTouchingBall = false;
			this.hasBottomTouchingPlayer = false;
		}, this);
		this.scene.eventEmitter.on('beforecollisionstart', this.onCollide, this);
		this.scene.eventEmitter.on('beforecollisionactive', this.onCollide, this);
		this.scene.eventEmitter.on('beforecollisionend', this.onCollide, this);

		this.init();
	}

	reset() {
		if (this.killed) {
			this.killed = false;
			this.init();
		}

		this.resetBallHits();
		this.resetPosition();
	}

	resetBallHits() {
		this.numberBallHits = 0;
	}

	interpolate(data: any) {
		if (this.killed) {
			return;
		}

		this.interpolation.interpolateMoveTo(
			this.containerPhysics,
			data,
			() => this.gameIsOnGoing(),
			false
		);
	}

	move(movesLeft: boolean, movesRight: boolean, jumps: boolean, dropshots: boolean) {
		if (this.killed) {
			return;
		}

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

			if (this.hasBottomTouchingJumpable() && !this.isJumping) {
				if (this.alwaysJump || (jumps && this.canJump)) {
					const verticalMoveMultiplier = this.verticalMoveMultiplier;

					this.containerPhysics.setVelocityY(
						verticalMoveMultiplier * -this.velocityYOnJump *
						this.initialMass / this.currentMass
					);

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
		if (this.killed) {
			return;
		}

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
		if (this.killed) {
			return;
		}

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

	isBottomTouchingBall(): boolean {
		return this.hasBottomTouchingBall;
	}

	hideFromHimself() {
		this.isHiddenToHimself = true;

		if (!this.gameData.isUserViewer()) {
			if (this.gameData.isCurrentPlayerKey(this.key)) {
				//Target player cannot see himself
				this.container.setAlpha(0);
			} else if (!this.isHiddenToOpponent) {
				//Opponent see transparent if he can see
				this.container.setAlpha(0.5);
			}
		} else {
			//Viewers always see transparent
			this.container.setAlpha(0.5);
		}
	}

	showToHimself() {
		this.isHiddenToHimself = this.initialIsHiddenToHimself;

		if (this.isHiddenToHimself) {
			return;
		}

		if (this.isHiddenToOpponent) {
			if (
				this.gameData.isCurrentPlayerKey(this.key) ||
				this.gameData.isUserViewer()
			) {
				this.container.setAlpha(0.5);
			}
		} else {
			this.container.setAlpha(1);
		}
	}

	hideFromOpponent() {
		this.isHiddenToOpponent = true;

		if (!this.gameData.isUserViewer()) {
			if (!this.gameData.isCurrentPlayerKey(this.key)) {
				//Opponent cannot see player
				this.container.setAlpha(0);
			} else if (!this.isHiddenToHimself) {
				//Bonus player see himself transparent if not hidden to himself
				this.container.setAlpha(0.5);
			}
		} else {
			//Viewers always see transparent
			this.container.setAlpha(0.5);
		}
	}

	showToOpponent() {
		this.isHiddenToOpponent = this.initialIsHiddenToOpponent;

		if (this.isHiddenToOpponent) {
			return;
		}

		if (this.isHiddenToHimself) {
			if (!this.gameData.isCurrentPlayerKey(this.key)) {
				this.container.setAlpha(0.5);
			}
		} else {
			this.container.setAlpha(1);
		}
	}

	kill() {
		const killedImage = this.scene.add.image(0, 0, this.currentTextureKey);
		killedImage.setTint(Phaser.Display.Color.ValueToColor(this.color).color);
		const eyeBall = this.createEyeBall();
		const eyePupil = this.createEyePupil();

		const killingContainer = this.scene.add.container(
			this.containerPhysics.x,
			this.containerPhysics.y,
			[
				killedImage,
				eyeBall,
				eyePupil,
			]
		);
		killingContainer.setScale(this.currentScale);
		this.animations.disappear(
			killingContainer,
			() => {
				if (killingContainer) {
					killingContainer.destroy();
				}
			}
		);

		this.container.destroy();
		this.killed = true;
	}

	revive() {
		this.reset();
	}

	scaleSmall() {
		this.currentScale = this.gameConfiguration.smallPlayerScale();
		this.currentMass = this.gameConfiguration.smallPlayerMass();
		this.applyScale();
	}

	scaleBig() {
		this.currentScale = this.gameConfiguration.bigPlayerScale();
		this.currentMass = this.gameConfiguration.bigPlayerMass();
		this.applyScale();
	}

	resetScale() {
		this.currentScale = this.initialScale;
		this.currentMass = this.initialMass;
		this.applyScale();
	}

	shiftShape(shape: string) {
		if (
			this.gameConfiguration.overridesCurrentPlayerShape() &&
			this.gameData.isCurrentPlayerKey(this.key)
		) {
			this.currentTextureKey = 'shape-' + this.gameConfiguration.currentPlayerShape();
		} else {
			this.currentTextureKey = 'shape-' + shape;
		}
		this.currentShape = shape;
		this.initBody();
	}

	resetShape() {
		this.shiftShape(this.initialShape);
	}

	artificialIntelligenceData(): ArtificialIntelligenceData {
		return {
			key: this.key,
			isHost: this.isHost,
			gravity: this.scene.matter.world.engine.gravity.y,
			isMoveReversed: this.isMoveReversed,
			horizontalMoveMultiplier: this.horizontalMoveMultiplier,
			verticalMoveMultiplier: this.verticalMoveMultiplier,
			canJump: this.canJump,
			velocityXOnMove: this.velocityXOnMove,
			velocityYOnJump: this.velocityYOnJump,
			initialMass: this.initialMass,
			currentMass: this.currentMass,
		};
	}

	positionData(): PositionData {
		if (this.killed) {
			return {
				key: this.key,
				killed: true,
				isHost: this.isHost,
				isClient: !this.isHost,
			};
		}

		return {
			key: this.key,
			killed: false,
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
			width: this.playerObject.width,
			height: this.playerObject.height,
		};
	}

	private init() {
		const x = this.gameConfiguration.playerInitialXFromKey(this.key, this.isHost);
		const y = this.gameConfiguration.playerInitialY();

		this.initialXLocation = x;
		this.initialYLocation = y;
		this.initialScale = this.gameConfiguration.initialPlayerScale();
		this.currentScale = this.initialScale;
		this.initialMass = this.gameConfiguration.initialPlayerMass();
		this.currentMass = this.initialMass;
		this.velocityXOnMove = this.gameConfiguration.playerXVelocity();
		this.velocityYOnJump = this.gameConfiguration.playerYVelocity();

		//Bonus
		this.horizontalMoveMultiplier = this.gameConfiguration.initialHorizontalMoveMultiplier();
		this.verticalMoveMultiplier = this.gameConfiguration.initialVerticalMoveMultiplier();
		this.initialIsHiddenToHimself = this.gameConfiguration.isHiddenToHimself();
		this.isHiddenToHimself = this.gameConfiguration.isHiddenToHimself();
		this.initialIsHiddenToOpponent = this.gameConfiguration.isHiddenToOpponent();
		this.isHiddenToOpponent = this.gameConfiguration.isHiddenToOpponent();

		this.initialTextureKey = 'shape-' + this.playerShapeFromKey();
		this.currentTextureKey = this.initialTextureKey;
		this.initialShape = this.gameData.getPlayerShapeFromKey(this.key);
		this.currentShape = this.initialShape;

		let shapeKey = this.playerShapeFromKey();

		//Create components
		this.container = this.scene.add.container(x, y);

		this.containerPhysics = this.scene.matter.add.gameObject(this.container);
		this.containerPhysics.setDataEnabled();
		this.containerPhysics.setData('owner', this);
		this.containerPhysics.setData('isPlayer', true);
		this.containerPhysics.setData('isHost', this.isHost);

		this.playerObject = this.scene.add.image(0, 0, 'shape-' + shapeKey);
		this.playerObject.setTint(Phaser.Display.Color.ValueToColor(this.color).color);

		this.container.add(this.playerObject);

		this.initBody();

		if (this.isHiddenToHimself) {
			this.hideFromHimself();
		}
		if (this.isHiddenToOpponent) {
			this.hideFromOpponent();
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

	private initBody() {
		this.container.setScale(1);
		this.initBodyShape();
		this.setupBody();
		this.initEye();
		this.container.setScale(this.currentScale);
		this.container.setFixedRotation();
	}

	private initBodyShape() {
		const x = this.containerPhysics.x;
		const y = this.containerPhysics.y;
		const bodies = [];
		const counterweights = [];
		let sensorsBottom = [];
		let sensorsBall = [];

		const matterFromPath = this.scene.matter.verts.fromPath;
		const matterFromVertices = this.matter().Bodies.fromVertices;
		const matterRectangle = this.matter().Bodies.rectangle;
		const matterCircle = this.matter().Bodies.circle;
		switch (this.currentShape) {
			case PLAYER_SHAPE_HALF_CIRCLE:
				bodies.push(matterFromVertices(x, y, matterFromPath('0 49 0 35 9 20 12 17.5 24 6 40 0 49 0 58 0 74 6 86 17.5 89 20 98 35 98 49')));
				counterweights.push(matterFromVertices(x, y - 16, matterFromPath('12 20 12 17.5 24 6 40 0 49 0 58 0 74 6 86 17.5 86 20'), { isSensor: true }));
				sensorsBottom.push(matterRectangle(x, y + 21, 98, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_TRIANGLE:
				bodies.push(matterFromVertices(x, y, matterFromPath('0 49 49 0 98 49')));
				counterweights.push(matterFromVertices(x, y - 12, matterFromPath('25 23 49 0 73 23 49 35'), { isSensor: true }));
				counterweights.push(matterFromVertices(x, y - 12, matterFromPath('25 23 49 0 73 23 49 35'), { isSensor: true }));
				counterweights.push(matterFromVertices(x, y - 12, matterFromPath('25 23 49 0 73 23 49 35'), { isSensor: true }));
				counterweights.push(matterFromVertices(x, y - 12, matterFromPath('25 23 49 0 73 23 49 35'), { isSensor: true }));
				counterweights.push(matterFromVertices(x, y - 12, matterFromPath('25 23 49 0 73 23 49 35'), { isSensor: true }));
				sensorsBottom.push(matterRectangle(x, y + 17, 98, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_X:
				bodies.push(matterFromVertices(x, y, matterFromPath('0 49 0 39 83 0 98 0 98 10 15 49')));
				bodies.push(matterFromVertices(x, y, matterFromPath('0 10 0 0 15 0 98 39 98 49 83 49')));
				counterweights.push(matterRectangle(x - 40, y - 20, 13, 8, { isSensor: true }));
				counterweights.push(matterRectangle(x - 40, y - 20, 13, 8, { isSensor: true }));
				counterweights.push(matterRectangle(x + 40, y - 20, 13, 8, { isSensor: true }));
				counterweights.push(matterRectangle(x + 40, y - 20, 13, 8, { isSensor: true }));
				sensorsBall.push(matterFromVertices(x - 32, y - 6, matterFromPath('0 10 30 24 30 28 0 13'), { isSensor: true }));
				sensorsBall.push(matterFromVertices(x + 32, y - 6, matterFromPath('98 10 68 24 68 28 98 13'), { isSensor: true }));
				sensorsBottom.push(matterRectangle(x - 39, y + 25, 20, 2, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x - 24, y + 20, 14, 10, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x, y + 15, 35, 10, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x + 24, y + 20, 14, 10, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x + 39, y + 25, 20, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_RECTANGLE:
				bodies.push(matterRectangle(x, y, 98, 49));
				sensorsBottom.push(matterRectangle(x, y + 25, 98, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_HYPHEN:
				bodies.push(matterRectangle(x, y, 48, 11));
				sensorsBottom.push(matterRectangle(x, y + 6, 48, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_OBELISK:
				bodies.push(matterRectangle(x, y, 11, 48));
				counterweights.push(matterRectangle(x, y - 12, 9, 2, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x, y + 25, 11, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_EQUAL:
				bodies.push(matterRectangle(x, y - 22, 98, 13));
				bodies.push(matterRectangle(x, y + 13, 98, 13));
				counterweights.push(matterRectangle(x, y - 19, 98, 2, { isSensor: true }));
				sensorsBall.push(matterRectangle(x, y - 4, 94, 30, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x, y + 20, 98, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_MAGNET:
				bodies.push(matterRectangle(x + 12.25, y - 19, 73.5, 13));
				bodies.push(matterRectangle(x + 12.25, y + 17, 73.5, 13));
				bodies.push(matterFromVertices(x - 35, y - 1, matterFromPath('0 33 0 12 24.5 0 24.5 49')));
				counterweights.push(matterRectangle(x - 25, y, 24.5, 20, { isSensor: true }));
				sensorsBall.push(matterRectangle(x + 10, y - 4, 72, 30, { isSensor: true }));
				sensorsBottom.push(matterCircle(x - 37, y + 17, 8, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x + 12.25, y + 24, 73.5, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_CROWN:
				bodies.push(matterFromVertices(x - 38, y, matterFromPath('0 49 0 0 24.5 24.5 24.5 49')));
				bodies.push(matterFromVertices(x, y, matterFromPath('24.5 49 24.5 24.5 49 0 73.5 24.5 73.5 49')));
				bodies.push(matterFromVertices(x + 38, y, matterFromPath('73.5 24.5 98 0 98 49 73.5 49')));
				bodies.push(matterFromVertices(x + 41, y - 14, matterFromPath('73.5 24.5 98 0 98 24.5 73.5 24.5')));
				bodies.push(matterRectangle(x - 24, y + 8, 5, 20));
				bodies.push(matterRectangle(x + 24, y + 8, 5, 20));
				counterweights.push(matterFromVertices(x - 41, y - 14, matterFromPath('0 24.5 0 0 24.5 24.5 24.5 24.5'), { isSensor: true }));
				counterweights.push(matterFromVertices(x, y - 14, matterFromPath('24.5 24.5 24.5 24.5 49 0 73.5 24.5 73.5 24.5'), { isSensor: true }));
				counterweights.push(matterFromVertices(x, y - 14, matterFromPath('24.5 24.5 24.5 24.5 49 0 73.5 24.5 73.5 24.5'), { isSensor: true }));
				counterweights.push(matterFromVertices(x, y - 14, matterFromPath('24.5 24.5 24.5 24.5 49 0 73.5 24.5 73.5 24.5'), { isSensor: true }));
				sensorsBottom.push(matterRectangle(x, y + 19, 98, 2, { isSensor: true }));
				break;
			case PLAYER_SHAPE_RHOMBUS:
				bodies.push(matterFromVertices(x, y, matterFromPath('0 24.5 49 0 98 24.5 49 49')));
				sensorsBottom.push(matterCircle(x - 25, y + 12.5, 8, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x, y + 23, 10, 2, { isSensor: true }));
				sensorsBottom.push(matterCircle(x + 25, y + 12.5, 8, { isSensor: true }));
				break;
			case PLAYER_SHAPE_HEXAGON:
				bodies.push(matterFromVertices(x, y, matterFromPath('24.5 49 0 24.5 24.5 0 73.5 0 98 24.5 73.5 49')));
				sensorsBottom.push(matterCircle(x - 35, y + 12.5, 8, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x, y + 24, 49, 2, { isSensor: true }));
				sensorsBottom.push(matterCircle(x + 35, y + 12.5, 8, { isSensor: true }));
				break;
			case PLAYER_SHAPE_DOT:
				bodies.push(matterCircle(x, y, 24.5));
				counterweights.push(matterRectangle(x, y - 16, 16, 8, { isSensor: true }));
				counterweights.push(matterRectangle(x, y - 16, 16, 8, { isSensor: true }));
				counterweights.push(matterRectangle(x, y - 16, 16, 8, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x - 18.25, y + 8, 12.5, 24.5, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x, y + 24, 28, 6, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x + 18.25, y + 8, 12.5, 24.5, { isSensor: true }));
				break;
			case PLAYER_SHAPE_ELLIPSE:
				bodies.push(matterFromVertices(x, y, matterFromPath('0 24.5 7.5 11 15 7 32 1.5 49 0 66 1.5 83 7 90.5 11 98 24.5 90.5 38 83 42 66 47.5 49 49 32 47.5 15 42 7.5 38')));
				counterweights.push(matterFromVertices(x, y - 18, matterFromPath('7.5 11 15 7 32 1.5 49 0 66 1.5 83 7 90.5 11'), { isSensor: true }));
				sensorsBottom.push(matterRectangle(x - 42, y + 9, 12, 17, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x, y + 22, 80, 8, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x + 42, y + 9, 12, 17, { isSensor: true }));
				break;
			case PLAYER_SHAPE_TRIPLE_COLON:
				bodies.push(matterRectangle(x - 42.5, y - 22, 13, 13));
				bodies.push(matterRectangle(x - 42.5, y + 14, 13, 13));
				bodies.push(matterRectangle(x, y - 22, 13, 13));
				bodies.push(matterRectangle(x, y + 14, 13, 13));
				bodies.push(matterRectangle(x + 42.5, y - 22, 13, 13));
				bodies.push(matterRectangle(x + 42.5, y + 14, 13, 13));
				counterweights.push(matterRectangle(x - 42.5, y - 18, 13, 2, { isSensor: true }));
				counterweights.push(matterRectangle(x, y - 18, 13, 2, { isSensor: true }));
				counterweights.push(matterRectangle(x + 42.5, y - 18, 13, 2, { isSensor: true }));
				sensorsBall.push(matterRectangle(x - 42.5, y - 15, 13, 2, { isSensor: true }));
				sensorsBall.push(matterRectangle(x, y - 15, 13, 2, { isSensor: true }));
				sensorsBall.push(matterRectangle(x + 42.5, y - 15, 13, 2, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x - 42.5, y + 21, 13, 2, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x, y + 21, 13, 2, { isSensor: true }));
				sensorsBottom.push(matterRectangle(x + 42.5, y + 21, 13, 2, { isSensor: true }));
				break;
		}

		this.containerPhysics.setExistingBody(
			this.matter().Body.create({
				parts: [].concat(sensorsBottom, sensorsBall, bodies, counterweights)
			})
		);

		this.sensorsJump = sensorsBottom;
		this.sensorsBall = sensorsBall.concat(sensorsBottom);
	}

	private setupBody() {
		this.playerObject.setTexture(this.currentTextureKey);
		this.containerPhysics.setIgnoreGravity(this.isFrozen);
		this.containerPhysics.setFriction(0, 0, 0);
		this.containerPhysics.setMass(this.currentMass);
		this.containerPhysics.setFixedRotation();

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

		if (this.eyeBall) {
			this.eyeBall.destroy();
		}
		this.eyeBall = this.createEyeBall();
		if (this.eyePupil) {
			this.eyePupil.destroy();
		}
		this.eyePupil = this.createEyePupil();

		this.container.add(this.eyeBall);
		this.container.add(this.eyePupil);
	}

	private createEyeBall(): Phaser.GameObjects.Graphics {
		const eyeBall = this.scene.add.graphics(
			{
				x: this.eyeBallXOffset,
				y: this.eyeBallYOffset
			}
		);
		eyeBall.fillStyle(0xffffff, 1);
		eyeBall.lineStyle(1, 0x363636);
		eyeBall.strokeCircle(
			0,
			0,
			this.eyeBallRadius
		);
		eyeBall.fillCircle(
			0,
			0,
			this.eyeBallRadius
		);

		return eyeBall;
	}

	private createEyePupil(): Phaser.GameObjects.Graphics {
		const eyePupil = this.scene.add.graphics(
			{
				x: this.eyeBallXOffset,
				y: this.eyeBallYOffset
			}
		);
		eyePupil.fillStyle(0x363636, 1);
		eyePupil.fillCircle(
			0,
			0,
			this.eyePupilRadius
		);

		return eyePupil;
	}

	private resetPosition() {
		this.containerPhysics.setVelocity(0, 0);
		this.containerPhysics.setX(this.initialXLocation);
		this.containerPhysics.setY(this.initialYLocation);
	}

	private onCollide({bodyA, bodyB}) {
		for (let sensor of this.sensorsJump) {
			if (bodyA === sensor) {
				if (bodyB === this.level.hostGround() || bodyB === this.level.clientGround()) {
					this.hasBottomTouchingGround = true;
				}
				if (bodyB.gameObject && bodyB.gameObject.getData('isHost') === this.isHost) {
					this.hasBottomTouchingPlayer = true;
				}
			}
		}

		for (let sensor of this.sensorsBall) {
			if (bodyA === sensor) {
				if (bodyB.gameObject && bodyB.gameObject.getData('isBall')) {
					this.hasBottomTouchingBall = true;
				}
			}
		}
	}

	private hasBottomTouchingJumpable(): boolean {
		return this.hasBottomTouchingGround || this.hasBottomTouchingPlayer;
	}

	private isJumpingForward(): boolean {
		return (
			Math.round(this.velocityY()) < 0 &&
			!this.hasBottomTouchingJumpable() &&
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

	private applyScale() {
		this.container.setScale(this.currentScale);
		this.containerPhysics.setMass(this.currentMass);
		this.containerPhysics.setFixedRotation();
	}

	private gameIsOnGoing(): boolean {
		return this.gameData.isGameStatusStarted();
	}
}
