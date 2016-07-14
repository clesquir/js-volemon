import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Profiles } from '/collections/profiles.js';

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
		controller: 'HomeController'
	});

	//This is use for various game environment tests
	if (Meteor.isDevelopment) {
		this.route('test-environment', {
			path: '/test-environment'
		});
	}

	this.route('games-list', {
		path: '/games-list',
		waitOn: function() {
			return Meteor.subscribe('games');
		},
		data: function() {
			return {
				games: Games.find({}, {sort: ['createdAt']})
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
				players: Players.find({gameId: this.params._id}, {sort: ['joinedAt']}),
				profiles: Profiles.find()
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
