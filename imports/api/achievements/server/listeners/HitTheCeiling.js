import {ACHIEVEMENT_HIT_THE_CEILING} from '/imports/api/achievements/constants';
import {BONUS_BIG_JUMP_MONSTER, BONUS_LOW_GRAVITY, BONUS_SMALL_MONSTER} from '/imports/api/games/bonusConstants';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import BonusRemoved from '/imports/api/games/events/BonusRemoved';
import PointTaken from '/imports/api/games/events/PointTaken';
import GameListener from './GameListener';

export default class HitTheCeiling extends GameListener {
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
		if (event.gameId === this.gameId) {
			if (event.activatedBonusClass === BONUS_LOW_GRAVITY) {
				this.isLowGravity = true;
			}
			if (this.playerKeyIsUser(event.targetPlayerKey)) {
				if (event.activatedBonusClass === BONUS_SMALL_MONSTER) {
					this.isSmall = true;
				}
				if (event.activatedBonusClass === BONUS_BIG_JUMP_MONSTER) {
					this.isBigJump = true;
				}
			}

			if (
				this.isLowGravity &&
				this.isSmall &&
				this.isBigJump
			) {
				this.incrementNumber(ACHIEVEMENT_HIT_THE_CEILING);
				this.resetBonuses();
			}
		}
	}

	/**
	 * @param {BonusRemoved} event
	 */
	onBonusRemoved(event) {
		if (event.gameId === this.gameId) {
			if (event.activatedBonusClass === BONUS_LOW_GRAVITY) {
				this.isLowGravity = false;
			}
			if (this.playerKeyIsUser(event.targetPlayerKey)) {
				if (event.activatedBonusClass === BONUS_SMALL_MONSTER) {
					this.isSmall = false;
				}
				if (event.activatedBonusClass === BONUS_BIG_JUMP_MONSTER) {
					this.isBigJump = false;
				}
			}
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
			this.resetBonuses();
		}
	}

	resetBonuses() {
		this.isLowGravity = false;
		this.isSmall = false;
		this.isBigJump = false;
	}
}
