import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';
import {onRenderGameController, onStopGameController} from '/imports/api/games/client/routeInitiator.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {TournamentEloScores} from '/imports/api/tournaments/tournamentEloScores.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';

export const TournamentGameController = RouteController.extend({
	waitOn: function() {
		return [
			Meteor.subscribe('tournamentGame', this.params.tournamentId, this.params.gameId)
		];
	},
	data: function() {
		return {
			tournament: Tournaments.findOne(this.params.tournamentId),
			game: Games.findOne(this.params.gameId),
			players: Players.find({gameId: this.params.gameId}, {sort: ['joinedAt']}),
			profiles: Profiles.find(),
			tournamentProfiles: TournamentProfiles.find(),
			tournamentEloScores: TournamentEloScores.find({gameId: this.params.gameId})
		};
	},
	onBeforeAction: function() {
		const tournament = Tournaments.findOne(this.params.tournamentId);
		const game = Games.findOne(this.params.gameId);

		Session.set('tournament', null);
		if (!tournament) {
			Router.go('tournaments');
		} else {
			Session.set('tournament', this.params.tournamentId);
		}

		Session.set('game', null);
		if (!game) {
			Router.go('tournament', {tournamentId: this.params.tournamentId});
		} else {
			Session.set('game', this.params.gameId);
		}

		this.next();
	},
	action: function() {
		this.render('tournamentGame');

		Template.tournamentGame.rendered = function() {
			onRenderGameController();

			Template.tournamentGame.rendered = null;
		};
	},
	onStop: onStopGameController
});
