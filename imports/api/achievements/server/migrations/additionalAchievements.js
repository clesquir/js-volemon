import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {
	ACHIEVEMENT_UNDESIRABLE
} from '/imports/api/achievements/constants.js';

Meteor.startup(function () {
	/**
	 * Migration for additional achievements
	 */
	if (!Achievements.findOne({_id: ACHIEVEMENT_UNDESIRABLE})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_UNDESIRABLE,
			"isSecret": true,
			"name": "Undesirable",
			"description": "Time a bonus bounces around without being caught",
			"type": "MS",
			"displayOrder": 35,
			"levels": [{"level": 1, "number": 30000}, {"level": 2, "number": 60000}, {"level": 3, "number": 120000}]
		});
	}
});
