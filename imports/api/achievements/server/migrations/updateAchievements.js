import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {ACHIEVEMENT_BATTLE_OF_THE_GIANTS, ACHIEVEMENT_TO_THE_SKY} from '/imports/api/achievements/constants.js'

Meteor.startup(function () {
	/**
	 * Migration for updating achievements
	 */
	const battleOfTheGiants = Achievements.findOne({_id: ACHIEVEMENT_BATTLE_OF_THE_GIANTS});
	if (battleOfTheGiants !== undefined && battleOfTheGiants.levels[2].number === 10) {
		Achievements.update(
			{_id: ACHIEVEMENT_BATTLE_OF_THE_GIANTS},
			{$set: {levels: [{"level": 1, "number": 1}, {"level": 2, "number": 2}, {"level": 3, "number": 3}]}}
		);
	}
	const toTheSky = Achievements.findOne({_id: ACHIEVEMENT_TO_THE_SKY});
	if (toTheSky !== undefined && toTheSky.levels[2].number === 6) {
		Achievements.update(
			{_id: ACHIEVEMENT_TO_THE_SKY},
			{$set: {levels: [{"level": 1, "number": 1}, {"level": 2, "number": 2}, {"level": 3, "number": 4}]}}
		);
	}
});
