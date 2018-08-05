import {BONUS_INSTANT_DEATH, BONUS_POISON, BONUS_RANDOM} from '/imports/api/games/bonusConstants.js';
import {ONE_VS_ONE_GAME_MODE, TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';

Meteor.startup(function() {
	const tournaments = [
		{
			_id: Random.id(5),
			identifier: "tournament_2017-11-27",
			name: 'Sudden death tournament',
			description: 'Only one point to score to win',
			mode: {
				overriddenMaximumPoints: 1
			},
			gameMode: ONE_VS_ONE_GAME_MODE,
			startDate: "2017-11-27 -04:00",
			endDate: "2017-12-02 -04:00",
			isPublished: true
		},
		{
			_id: Random.id(5),
			identifier: "tournament_2018-07-30_1v1",
			name: "1 VS 1: Ready to die",
			description: "Poison and Instant death bonuses",
			mode: {
				overriddenAvailableBonuses: [BONUS_POISON, BONUS_INSTANT_DEATH, BONUS_RANDOM],
				overriddenAvailableBonusesForRandom: [BONUS_POISON, BONUS_INSTANT_DEATH]
			},
			gameMode: ONE_VS_ONE_GAME_MODE,
			startDate: "2018-07-30 -04:00",
			endDate: "2018-08-06 -04:00",
			isPublished: true
		},
		{
			_id: Random.id(5),
			identifier: "tournament_2018-07-30_2v2",
			name: "2 VS 2: Ready to die",
			description: "Poison and Instant death bonuses",
			mode: {
				overriddenAvailableBonuses: [BONUS_POISON, BONUS_INSTANT_DEATH, BONUS_RANDOM],
				overriddenAvailableBonusesForRandom: [BONUS_POISON, BONUS_INSTANT_DEATH]
			},
			gameMode: TWO_VS_TWO_GAME_MODE,
			startDate: "2018-07-30 -04:00",
			endDate: "2018-08-06 -04:00",
			isPublished: true
		},
		{
			_id: Random.id(5),
			identifier: "tournament_2018-08-06_1v1",
			name: "1 VS 1: Classic",
			description: "Introducing Invincible or Instant death bonus/malus",
			mode: {},
			gameMode: ONE_VS_ONE_GAME_MODE,
			startDate: "2018-08-06 -04:00",
			endDate: "2018-08-13 -04:00",
			isPublished: false
		},
		{
			_id: Random.id(5),
			identifier: "tournament_2018-08-06_2v2",
			name: "2 VS 2: Classic",
			description: "Introducing Invincible or Instant death bonus/malus",
			mode: {},
			gameMode: TWO_VS_TWO_GAME_MODE,
			startDate: "2018-08-06 -04:00",
			endDate: "2018-08-13 -04:00",
			isPublished: false
		}
	];

	for (let expectedTournament of tournaments) {
		let actualTournament = Tournaments.findOne({identifier: expectedTournament.identifier});

		if (!actualTournament) {
			Tournaments.insert(expectedTournament);
		} else {
			const updates = {};

			if (!_.isEqual(actualTournament.mode, expectedTournament.mode)) {
				updates.mode = expectedTournament.mode;
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
