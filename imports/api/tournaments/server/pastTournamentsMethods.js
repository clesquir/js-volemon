import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Meteor} from 'meteor/meteor';

Meteor.methods({
	pastTournaments: function(skip, limit) {
		const tournaments = Tournaments.find(
			{'status.id': 'approved', isPublished: true},
			{
				sort: [['endDate', 'desc']],
				skip: skip,
				limit: limit
			}
		);

		const pastTournaments = [];
		tournaments.forEach(function(tournament) {
			pastTournaments.push(tournament);
		});

		return pastTournaments;
	}
});
