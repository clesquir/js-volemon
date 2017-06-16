import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {
	ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED
} from '/imports/api/achievements/constants.js';

Meteor.startup(function () {
	/**
	 * Migration for additional achievements
	 */
	if (!Achievements.findOne({_id: ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED,
			"isSecret": true,
			"name": "Carefully randomly picked",
			"description": "# of won games with every shape when selecting random shape",
			"type": "QUANTITY",
			"displayOrder": 31,
			"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 2}, {"level": 3, "number": 3}]
		});
	}
});
