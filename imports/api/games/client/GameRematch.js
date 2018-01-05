import {Router} from 'meteor/iron:router';
import {Games} from '/imports/api/games/games.js';

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

					let timeout = 1000;
					if (this.gameData.isUserClient()) {
						timeout = 0;
					} else if (this.gameData.isUserHost()) {
						timeout = 500;
					}

					Meteor.setTimeout(() => {
						if (this.gameData.hasTournament()) {
							Router.go('tournamentGame', {tournamentId: this.gameData.tournamentId, gameId: fields.rematchGameId});
						} else {
							Router.go('game', {_id: fields.rematchGameId});
						}
					}, timeout);
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
