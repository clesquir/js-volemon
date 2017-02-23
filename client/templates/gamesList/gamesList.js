import { Constants } from '/imports/lib/constants.js';

Template.gamesList.helpers({
	creatorName: function() {
		if (this.creatorName !== undefined) {
			return this.creatorName;
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
