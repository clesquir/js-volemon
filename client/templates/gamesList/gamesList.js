import { Players } from '/collections/players.js';
import { Constants } from '/lib/constants.js';

Template.gamesList.helpers({
	createdByPlayerName: function() {
		var player = Players.findOne({gameId: this._id, userId: this.createdBy});

		if (player) {
			return player.name;
		} else {
			return '-';
		}
	},

	gameStatus: function() {
		switch (this.status) {
			case Constants.GAME_STATUS_REGISTRATION:
				return 'Registration';
			case Constants.GAME_STATUS_STARTED:
				return 'Started';
		}

		return '-';
	}
});

Template.gamesList.events({
	'click [data-action="go-to-game"]': function(e) {
		Router.go(Router.routes['game'].url({_id: this._id}));
	}
});
