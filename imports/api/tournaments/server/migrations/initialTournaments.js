import {ONE_VS_ONE_GAME_MODE, TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {TournamentModes} from '/imports/api/tournaments/tournamentModes.js';
import {TOURNAMENT_MODE_CLASSIC} from '/imports/api/tournaments/tournamentModesConstants.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';

Meteor.startup(function() {
	const tournaments = [
		{
			_id: Random.id(5),
			identifier: "tournament_2018-06-18_1v1",
			name: "1 VS 1: Classic",
			description: "Introducing high gravity bonus",
			mode: TOURNAMENT_MODE_CLASSIC,
			gameMode: ONE_VS_ONE_GAME_MODE,
			startDate: "2018-06-18 -04:00",
			endDate: "2018-06-25 -04:00",
			isPublished: false
		},
		{
			_id: Random.id(5),
			identifier: "tournament_2018-06-18_2v2",
			name: "2 VS 2: Classic",
			description: "Introducing high gravity bonus",
			mode: TOURNAMENT_MODE_CLASSIC,
			gameMode: TWO_VS_TWO_GAME_MODE,
			startDate: "2018-06-18 -04:00",
			endDate: "2018-06-25 -04:00",
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
