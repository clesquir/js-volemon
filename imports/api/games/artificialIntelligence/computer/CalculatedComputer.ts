import Computer from "./Computer";
import {ArtificialIntelligenceData} from "../ArtificialIntelligenceData";
import GameConfiguration from "../../configuration/GameConfiguration";
import {ArtificialIntelligencePositionData} from "../ArtificialIntelligencePositionData";

export default class CalculatedComputer implements Computer {
	key: string;
	left: boolean = false;
	right: boolean = false;
	jump: boolean = false;
	dropshot: boolean = false;
	isSmashing: boolean = false;

	constructor(key) {
		this.key = key;
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
		bonusesPosition: ArtificialIntelligencePositionData[],
		gameConfiguration: GameConfiguration
	) {
		const isLeft = this.isLeftPlayer(modifiers);
		const width = gameConfiguration.width();
		const halfWidth = (width / 2);
		const height = gameConfiguration.height();
		const groundY = height - gameConfiguration.groundHeight();

		this.jump = false;
		this.dropshot = false;

		const gravity = Math.abs(gameConfiguration.worldGravity() * ballPosition.gravityScale);
		const netWidth = gameConfiguration.netWidth();
		const netY = groundY - gameConfiguration.netHeight();

		let timeToGround = this.timeToReachY(ballPosition.velocityY, gravity, Math.abs(ballPosition.y - groundY + computerPosition.height / 2));
		let xAtGround = ballPosition.x + ballPosition.velocityX * timeToGround;

		xAtGround = this.restrictToVerticalBounds(xAtGround, ballPosition, gravity);
		xAtGround = this.restrictToHorizontalBounds(xAtGround, width);
		xAtGround = this.reboundsOnNet(
			xAtGround,
			ballPosition,
			netWidth,
			netY,
			halfWidth,
			gravity,
			isLeft
		);

		const horizontalThreshold = 25;
		const distanceWithTimeToGround = timeToGround * modifiers.velocityXOnMove * modifiers.horizontalMoveModifier();

		if (isLeft) {
			if (xAtGround < halfWidth) {
				if (
					this.shouldSmash(modifiers, ballPosition, computerPosition, halfWidth, netY, netWidth) ||
					this.doingSmash(computerPosition)
				) {
					this.jump = true;
					this.moveRight();
					this.isSmashing = true;
				} else {
					this.isSmashing = false;

					if (
						this.ballWillFallAhead(isLeft, xAtGround, computerPosition) &&
						this.playerAtTheNet(isLeft, halfWidth, netWidth, computerPosition) === false
					) {
						if (computerPosition.x + distanceWithTimeToGround > xAtGround + horizontalThreshold) {
							this.stopMovingHorizontally();
						} else {
							this.moveRight();
						}
					} else if (
						this.ballWillFallBehind(isLeft, xAtGround, computerPosition) &&
						this.playerIsBackToTheWall(isLeft, width, computerPosition) === false
					) {
						this.moveLeft();
					} else {
						this.stopMovingHorizontally();
					}
				}
			} else if (!this.doingSmash(computerPosition)) {
				//Avoid maluses or grab bonuses or move to center
				this.moveToCenter(modifiers, computerPosition, width);
				this.isSmashing = false;
			}
		} else {
			if (xAtGround > halfWidth) {
				if (
					this.shouldSmash(modifiers, ballPosition, computerPosition, halfWidth, netY, netWidth) ||
					this.doingSmash(computerPosition)
				) {
					this.jump = true;
					this.moveLeft();
					this.isSmashing = true;
				} else {
					this.isSmashing = false;

					if (
						this.ballWillFallAhead(isLeft, xAtGround, computerPosition) &&
						this.playerAtTheNet(isLeft, halfWidth, netWidth, computerPosition) === false
					) {
						if (computerPosition.x - distanceWithTimeToGround < xAtGround - horizontalThreshold) {
							this.stopMovingHorizontally();
						} else {
							this.moveLeft();
						}
					} else if (
						this.ballWillFallBehind(isLeft, xAtGround, computerPosition) &&
						this.playerIsBackToTheWall(isLeft, width, computerPosition) === false
					) {
						this.moveRight();
					} else {
						this.stopMovingHorizontally();
					}
				}
			} else if (!this.doingSmash(computerPosition)) {
				//Avoid maluses or grab bonuses or move to center
				this.moveToCenter(modifiers, computerPosition, width);
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
		modifiers,
		ballPosition,
		computerPosition,
		halfLevelWidth: number,
		netY: number,
		netWidth: number
	): boolean {
		//Constants
		const widthRatioClose = 0.75;
		const widthRatioFar = 2.25;
		const heightRatioClose = 1.7;
		const heightRatioFar = 2.3;
		const positionRatioMinimum = 0.9;
		const positionRatioMaximum = 2;
		const xVelocityMaximum = 350;
		const yVelocityMinimum = 0;
		const yVelocityMaximum = 150;

		const isLeft = this.isLeftPlayer(modifiers);
		const width = computerPosition.width;
		const minimumHeight = netY - computerPosition.height * heightRatioClose;
		const maximumHeight = netY - computerPosition.height * heightRatioFar;
		const xDifferenceWithPlayer = Math.abs(ballPosition.x - computerPosition.x);
		const yDifferenceWithPlayer = Math.abs(ballPosition.y - computerPosition.y);
		const ratioDifference = xDifferenceWithPlayer / yDifferenceWithPlayer;
		let playerLeftLimit;
		let playerRightLimit;

		let isInFront = false;
		if (isLeft) {
			isInFront = ballPosition.x > computerPosition.x;
			playerLeftLimit = computerPosition.x + width * widthRatioClose;
			playerRightLimit = playerLeftLimit + width * widthRatioFar;
			//limit to net
			if (playerRightLimit > halfLevelWidth - netWidth) {
				playerRightLimit = halfLevelWidth - netWidth;
			}
		} else {
			isInFront = ballPosition.x < computerPosition.x;
			playerRightLimit = computerPosition.x - width * widthRatioClose;
			playerLeftLimit = playerRightLimit - width * widthRatioFar;
			//limit to net
			if (playerLeftLimit < halfLevelWidth + netWidth) {
				playerLeftLimit = halfLevelWidth + netWidth;
			}
		}

		return (
			modifiers.canJump &&
			isInFront &&
			ratioDifference > positionRatioMinimum && ratioDifference < positionRatioMaximum &&
			Math.abs(ballPosition.velocityX) < xVelocityMaximum &&
			ballPosition.velocityY > yVelocityMinimum && ballPosition.velocityY < yVelocityMaximum &&
			ballPosition.x > playerLeftLimit &&
			ballPosition.x < playerRightLimit &&
			ballPosition.y > maximumHeight &&
			ballPosition.y < minimumHeight &&
			this.playerAtTheNet(isLeft, halfLevelWidth, netWidth, computerPosition) === false
		);
	}

	private doingSmash(computerPosition): boolean {
		return this.isSmashing && computerPosition.velocityY < 0;
	}

	private moveToCenter(modifiers, computerPosition, width: number) {
		const halfSpace = (this.isLeftPlayer(modifiers) ? width / 4 : width * 3 / 4);

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

	private restrictToVerticalBounds(xAtGround: number, ballPosition, gravity: number): number {
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

	private restrictToHorizontalBounds(x: number, width: number): number {
		//wall rebounds
		if (x < 0) {
			x = -x;
		} else if (x > width) {
			x = 2 * width - x;
		}

		//out of bounds
		if (x > width) {
			x = width;
		}

		return x;
	}

	private reboundsOnNet(
		xAtGround: number,
		ballPosition,
		netWidth: number,
		netY: number,
		halfWidth: number,
		gravity: number,
		isLeft: boolean
	): number {
		const isRight = !isLeft;

		if ((isLeft && xAtGround > halfWidth) || (isRight && xAtGround < halfWidth)) {
			let timeToNet = this.timeToReachY(ballPosition.velocityY, gravity, Math.abs(ballPosition.y - netY));
			let xAtNet = ballPosition.x + ballPosition.velocityX * timeToNet;

			if ((isLeft && xAtNet < halfWidth) || (isRight && xAtNet > halfWidth)) {
				xAtGround = halfWidth + (isLeft ? -1 : 1) * netWidth;
			}
		}

		return xAtGround;
	}

	private isLeftPlayer(modifiers): boolean {
		return !!modifiers.isHost;
	}

	private ballWillFallAhead(isLeft: boolean, xAtGround: number, computerPosition): boolean {
		if (isLeft) {
			return xAtGround > computerPosition.x + computerPosition.width / 4;
		} else {
			return xAtGround < computerPosition.x - computerPosition.width / 4;
		}
	}

	private ballWillFallBehind(isLeft: boolean, xAtGround: number, computerPosition): boolean {
		if (isLeft) {
			return xAtGround < computerPosition.x + computerPosition.width / 6;
		} else {
			return xAtGround > computerPosition.x - computerPosition.width / 6;
		}
	}

	private playerAtTheNet(isLeft: boolean, halfLevelWidth: number, netWidth: number, computerPosition): boolean {
		if (isLeft) {
			return computerPosition.x + computerPosition.width / 2 >= halfLevelWidth - netWidth;
		} else {
			return computerPosition.x - computerPosition.width / 2 <= halfLevelWidth + netWidth;
		}
	}

	private playerIsBackToTheWall(isLeft: boolean, levelWidth: number, computerPosition): boolean {
		if (isLeft) {
			return computerPosition.x - computerPosition.width / 2 <= 0;
		} else {
			return computerPosition.x + computerPosition.width / 2 >= levelWidth;
		}
	}

	/**
	 * @param {{key: string, isMoveReversed: boolean, horizontalMoveModifier: Function, verticalMoveModifier: Function, alwaysJump: boolean, canJump: boolean, velocityXOnMove: number, velocityYOnJump: number}} modifiers
	 */
	private applyModifiers(modifiers) {
		if (modifiers.isMoveReversed !== modifiers.velocityXOnMove < 0) {
			const left = this.right;
			const right = this.left;
			this.left = left;
			this.right = right;
		}
	}
}
