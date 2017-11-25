import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';

export const TournamentUserProfileController = RouteController.extend({
	waitOn: function() {
		return [
			Meteor.subscribe('tournament', this.params.tournamentId),
			Meteor.subscribe('tournamentProfileData', this.params.tournamentId, this.params.userId),
			Meteor.subscribe('userProfile', this.params.userId)
		];
	},
	data: function() {
		return {
			profile: TournamentProfiles.findOne({tournamentId: this.params.tournamentId, userId: this.params.userId}),
			tournament: Tournaments.findOne(this.params.tournamentId)
		};
	},
	onBeforeAction: function() {
		const profile = TournamentProfiles.findOne({tournamentId: this.params.tournamentId, userId: this.params.userId});

		Session.set('userProfile', null);
		Session.set('tournament', null);
		if (!profile) {
			Router.go('home');
		} else {
			Session.set('userProfile', this.params.userId);
			Session.set('tournament', this.params.tournamentId);
		}

		this.next();
	}
});
