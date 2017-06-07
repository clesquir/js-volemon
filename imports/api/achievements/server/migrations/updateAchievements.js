import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {ACHIEVEMENT_ALL_BONUSES_IN_A_GAME} from '/imports/api/achievements/constants.js'

Meteor.startup(function () {
	/**
	 * Migration for updating achievements
	 */
	const allBonusesInaAGame = Achievements.findOne({_id: ACHIEVEMENT_ALL_BONUSES_IN_A_GAME});
	if (allBonusesInaAGame !== undefined && allBonusesInaAGame.levels[1].number === 3) {
		Achievements.update(
			{_id: ACHIEVEMENT_ALL_BONUSES_IN_A_GAME},
			{$set: {levels: [{"level": 1, "number": 1}, {"level": 2, "number": 2}, {"level": 3, "number": 3}]}}
		);
	}
});
