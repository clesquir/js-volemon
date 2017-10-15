import Listener from '/imports/api/achievements/server/listeners/Listener.js';
import {ACHIEVEMENT_TO_THE_SKY} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusRemoved from '/imports/api/games/events/BonusRemoved.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {
	BONUS_SMALL_MONSTER,
	BONUS_BIG_JUMP_MONSTER,
	BONUS_BOUNCE_MONSTER
} from '/imports/api/games/bonusConstants.js';

export default class ToTheSky extends Listener {
	allowedForTournamentGame() {
		return true;
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
			this.playerKeyIsUser(event.targetPlayerKey)
		) {
			this.onBonus(event, true);

			if (
				this.currentPlayerIsSmall &&
				this.currentPlayerIsBigJump &&
				this.currentPlayerIsBouncy
			) {
				this.incrementNumber(ACHIEVEMENT_TO_THE_SKY);
			}
		}
	}

	/**
	 * @param {BonusRemoved} event
	 */
	onBonusRemoved(event) {
		if (
			event.gameId === this.gameId &&
			this.playerKeyIsUser(event.targetPlayerKey)
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
			this.currentPlayerIsSmall = false;
			this.currentPlayerIsBigJump = false;
			this.currentPlayerIsBouncy = false;
		}
	}

	/**
	 * @param {BonusCaught|BonusRemoved} event
	 * @param {boolean} activate
	 */
	onBonus(event, activate) {
		if (event.activatedBonusClass === BONUS_SMALL_MONSTER) {
			this.currentPlayerIsSmall = activate;
		}
		if (event.activatedBonusClass === BONUS_BIG_JUMP_MONSTER) {
			this.currentPlayerIsBigJump = activate;
		}
		if (event.activatedBonusClass === BONUS_BOUNCE_MONSTER) {
			this.currentPlayerIsBouncy = activate;
		}
	}
}
