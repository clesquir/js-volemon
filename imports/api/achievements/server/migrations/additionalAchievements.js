import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {
	ACHIEVEMENT_GAMES_WON_WITH_X_SHAPE,
	ACHIEVEMENT_INVINCIBLE_IN_A_LIFETIME
} from '/imports/api/achievements/constants.js';

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
	if (!Achievements.findOne({_id: ACHIEVEMENT_INVINCIBLE_IN_A_LIFETIME})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_INVINCIBLE_IN_A_LIFETIME,
			"isSecret": true,
			"name": "Always my armor on",
			"description": "# of invincible bonuses caught in a game",
			"type": "QUANTITY",
			"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 10}, {"level": 3, "number": 25}]
		});
	}
});
