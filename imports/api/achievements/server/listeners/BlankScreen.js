import {ACHIEVEMENT_BLANK_SCREEN} from '/imports/api/achievements/constants.js';
import {BONUS_CLOAKED_MONSTER, BONUS_INVISIBLE_BALL, BONUS_INVISIBLE_MONSTER} from '/imports/api/games/bonusConstants';
import {isTwoVersusTwoGameMode} from '/imports/api/games/constants';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import BonusRemoved from '/imports/api/games/events/BonusRemoved';
import PointTaken from '/imports/api/games/events/PointTaken';
import GameListener from './GameListener';

export default class BlankScreen extends GameListener {
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
			this.userIsGamePlayer()
		) {
			this.onBonus(event, true);

			if (
				this.ballIsInvisible &&
				(this.currentPlayerIsInvisible || this.currentPlayerIsCloaked) &&
				(this.oppositePlayerIsInvisible || this.oppositePlayerIsCloaked)
			) {
				this.incrementNumber(ACHIEVEMENT_BLANK_SCREEN);
			}
		}
	}

	/**
	 * @param {BonusRemoved} event
	 */
	onBonusRemoved(event) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
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
			this.ballIsInvisible = false;
			this.currentPlayerIsInvisible = false;
			this.currentPlayerIsCloaked = false;
			this.oppositePlayerIsInvisible = false;
			this.oppositePlayerIsCloaked = false;
		}
	}

	/**
	 * @param {BonusCaught|BonusRemoved} event
	 * @param {boolean} activate
	 */
	onBonus(event, activate) {
		if (event.activatedBonusClass === BONUS_INVISIBLE_BALL) {
			this.ballIsInvisible = activate;
		}

		if (event.activatedBonusClass === BONUS_INVISIBLE_MONSTER) {
			if (this.playerKeyIsOpponent(event.targetPlayerKey)) {
				this.oppositePlayerIsInvisible = activate;
			} else if (this.playerKeyIsUser(event.targetPlayerKey)) {
				this.currentPlayerIsInvisible = activate;
			}
		}

		if (event.activatedBonusClass === BONUS_CLOAKED_MONSTER) {
			if (this.playerKeyIsOpponent(event.targetPlayerKey)) {
				this.oppositePlayerIsCloaked = activate;
			} else if (this.playerKeyIsUser(event.targetPlayerKey)) {
				this.currentPlayerIsCloaked = activate;
			}
		}
	}
}
