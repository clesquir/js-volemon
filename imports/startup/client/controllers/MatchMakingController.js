import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';

export const MatchMakingController = RouteController.extend({
	waitOn: function() {
		return [
			Meteor.subscribe('matchMakings'),
			Meteor.subscribe('playableTournaments', Meteor.userId())
		];
	},
	onBeforeAction: function() {
		if (!Meteor.userId()) {
			Router.go('home');
			Session.set('lightbox', 'login');
		} else {
			Router.go('home');
			Session.set('matchMaking.modeSelection', this.params.modeSelection);
			if (this.params.tournamentId !== 'none') {
				Session.set('matchMaking.tournamentId', this.params.tournamentId);
			}
			Session.set('lightbox', 'matchMaking');
			Session.set('lightbox.closable', false);
		}

		this.next();
	}
});
