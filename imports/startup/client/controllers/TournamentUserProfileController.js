import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {UserProfiles} from '/imports/api/profiles/userprofiles.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';

export const TournamentUserProfileController = RouteController.extend({
	waitOn: function() {
		return [
			Meteor.subscribe('tournament', this.params.tournamentId),
			Meteor.subscribe('userProfile', this.params.userId)
		];
	},
	data: function() {
		return {
			tournament: Tournaments.findOne(this.params.tournamentId)
		};
	},
	onBeforeAction: function() {
		const tournament = Tournaments.findOne({_id: this.params.tournamentId});
		const profile = UserProfiles.findOne({userId: this.params.userId});

		Session.set('tournament', null);
		Session.set('userProfile', null);
		if (!tournament) {
			Router.go('home');
		} else {
			if (!profile) {
				Router.go('tournament', {tournamentId: this.params.tournamentId});
			} else {
				Session.set('tournament', this.params.tournamentId);
				Session.set('userProfile', this.params.userId);
			}
		}

		this.next();
	},
	onStop: function() {
		Session.set('tournament', null);
		Session.set('userProfile', null);
	}
});
