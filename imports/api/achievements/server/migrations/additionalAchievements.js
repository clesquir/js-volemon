import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {
	ACHIEVEMENT_TEENY_TINY_WORLD
} from '/imports/api/achievements/constants.js';

Meteor.startup(function () {
	/**
	 * Migration for additional achievements
	 */
	if (!Achievements.findOne({_id: ACHIEVEMENT_TEENY_TINY_WORLD})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_TEENY_TINY_WORLD,
			"isSecret": true,
			"name": "Teeny-tiny world",
			"description": "Bonuses combo: Small ball, both players are small",
			"type": "TIMES",
			"displayOrder": 36,
			"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 5}, {"level": 3, "number": 10}]
		});
	}
});
