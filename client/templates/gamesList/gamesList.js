import { Constants } from '/lib/constants.js';

Template.gamesList.helpers({
	createdByUserName: function() {
		var user = Meteor.users.findOne({_id: this.createdBy});

		if (user) {
			return user.profile.name;
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
