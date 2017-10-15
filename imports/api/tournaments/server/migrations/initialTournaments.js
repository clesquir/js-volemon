import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {
	TOURNAMENT_MODE_CLASSIC,
	TOURNAMENT_MODE_HARDCORE
} from '/imports/api/tournaments/tournamentModesConstants.js';
import {TournamentModes} from '/imports/api/tournamentModes.js';

Meteor.startup(function () {
	const tournaments = [
		{
			"_id": Random.id(5),
			"identifier": 'tournament_2017-10-16',
			"mode": TOURNAMENT_MODE_CLASSIC,
			"startDate": "2017-10-16 +0000",
			"endDate": "2017-10-21 +0000"
		},
		{
			"_id": Random.id(5),
			"identifier": 'tournament_2017-10-23',
			"mode": TOURNAMENT_MODE_HARDCORE,
			"startDate": "2017-10-23 +0000",
			"endDate": "2017-10-28 +0000"
		}
	];

	for (let tournament of tournaments) {
		if (!Tournaments.findOne({identifier: tournament.identifier})) {
			tournament.mode = TournamentModes.findOne({_id: tournament.mode});

			Tournaments.insert(tournament);
		}
	}
});
