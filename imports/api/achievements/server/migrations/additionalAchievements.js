import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {
	ACHIEVEMENT_GAMES_WON_WITH_X_SHAPE,
	ACHIEVEMENT_INVINCIBLE_IN_A_LIFETIME,
	ACHIEVEMENT_CONSECUTIVE_LOST_GAMES,
	ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE,
	ACHIEVEMENT_RANDOM_IN_A_GAME
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
			"displayOrder": 18,
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
			"displayOrder": 19,
			"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 10}, {"level": 3, "number": 25}]
		});
	}
	if (!Achievements.findOne({_id: ACHIEVEMENT_CONSECUTIVE_LOST_GAMES})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_CONSECUTIVE_LOST_GAMES,
			"isSecret": true,
			"name": "Master of nothing",
			"description": "# of consecutive lost games",
			"type": "QUANTITY",
			"displayOrder": 20,
			"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 10}, {"level": 3, "number": 25}]
		});
	}
	if (!Achievements.findOne({_id: ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE,
			"isSecret": true,
			"name": "Birdie",
			"description": "# of games won under a minute",
			"type": "TIMES",
			"displayOrder": 21,
			"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 10}, {"level": 3, "number": 15}]
		});
	}
	if (!Achievements.findOne({_id: ACHIEVEMENT_RANDOM_IN_A_GAME})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_RANDOM_IN_A_GAME,
			"isSecret": true,
			"name": "Gambler",
			"description": "# of random bonuses caught in a game",
			"type": "QUANTITY",
			"displayOrder": 22,
			"levels": [{"level": 1, "number": 4}, {"level": 2, "number": 8}, {"level": 3, "number": 12}]
		});
	}
});