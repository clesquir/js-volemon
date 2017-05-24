import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {
	ACHIEVEMENT_PAUSE_IN_A_POINT,
	ACHIEVEMENT_PAUSE_IN_A_GAME,
	ACHIEVEMENT_INVISIBLE_IN_A_POINT,
	ACHIEVEMENT_INVISIBLE_IN_A_GAME,
	ACHIEVEMENT_ALL_BONUSES_IN_A_GAME
} from '/imports/api/achievements/constants.js'

Meteor.startup(function () {
	/**
	 * Migration for updating levels for pauses/invisibles in a point/game
	 */
	const pauseInAPoint = Achievements.findOne({_id: ACHIEVEMENT_PAUSE_IN_A_POINT});
	if (pauseInAPoint !== undefined && pauseInAPoint.levels[0].number === 3) {
		Achievements.update(
			{_id: ACHIEVEMENT_PAUSE_IN_A_POINT},
			{$set: {levels: [{"level": 1, "number": 2}, {"level": 2, "number": 4}, {"level": 3, "number": 6}]}}
		);
	}

	const pauseInAGame = Achievements.findOne({_id: ACHIEVEMENT_PAUSE_IN_A_GAME});
	if (pauseInAGame !== undefined && pauseInAGame.levels[0].number === 5) {
		Achievements.update(
			{_id: ACHIEVEMENT_PAUSE_IN_A_GAME},
			{$set: {levels: [{"level": 1, "number": 3}, {"level": 2, "number": 6}, {"level": 3, "number": 9}]}}
		);
	}

	const invisibleInAPoint = Achievements.findOne({_id: ACHIEVEMENT_INVISIBLE_IN_A_POINT});
	if (invisibleInAPoint !== undefined && invisibleInAPoint.levels[0].number === 3) {
		Achievements.update(
			{_id: ACHIEVEMENT_INVISIBLE_IN_A_POINT},
			{$set: {levels: [{"level": 1, "number": 3}, {"level": 2, "number": 6}, {"level": 3, "number": 9}]}}
		);
	}

	const invisibleInAGame = Achievements.findOne({_id: ACHIEVEMENT_INVISIBLE_IN_A_GAME});
	if (invisibleInAGame !== undefined && invisibleInAGame.levels[0].number === 5) {
		Achievements.update(
			{_id: ACHIEVEMENT_INVISIBLE_IN_A_GAME},
			{$set: {levels: [{"level": 1, "number": 4}, {"level": 2, "number": 8}, {"level": 3, "number": 12}]}}
		);
	}

	/**
	 * Migration for updating levels for Caugh all bonuses in a game
	 */
	const allBonusesInAGame = Achievements.findOne({_id: ACHIEVEMENT_ALL_BONUSES_IN_A_GAME});
	if (allBonusesInAGame !== undefined && allBonusesInAGame.levels[0].number === 3) {
		Achievements.update(
			{_id: ACHIEVEMENT_ALL_BONUSES_IN_A_GAME},
			{$set: {levels: [{"level": 1, "number": 1}, {"level": 2, "number": 3}, {"level": 3, "number": 5}]}}
		);
	}
});
