export default class KeepRegistrationAlive {

	start(gameId) {
		this.intervalFn = Meteor.setInterval(() => {
			var game = Games.findOne(gameId),
				player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

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
