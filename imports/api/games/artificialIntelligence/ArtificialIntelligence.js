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
		const isLeft = modifiers.key === 'player1' || modifiers.key === 'player3';
		const groundY = height - gameConfiguration.groundHeight();
		const distanceMultiplier = 1.502636245994042;

		let t = this.timeToGroundY(ballPosition.velocityY, gravity, Math.abs(ballPosition.y - groundY));
		let px = ballPosition.x + ballPosition.velocityX * t;
		let py = ballPosition.y + (ballPosition.velocityY / distanceMultiplier * t) + 0.5 * gravity * t * t;

		//wall rebounds
		if (px < 0) {
			px = -px;
		} else if (px > width) {
			px = 2 * width - px;
		}

		//ball rebounds
		if (
			(
				(ballPosition.x < halfWidth && px > halfWidth) ||
				(ballPosition.x > halfWidth && px < halfWidth)
			)
		) {
			px = 2 * halfWidth - px;
		}

		engine.drawBallPrediction(px, py);

		if (isLeft) {
			if (px < halfWidth) {
				this.jumpToReach(computerPosition, ballPosition, px, t);

				if (px > computerPosition.x + computerPosition.width / 4) {
					//ball is in front
					this.right = true;
				} else if (px < computerPosition.x + computerPosition.width / 6) {
					//ball is behind
					this.left = true;
				}
			} else {
				this.moveToCenter(modifiers.key, computerPosition, gameConfiguration);
			}
		} else {
			if (px > halfWidth) {
				this.jumpToReach(computerPosition, ballPosition, px, t);

				if (px < computerPosition.x - computerPosition.width / 4) {
					//ball is in front
					this.left = true;
				} else if (px > computerPosition.x - computerPosition.width / 6) {
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
	 */
	jumpToReach(computerPosition, ballPosition, px, t) {
		const DEP_X = 0.15;
		const halfPlayerWidth = computerPosition.width / 2;
		const halfBallWidth = ballPosition.width / 2;

		if (
			ballPosition.y < computerPosition.y - computerPosition.height / 2 &&
			Math.abs(ballPosition.velocityX) > 0 &&
			(Math.abs((computerPosition.x + halfPlayerWidth) - (px + halfBallWidth)) - halfPlayerWidth - halfBallWidth) > (1000 * t * DEP_X)
		) {
			//ball is above us and we won't reach it if we don't jump
			this.jump = true;
		}
	}

	/**
	 * @private
	 * @param key
	 * @param computerPosition
	 * @param gameConfiguration
	 */
	moveToCenter(key, computerPosition, gameConfiguration) {
		const width = gameConfiguration.width();
		const isLeft = key === 'player1' || key === 'player3';
		const halfSpace = (isLeft ? width * 1 / 4 : width * 3 / 4);

		if (computerPosition.x + computerPosition.width / 4 < halfSpace) {
			this.right = true;
		} else if (computerPosition.x - computerPosition.width / 4 > halfSpace) {
			this.left = true;
		}
	}

	timeToGroundY(velocityY, gravity, distanceToGround) {
		const delta = Math.sqrt(
			(velocityY * velocityY) + (2 * gravity * distanceToGround)
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
}
