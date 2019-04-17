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
import {DEPTH_ACTIVATION_ANIMATION, DEPTH_ALL} from "../../constants";

export default class Player {
	scene: MainScene;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	serverNormalizedTime: ServerNormalizedTime;
	animations: Animations;
	level: Level;
	key: string;
	isHost: boolean;
	color: string;
	interpolation: Interpolation;

	container: Phaser.Group;
	playerObject: Phaser.Sprite;

	eyeBall: Phaser.Graphics;
	eyePupil: Phaser.Graphics;
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
	initialGravityScale: number;
	currentGravityScale: number;
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
	stopped: boolean = false;

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
		isHost: boolean,
		color?: string
	) {
		this.scene = scene;
		this.gameConfiguration = gameConfiguration;
		this.gameData = gameData;
		this.serverNormalizedTime = serverNormalizedTime;
		this.animations = animations;
		this.level = level;
		this.key = key;
		this.isHost = isHost;
		this.color = color;

		this.interpolation = new Interpolation(
			this.scene,
			this.serverNormalizedTime
		);

		this.init();
	}

	reset() {
		if (this.killed) {
			this.killed = false;
			this.init();
		}

		this.resetBallHits();
		this.resetPosition();

		this.scene.sortWorldComponents();
	}

	resetBallHits() {
		this.numberBallHits = 0;
	}

	interpolate(data: any) {
		if (this.killed) {
			return;
		}

		this.interpolation.interpolateMoveTo(
			this.playerObject,
			data,
			() => this.gameIsOnGoing(),
			true
		);
	}

	move(movesLeft: boolean, movesRight: boolean, jumps: boolean, dropshots: boolean) {
		if (this.killed) {
			return;
		}

		this.dropShots = false;

		if (this.isFrozen) {
			this.playerObject.body.setZeroVelocity();
		} else {
			const horizontalMoveMultiplier = this.horizontalMoveMultiplier;
			const moveReversal = (this.isMoveReversed ? -1 : 1);

			if (movesLeft) {
				this.playerObject.body.velocity.x = horizontalMoveMultiplier * moveReversal * -this.velocityXOnMove;
			} else if (movesRight) {
				this.playerObject.body.velocity.x = horizontalMoveMultiplier * moveReversal * this.velocityXOnMove;
			} else {
				this.playerObject.body.velocity.x = 0;
			}

			if (this.hasBottomTouchingJumpable() && !this.isJumping) {
				if (this.alwaysJump || (jumps && this.canJump)) {
					const verticalMoveMultiplier = this.verticalMoveMultiplier;

					this.playerObject.body.velocity.y = (verticalMoveMultiplier * -this.velocityYOnJump);

					this.isJumping = true;
					this.isJumpingTimer = this.scene.game.time.events.add(
						250,
						() => this.isJumping = false
					);
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
		const dx = this.playerObject.x + this.eyeBall.x - ball.x();
		const dy = this.playerObject.y + this.eyeBall.y - ball.y();
		const r = Math.sqrt(dx * dx + dy * dy);
		const max = this.eyeBallRadius - this.eyePupilRadius;
		const x = (r < max) ? dx : dx * max / r;
		const y = (r < max) ? dy : dy * max / r;
		this.eyePupil.position.setTo(x * -1, y * -1);
	}

	stopGame() {
		if (this.killed) {
			return;
		}

		this.freeze();

		if (!this.stopped) {
			//Restore look
			this.shiftShape(this.currentShape);
		}

		this.stopped = true;
	}

	freeze() {
		if (this.killed) {
			return;
		}

		this.isFrozen = true;
		this.playerObject.body.data.gravityScale = 0;
		this.playerObject.body.setZeroVelocity();
	}

	unfreeze() {
		this.isFrozen = false;

		if (this.killed) {
			return;
		}

		this.playerObject.body.data.gravityScale = this.currentGravityScale;
	}

	isSmashingBall(ballX: number): boolean {
		return (
			this.isJumpingForward() &&
			this.isInFrontOfPlayer(ballX)
		);
	}

	isReboundingBall(ballY: number): boolean {
		return ballY < this.playerObject.y + (this.playerObject.height / 2);
	}

	hideFromHimself() {
		this.isHiddenToHimself = true;

		if (!this.gameData.isUserViewer()) {
			if (this.gameData.isCurrentPlayerKey(this.key)) {
				//Target player cannot see himself
				this.playerObject.alpha = 0;
			} else if (!this.isHiddenToOpponent) {
				//Opponent see transparent if he can see
				this.playerObject.alpha = 0.5;
			}
		} else {
			//Viewers always see transparent
			this.playerObject.alpha = 0.5;
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
				this.playerObject.alpha = 0.5;
			}
		} else {
			this.playerObject.alpha = 1;
		}
	}

	hideFromOpponent() {
		this.isHiddenToOpponent = true;

		if (!this.gameData.isUserViewer()) {
			if (!this.gameData.isCurrentPlayerKey(this.key)) {
				//Opponent cannot see player
				this.playerObject.alpha = 0;
			} else if (!this.isHiddenToHimself) {
				//Bonus player see himself transparent if not hidden to himself
				this.playerObject.alpha = 0.5;
			}
		} else {
			//Viewers always see transparent
			this.playerObject.alpha = 0.5;
		}
	}

	showToOpponent() {
		this.isHiddenToOpponent = this.initialIsHiddenToOpponent;

		if (this.isHiddenToOpponent) {
			return;
		}

		if (this.isHiddenToHimself) {
			if (!this.gameData.isCurrentPlayerKey(this.key)) {
				this.playerObject.alpha = 0.5;
			}
		} else {
			this.playerObject.alpha = 1;
		}
	}

	kill() {
		this.eyePupil.position.setTo(0);

		const killingContainer = this.scene.game.add.sprite(
			this.playerObject.width,
			this.playerObject.height,
			this.currentTextureKey
		);
		killingContainer.scale.setTo(this.currentScale);
		killingContainer.x = this.playerObject.x;
		killingContainer.y = this.playerObject.y;
		killingContainer.anchor.setTo(0.5);
		killingContainer.alpha = this.playerObject.alpha;
		killingContainer.tint = this.playerObject.tint;
		this.initEye(killingContainer);

		// @ts-ignore
		killingContainer.depth = DEPTH_ACTIVATION_ANIMATION;
		this.scene.zIndexGroup.add(killingContainer);

		this.animations.disappear(
			killingContainer,
			() => {
				if (killingContainer) {
					killingContainer.destroy(true);
				}
			}
		);

		this.playerObject.destroy(true);
		this.killed = true;
	}

	revive() {
		this.reset();
	}

	scaleSmall() {
		this.currentScale = this.gameConfiguration.smallPlayerScale();
		this.currentMass = this.gameConfiguration.smallPlayerMass();
		this.currentGravityScale = this.gameConfiguration.smallPlayerGravityScale();
		this.applyScale();
	}

	scaleBig() {
		this.currentScale = this.gameConfiguration.bigPlayerScale();
		this.currentMass = this.gameConfiguration.bigPlayerMass();
		this.currentGravityScale = this.gameConfiguration.bigPlayerGravityScale();
		this.applyScale();
	}

	resetScale() {
		this.currentScale = this.initialScale;
		this.currentMass = this.initialMass;
		this.currentGravityScale = this.initialGravityScale;
		this.applyScale();
	}

	shiftShape(shape: string) {
		if (this.overrideShapeDisplay()) {
			if (this.gameData.isCurrentPlayerKey(this.key)) {
				this.currentTextureKey = 'shape-' + this.gameConfiguration.currentPlayerShape();
			} else {
				this.currentTextureKey = 'shape-' + this.gameConfiguration.opponentPlayerShape();
			}
		} else {
			this.currentTextureKey = 'shape-' + shape;
		}
		this.currentShape = shape;
		this.initBody();
		this.initBody(); //Calling this twice fix a bug where sprite and body are not in sync
	}

	resetShape() {
		this.shiftShape(this.initialShape);
	}

	artificialIntelligenceData(): ArtificialIntelligenceData {
		return {
			key: this.key,
			isHost: this.isHost,
			gravity: this.scene.game.physics.p2.gravity.y,
			gravityScale: this.currentGravityScale,
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
			x: this.playerObject.x,
			y: this.playerObject.y,
			velocityX: this.velocityX(),
			velocityY: this.velocityY(),
			isHost: this.isHost,
			isClient: !this.isHost,
			doingDropShot: this.dropShots,
		};
	}

	artificialIntelligencePositionData(): ArtificialIntelligencePositionData {
		return {
			x: this.playerObject.x,
			y: this.playerObject.y,
			gravityScale: this.currentGravityScale,
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
		this.initialScale = this.gameConfiguration.initialPlayerScale(this.key);
		this.currentScale = this.initialScale;
		this.initialGravityScale = this.gameConfiguration.initialPlayerGravityScale(this.key);
		this.currentGravityScale = this.initialGravityScale;
		this.initialMass = this.gameConfiguration.initialPlayerMass(this.key);
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
		this.playerObject = this.scene.game.add.sprite(x, y, 'shape-' + shapeKey);
		this.scene.game.physics.p2.enable(this.playerObject, this.scene.game.config.enableDebug);
		this.playerObject.data.owner = this;
		this.playerObject.data.isPlayer = true;
		this.playerObject.data.isHost = this.isHost;

		if (this.color !== null) {
			this.playerObject.tint = Phaser.Color.hexToRGB(this.color);
		}

		// @ts-ignore
		this.playerObject.depth = DEPTH_ALL;
		this.scene.zIndexGroup.add(this.playerObject);

		this.playerObject.scale.setTo(this.initialScale);
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
		if (this.overrideShapeDisplay()) {
			if (this.gameData.isCurrentPlayerKey(this.key)) {
				return this.gameConfiguration.currentPlayerShape();
			} else {
				return this.gameConfiguration.opponentPlayerShape();
			}
		} else {
			return this.gameData.getPlayerShapeFromKey(this.key);
		}
	}

	private initBody() {
		if (this.killed) {
			return;
		}

		this.initBodyShape();
		this.setupBody();
		this.initEye(this.playerObject);
	}

	private initBodyShape() {
		this.playerObject.body.clearShapes();
		this.playerObject.body.loadPolygon('physicsData', 'player-' + this.currentShape, this.currentScale);
	}

	private setupBody() {
		this.playerObject.loadTexture(this.currentTextureKey);
		this.playerObject.body.fixedRotation = true;
		this.playerObject.body.mass = this.currentMass;

		if (this.isFrozen) {
			this.playerObject.body.data.gravityScale = 0;
		} else {
			this.playerObject.body.data.gravityScale = this.currentGravityScale;
		}

		const collisionCategory = this.isHost ? this.level.collisionCategoryHost : this.level.collisionCategoryClient;
		const collisionLimit = this.isHost ? this.level.collisionCategoryHostLimit : this.level.collisionCategoryClientLimit;
		this.playerObject.body.setMaterial(this.level.materialPlayer);
		this.playerObject.body.setCollisionGroup(collisionCategory);
		this.playerObject.body.collides(collisionLimit);
		this.playerObject.body.collides(collisionCategory);
		this.playerObject.body.collides(this.level.collisionCategoryBall);
		this.playerObject.body.collides(this.level.collisionCategoryBonus);
	}

	private initEye(playerObject: Phaser.Sprite) {
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

		this.eyeBall.addChild(this.eyePupil);
		playerObject.addChild(this.eyeBall);
	}

	private createEyeBall(): Phaser.Graphics {
		const eyeBall = this.scene.game.add.graphics(
			this.eyeBallXOffset,
			this.eyeBallYOffset
		);
		eyeBall.beginFill(0xffffff);
		eyeBall.lineStyle(1, 0x363636);
		eyeBall.drawCircle(0, 0, this.eyeBallRadius * 2);

		return eyeBall;
	}

	private createEyePupil(): Phaser.Graphics {
		const eyePupil = this.scene.game.add.graphics();
		eyePupil.beginFill(0x363636);
		eyePupil.drawCircle(0, 0, this.eyePupilRadius * 2);
		eyePupil.beginFill(0x363636);

		return eyePupil;
	}

	private resetPosition() {
		this.playerObject.body.setZeroVelocity();
		this.playerObject.reset(this.initialXLocation, this.initialYLocation);
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
			(this.isHost && this.playerObject.x < ballX) ||
			(!this.isHost && ballX < this.playerObject.x)
		);
	}

	private hasBottomTouchingJumpable() {
		if (this.scene.game.physics && this.scene.game.physics.p2) {
			for (let i = 0; i < this.scene.game.physics.p2.world.narrowphase.contactEquations.length; i++) {
				const contact = <any>this.scene.game.physics.p2.world.narrowphase.contactEquations[i];
				if (
					(contact.bodyA.parent === this.playerObject.body && this.canPlayerJumpOnBody(contact.bodyB.parent)) ||
					(contact.bodyB.parent === this.playerObject.body && this.canPlayerJumpOnBody(contact.bodyA.parent))
				) {
					let dot = p2.vec2.dot(contact.normalA, p2.vec2.fromValues(0, 1));

					if (contact.bodyA.parent === this.playerObject.body) {
						dot *= -1;
					}

					if (dot > 0.5) {
						return true;
					}
				}
			}
		}

		return false;
	}

	private canPlayerJumpOnBody(contactBody): boolean {
		if (contactBody === this.scene.level.hostGround()) {
			return this.isHost;
		} else if (contactBody === this.scene.level.clientGround()) {
			return !this.isHost;
		} else if (contactBody.sprite) {
			return (contactBody.sprite.data && contactBody.sprite.data.isHost === this.isHost);
		}
	}

	private velocityX(): number {
		return this.playerObject.body.velocity.x;
	}

	private velocityY(): number {
		return this.playerObject.body.velocity.y;
	}

	private applyScale() {
		this.playerObject.scale.setTo(this.currentScale);

		this.initBody();
	}

	private gameIsOnGoing(): boolean {
		return this.gameData.isGameStatusStarted();
	}

	private overrideShapeDisplay() {
		return (
			(
				(this.gameConfiguration.overridesCurrentPlayerShape() && this.gameData.isCurrentPlayerKey(this.key)) ||
				(this.gameConfiguration.overridesOpponentPlayerShape() && !this.gameData.isCurrentPlayerKey(this.key))
			) &&
			this.gameData.isGameStatusStarted()
		);
	}
}
