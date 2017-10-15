import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {Games} from '/imports/api/games/games.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';

export const TournamentController = RouteController.extend({
	waitOn: function() {
		return [
			Meteor.subscribe('tournament', this.params.tournamentId),
			Meteor.subscribe('tournamentProfiles', this.params.tournamentId),
			Meteor.subscribe('tournamentGames', this.params.tournamentId),
			Meteor.subscribe('tournamentRanks', this.params.tournamentId)
		];
	},
	data: function() {
		return {
			users: Meteor.users.find(),
			tournament: Tournaments.findOne(this.params.tournamentId),
			tournamentProfile: TournamentProfiles.findOne({tournamentId: this.params.tournamentId, userId: Meteor.userId()}),
			tournamentProfiles: TournamentProfiles.find({tournamentId: this.params.tournamentId}, {sort: [['eloRating', 'desc']]}),
			tournamentGames: Games.find({tournamentId: this.params.tournamentId}, {sort: [['createdAt', 'desc']]})
		};
	},
	onBeforeAction: function() {
		const tournament = Tournaments.findOne(this.params.tournamentId);

		Session.set('tournament', null);
		if (!tournament) {
			Router.go('tournaments');
		} else {
			Session.set('tournament', this.params.tournamentId);
		}

		this.next();
	}
});
