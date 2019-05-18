import {onRenderGameController, onStopGameController} from '/imports/api/games/client/routeInitiator.js';
import {isTwoVersusTwoGameMode} from '/imports/api/games/constants';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {TeamEloScores} from '/imports/api/games/teameloscores';
import {Router} from 'meteor/iron:router';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

export const GameController = RouteController.extend({
	waitOn: function() {
		return Meteor.subscribe('game', this.params._id);
	},
	data: function() {
		const game = Games.findOne(this.params._id);
		let eloScores = EloScores.find({gameId: this.params._id});

		if (game && isTwoVersusTwoGameMode(game.gameMode)) {
			eloScores = TeamEloScores.find({gameId: this.params._id});
		}

		return {
			game: game,
			players: Players.find({gameId: this.params._id}, {sort: ['joinedAt']}),
			eloScores: eloScores
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
			onRenderGameController();

			Template.game.rendered = null;
		};
	},
	onStop: onStopGameController
});
