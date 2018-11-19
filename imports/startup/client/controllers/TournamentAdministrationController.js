import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Router} from 'meteor/iron:router';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

export const TournamentAdministrationController = RouteController.extend({
	waitOn: function() {
		return [
			Meteor.subscribe('tournament', this.params.tournamentId)
		];
	},
	data: function() {
		return {
			tournament: Tournaments.findOne(this.params.tournamentId)
		};
	},
	onBeforeAction: function() {
		const tournament = Tournaments.findOne(this.params.tournamentId);

		if (tournament) {
			Session.set('tournament', this.params.tournamentId);
		} else {
			Session.set('tournament', null);
			Router.go('tournaments');
		}

		this.next();
	},
	onStop: function() {
		Session.set('tournament', null);
	}
});
