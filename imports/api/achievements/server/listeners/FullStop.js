import {ACHIEVEMENT_FULL_STOP} from '/imports/api/achievements/constants.js';
import {isTwoVersusTwoGameMode} from '/imports/api/games/constants';
import {GAME_MAXIMUM_POINTS} from '/imports/api/games/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon';
import {PLAYER_SHAPE_DOT} from '/imports/api/games/shapeConstants.js'
import GameListener from './GameListener';

export default class FullStop extends GameListener {
	allowedForGameMode(gameMode) {
		return !isTwoVersusTwoGameMode(gameMode);
	}

	allowedForGameOverride() {
		const gameOverride = this.gameOverride();

		return !gameOverride.overridesMaximumPoints() || gameOverride.maximumPoints() === GAME_MAXIMUM_POINTS;
	}

	addListeners() {
		this.addListener(PlayerWon.getClassName(), this.onPlayerWon);
	}

	removeListeners() {
		this.removeListener(PlayerWon.getClassName(), this.onPlayerWon);
	}

	/**
	 * @param {PlayerWon} event
	 */
	onPlayerWon(event) {
		if (
			event.gameId === this.gameId &&
			event.userId === this.userId &&
			event.winnerPoints === this.gameMaximumPoints() &&
			event.loserPoints === 0 &&
			this.currentPlayerShape() === PLAYER_SHAPE_DOT &&
			this.oppositePlayerShape() !== PLAYER_SHAPE_DOT
		) {
			this.incrementNumber(ACHIEVEMENT_FULL_STOP);
		}
	}
}
