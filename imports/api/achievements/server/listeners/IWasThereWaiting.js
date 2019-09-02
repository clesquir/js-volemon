import {ACHIEVEMENT_I_WAS_THERE_WAITING} from '/imports/api/achievements/constants.js';
import {BONUS_FREEZE_MONSTER} from '/imports/api/games/bonusConstants';
import {isTwoVersusTwoGameMode} from '/imports/api/games/constants';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import BonusRemoved from '/imports/api/games/events/BonusRemoved';
import PointTaken from '/imports/api/games/events/PointTaken';
import GameListener from './GameListener';

export default class IWasThereWaiting extends GameListener {
	allowedForGameMode(gameMode) {
		return !isTwoVersusTwoGameMode(gameMode);
	}

	addListeners() {
		this.addListener(PointTaken.getClassName(), this.onPointTaken);
		this.addListener(BonusCaught.getClassName(), this.onBonusCaught);
		this.addListener(BonusRemoved.getClassName(), this.onBonusRemoved);
	}

	removeListeners() {
		this.removeListener(BonusRemoved.getClassName(), this.onBonusRemoved);
		this.removeListener(BonusCaught.getClassName(), this.onBonusCaught);
		this.removeListener(PointTaken.getClassName(), this.onPointTaken);
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
