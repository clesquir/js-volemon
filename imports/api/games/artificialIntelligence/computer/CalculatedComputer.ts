import Computer from "./Computer";
import {ArtificialIntelligenceData} from "../ArtificialIntelligenceData";
import GameConfiguration from "../../configuration/GameConfiguration";
import {ArtificialIntelligencePositionData} from "../ArtificialIntelligencePositionData";
import MainScene from "../../client/scene/MainScene";
import {DEPTH_ACTIVATION_ANIMATION} from "../../constants";

export default class CalculatedComputer implements Computer {
	private readonly key: string;
	private readonly isLeft: boolean;
	private readonly scene: MainScene;
	private readonly levelWidth: number;
	private readonly levelHalfWidth: number;
	private readonly groundY: number;
	private readonly netWidth: number;
	private readonly netY: number;
	private readonly debug: boolean;

	//Debug info
	private zone: Phaser.GameObjects.Graphics;
	private ballGroundPrediction: Phaser.GameObjects.Graphics;
	private ballSmashPrediction: Phaser.GameObjects.Graphics;

	left: boolean = false;
	right: boolean = false;
	jump: boolean = false;
	dropshot: boolean = false;
	isSmashing: boolean = false;

	constructor(key: string, isLeft: boolean, scene: MainScene, gameConfiguration: GameConfiguration) {
		this.key = key;
		this.isLeft = isLeft;
		this.scene = scene;
		this.levelWidth = gameConfiguration.width();
		this.levelHalfWidth = this.levelWidth / 2;
		this.groundY = gameConfiguration.height() - gameConfiguration.groundHeight();
		this.netWidth = gameConfiguration.netWidth();
		this.netY = this.groundY - gameConfiguration.netHeight();
		this.debug = this.scene.matter.config.debug;

		this.zone = this.scene.add.graphics();
		this.zone.setDepth(DEPTH_ACTIVATION_ANIMATION);
		this.ballGroundPrediction = this.scene.add.graphics();
		this.ballGroundPrediction.setDepth(DEPTH_ACTIVATION_ANIMATION);
		this.ballSmashPrediction = this.scene.add.graphics();
		this.ballSmashPrediction.setDepth(DEPTH_ACTIVATION_ANIMATION);
	}

	currentGeneration(): number {
		return 1;
	}

	getGenomes(): string {
		return '';
	}

	startGame() {
	}

	startPoint() {
	}

	stopPoint(pointSide: string) {
	}

	computeMovement(
		modifiers: ArtificialIntelligenceData,
		computerPosition: ArtificialIntelligencePositionData,
		ballPosition: ArtificialIntelligencePositionData,
		bonusesPosition: ArtificialIntelligencePositionData[]
	) {
		this.jump = false;
		this.dropshot = false;

		const gravity = Math.abs(modifiers.gravity);
		let timeToGround = this.timeToReachY(
			ballPosition.velocityY, gravity, Math.abs(ballPosition.y - this.groundY + computerPosition.height / 2)
		);
		let xAtGround = ballPosition.x + ballPosition.velocityX * timeToGround;

		xAtGround = this.calculateVerticalRebound(xAtGround, ballPosition, gravity);
		xAtGround = this.calculateHorizontalRebound(xAtGround);
		xAtGround = this.calculateNetRebound(xAtGround, ballPosition, gravity);

		const horizontalThreshold = 20;
		const distanceWithTimeToGround = timeToGround * modifiers.velocityXOnMove * modifiers.horizontalMoveMultiplier;

		if (this.debug) {
			this.ballGroundPrediction.clear();
			this.ballGroundPrediction.lineStyle(1, this.isLeft ? 0xc94141 : 0x3363a1);
			this.ballGroundPrediction.strokeCircle(
				xAtGround - ballPosition.width / 2,
				this.groundY,
				ballPosition.width / 2
			);
		}

		if (this.isLeft) {
			if (xAtGround < this.levelHalfWidth) {
				if (
					this.shouldSmash(modifiers, ballPosition, computerPosition) ||
					this.doingSmash(computerPosition)
				) {
					this.jump = true;
					this.moveRight();
					this.isSmashing = true;
				} else {
					this.isSmashing = false;

					if (
						this.ballWillFallAhead(xAtGround, computerPosition) &&
						this.playerAtTheNet(computerPosition, ballPosition, ballPosition.width) === false
					) {
						if (computerPosition.x + distanceWithTimeToGround > xAtGround - horizontalThreshold) {
							this.stopMovingHorizontally();
						} else {
							this.moveRight();
						}
					} else if (
						this.ballWillFallBehind(xAtGround, computerPosition) &&
						this.playerIsBackToTheWall(computerPosition, ballPosition) === false
					) {
						this.moveLeft();
					} else {
						this.stopMovingHorizontally();
					}
				}
			} else if (!this.doingSmash(computerPosition)) {
				//Avoid maluses or grab bonuses or move to center
				this.moveToCenter(computerPosition);
				this.isSmashing = false;
			}
		} else {
			if (xAtGround > this.levelHalfWidth) {
				if (
					this.shouldSmash(modifiers, ballPosition, computerPosition) ||
					this.doingSmash(computerPosition)
				) {
					this.jump = true;
					this.moveLeft();
					this.isSmashing = true;
				} else {
					this.isSmashing = false;

					if (
						this.ballWillFallAhead(xAtGround, computerPosition) &&
						this.playerAtTheNet(computerPosition, ballPosition, ballPosition.width) === false
					) {
						if (computerPosition.x - distanceWithTimeToGround < xAtGround + horizontalThreshold) {
							this.stopMovingHorizontally();
						} else {
							this.moveLeft();
						}
					} else if (
						this.ballWillFallBehind(xAtGround, computerPosition) &&
						this.playerIsBackToTheWall(computerPosition, ballPosition) === false
					) {
						this.moveRight();
					} else {
						this.stopMovingHorizontally();
					}
				}
			} else if (!this.doingSmash(computerPosition)) {
				//Avoid maluses or grab bonuses or move to center
				this.moveToCenter(computerPosition);
				this.isSmashing = false;
			}
		}

		this.applyModifiers(modifiers);
	}

	private moveLeft() {
		this.left = true;
		this.right = false;
	}

	private moveRight() {
		this.right = true;
		this.left = false;
	}

	private stopMovingHorizontally() {
		this.left = false;
		this.right = false;
	}

	private shouldSmash(
		modifiers: ArtificialIntelligenceData,
		ballPosition: ArtificialIntelligencePositionData,
		computerPosition: ArtificialIntelligencePositionData
	): boolean {
		//Abort calculations
		if (
			modifiers.canJump === false ||
			Math.abs(ballPosition.velocityX) > 5 ||
			Math.abs(ballPosition.velocityY) > 5
		) {
			return false;
		}

		const verticalVelocity = modifiers.verticalMoveMultiplier * modifiers.velocityYOnJump * modifiers.initialMass / modifiers.currentMass;
		const gravity = Math.abs(modifiers.gravity);
		let zoneMinimumX;
		let zoneMaximumX;
		let zoneMinimumY = computerPosition.y - (Math.exp(verticalVelocity * Math.sin(90)) / (2 * gravity)) + computerPosition.height;
		let zoneMaximumY = this.netY - ballPosition.height;

		if (this.isLeft) {
			zoneMinimumX = computerPosition.x + computerPosition.width;
			zoneMaximumX = computerPosition.x + computerPosition.width * 2;
		} else {
			zoneMinimumX = computerPosition.x - computerPosition.width * 2;
			zoneMaximumX = computerPosition.x - computerPosition.width;
		}

		if (this.debug) {
			this.zone.clear();
			this.zone.lineStyle(1, this.isLeft ? 0xc94141 : 0x3363a1);
			this.zone.strokeRect(
				zoneMinimumX,
				zoneMinimumY,
				zoneMaximumX - zoneMinimumX,
				zoneMaximumY - zoneMinimumY
			);
		}

		let timeToY = this.timeToReachY(
			verticalVelocity, gravity, computerPosition.y - zoneMinimumY + (zoneMaximumY - zoneMinimumY) / 2
		);
		const ballX = ballPosition.x + ballPosition.velocityX * timeToY;
		const ballY = ballPosition.y + ballPosition.velocityY * timeToY;

		const shouldSmash = (
			ballX > zoneMinimumX &&
			ballX < zoneMaximumX &&
			ballY > zoneMinimumY &&
			ballY < zoneMaximumY &&
			this.playerAtTheNet(computerPosition, ballPosition, computerPosition.width) === false
		);

		if (shouldSmash && this.debug) {
			this.ballSmashPrediction.clear();
			this.ballSmashPrediction.lineStyle(1, this.isLeft ? 0xc94141 : 0x3363a1);
			this.ballSmashPrediction.strokeCircle(
				ballX - ballPosition.width / 2,
				ballY - ballPosition.height / 2,
				ballPosition.width / 2
			);
		}

		return shouldSmash;
	}

	private doingSmash(computerPosition: ArtificialIntelligencePositionData): boolean {
		return this.isSmashing && computerPosition.velocityY < 0;
	}

	private moveToCenter(computerPosition: ArtificialIntelligencePositionData) {
		const halfSpace = (this.isLeft ? this.levelWidth / 4 : this.levelWidth * 3 / 4);

		if (computerPosition.x + computerPosition.width / 4 < halfSpace) {
			this.moveRight();
		} else if (computerPosition.x - computerPosition.width / 4 > halfSpace) {
			this.moveLeft();
		} else {
			this.stopMovingHorizontally();
		}
	}

	private timeToReachY(velocityY: number, gravity: number, distance: number): number {
		let delta = Math.sqrt((velocityY * velocityY) + (2 * gravity * distance));

		if (delta === 0) {
			return 0;
		}

		const t = (-velocityY + delta) / gravity;

		if (t < 0) {
			return 0;
		}

		return t;
	}

	private calculateVerticalRebound(xAtGround: number, ballPosition, gravity: number): number {
		const velocityY = ballPosition.velocityY;

		if (velocityY < 0) {
			const distance = -ballPosition.y;
			const delta = Math.sqrt((velocityY * velocityY) + (2 * gravity * distance));

			if (!isNaN(delta)) {
				const timeToCeilingA = (-velocityY - delta) / gravity;
				const timeToCeilingB = (-velocityY + delta) / gravity;

				return xAtGround - (ballPosition.velocityX * Math.abs(timeToCeilingB - timeToCeilingA));
			}
		}

		return xAtGround;
	}

	private calculateHorizontalRebound(x: number): number {
		//wall rebounds
		if (x < 0) {
			x = -x;
		} else if (x > this.levelWidth) {
			x = 2 * this.levelWidth - x;
		}

		//out of bounds
		if (x > this.levelWidth) {
			x = this.levelWidth;
		}

		return x;
	}

	private calculateNetRebound(
		xAtGround: number,
		ballPosition: ArtificialIntelligencePositionData,
		gravity: number
	): number {
		const isRight = !this.isLeft;

		if ((this.isLeft && xAtGround > this.levelHalfWidth) || (isRight && xAtGround < this.levelHalfWidth)) {
			let timeToNet = this.timeToReachY(ballPosition.velocityY, gravity, Math.abs(ballPosition.y - this.netY));
			let xAtNet = ballPosition.x + ballPosition.velocityX * timeToNet;

			if ((this.isLeft && xAtNet < this.levelHalfWidth) || (isRight && xAtNet > this.levelHalfWidth)) {
				xAtGround = this.levelHalfWidth + (this.isLeft ? -1 : 1) * this.netWidth;
			}
		}

		return xAtGround;
	}

	private ballWillFallAhead(xAtGround: number, computerPosition: ArtificialIntelligencePositionData): boolean {
		const playerNoseTip = computerPosition.width / 4;

		if (this.isLeft) {
			return xAtGround > computerPosition.x + playerNoseTip;
		} else {
			return xAtGround < computerPosition.x - playerNoseTip;
		}
	}

	private ballWillFallBehind(xAtGround: number, computerPosition: ArtificialIntelligencePositionData): boolean {
		const playerNoseBase = computerPosition.width / 6;

		if (this.isLeft) {
			return xAtGround < computerPosition.x + playerNoseBase;
		} else {
			return xAtGround > computerPosition.x - playerNoseBase;
		}
	}

	private playerAtTheNet(
		computerPosition: ArtificialIntelligencePositionData,
		ballPosition: ArtificialIntelligencePositionData,
		distance: number = 0
	): boolean {
		const halfPlayerWidth = computerPosition.width / 2;
		const halfBallWidth = ballPosition.width / 2;

		if (this.isLeft) {
			return computerPosition.x + halfPlayerWidth - distance >= this.levelHalfWidth - this.netWidth;
		} else {
			return computerPosition.x - halfPlayerWidth + distance <= this.levelHalfWidth + this.netWidth;
		}
	}

	private playerIsBackToTheWall(
		computerPosition: ArtificialIntelligencePositionData,
		ballPosition: ArtificialIntelligencePositionData
	): boolean {
		const halfPlayerWidth = computerPosition.width / 2;
		const halfBallWidth = ballPosition.width / 2;

		if (this.isLeft) {
			return computerPosition.x - halfPlayerWidth - halfBallWidth <= 0;
		} else {
			return computerPosition.x + halfPlayerWidth + halfBallWidth >= this.levelWidth;
		}
	}

	private applyModifiers(modifiers: ArtificialIntelligenceData) {
		if (modifiers.isMoveReversed !== modifiers.velocityXOnMove < 0) {
			const left = this.right;
			const right = this.left;
			this.left = left;
			this.right = right;
		}
	}
}
