import GameListener from './GameListener';
import {ACHIEVEMENT_TO_THE_SKY} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import BonusRemoved from '/imports/api/games/events/BonusRemoved';
import PointTaken from '/imports/api/games/events/PointTaken';
import {
	BONUS_SMALL_MONSTER,
	BONUS_BIG_JUMP_MONSTER,
	BONUS_BOUNCE_MONSTER
} from '/imports/api/games/bonusConstants';

export default class ToTheSky extends GameListener {
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
