import {Games} from '/imports/api/games/games.js';
import {GAME_STATUS_STARTED} from '/imports/api/games/statusConstants.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Router} from 'meteor/iron:router';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

export const TournamentController = RouteController.extend({
	waitOn: function() {
		return [
			Meteor.subscribe('tournament', this.params.tournamentId),
			Meteor.subscribe('tournamentProfile', this.params.tournamentId, Meteor.userId()),
			Meteor.subscribe('tournamentGames', this.params.tournamentId),
			Meteor.subscribe('tournamentRanks', this.params.tournamentId)
		];
	},
	data: function() {
		return {
			tournament: Tournaments.findOne(this.params.tournamentId),
			tournamentProfile: TournamentProfiles.findOne({tournamentId: this.params.tournamentId, userId: Meteor.userId()}),
			tournamentGames: Games.find({tournamentId: this.params.tournamentId, status: GAME_STATUS_STARTED}, {sort: [['createdAt', 'desc']]})
		};
	},
	onBeforeAction: function() {
		const tournament = Tournaments.findOne(this.params.tournamentId);

		Session.set('tournament', null);
		if (!tournament || tournament.status.id !== 'approved') {
			Router.go('tournaments');
		} else {
			Session.set('tournament', this.params.tournamentId);
		}

		this.next();
	},
	onStop: function() {
		Session.set('tournament', null);
	}
});
