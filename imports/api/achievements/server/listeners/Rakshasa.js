import GameListener from './GameListener.js';
import {ACHIEVEMENT_RAKSHASA} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import {BONUS_SHAPE_SHIFT} from '/imports/api/games/bonusConstants.js'
import {PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js'

export default class Rakshasa extends GameListener {
	allowedForTournamentGame() {
		return true;
	}

	addListeners() {
		this.addListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
	}

	removeListeners() {
		this.removeListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
	}

	/**
	 * @param {BonusCaught} event
	 */
	onBonusCaught(event) {
		if (
			event.gameId === this.gameId &&
			event.bonusClass === BONUS_SHAPE_SHIFT &&
			this.playerKeyIsUser(event.activatorPlayerKey)
		) {
			this.updateShapesCaught(event.activationData.playerShape);
		}
	}

	updateShapesCaught(playerShape) {
		const userAchievement = this.userAchievement(ACHIEVEMENT_RAKSHASA);
		let currentNumber = 0;
		let shapes = {};

		if (!userAchievement) {
			shapes[playerShape] = 1;

			this.insertAchievement(
				ACHIEVEMENT_RAKSHASA,
				{shapes: shapes, number: 0}
			);
		} else {
			currentNumber = userAchievement.number;
			shapes = userAchievement.shapes || {};
			if (shapes[playerShape] === undefined) {
				shapes[playerShape] = 0;
			}
			shapes[playerShape]++;

			this.updateAchievement(
				ACHIEVEMENT_RAKSHASA,
				{shapes: shapes}
			);
		}

		if (this.allShapesCaughtAreGreaterThan(shapes, currentNumber)) {
			this.incrementNumber(ACHIEVEMENT_RAKSHASA);
		}
	}

	listOfShapes() {
		return PLAYER_LIST_OF_SHAPES;
	}

	/**
	 * @private
	 * @param shapes
	 * @param {int} currentNumber
	 * @returns {boolean} True if all shapes are there with greater number of times
	 */
	allShapesCaughtAreGreaterThan(shapes, currentNumber) {
		for (let shape of this.listOfShapes()) {
			if (shapes[shape] === undefined) {
				return false;
			} else if (shapes[shape] <= currentNumber) {
				return false;
			}
		}

		return true;
	}
}
