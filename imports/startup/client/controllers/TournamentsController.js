import {Meteor} from 'meteor/meteor';

export const TournamentsController = RouteController.extend({
	waitOn: function() {
		return [
			Meteor.subscribe('profileData', Meteor.userId()),
			Meteor.subscribe('activeTournaments'),
			Meteor.subscribe('futureTournaments'),
			Meteor.subscribe('submittedTournaments'),
			Meteor.subscribe('draftTournaments')
		];
	}
});
