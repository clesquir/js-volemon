import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {
	ACHIEVEMENT_HOW_TO_TIE_A_TIE,
	ACHIEVEMENT_BATTLE_OF_THE_GIANTS,
	ACHIEVEMENT_NINJA,
	ACHIEVEMENT_I_WAS_THERE_WAITING,
	ACHIEVEMENT_TO_THE_SKY,
	ACHIEVEMENT_BLANK_SCREEN
} from '/imports/api/achievements/constants.js';

Meteor.startup(function () {
	/**
	 * Migration for additional achievements
	 */
	if (!Achievements.findOne({_id: ACHIEVEMENT_HOW_TO_TIE_A_TIE})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_HOW_TO_TIE_A_TIE,
			"isSecret": true,
			"name": "How to tie a tie",
			"description": "# of tie games",
			"type": "QUANTITY",
			"displayOrder": 23,
			"levels": [{"level": 1, "number": 10}, {"level": 2, "number": 25}, {"level": 3, "number": 50}]
		});
	}
	if (!Achievements.findOne({_id: ACHIEVEMENT_BATTLE_OF_THE_GIANTS})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_BATTLE_OF_THE_GIANTS,
			"isSecret": true,
			"name": "Battle of the giants",
			"description": "# of points scored when both players are big",
			"type": "QUANTITY",
			"displayOrder": 24,
			"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 5}, {"level": 3, "number": 10}]
		});
	}
	if (!Achievements.findOne({_id: ACHIEVEMENT_NINJA})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_NINJA,
			"isSecret": true,
			"name": "Ninja",
			"description": "# of games without activating any bonuses",
			"type": "QUANTITY",
			"displayOrder": 25,
			"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 5}, {"level": 3, "number": 10}]
		});
	}
	if (!Achievements.findOne({_id: ACHIEVEMENT_I_WAS_THERE_WAITING})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_I_WAS_THERE_WAITING,
			"isSecret": true,
			"name": "I was there waiting...",
			"description": "# of points scored when paused",
			"type": "QUANTITY",
			"displayOrder": 26,
			"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 10}, {"level": 3, "number": 20}]
		});
	}
	if (!Achievements.findOne({_id: ACHIEVEMENT_TO_THE_SKY})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_TO_THE_SKY,
			"isSecret": true,
			"name": "To the sky",
			"description": "Bonuses combo: Small monster, big jump and bouncy",
			"type": "TIMES",
			"displayOrder": 27,
			"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 3}, {"level": 3, "number": 6}]
		});
	}
	if (!Achievements.findOne({_id: ACHIEVEMENT_BLANK_SCREEN})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_BLANK_SCREEN,
			"isSecret": true,
			"name": "Blank screen",
			"description": "Bonuses combo: Invisible ball, both players either invisible or cloaked",
			"type": "TIMES",
			"displayOrder": 28,
			"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 2}, {"level": 3, "number": 3}]
		});
	}
});
