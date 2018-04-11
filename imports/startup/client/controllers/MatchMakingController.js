import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';

export const MatchMakingController = RouteController.extend({
	onBeforeAction: function() {
		if (!Meteor.userId()) {
			Router.go('home');
			Session.set('lightbox', 'login');
		} else {
			Router.go('home');
			Session.set('lightbox', 'matchMaking');
			Session.set('lightbox.closable', false);
			Session.set('matchMaking.modeSelection', this.params.modeSelection);
			if (this.params.tournamentId !== 'none') {
				Session.set('matchMaking.tournamentId', this.params.tournamentId);
			}
		}

		this.next();
	}
});
