import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {ACHIEVEMENT_GAMES_WON_WITH_X_SHAPE} from '/imports/api/achievements/constants.js';

Meteor.startup(function () {
	/**
	 * Migration for additional achievements
	 */
	if (!Achievements.findOne({_id: ACHIEVEMENT_GAMES_WON_WITH_X_SHAPE})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_GAMES_WON_WITH_X_SHAPE,
			"isSecret": true,
			"name": "Letter, number or operator",
			"description": "# on won games with the X shape",
			"type": "QUANTITY",
			"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 10}, {"level": 3, "number": 25}]
		});
	}
});
