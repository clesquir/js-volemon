import Computer from "./Computer";
import {ArtificialIntelligenceData} from "../ArtificialIntelligenceData";
import GameConfiguration from "../../configuration/GameConfiguration";
import {ArtificialIntelligencePositionData} from "../ArtificialIntelligencePositionData";
import MainScene from "../../client/scene/MainScene";

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
	private readonly highVelocity: number = 225;

	//Debug info
	private zone: Phaser.Graphics;
	private ballGroundPrediction: Phaser.Graphics;
	private ballSmashPrediction: Phaser.Graphics;

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
		this.debug = this.scene.game.config.enableDebug;

		this.zone = this.scene.game.add.graphics();
		this.ballGroundPrediction = this.scene.game.add.graphics();
		this.ballSmashPrediction = this.scene.game.add.graphics();
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

		const ballGravity = Math.abs(modifiers.gravity * ballPosition.gravityScale);

		let timeToGround = this.timeToReachY(
			ballPosition.velocityY,
			ballGravity,
			Math.abs(ballPosition.y - this.groundY + computerPosition.height / 2)
		);
		let xAtGround = ballPosition.x + ballPosition.velocityX * timeToGround;

		xAtGround = this.calculateVerticalRebound(xAtGround, ballPosition, ballGravity);
		xAtGround = this.calculateHorizontalRebound(xAtGround);
		xAtGround = this.calculateNetRebound(xAtGround, ballPosition, ballGravity);

		const horizontalThreshold = Math.abs(ballPosition.velocityX) < this.highVelocity ? 20 : 0;
		const distanceWithTimeToGround = timeToGround * modifiers.velocityXOnMove * modifiers.horizontalMoveMultiplier;

		if (this.debug) {
			this.ballGroundPrediction.clear();
			this.ballGroundPrediction.lineStyle(1, this.isLeft ? 0xc94141 : 0x3363a1);
			this.ballGroundPrediction.drawCircle(
				xAtGround,
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
						this.playerAtTheNet(computerPosition, ballPosition.width) === false
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
						this.playerAtTheNet(computerPosition, ballPosition.width) === false
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
			modifiers.verticalMoveMultiplier !== 1 ||
			modifiers.horizontalMoveMultiplier !== 1 ||
			Math.abs(ballPosition.velocityX) >= this.highVelocity ||
			Math.abs(ballPosition.velocityY) >= this.highVelocity
		) {
			return false;
		}

		const verticalVelocity = modifiers.verticalMoveMultiplier * modifiers.velocityYOnJump;
		const computerGravity = Math.abs(modifiers.gravity * modifiers.gravityScale);
		let zoneMinimumX;
		let zoneMaximumX;

		const zoneMinimumY = (this.groundY - computerPosition.height / 2) - verticalVelocity * verticalVelocity / (2 * computerGravity);
		const zoneMaximumY = this.netY - ballPosition.height;

		if (this.isLeft) {
			zoneMinimumX = computerPosition.x + computerPosition.width * 0.75;
			zoneMaximumX = computerPosition.x + computerPosition.width * 1.25;
		} else {
			zoneMinimumX = computerPosition.x - computerPosition.width * 1.25;
			zoneMaximumX = computerPosition.x - computerPosition.width * 0.75;
		}

		if (this.debug) {
			this.zone.clear();
			this.zone.lineStyle(1, this.isLeft ? 0xc94141 : 0x3363a1);
			this.zone.drawRect(
				zoneMinimumX,
				zoneMinimumY,
				zoneMaximumX - zoneMinimumX,
				zoneMaximumY - zoneMinimumY
			);
		}

		let timeToY = this.timeToReachY(
			verticalVelocity, computerGravity, computerPosition.y - zoneMinimumY + (zoneMaximumY - zoneMinimumY) / 2
		);
		const ballX = ballPosition.x + ballPosition.velocityX * timeToY;
		const ballY = ballPosition.y + ballPosition.velocityY * timeToY;

		const shouldSmash = (
			ballX > zoneMinimumX &&
			ballX < zoneMaximumX &&
			ballY > zoneMinimumY &&
			ballY < zoneMaximumY &&
			this.playerAtTheNet(computerPosition, computerPosition.width) === false
		);

		if (shouldSmash && this.debug) {
			this.ballSmashPrediction.clear();
			this.ballSmashPrediction.lineStyle(1, this.isLeft ? 0xc94141 : 0x3363a1);
			this.ballSmashPrediction.drawCircle(
				ballX,
				ballY,
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
		//Reverse velocity
		velocityY = -velocityY;

		//Max height
		let maxHeight = distance + velocityY * velocityY / (2 * gravity);

		//Time to max height
		let upTime = velocityY / gravity;
		if (maxHeight < 0) {
			upTime = 0;
		}

		//Time from max height to impact
		let downTime = Math.sqrt(2 * maxHeight / gravity);

		return upTime + downTime;
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
		distance: number = 0
	): boolean {
		const halfPlayerWidth = computerPosition.width / 2;

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
