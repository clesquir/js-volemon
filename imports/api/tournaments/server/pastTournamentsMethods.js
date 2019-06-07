import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Meteor} from 'meteor/meteor';
import moment from 'moment';

Meteor.methods({
	pastTournaments: function(skip, limit) {
		const today = moment(new Date());

		const tournaments = Tournaments.find(
			{
				'status.id': 'approved',
				'endDate': {'$lte': today.format('YYYY-MM-DD') + ' -04:00'}
			},
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
