import {ACHIEVEMENT_TEENY_TINY_WORLD} from '/imports/api/achievements/constants.js';
import {BONUS_SMALL_BALL, BONUS_SMALL_MONSTER} from '/imports/api/games/bonusConstants';
import {isTwoVersusTwoGameMode} from '/imports/api/games/constants';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import BonusRemoved from '/imports/api/games/events/BonusRemoved';
import PointTaken from '/imports/api/games/events/PointTaken';
import GameListener from './GameListener';

export default class TeenyTinyWorld extends GameListener {
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
		if (event.gameId === this.gameId) {
			if (event.activatedBonusClass === BONUS_SMALL_MONSTER) {
				this.onSmallMonsterBonus(event, true);
			}
			if (event.activatedBonusClass === BONUS_SMALL_BALL) {
				this.ballIsSmall = true;
			}

			if (
				this.currentPlayerIsSmall &&
				this.oppositePlayerIsSmall &&
				this.ballIsSmall
			) {
				this.incrementNumber(ACHIEVEMENT_TEENY_TINY_WORLD);
				this.resetBonuses();
			}
		}
	}

	/**
	 * @param {BonusRemoved} event
	 */
	onBonusRemoved(event) {
		if (event.gameId === this.gameId) {
			if (event.activatedBonusClass === BONUS_SMALL_MONSTER) {
				this.onSmallMonsterBonus(event, false);
			}
			if (event.activatedBonusClass === BONUS_SMALL_BALL) {
				this.ballIsSmall = false;
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

	/**
	 * @param {BonusCaught|BonusRemoved} event
	 * @param {boolean} activate
	 */
	onSmallMonsterBonus(event, activate) {
		if (this.playerKeyIsOpponent(event.targetPlayerKey)) {
			this.oppositePlayerIsSmall = activate;
		} else if (this.playerKeyIsUser(event.targetPlayerKey)) {
			this.currentPlayerIsSmall = activate;
		}
	}

	resetBonuses() {
		this.currentPlayerIsSmall = false;
		this.oppositePlayerIsSmall = false;
		this.ballIsSmall = false;
	}
}
