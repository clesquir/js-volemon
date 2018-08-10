import GameListener from './GameListener.js';
import {ACHIEVEMENT_BATTLE_OF_THE_GIANTS} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusRemoved from '/imports/api/games/events/BonusRemoved.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {BONUS_BIG_MONSTER} from '/imports/api/games/bonusConstants.js';

export default class BattleOfTheGiants extends GameListener {
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
			event.activatedBonusClass === BONUS_BIG_MONSTER
		) {
			this.onBonus(event, true);
		}
	}

	/**
	 * @param {BonusRemoved} event
	 */
	onBonusRemoved(event) {
		if (
			event.gameId === this.gameId &&
			event.activatedBonusClass === BONUS_BIG_MONSTER
		) {
			this.onBonus(event, false);
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
			if (this.currentPlayerIsBig && this.oppositePlayerIsBig && this.isPlayerHostSide() === event.pointScoredByHost) {
				this.incrementNumber(ACHIEVEMENT_BATTLE_OF_THE_GIANTS);
			}

			this.currentPlayerIsBig = false;
			this.oppositePlayerIsBig = false;
		}
	}

	/**
	 * @param {BonusCaught|BonusRemoved} event
	 * @param {boolean} activate
	 */
	onBonus(event, activate) {
		if (this.playerKeyIsOpponent(event.targetPlayerKey)) {
			this.oppositePlayerIsBig = activate;
		} else if (this.playerKeyIsUser(event.targetPlayerKey)) {
			this.currentPlayerIsBig = activate;
		}
	}
}
