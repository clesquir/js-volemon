import {Games} from '/collections/games.js';

export default class GameRematch {

	constructor(gameId) {
		this.gameId = gameId;
	}

	init() {
		this.gameRematchTracker = Games.find({_id: this.gameId}).observeChanges({
			changed: (id, fields) => {
				if (fields.hasOwnProperty('rematchGameId')) {
					Session.set('apploadingmask', true);
					Router.go(Router.routes['game'].url({_id: fields.rematchGameId}));
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
