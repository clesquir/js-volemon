Router.configure({
	layoutTemplate: 'app',
	loadingTemplate: 'loading',
	waitOn: function() {
		return Meteor.subscribe('userData');
	}
});

Router.map(function() {
	this.route('home', {
		path: '/',
		waitOn: function() {
			Session.setDefault('gamesLimitOnHomePage', Config.gamesLimitOnHomePage);

			return [
				Meteor.subscribe('profileData'),
				Meteor.subscribe('recentProfileGames', Session.get('gamesLimitOnHomePage'))
			];
		},
		data: function() {
			return {
				profile: Profiles.findOne({userId: Meteor.userId()}),
				games: Games.find({}, {sort: [['createdAt', 'desc']]}),
				players: Players.find()
			};
		}
	});

	this.route('games-list', {
		path: '/games-list',
		waitOn: function() {
			return Meteor.subscribe('games');
		},
		data: function() {
			return {
				games: Games.find({status: {$in: [Constants.GAME_STATUS_REGISTRATION, Constants.GAME_STATUS_STARTED]}})
			};
		}
	});

	this.route('rank', {
		path: '/rank',
		waitOn: function() {
			return Meteor.subscribe('ranks');
		},
		data: function() {
			return {
				users: Meteor.users.find(),
				profiles: Profiles.find({}, {sort: [['eloRating', 'desc']]})
			};
		}
	});

	this.route('game', {
		path: '/:_id',
		waitOn: function() {
			return Meteor.subscribe('game', this.params._id);
		},
		data: function() {
			return {
				game: Games.findOne(this.params._id),
				players: Players.find({gameId: this.params._id})
			};
		},
		onBeforeAction: function() {
			var game = Games.findOne(this.params._id);

			if (!game) {
				Router.go('home');
			} else {
				Session.set('game', this.params._id);
			}

			this.next();
		}
	});
});
