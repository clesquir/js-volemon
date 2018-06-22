export class ArtificialIntelligence {
	left = false;
	right = false;
	jump = false;
	dropshot = false;

	/**
	 * @param {{key: string, isMoveReversed: boolean, moveModifier: Function, alwaysJump: boolean, canJump: boolean, velocityXOnMove: number, velocityYOnJump: number}} modifiers
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}} computerPosition
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}} ballPosition
	 * @param {GameConfiguration} gameConfiguration
	 * @param {Engine} engine
	 */
	computeMovement(modifiers, computerPosition, ballPosition, gameConfiguration, engine) {
		this.left = false;
		this.right = false;
		this.jump = false;
		this.dropshot = false;

		const width = gameConfiguration.width();
		const height = gameConfiguration.height();
		const gravity = Math.abs(gameConfiguration.worldGravity() * ballPosition.gravityScale);
		const halfWidth = (width / 2);
		const isLeft = this.isLeftPlayer(modifiers.key);
		const isRight = !isLeft;
		const groundY = height - gameConfiguration.groundHeight();
		const netY = groundY - gameConfiguration.netHeight();

		let timeToGround = this.timeToReachY(ballPosition.velocityY, gravity, Math.abs(ballPosition.y - groundY + computerPosition.height / 2));
		let xAtGround = ballPosition.x + ballPosition.velocityX * timeToGround;

		//wall rebounds
		if (xAtGround < 0) {
			xAtGround = -xAtGround;
		} else if (xAtGround > width) {
			xAtGround = 2 * width - xAtGround;
		}

		//out of bounds
		if (xAtGround > width) {
			xAtGround = width;
		}

		//net rebounds
		if ((isLeft && xAtGround > halfWidth) || (isRight && xAtGround < halfWidth)) {
			let timeToNet = this.timeToReachY(ballPosition.velocityY, gravity, Math.abs(ballPosition.y - netY));
			let xAtNet = ballPosition.x + ballPosition.velocityX * timeToNet;

			if ((isLeft && xAtNet < halfWidth) || (isRight && xAtNet > halfWidth)) {
				xAtGround = halfWidth + (isLeft ? -1 : 1) * gameConfiguration.netWidth();
			}
		}

		engine.drawBallPrediction(xAtGround, groundY);

		if (isLeft) {
			if (xAtGround < halfWidth) {
				if (xAtGround > computerPosition.x + computerPosition.width / 4) {
					//ball is in front
					this.right = true;
				} else if (xAtGround < computerPosition.x + computerPosition.width / 6) {
					//ball is behind
					this.left = true;
				}
			} else {
				this.moveToCenter(modifiers.key, computerPosition, gameConfiguration);
			}
		} else {
			if (xAtGround > halfWidth) {
				if (xAtGround < computerPosition.x - computerPosition.width / 4) {
					//ball is in front
					this.left = true;
				} else if (xAtGround > computerPosition.x - computerPosition.width / 6) {
					//ball is behind
					this.right = true;
				}
			} else {
				this.moveToCenter(modifiers.key, computerPosition, gameConfiguration);
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
	 * @param gameConfiguration
	 */
	moveToCenter(key, computerPosition, gameConfiguration) {
		const width = gameConfiguration.width();
		const halfSpace = (this.isLeftPlayer(key) ? width * 1 / 4 : width * 3 / 4);

		if (computerPosition.x + computerPosition.width / 4 < halfSpace) {
			this.right = true;
		} else if (computerPosition.x - computerPosition.width / 4 > halfSpace) {
			this.left = true;
		}
	}

	timeToReachY(velocityY, gravity, distance) {
		const delta = Math.sqrt(
			(velocityY * velocityY) + (2 * gravity * distance)
		);

		if (delta === 0) {
			return 0;
		}

		const t = (-velocityY + delta) / gravity;

		if (t < 0) {
			return 0;
		}

		return t;
	}

	isLeftPlayer(key) {
		return key === 'player1' || key === 'player3';
	}
}
