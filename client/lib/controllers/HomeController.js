HomeController = RouteController.extend({
	subscriptions: function() {
		return Meteor.subscribe('profileData');
	},
	onBeforeAction: function() {
		this.state.setDefault('gamesLimit', Config.gamesLimitOnHomePage);
		this.next();
	},
	gamesIncrement: function() {
		return Config.gamesIncrementOnHomePage;
	},
	gamesLimit: function () {
		return this.state.get('gamesLimit') || this.gamesIncrement();
	},
	gamesCount: function() {
		return Games.find({}, {sort: [['createdAt', 'desc']]}).count();
	},
	action: function () {
		Meteor.subscribe('recentProfileGames', this.gamesLimit());

		if (this.ready()) {
			this.render();
		} else {
			this.next();
		}
	},
	data: function() {
		return {
			profile: Profiles.findOne({userId: Meteor.userId()}),
			games: Games.find({}, {sort: [['createdAt', 'desc']]}),
			players: Players.find()
		};
	}
});
