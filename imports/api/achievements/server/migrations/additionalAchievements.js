import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {
	ACHIEVEMENT_FULL_STOP
} from '/imports/api/achievements/constants.js';

Meteor.startup(function () {
	/**
	 * Migration for additional achievements
	 */
	if (!Achievements.findOne({_id: ACHIEVEMENT_FULL_STOP})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_FULL_STOP,
			"isSecret": true,
			"name": "Full stop",
			"description": "# of shutouts with the dot shape against a different shape player",
			"type": "QUANTITY",
			"displayOrder": 34,
			"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 5}, {"level": 3, "number": 10}]
		});
	}
});
