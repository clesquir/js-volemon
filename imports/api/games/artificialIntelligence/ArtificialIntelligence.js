import Learner from '/imports/api/games/artificialIntelligence/Learner.js';
import {CLIENT_POINTS_COLUMN, HOST_POINTS_COLUMN} from '/imports/api/games/constants.js';

export default class ArtificialIntelligence {
	computers = {};
	pointStartTime = 0;
	numberPointsForCurrentGenomes = 0;
	numberPointsToCalculateGenomes = 5;
	canJump = false;

	addComputerWithKey(key, machineLearning = false) {
		this.computers[key] = {
			left: false,
			right: false,
			jump: false,
			dropshot: false,
			cumulatedPoints: 0
		};

		if (machineLearning) {
			this.computers[key].learner = new Learner(4, 2, 12, 4, 0.2);
			this.computers[key].learner.init();
		}
	}

	getGenomes(key) {
		if (this.computers[key] && this.computers[key].learner) {
			return this.computers[key].learner.getGenomes();
		} else {
			return '';
		}
	}

	loadGenomes(key, genomes) {
		if (this.computers[key] && this.computers[key].learner) {
			this.computers[key].learner.loadGenomes(genomes, true);
		}
	}

	startGame() {
		for (let key in this.computers) {
			if (this.computers.hasOwnProperty(key) && this.computers[key].learner) {
				this.computers[key].learner.startLearning();
			}
		}
	}

	startPoint() {
		this.pointStartTime = (new Date()).getTime();
	}

	stopPoint(pointSide) {
		for (let key in this.computers) {
			if (this.computers.hasOwnProperty(key) && this.computers[key].learner) {
				const pointTime = ((new Date()).getTime() - this.pointStartTime);
				let points = 1 / pointTime * 10000000;

				//When it has the point, the shortest the point, the better
				//When it doesn't, the longest the point, the better. Negative value
				if (!(key === 'player1' ? pointSide === HOST_POINTS_COLUMN : pointSide === CLIENT_POINTS_COLUMN)) {
					points = -1 * points;
				}

				this.computers[key].cumulatedPoints += points;
				this.numberPointsForCurrentGenomes++;

				if (this.numberPointsForCurrentGenomes >= this.numberPointsToCalculateGenomes) {
					this.computers[key].learner.computeGenomesPoint(this.computers[key].cumulatedPoints);

					//Reset
					this.numberPointsForCurrentGenomes = 0;
					this.computers[key].cumulatedPoints = 0;
				}
			}
		}
	}

	applyLearnerOutput(key, outputs) {
		if (this.computers.hasOwnProperty(key) && outputs.length === 2) {
			this.computers[key].left = false;
			this.computers[key].right = false;

			if (outputs[0] < 0.45) {
				this.computers[key].left = true;
			} else if (outputs[0] > 0.55) {
				this.computers[key].right = true;
			}

			this.computers[key].jump = false;
			this.computers[key].dropshot = false;

			if (outputs[1] < 0.45) {
				this.computers[key].jump = true;
			} else if (outputs[1] > 0.55) {
				this.computers[key].dropshot = true;
			}
		}
	}

	/**
	 * @param {string} key
	 * @param {{key: string, isMoveReversed: boolean, horizontalMoveModifier: Function, verticalMoveModifier: Function, alwaysJump: boolean, canJump: boolean, velocityXOnMove: number, velocityYOnJump: number}} modifiers
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}} computerPosition
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}} ballPosition
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}[]} bonusesPosition
	 * @param {GameConfiguration} gameConfiguration
	 * @param {Engine} engine
	 */
	computeMovement(key, modifiers, computerPosition, ballPosition, bonusesPosition, gameConfiguration, engine) {
		if (this.computers[key].learner) {
			this.applyLearnerOutput(
				key,
				this.computers[key].learner.emitData(
					[
						Math.round(computerPosition.x - ballPosition.x), //distance player/ball and side
						Math.round(computerPosition.y - ballPosition.y), //distance player/ball and side
						Math.round(ballPosition.velocityX),
						Math.round(ballPosition.velocityY)
					]
				)
			);

			return;
		}

		this.computers[key].left = false;
		this.computers[key].right = false;
		this.computers[key].jump = false;
		this.computers[key].dropshot = false;

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
					this.computers[key].right = true;
				} else if (xAtGround < computerPosition.x + computerPosition.width / 6) {
					//ball is behind
					this.computers[key].left = true;
				} else if (this.canJump) {
					this.computers[key].jump = true;
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
					this.computers[key].left = true;
				} else if (xAtGround > computerPosition.x - computerPosition.width / 6) {
					//ball is behind
					this.computers[key].right = true;
				} else if (this.canJump) {
					this.computers[key].jump = true;
				}
			} else {
				//Avoid maluses or grab bonuses or move to center
				this.moveToCenter(modifiers.key, computerPosition, width);
			}
		}

		if (modifiers.isMoveReversed) {
			const left = this.computers[key].right;
			const right = this.computers[key].left;
			this.computers[key].left = left;
			this.computers[key].right = right;
		}
	}

	movesLeft(key) {
		if (this.computers.hasOwnProperty(key)) {
			return this.computers[key].left;
		}

		return false;
	}

	movesRight(key) {
		if (this.computers.hasOwnProperty(key)) {
			return this.computers[key].right;
		}

		return false;
	}

	jumps(key) {
		if (this.computers.hasOwnProperty(key)) {
			return this.computers[key].jump;
		}

		return false;
	}

	dropshots(key) {
		if (this.computers.hasOwnProperty(key)) {
			return this.computers[key].dropshot;
		}

		return false;
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
			this.computers[key].right = true;
		} else if (computerPosition.x - computerPosition.width / 4 > halfSpace) {
			this.computers[key].left = true;
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
