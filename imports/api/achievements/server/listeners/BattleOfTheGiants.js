import {ACHIEVEMENT_BATTLE_OF_THE_GIANTS} from '/imports/api/achievements/constants.js';
import {BONUS_BIG_MONSTER} from '/imports/api/games/bonusConstants';
import {isTwoVersusTwoGameMode} from '/imports/api/games/constants';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import BonusRemoved from '/imports/api/games/events/BonusRemoved';
import PointTaken from '/imports/api/games/events/PointTaken';
import GameListener from './GameListener';

export default class BattleOfTheGiants extends GameListener {
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
