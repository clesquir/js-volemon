import {
	BONUS_BIG_BALL,
	BONUS_BIG_JUMP_MONSTER,
	BONUS_BIG_MONSTER,
	BONUS_BOUNCE_MONSTER,
	BONUS_CLOAKED_MONSTER,
	BONUS_CLOUD,
	BONUS_FAST_MONSTER,
	BONUS_FREEZE_MONSTER,
	BONUS_HIGH_GRAVITY,
	BONUS_INSTANT_DEATH,
	BONUS_INVISIBLE_BALL,
	BONUS_INVISIBLE_MONSTER,
	BONUS_INVISIBLE_OPPONENT_MONSTER,
	BONUS_LOW_GRAVITY,
	BONUS_NO_JUMP_MONSTER,
	BONUS_POISON,
	BONUS_RANDOM,
	BONUS_REPELLENT,
	BONUS_REVERSE_MOVE_MONSTER,
	BONUS_SHAPE_SHIFT,
	BONUS_SLOW_MONSTER,
	BONUS_SMALL_BALL,
	BONUS_SMALL_MONSTER,
	BONUS_SMOKE_BOMB
} from '/imports/api/games/bonusConstants.js';
import {ONE_VS_ONE_GAME_MODE, TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';

Meteor.startup(function() {
	Tournaments.update({status: {$exists: false}}, {$set: {status: {id: 'approved', name: 'Approved'}}}, {multi: true});

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
		},
		{
			_id: Random.id(5),
			identifier: "tournament_2018-08-13_1v1",
			name: "1 VS 1: Random",
			description: "Only random bonuses are spawning",
			mode: {
				overriddenAvailableBonuses: [BONUS_RANDOM],
				overriddenAvailableBonusesForRandom: [
					BONUS_SMALL_BALL,
					BONUS_BIG_BALL,
					BONUS_INVISIBLE_BALL,
					BONUS_LOW_GRAVITY,
					BONUS_HIGH_GRAVITY,
					BONUS_SMALL_MONSTER,
					BONUS_BIG_MONSTER,
					BONUS_BIG_JUMP_MONSTER,
					BONUS_SLOW_MONSTER,
					BONUS_FAST_MONSTER,
					BONUS_FREEZE_MONSTER,
					BONUS_REVERSE_MOVE_MONSTER,
					BONUS_INVISIBLE_MONSTER,
					BONUS_INVISIBLE_OPPONENT_MONSTER,
					BONUS_POISON,
					BONUS_REPELLENT,
					BONUS_CLOUD,
					BONUS_NO_JUMP_MONSTER,
					BONUS_BOUNCE_MONSTER,
					BONUS_CLOAKED_MONSTER,
					BONUS_SHAPE_SHIFT,
					BONUS_SMOKE_BOMB
				]
			},
			gameMode: ONE_VS_ONE_GAME_MODE,
			startDate: "2018-08-13 -04:00",
			endDate: "2018-08-20 -04:00",
			isPublished: false
		},
		{
			_id: Random.id(5),
			identifier: "tournament_2018-08-13_2v2",
			name: "2 VS 2: Random",
			description: "Only random bonuses are spawning",
			mode: {
				overriddenAvailableBonuses: [BONUS_RANDOM],
				overriddenAvailableBonusesForRandom: [
					BONUS_SMALL_BALL,
					BONUS_BIG_BALL,
					BONUS_INVISIBLE_BALL,
					BONUS_LOW_GRAVITY,
					BONUS_HIGH_GRAVITY,
					BONUS_SMALL_MONSTER,
					BONUS_BIG_MONSTER,
					BONUS_BIG_JUMP_MONSTER,
					BONUS_SLOW_MONSTER,
					BONUS_FAST_MONSTER,
					BONUS_FREEZE_MONSTER,
					BONUS_REVERSE_MOVE_MONSTER,
					BONUS_INVISIBLE_MONSTER,
					BONUS_INVISIBLE_OPPONENT_MONSTER,
					BONUS_POISON,
					BONUS_REPELLENT,
					BONUS_CLOUD,
					BONUS_NO_JUMP_MONSTER,
					BONUS_BOUNCE_MONSTER,
					BONUS_CLOAKED_MONSTER,
					BONUS_SHAPE_SHIFT,
					BONUS_SMOKE_BOMB
				]
			},
			gameMode: TWO_VS_TWO_GAME_MODE,
			startDate: "2018-08-13 -04:00",
			endDate: "2018-08-20 -04:00",
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
