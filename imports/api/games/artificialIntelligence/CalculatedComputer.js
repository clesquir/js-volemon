import Computer from '/imports/api/games/artificialIntelligence/Computer.js';

export default class CalculatedComputer extends Computer {
	isSmashing = false;

	constructor(key) {
		super();
		this.key = key;
	}

	currentGeneration() {
		return 1;
	}

	getGenomes() {
		return '';
	}

	startGame() {
	}

	startPoint() {
	}

	stopPoint(pointSide) {
	}

	/**
	 * @param {{key: string, isMoveReversed: boolean, horizontalMoveModifier: Function, verticalMoveModifier: Function, alwaysJump: boolean, canJump: boolean, velocityXOnMove: number, velocityYOnJump: number}} modifiers
	 * @param {{x: number, y: number, scale: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}} computerPosition
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}} ballPosition
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}[]} bonusesPosition
	 * @param {GameConfiguration} gameConfiguration
	 * @param {Engine} engine
	 */
	computeMovement(modifiers, computerPosition, ballPosition, bonusesPosition, gameConfiguration, engine) {
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

		engine.drawBallPrediction(xAtGround, groundY, 'rgb(200, 0, 0)');

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

	/**
	 * @private
	 */
	moveLeft() {
		this.left = true;
		this.right = false;
	}

	/**
	 * @private
	 */
	moveRight() {
		this.right = true;
		this.left = false;
	}

	/**
	 * @private
	 */
	stopMovingHorizontally() {
		this.left = false;
		this.right = false;
	}

	/**
	 * @private
	 * @param modifiers
	 * @param ballPosition
	 * @param computerPosition
	 * @param halfLevelWidth
	 * @param netY
	 * @param netWidth
	 * @returns {boolean}
	 */
	shouldSmash(modifiers, ballPosition, computerPosition, halfLevelWidth, netY, netWidth) {
		//Constants
		const widthRatioClose = 0.75;
		const widthRatioFar = 2.25;
		const heightRatioClose = 1.7;
		const heightRatioFar = 2.35;
		const positionRatioMinimum = 0.8;
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

	/**
	 * @private
	 * @param computerPosition
	 */
	doingSmash(computerPosition) {
		return this.isSmashing && computerPosition.velocityY < 0;
	}

	/**
	 * @private
	 * @param modifiers
	 * @param computerPosition
	 * @param width
	 */
	moveToCenter(modifiers, computerPosition, width) {
		const halfSpace = (this.isLeftPlayer(modifiers) ? width * 1 / 4 : width * 3 / 4);

		if (computerPosition.x + computerPosition.width / 4 < halfSpace) {
			this.moveRight();
		} else if (computerPosition.x - computerPosition.width / 4 > halfSpace) {
			this.moveLeft();
		} else {
			this.stopMovingHorizontally();
		}
	}

	/**
	 * @private
	 * @param velocityY
	 * @param gravity
	 * @param distance
	 * @returns {number}
	 */
	timeToReachY(velocityY, gravity, distance) {
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

	/**
	 * @private
	 * @param xAtGround
	 * @param ballPosition
	 * @param gravity
	 * @returns {number}
	 */
	restrictToVerticalBounds(xAtGround, ballPosition, gravity) {
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

	/**
	 * @private
	 * @param {number} x
	 * @param {number} width
	 * @returns {number}
	 */
	restrictToHorizontalBounds(x, width) {
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

	/**
	 * @private
	 * @param xAtGround
	 * @param ballPosition
	 * @param netWidth
	 * @param netY
	 * @param halfWidth
	 * @param gravity
	 * @param isLeft
	 * @returns {number}
	 */
	reboundsOnNet(xAtGround, ballPosition, netWidth, netY, halfWidth, gravity, isLeft) {
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

	/**
	 * @private
	 * @param modifiers
	 * @returns {boolean}
	 */
	isLeftPlayer(modifiers) {
		return !!modifiers.isHost;
	}

	/**
	 * @private
	 * @param isLeft
	 * @param xAtGround
	 * @param computerPosition
	 * @returns {boolean}
	 */
	ballWillFallAhead(isLeft, xAtGround, computerPosition) {
		if (isLeft) {
			return xAtGround > computerPosition.x + computerPosition.width / 4;
		} else {
			return xAtGround < computerPosition.x - computerPosition.width / 4;
		}
	}

	/**
	 * @private
	 * @param isLeft
	 * @param xAtGround
	 * @param computerPosition
	 * @returns {boolean}
	 */
	ballWillFallBehind(isLeft, xAtGround, computerPosition) {
		if (isLeft) {
			return xAtGround < computerPosition.x + computerPosition.width / 6;
		} else {
			return xAtGround > computerPosition.x - computerPosition.width / 6;
		}
	}

	/**
	 * @private
	 * @param isLeft
	 * @param halfLevelWidth
	 * @param netWidth
	 * @param computerPosition
	 * @returns {boolean}
	 */
	playerAtTheNet(isLeft, halfLevelWidth, netWidth, computerPosition) {
		if (isLeft) {
			return computerPosition.x + computerPosition.width / 2 >= halfLevelWidth - netWidth;
		} else {
			return computerPosition.x - computerPosition.width / 2 <= halfLevelWidth + netWidth;
		}
	}

	/**
	 * @private
	 * @param isLeft
	 * @param levelWidth
	 * @param computerPosition
	 * @returns {boolean}
	 */
	playerIsBackToTheWall(isLeft, levelWidth, computerPosition) {
		if (isLeft) {
			return computerPosition.x - computerPosition.width / 2 <= 0;
		} else {
			return computerPosition.x + computerPosition.width / 2 >= levelWidth;
		}
	}

	/**
	 * @private
	 * @param {{key: string, isMoveReversed: boolean, horizontalMoveModifier: Function, verticalMoveModifier: Function, alwaysJump: boolean, canJump: boolean, velocityXOnMove: number, velocityYOnJump: number}} modifiers
	 */
	applyModifiers(modifiers) {
		if (modifiers.isMoveReversed !== modifiers.velocityXOnMove < 0) {
			const left = this.right;
			const right = this.left;
			this.left = left;
			this.right = right;
		}
	}
}
