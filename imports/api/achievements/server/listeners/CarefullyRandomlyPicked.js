import Listener from '/imports/api/achievements/server/listeners/Listener.js';
import {ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED} from '/imports/api/achievements/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import {Players} from '/imports/api/games/players.js';
import {PLAYER_LIST_OF_SHAPES, PLAYER_SHAPE_RANDOM} from '/imports/api/games/shapeConstants.js';

export default class CarefullyRandomlyPicked extends Listener {
	addListeners() {
		this.addListener(PlayerWon.prototype.constructor.name, this.onPlayerWon);
	}

	removeListeners() {
		this.removeListener(PlayerWon.prototype.constructor.name, this.onPlayerWon);
	}

	/**
	 * @param {PlayerWon} event
	 */
	onPlayerWon(event) {
		if (
			event.gameId === this.gameId &&
			event.userId === this.userId
		) {
			const player = Players.findOne({gameId: this.gameId, userId: this.userId});

			if (player.selectedShape === PLAYER_SHAPE_RANDOM) {
				this.updateShapesWon(player.shape);
			}
		}
	}

	updateShapesWon(playerShape) {
		const userAchievement = this.userAchievement(ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED);
		let currentNumber = 0;
		let wonShapes = {};

		if (!userAchievement) {
			wonShapes[playerShape] = 1;

			this.insertAchievement(
				ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED,
				{shapes: wonShapes, number: 0}
			);
		} else {
			currentNumber = userAchievement.number;
			wonShapes = userAchievement.shapes;
			if (wonShapes[playerShape] === undefined) {
				wonShapes[playerShape] = 0;
			}
			wonShapes[playerShape]++;

			this.updateAchievement(
				ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED,
				{shapes: wonShapes}
			);
		}

		if (this.allShapesUseAreGreaterThan(wonShapes, currentNumber)) {
			this.incrementNumber(ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED);
		}
	}

	/**
	 * @private
	 * @param wonShapes
	 * @param {int} currentNumber
	 * @returns {boolean} True if all shapes are there with greater number of times
	 */
	allShapesUseAreGreaterThan(wonShapes, currentNumber) {
		for (let shape of this.listOfShapes()) {
			if (wonShapes[shape] === undefined) {
				return false;
			} else if (wonShapes[shape] <= currentNumber) {
				return false;
			}
		}

		return true;
	}

	listOfShapes() {
		return PLAYER_LIST_OF_SHAPES;
	}
}
