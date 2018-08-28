export class ArtificialIntelligence {
	left = false;
	right = false;
	jump = false;
	dropshot = false;

	/**
	 * @param {{key: string, isMoveReversed: boolean, horizontalMoveModifier: Function, verticalMoveModifier: Function, alwaysJump: boolean, canJump: boolean, velocityXOnMove: number, velocityYOnJump: number}} modifiers
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}} computerPosition
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}} ballPosition
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}[]} bonusesPosition
	 * @param {GameConfiguration} gameConfiguration
	 * @param {Engine} engine
	 */
	computeMovement(modifiers, computerPosition, ballPosition, bonusesPosition, gameConfiguration, engine) {
		this.left = false;
		this.right = false;
		this.jump = false;
		this.dropshot = false;

		const width = gameConfiguration.width();
		const height = gameConfiguration.height();
		const gravity = Math.abs(gameConfiguration.worldGravity() * ballPosition.gravityScale);
		const halfWidth = (width / 2);
		const isLeft = this.isLeftPlayer(modifiers.key);
		const groundY = height - gameConfiguration.groundHeight();

		let timeToGround = this.timeToReachY(ballPosition.velocityY, gravity, Math.abs(ballPosition.y - groundY + computerPosition.height / 2));
		let xAtGround = ballPosition.x + ballPosition.velocityX * timeToGround;

		xAtGround = this.restrictToVerticalBounds(xAtGround, ballPosition, gravity);
		xAtGround = this.restrictToHorizontalBounds(xAtGround, width);
		xAtGround = this.reboundsOnNet(
			xAtGround,
			ballPosition,
			gameConfiguration.netWidth(),
			groundY - gameConfiguration.netHeight(),
			halfWidth,
			gravity,
			isLeft
		);

		engine.drawBallPrediction(xAtGround, groundY, 'rgb(200, 0, 0.5)');

		if (isLeft) {
			if (xAtGround < halfWidth) {
				//move to ball position
				if (xAtGround > computerPosition.x + computerPosition.width / 4) {
					//ball is in front
					this.right = true;
				} else if (xAtGround < computerPosition.x + computerPosition.width / 6) {
					//ball is behind
					this.left = true;
				}
			} else {
				//Avoid maluses or grab bonuses or move to center
				this.moveToCenter(modifiers.key, computerPosition, width);
			}
		} else {
			if (xAtGround > halfWidth) {
				//move to ball position
				if (xAtGround < computerPosition.x - computerPosition.width / 4) {
					//ball is in front
					this.left = true;
				} else if (xAtGround > computerPosition.x - computerPosition.width / 6) {
					//ball is behind
					this.right = true;
				}
			} else {
				//Avoid maluses or grab bonuses or move to center
				this.moveToCenter(modifiers.key, computerPosition, width);
			}
		}

		if (modifiers.isMoveReversed) {
			const left = this.right;
			const right = this.left;
			this.left = left;
			this.right = right;
		}
	}

	movesLeft() {
		return this.left;
	}

	movesRight() {
		return this.right;
	}

	jumps() {
		return this.jump;
	}

	dropshots() {
		return this.dropshot;
	}

	/**
	 * @private
	 * @param key
	 * @param computerPosition
	 * @param width
	 */
	moveToCenter(key, computerPosition, width) {
		const halfSpace = (this.isLeftPlayer(key) ? width * 1 / 4 : width * 3 / 4);

		if (computerPosition.x + computerPosition.width / 4 < halfSpace) {
			this.right = true;
		} else if (computerPosition.x - computerPosition.width / 4 > halfSpace) {
			this.left = true;
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
	 * @param key
	 * @returns {boolean}
	 */
	isLeftPlayer(key) {
		return key === 'player1' || key === 'player3';
	}
}
