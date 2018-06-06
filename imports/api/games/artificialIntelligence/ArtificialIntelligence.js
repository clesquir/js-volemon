export class ArtificialIntelligence {
	left = false;
	right = false;
	jump = false;
	dropshot = false;

	/**
	 * @param {{isMoveReversed: boolean, moveModifier: Function, alwaysJump: boolean, canJump: boolean, velocityXOnMove: number, velocityYOnJump: number}} modifiers
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, width: number, height: number}} computerPosition
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, width: number, height: number}} ballPosition
	 */
	computeMovement(modifiers, computerPosition, ballPosition) {
		this.left = false;
		this.right = false;
		this.jump = false;
		this.dropshot = false;

		if (ballPosition.x < computerPosition.x - computerPosition.width / 4) {
			if (modifiers.isMoveReversed) {
				this.right = true;
			} else {
				this.left = true;
			}
		} else if (ballPosition.x > computerPosition.x + computerPosition.width / 4) {
			if (modifiers.isMoveReversed) {
				this.left = true;
			} else {
				this.right = true;
			}
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
}
