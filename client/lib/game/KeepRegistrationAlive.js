import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Config } from '/lib/config.js';
import { Constants } from '/lib/constants.js';

export default class KeepRegistrationAlive {

	constructor(gameId) {
		this.gameId = gameId;
	}

	start() {
		this.intervalFn = Meteor.setInterval(() => {
			var game = Games.findOne(this.gameId),
				player = Players.findOne({gameId: this.gameId, userId: Meteor.userId()});

			if (game && player && game.status === Constants.GAME_STATUS_REGISTRATION) {
				Meteor.call('keepPlayerAlive', player._id, (error) => {
					if (error && error.error === 404) {
						Meteor.clearInterval(this.intervalFn);
					}
				});
			} else {
				Meteor.clearInterval(this.intervalFn);
			}
		}, Config.keepAliveInterval);
	}

	stop() {
		Meteor.clearInterval(this.intervalFn);
	}

}
