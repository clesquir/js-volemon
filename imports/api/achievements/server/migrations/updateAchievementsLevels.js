import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {
	ACHIEVEMENT_PAUSE_IN_A_POINT,
	ACHIEVEMENT_PAUSE_IN_A_GAME,
	ACHIEVEMENT_PAUSE_IN_A_LIFETIME,
	ACHIEVEMENT_BONUSES_IN_A_GAME
} from '/imports/api/achievements/constants.js'

Meteor.startup(function () {
	/**
	 * Migration for updating levels
	 */
	const pauseInAPoint = Achievements.findOne({_id: ACHIEVEMENT_PAUSE_IN_A_POINT});
	if (pauseInAPoint !== undefined && pauseInAPoint.levels[1].number === 4) {
		Achievements.update(
			{_id: ACHIEVEMENT_PAUSE_IN_A_POINT},
			{$set: {levels: [{"level": 1, "number": 2}, {"level": 2, "number": 3}, {"level": 3, "number": 4}]}}
		);
	}
	const pauseInAGame = Achievements.findOne({_id: ACHIEVEMENT_PAUSE_IN_A_GAME});
	if (pauseInAGame !== undefined && pauseInAGame.levels[1].number === 6) {
		Achievements.update(
			{_id: ACHIEVEMENT_PAUSE_IN_A_GAME},
			{$set: {levels: [{"level": 1, "number": 3}, {"level": 2, "number": 5}, {"level": 3, "number": 7}]}}
		);
	}
	const pauseInALifetime = Achievements.findOne({_id: ACHIEVEMENT_PAUSE_IN_A_LIFETIME});
	if (pauseInALifetime !== undefined && pauseInALifetime.levels[0].number === 50) {
		Achievements.update(
			{_id: ACHIEVEMENT_PAUSE_IN_A_LIFETIME},
			{$set: {levels: [{"level": 1, "number": 25}, {"level": 2, "number": 50}, {"level": 3, "number": 100}]}}
		);
	}
	const bonusesInAGame = Achievements.findOne({_id: ACHIEVEMENT_BONUSES_IN_A_GAME});
	if (bonusesInAGame !== undefined && bonusesInAGame.levels[2].number === 50) {
		Achievements.update(
			{_id: ACHIEVEMENT_BONUSES_IN_A_GAME},
			{$set: {levels: [{"level": 1, "number": 15}, {"level": 2, "number": 30}, {"level": 3, "number": 45}]}}
		);
	}
});
