import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {
	TOURNAMENT_MODE_CLASSIC,
	TOURNAMENT_MODE_HARDCORE,
	TOURNAMENT_MODE_MOON_GRAVITY,
	TOURNAMENT_MODE_JUPITER_GRAVITY
} from '/imports/api/tournaments/tournamentModesConstants.js';
import {TournamentModes} from '/imports/api/tournaments/tournamentModes.js';

Meteor.startup(function() {
	const tournaments = [
		{
			_id: Random.id(5),
			identifier: 'tournament_2017-10-23',
			mode: TOURNAMENT_MODE_CLASSIC,
			startDate: "2017-10-23 -4",
			endDate: "2017-10-28 -4",
			isPublished: false
		},
		{
			_id: Random.id(5),
			identifier: 'tournament_2017-10-30',
			mode: TOURNAMENT_MODE_HARDCORE,
			startDate: "2017-10-30 -4",
			endDate: "2017-11-04 -4",
			isPublished: false
		},
		{
			_id: Random.id(5),
			identifier: 'tournament_2017-11-06_moon',
			mode: TOURNAMENT_MODE_MOON_GRAVITY,
			startDate: "2017-11-06 -4",
			endDate: "2017-11-11 -4",
			isPublished: false
		},
		{
			_id: Random.id(5),
			identifier: 'tournament_2017-11-06_jupiter',
			mode: TOURNAMENT_MODE_JUPITER_GRAVITY,
			startDate: "2017-11-06 -4",
			endDate: "2017-11-11 -4",
			isPublished: false
		}
	];

	for (let expectedTournament of tournaments) {
		let actualTournament = Tournaments.findOne({identifier: expectedTournament.identifier});
		let tournamentMode = TournamentModes.findOne({_id: expectedTournament.mode});

		if (!actualTournament) {
			expectedTournament.mode = tournamentMode;

			Tournaments.insert(expectedTournament);
		} else {
			const updates = {};
			if (!_.isEqual(actualTournament.mode, tournamentMode)) {
				updates.mode = tournamentMode;
			}
			if (actualTournament.startDate !== expectedTournament.startDate) {
				updates.startDate = expectedTournament.startDate;
			}
			if (actualTournament.endDate !== expectedTournament.endDate) {
				updates.endDate = expectedTournament.endDate;
			}

			if (Object.keys(updates).length) {
				Tournaments.update({_id: actualTournament._id}, {$set: updates});
			}
		}
	}
});
