import Learner from '/imports/api/games/artificialIntelligence/Learner.js';
import {CLIENT_POINTS_COLUMN, HOST_POINTS_COLUMN} from '/imports/api/games/constants.js';
import clientGenomes from '/public/assets/artificial-intelligence/client_genomes.json';
import hostGenomes from '/public/assets/artificial-intelligence/host_genomes.json';

export default class ArtificialIntelligence {
	computers = {};
	pointStartTime = 0;
	numberPointsToCalculateGenomes = 5;
	genomesFromExisting = true;

	addComputerWithKey(key, machineLearning = false, isLearning = false) {
		this.computers[key] = {
			isLearning: isLearning,
			left: false,
			right: false,
			jump: false,
			dropshot: false,
			numberPointsForCurrentGenome: 0,
			cumulatedFitness: 0
		};

		if (machineLearning) {
			this.computers[key].learner = new Learner(6, 2, 12, 4, 0.2);
			this.computers[key].learner.init();

			if (this.genomesFromExisting) {
				this.loadGenomes(
					key,
					JSON.stringify(key === 'player1' || key === 'player3' ? hostGenomes : clientGenomes)
				);
			}
		}
	}

	currentGeneration(key) {
		if (this.computers.hasOwnProperty(key) && this.computers[key].learner) {
			return this.computers[key].learner.generation;
		}

		return 1;
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
			if (this.computers.hasOwnProperty(key) && this.computers[key].learner && this.computers[key].isLearning) {
				const pointTime = ((new Date()).getTime() - this.pointStartTime);
				let fitness = 0;

				//When it has the point, the shortest the point, the better
				//When it doesn't, the longest the point, the better. Negative value
				if (pointSide === HOST_POINTS_COLUMN) {
					//fitness = 1 / pointTime * 10000000;

					if (key === 'player2') {
						fitness = -1 / pointTime * 10000000;
					} else {
						console.log('SCORED!');
					}
				} else if (pointSide === CLIENT_POINTS_COLUMN) {
					//fitness = 1 / pointTime * 10000000;

					if (key === 'player1') {
						fitness = -1 / pointTime * 10000000;
					} else {
						console.log('SCORED!');
					}
				}

				this.computers[key].cumulatedFitness += fitness;
				this.computers[key].numberPointsForCurrentGenome++;

				if (this.computers[key].numberPointsForCurrentGenome >= this.numberPointsToCalculateGenomes) {
					this.computers[key].learner.applyGenomeFitness(this.computers[key].cumulatedFitness);

					//Reset
					this.computers[key].numberPointsForCurrentGenome = 0;
					this.computers[key].cumulatedFitness = 0;
				}
			}
		}
	}

	/**
	 * @param key
	 * @param {{key: string, isMoveReversed: boolean, horizontalMoveModifier: Function, verticalMoveModifier: Function, alwaysJump: boolean, canJump: boolean, velocityXOnMove: number, velocityYOnJump: number}} modifiers
	 * @param outputs
	 */
	applyLearnerOutput(key, modifiers, outputs) {
		if (this.computers.hasOwnProperty(key) && outputs.length === 2) {
			if (outputs[0] < 0.45) {
				this.moveLeft(key);
			} else if (outputs[0] > 0.55) {
				this.moveRight(key);
			} else {
				this.stopMovingHorizontally(key);
			}

			this.computers[key].jump = false;
			this.computers[key].dropshot = false;

			if (outputs[1] < 0.45) {
				this.computers[key].jump = true;
			} else if (outputs[1] > 0.55) {
				this.computers[key].dropshot = true;
			}

			this.applyModifiers(key, modifiers);
		}
	}

	/**
	 * @param {string} key
	 * @param {{key: string, isMoveReversed: boolean, horizontalMoveModifier: Function, verticalMoveModifier: Function, alwaysJump: boolean, canJump: boolean, velocityXOnMove: number, velocityYOnJump: number}} modifiers
	 * @param {{x: number, y: number, scale: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}} computerPosition
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}} ballPosition
	 * @param {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}[]} bonusesPosition
	 * @param {GameConfiguration} gameConfiguration
	 * @param {Engine} engine
	 */
	computeMovement(key, modifiers, computerPosition, ballPosition, bonusesPosition, gameConfiguration, engine) {
		const isLeft = this.isLeftPlayer(modifiers);
		const width = gameConfiguration.width();
		const halfWidth = (width / 2);
		const height = gameConfiguration.height();
		const groundY = height - gameConfiguration.groundHeight();

		if (this.computers[key].learner) {
			if (
				Math.round(ballPosition.velocityX) === 0 &&
				isLeft === (ballPosition.x < halfWidth)
			) {
				//Reduce fitness if ball stalled horizontally on player's side
				this.computers[key].cumulatedFitness -= 10;
			}
			if (isLeft === (ballPosition.x > halfWidth)) {
				//Increase fitness if ball is not on player's side
				this.computers[key].cumulatedFitness += 1;
			} else {
				//Reduce fitness if ball is on player's side
				this.computers[key].cumulatedFitness -= 1;
			}

			this.applyLearnerOutput(
				key,
				modifiers,
				this.computers[key].learner.emitData(
					[
						this.round5(computerPosition.x - ballPosition.x), //Distance X from ball
						this.round5(computerPosition.y - ballPosition.y), //Distance Y from ball
						Math.round(ballPosition.x / width * 100),
						this.round5(groundY - ballPosition.y), //Distance from ground
						this.round5(ballPosition.velocityX), //Ball X speed
						this.round5(ballPosition.velocityY) //Ball Y speed
					]
				)
			);

			return;
		}

		this.computers[key].jump = false;
		this.computers[key].dropshot = false;

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

		const horizontalThreshold = 90;
		const distanceWithTimeToGround = timeToGround * modifiers.velocityXOnMove * modifiers.horizontalMoveModifier();

		if (isLeft) {
			if (xAtGround < halfWidth) {
				if (
					this.shouldSmash(modifiers.key, modifiers, ballPosition, computerPosition, halfWidth, netY, netWidth) ||
					this.isSmashing(modifiers.key, computerPosition)
				) {
					this.computers[key].jump = true;
					this.moveRight(key);
					this.computers[key].isSmashing = true;
				} else {
					this.computers[key].isSmashing = false;

					if (
						this.ballWillFallAhead(isLeft, xAtGround, computerPosition) &&
						this.playerAtTheNet(isLeft, halfWidth, netWidth, computerPosition) === false
					) {
						if (computerPosition.x + distanceWithTimeToGround > xAtGround + horizontalThreshold) {
							this.stopMovingHorizontally(key);
						} else {
							this.moveRight(key);
						}
					} else if (
						this.ballWillFallBehind(isLeft, xAtGround, computerPosition) &&
						this.playerIsBackToTheWall(isLeft, width, computerPosition) === false
					) {
						this.moveLeft(key);
					} else {
						this.stopMovingHorizontally(key);
					}
				}
			} else if (!this.isSmashing(modifiers.key, computerPosition)) {
				//Avoid maluses or grab bonuses or move to center
				this.moveToCenter(modifiers.key, modifiers, computerPosition, width);
				this.computers[key].isSmashing = false;
			}
		} else {
			if (xAtGround > halfWidth) {
				if (
					this.shouldSmash(modifiers.key, modifiers, ballPosition, computerPosition, halfWidth, netY, netWidth) ||
					this.isSmashing(modifiers.key, computerPosition)
				) {
					this.computers[key].jump = true;
					this.moveLeft(key);
					this.computers[key].isSmashing = true;
				} else {
					this.computers[key].isSmashing = false;

					if (
						this.ballWillFallAhead(isLeft, xAtGround, computerPosition) &&
						this.playerAtTheNet(isLeft, halfWidth, netWidth, computerPosition) === false
					) {
						if (computerPosition.x - distanceWithTimeToGround < xAtGround - horizontalThreshold) {
							this.stopMovingHorizontally(key);
						} else {
							this.moveLeft(key);
						}
					} else if (
						this.ballWillFallBehind(isLeft, xAtGround, computerPosition) &&
						this.playerIsBackToTheWall(isLeft, width, computerPosition) === false
					) {
						this.moveRight(key);
					} else {
						this.stopMovingHorizontally(key);
					}
				}
			} else if (!this.isSmashing(modifiers.key, computerPosition)) {
				//Avoid maluses or grab bonuses or move to center
				this.moveToCenter(modifiers.key, modifiers, computerPosition, width);
				this.computers[key].isSmashing = false;
			}
		}

		this.applyModifiers(key, modifiers);
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
	 */
	moveLeft(key) {
		this.computers[key].left = true;
		this.computers[key].right = false;
	}

	/**
	 * @private
	 * @param key
	 */
	moveRight(key) {
		this.computers[key].right = true;
		this.computers[key].left = false;
	}

	/**
	 * @private
	 * @param key
	 */
	stopMovingHorizontally(key) {
		this.computers[key].left = false;
		this.computers[key].right = false;
	}

	/**
	 * @private
	 * @param key
	 * @param modifiers
	 * @param ballPosition
	 * @param computerPosition
	 * @param halfLevelWidth
	 * @param netY
	 * @param netWidth
	 * @returns {boolean}
	 */
	shouldSmash(key, modifiers, ballPosition, computerPosition, halfLevelWidth, netY, netWidth) {
		let isLeft = this.isLeftPlayer(modifiers);
		let width = computerPosition.width;
		let maximumHeight = netY - computerPosition.height * 2.5;
		let minimumHeight = netY - computerPosition.height * 1.75;
		let playerLeftLimit;
		let playerRightLimit;

		if (isLeft) {
			playerLeftLimit = computerPosition.x + width;
			playerRightLimit = playerLeftLimit + width;
			//limit to net
			if (playerRightLimit > halfLevelWidth - netWidth) {
				playerRightLimit = halfLevelWidth - netWidth;
			}
		} else {
			playerRightLimit = computerPosition.x - width;
			playerLeftLimit = playerRightLimit - width;
			//limit to net
			if (playerLeftLimit < halfLevelWidth + netWidth) {
				playerLeftLimit = halfLevelWidth + netWidth;
			}
		}

		return (
			modifiers.canJump &&
			Math.abs(ballPosition.velocityX) < 350 &&
			ballPosition.velocityY > 0 &&
			ballPosition.x > playerLeftLimit &&
			ballPosition.x < playerRightLimit &&
			ballPosition.y > maximumHeight &&
			ballPosition.y < minimumHeight &&
			this.playerAtTheNet(isLeft, halfLevelWidth, netWidth, computerPosition) === false
		);
	}

	/**
	 * @private
	 * @param key
	 * @param computerPosition
	 */
	isSmashing(key, computerPosition) {
		return this.computers[key].isSmashing && computerPosition.velocityY < 0;
	}

	/**
	 * @private
	 * @param key
	 * @param modifiers
	 * @param computerPosition
	 * @param width
	 */
	moveToCenter(key, modifiers, computerPosition, width) {
		const halfSpace = (this.isLeftPlayer(modifiers) ? width * 1 / 4 : width * 3 / 4);

		if (computerPosition.x + computerPosition.width / 4 < halfSpace) {
			this.moveRight(key);
		} else if (computerPosition.x - computerPosition.width / 4 > halfSpace) {
			this.moveLeft(key);
		} else {
			this.stopMovingHorizontally(key);
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
	 * @param key
	 * @param {{key: string, isMoveReversed: boolean, horizontalMoveModifier: Function, verticalMoveModifier: Function, alwaysJump: boolean, canJump: boolean, velocityXOnMove: number, velocityYOnJump: number}} modifiers
	 */
	applyModifiers(key, modifiers) {
		if (modifiers.isMoveReversed !== modifiers.velocityXOnMove < 0) {
			const left = this.computers[key].right;
			const right = this.computers[key].left;
			this.computers[key].left = left;
			this.computers[key].right = right;
		}
	}

	/**
	 * @private
	 * @param {number} value
	 * @returns {number}
	 */
	round5(value) {
		return Math.ceil(value / 5) * 5;
	}
}
