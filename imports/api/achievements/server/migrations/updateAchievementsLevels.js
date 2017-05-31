import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {
	ACHIEVEMENT_INVINCIBLE_IN_A_LIFETIME,
	ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE,
	ACHIEVEMENT_RANDOM_IN_A_GAME
} from '/imports/api/achievements/constants.js'

Meteor.startup(function () {
	/**
	 * Migration for updating levels
	 */
	const invincible = Achievements.findOne({_id: ACHIEVEMENT_INVINCIBLE_IN_A_LIFETIME});
	if (invincible !== undefined && invincible.levels[0].number === 5) {
		Achievements.update(
			{_id: ACHIEVEMENT_INVINCIBLE_IN_A_LIFETIME},
			{$set: {levels: [{"level": 1, "number": 2}, {"level": 2, "number": 4}, {"level": 3, "number": 8}]}}
		);
	}
	const gamesWonUnderAMinute = Achievements.findOne({_id: ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE});
	if (gamesWonUnderAMinute !== undefined && gamesWonUnderAMinute.levels[0].number === 5) {
		Achievements.update(
			{_id: ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE},
			{$set: {levels: [{"level": 1, "number": 2}, {"level": 2, "number": 4}, {"level": 3, "number": 8}]}}
		);
	}
	const randomInAGame = Achievements.findOne({_id: ACHIEVEMENT_RANDOM_IN_A_GAME});
	if (randomInAGame !== undefined && randomInAGame.levels[0].number === 4) {
		Achievements.update(
			{_id: ACHIEVEMENT_RANDOM_IN_A_GAME},
			{$set: {levels: [{"level": 1, "number": 3}, {"level": 2, "number": 6}, {"level": 3, "number": 12}]}}
		);
	}
});
