import Listener from '/imports/api/achievements/server/listeners/Listener.js';
import {ACHIEVEMENT_RAKSHASA} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import {BONUS_SHAPE_SHIFT} from '/imports/api/games/bonusConstants.js'
import {PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js'

export default class Rakshasa extends Listener {
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
			this.playerKeyIsUser(event.activatorPlayerKey) &&
			event.bonusClass === BONUS_SHAPE_SHIFT
		) {
			this.addShapeCaught(event.activationData.playerShape);

			if (this.hasCaughtAllShapes()) {
				this.incrementNumber(ACHIEVEMENT_RAKSHASA);
				this.initShapesCaught();
			}
		}
	}

	availableShapes() {
		return PLAYER_LIST_OF_SHAPES;
	}

	initShapesCaught() {
		const shapes = this.availableShapes();

		this.shapesCaught = {};
		for (let shape of shapes) {
			this.shapesCaught[shape] = false;
		}

		//Add initial player shape
		this.shapesCaught[this.currentPlayerShape()] = true;
	}

	/**
	 * @param shape
	 */
	addShapeCaught(shape) {
		if (!this.shapesCaught) {
			this.initShapesCaught();
		}

		this.shapesCaught[shape] = true;
	}

	/**
	 * @returns {boolean}
	 */
	hasCaughtAllShapes() {
		for (let shape in this.shapesCaught) {
			if (this.shapesCaught.hasOwnProperty(shape) && !this.shapesCaught[shape]) {
				return false;
			}
		}

		return true;
	}
}
