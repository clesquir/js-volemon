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
					Session.set('apploadingmask', true);

					let timeout = 1000;
					if (this.gameData.isUserClient()) {
						timeout = 0;
					} else if (this.gameData.isUserHost()) {
						timeout = 500;
					}

					Meteor.setTimeout(() => {
						Router.go(Router.routes['game'].url({_id: fields.rematchGameId}));
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
