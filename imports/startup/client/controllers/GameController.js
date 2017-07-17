import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {updateConnectionIndicator, destroyConnectionIndicator} from '/imports/api/games/client/connectionIndicator.js';
import {initGame, quitGame, destroyGame, unsetGameSessions} from '/imports/api/games/client/routeInitiator.js';
import {Profiles} from '/imports/api/profiles/profiles.js';

export const GameController = RouteController.extend({
	waitOn: function() {
		return Meteor.subscribe('game', this.params._id);
	},
	data: function() {
		return {
			game: Games.findOne(this.params._id),
			players: Players.find({gameId: this.params._id}, {sort: ['joinedAt']}),
			profiles: Profiles.find(),
			eloScores: EloScores.find({gameId: this.params._id})
		};
	},
	onBeforeAction: function() {
		const game = Games.findOne(this.params._id);

		if (!game) {
			Router.go('home');
		} else {
			Session.set('game', this.params._id);
		}

		this.next();
	},
	action: function() {
		this.render('game');

		Template.game.rendered = function() {
			initGame(Session.get('game'));

			$(window).bind('beforeunload', function() {
				quitGame(Session.get('game'));
				destroyGame(Session.get('game'));
			});

			updateConnectionIndicator();

			Template.game.rendered = null;
		};
	},
	onStop: function() {
		quitGame(Session.get('game'));
		destroyGame(Session.get('game'));
		destroyConnectionIndicator();
		unsetGameSessions();
	}
});