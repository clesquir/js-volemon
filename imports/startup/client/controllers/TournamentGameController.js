import RouteInitiator from '/imports/api/games/client/RouteInitiator';
import {isTwoVersusTwoGameMode} from '/imports/api/games/constants';
import {EloScores} from '/imports/api/games/eloscores';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {TeamEloScores} from '/imports/api/games/teameloscores';
import {TournamentEloScores} from '/imports/api/tournaments/tournamentEloScores.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Router} from 'meteor/iron:router';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

export const TournamentGameController = RouteController.extend({
	waitOn: function() {
		return [
			Meteor.subscribe('tournamentGame', this.params.tournamentId, this.params.gameId)
		];
	},
	data: function() {
		const game = Games.findOne(this.params.gameId);
		let eloScores = EloScores.find({gameId: this.params.gameId});

		if (game) {
			if (isTwoVersusTwoGameMode(game.gameMode)) {
				eloScores = TeamEloScores.find({gameId: this.params.gameId});
			}
		}

		return {
			game: game,
			players: Players.find({gameId: this.params.gameId}, {sort: ['joinedAt']}),
			eloScores: eloScores,
			tournament: Tournaments.findOne(this.params.tournamentId),
			tournamentEloScores: TournamentEloScores.find({gameId: this.params.gameId})
		};
	},
	onBeforeAction: function() {
		const tournament = Tournaments.findOne(this.params.tournamentId);
		const game = Games.findOne(this.params.gameId);

		Session.set('tournament', null);
		Session.set('game', null);
		if (!tournament) {
			Router.go('tournaments');
		} else {
			Session.set('tournament', this.params.tournamentId);
		}
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
			RouteInitiator.get().onControllerRender(Session.get('game'));

			Template.tournamentGame.rendered = null;
		};
	},
	onStop: function() {
		Session.set('tournament', null);

		RouteInitiator.get().onControllerStop(this);
	}
});
