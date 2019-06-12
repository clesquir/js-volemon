import GameListener from './GameListener.js';
import {ACHIEVEMENT_I_WAS_THERE_WAITING} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusRemoved from '/imports/api/games/events/BonusRemoved.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {BONUS_FREEZE_MONSTER} from '/imports/api/games/bonusConstants';

export default class IWasThereWaiting extends GameListener {
	allowedFor2Vs2() {
		return false;
	}

	addListeners() {
		this.addListener(PointTaken.prototype.constructor.name, this.onPointTaken);
		this.addListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
		this.addListener(BonusRemoved.prototype.constructor.name, this.onBonusRemoved);
	}

	removeListeners() {
		this.removeListener(BonusRemoved.prototype.constructor.name, this.onBonusRemoved);
		this.removeListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
		this.removeListener(PointTaken.prototype.constructor.name, this.onPointTaken);
	}

	/**
	 * @param {BonusCaught} event
	 */
	onBonusCaught(event) {
		if (
			event.gameId === this.gameId &&
			event.activatedBonusClass === BONUS_FREEZE_MONSTER &&
			this.playerKeyIsUser(event.targetPlayerKey)
		) {
			this.currentPlayerIsPaused = true;
		}
	}

	/**
	 * @param {BonusRemoved} event
	 */
	onBonusRemoved(event) {
		if (
			event.gameId === this.gameId &&
			event.activatedBonusClass === BONUS_FREEZE_MONSTER &&
			this.playerKeyIsUser(event.targetPlayerKey)
		) {
			this.currentPlayerIsPaused = false;
		}
	}

	/**
	 * @param {PointTaken} event
	 */
	onPointTaken(event) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			if (this.currentPlayerIsPaused && this.isPlayerHostSide() === event.pointScoredByHost) {
				this.incrementNumber(ACHIEVEMENT_I_WAS_THERE_WAITING);
			}

			this.currentPlayerIsPaused = false;
		}
	}
}
