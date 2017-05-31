import Listener from '/imports/api/achievements/server/listeners/Listener.js';
import {ACHIEVEMENT_NINJA} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import GameFinished from '/imports/api/games/events/GameFinished.js';

export default class Ninja extends Listener {
	addListeners() {
		this.addListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
		this.addListener(GameFinished.prototype.constructor.name, this.onGameFinished);
	}

	removeListeners() {
		this.removeListener(GameFinished.prototype.constructor.name, this.onGameFinished);
		this.removeListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
	}

	/**
	 * @param {BonusCaught} event
	 */
	onBonusCaught(event) {
		if (
			event.gameId === this.gameId &&
			this.playerKeyIsUser(event.activatorPlayerKey)
		) {
			this.hasCaughtBonus = true;
		}
	}

	/**
	 * @param {GameFinished} event
	 */
	onGameFinished(event) {
		if (
			event.gameId === this.gameId &&
			!this.hasCaughtBonus &&
			this.userIsGamePlayer()
		) {
			this.incrementNumber(ACHIEVEMENT_NINJA);
		}
	}
}
