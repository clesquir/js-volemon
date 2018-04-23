import {TournamentModes} from '/imports/api/tournaments/tournamentModes.js';
import {
	TOURNAMENT_MODE_PLAYER_VELOCITY
} from '/imports/api/tournaments/tournamentModesConstants.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';

Meteor.startup(function() {
	const tournaments = [
		{
			_id: Random.id(5),
			identifier: 'tournament_2018-04-23',
			mode: TOURNAMENT_MODE_PLAYER_VELOCITY,
			name: "On steroids",
			description: 'Player movements are freaking fast',
			startDate: "2018-04-23 -04:00",
			endDate: "2018-04-30 -04:00",
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
			if (actualTournament.name !== expectedTournament.name) {
				updates.name = expectedTournament.name;
			}
			if (actualTournament.description !== expectedTournament.description) {
				updates.description = expectedTournament.description;
			}
			if (actualTournament.startDate !== expectedTournament.startDate) {
				updates.startDate = expectedTournament.startDate;
			}
			if (actualTournament.endDate !== expectedTournament.endDate) {
				updates.endDate = expectedTournament.endDate;
			}
			if (actualTournament.numberOfLostAllowed !== expectedTournament.numberOfLostAllowed) {
				updates.numberOfLostAllowed = expectedTournament.numberOfLostAllowed;
			}

			if (Object.keys(updates).length) {
				Tournaments.update({_id: actualTournament._id}, {$set: updates});
			}
		}
	}
});
