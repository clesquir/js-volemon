import {TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {TournamentModes} from '/imports/api/tournaments/tournamentModes.js';
import {TOURNAMENT_MODE_GRAVITY_OVERRIDE} from '/imports/api/tournaments/tournamentModesConstants.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';

Meteor.startup(function() {
	const tournaments = [
		{
			identifier: "tournament_2017-11-06_moon",
			name: "Moon gravity",
			description: "The gravity force is weak with this one",
			mode: TOURNAMENT_MODE_GRAVITY_OVERRIDE,
			startDate: "2017-11-06 -04:00",
			endDate: "2017-11-11 -04:00",
			isPublished: true
		},
		{
			identifier: "tournament_2017-11-06_jupiter",
			name: "Jupiter gravity",
			description: "The gravity force is strong with this one",
			mode: TOURNAMENT_MODE_GRAVITY_OVERRIDE,
			startDate: "2017-11-06 -04:00",
			endDate: "2017-11-11 -04:00",
			isPublished: true
		},
		{
			identifier: "tournament_2018-05-14",
			name: "Jupiter gravity",
			description: "2 VS 2 strong gravity",
			mode: TOURNAMENT_MODE_GRAVITY_OVERRIDE,
			gameMode: TWO_VS_TWO_GAME_MODE,
			startDate: "2018-05-13 -04:00",
			endDate: "2018-05-21 -04:00",
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
			if (actualTournament.gameMode !== expectedTournament.gameMode) {
				updates.gameMode = expectedTournament.gameMode;
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
