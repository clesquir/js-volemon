import {Games} from '/imports/api/games/games.js';
import {Router} from 'meteor/iron:router';

export default class GameRematch {

	/**
	 * @param {string} gameId
	 * @param {GameData} gameData
	 */
	constructor(gameId, gameData) {
		this.gameId = gameId;
		this.gameData = gameData;
	}

	init() {
		this.gameRematchTracker = Games.find({_id: this.gameId}).observeChanges({
			changed: (id, fields) => {
				if (fields.hasOwnProperty('rematchGameId')) {
					Session.set('appLoadingMask', true);
					Session.set('appLoadingMask.text', 'Creating rematch...');

					if (this.gameData.hasTournament()) {
						Router.go('tournamentGame', {tournamentId: this.gameData.tournamentId, gameId: fields.rematchGameId});
					} else {
						Router.go('game', {_id: fields.rematchGameId});
					}
				}
			}
		});
	}

	stop() {
		if (this.gameRematchTracker) {
			this.gameRematchTracker.stop();
		}
	}

}
