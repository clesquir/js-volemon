import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {
	ACHIEVEMENT_DAVID_VS_GOLIATH,
	ACHIEVEMENT_SNOOZER
} from '/imports/api/achievements/constants.js';

Meteor.startup(function () {
	/**
	 * Migration for additional achievements
	 */
	if (!Achievements.findOne({_id: ACHIEVEMENT_DAVID_VS_GOLIATH})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_DAVID_VS_GOLIATH,
			"isSecret": true,
			"name": "David VS Goliath",
			"description": "# of won games against opponent with ELO 150 points higher",
			"type": "QUANTITY",
			"displayOrder": 29,
			"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 10}, {"level": 3, "number": 20}]
		});
	}
	if (!Achievements.findOne({_id: ACHIEVEMENT_SNOOZER})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_SNOOZER,
			"isSecret": true,
			"name": "Snoozer",
			"description": "# of won games when opponent was leading 4-0",
			"type": "QUANTITY",
			"displayOrder": 30,
			"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 10}, {"level": 3, "number": 20}]
		});
	}
});
