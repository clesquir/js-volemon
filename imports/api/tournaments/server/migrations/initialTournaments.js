import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {
	TOURNAMENT_MODE_CLASSIC,
	TOURNAMENT_MODE_HARDCORE,
	TOURNAMENT_MODE_MOON_GRAVITY,
	TOURNAMENT_MODE_JUPITER_GRAVITY,
	TOURNAMENT_MODE_SMOKE_BOMB,
	TOURNAMENT_MODE_RANDOM_BONUSES,
	TOURNAMENT_MODE_SUDDEN_DEATH,
	TOURNAMENT_MODE_INSTANT_DEATH_BONUS,
	TOURNAMENT_MODE_NO_BONUSES
} from '/imports/api/tournaments/tournamentModesConstants.js';
import {TournamentModes} from '/imports/api/tournaments/tournamentModes.js';

Meteor.startup(function() {
	const tournaments = [
		{
			_id: Random.id(5),
			identifier: 'tournament_2017-10-23',
			mode: TOURNAMENT_MODE_CLASSIC,
			startDate: "2017-10-23 -04:00",
			endDate: "2017-10-28 -04:00",
			isPublished: false
		},
		{
			_id: Random.id(5),
			identifier: 'tournament_2017-10-30',
			mode: TOURNAMENT_MODE_HARDCORE,
			startDate: "2017-10-30 -04:00",
			endDate: "2017-11-04 -04:00",
			isPublished: false
		},
		{
			_id: Random.id(5),
			identifier: 'tournament_2017-11-06_moon',
			mode: TOURNAMENT_MODE_MOON_GRAVITY,
			startDate: "2017-11-06 -04:00",
			endDate: "2017-11-11 -04:00",
			isPublished: false
		},
		{
			_id: Random.id(5),
			identifier: 'tournament_2017-11-06_jupiter',
			mode: TOURNAMENT_MODE_JUPITER_GRAVITY,
			startDate: "2017-11-06 -04:00",
			endDate: "2017-11-11 -04:00",
			isPublished: false
		},
		{
			_id: Random.id(5),
			identifier: 'tournament_2017-11-13',
			mode: TOURNAMENT_MODE_SMOKE_BOMB,
			startDate: "2017-11-13 -04:00",
			endDate: "2017-11-18 -04:00",
			isPublished: false
		},
		{
			_id: Random.id(5),
			identifier: 'tournament_2017-11-20',
			mode: TOURNAMENT_MODE_RANDOM_BONUSES,
			startDate: "2017-11-20 -04:00",
			endDate: "2017-11-25 -04:00",
			isPublished: false
		},
		{
			_id: Random.id(5),
			identifier: 'tournament_2017-11-27',
			mode: TOURNAMENT_MODE_SUDDEN_DEATH,
			startDate: "2017-11-27 -04:00",
			endDate: "2017-12-02 -04:00",
			isPublished: false
		},
		{
			_id: Random.id(5),
			identifier: 'tournament_2017-12-04',
			mode: TOURNAMENT_MODE_INSTANT_DEATH_BONUS,
			startDate: "2017-12-04 -04:00",
			endDate: "2017-12-09 -04:00",
			isPublished: false
		},
		{
			_id: Random.id(5),
			identifier: 'tournament_2017-12-04_no-bonuses',
			mode: TOURNAMENT_MODE_NO_BONUSES,
			startDate: "2017-12-04 -04:00",
			endDate: "2017-12-30 -04:00",
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
