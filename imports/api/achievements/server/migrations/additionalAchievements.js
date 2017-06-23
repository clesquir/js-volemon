import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {
	ACHIEVEMENT_RAKSHASA,
	ACHIEVEMENT_TRIPLE_COLON
} from '/imports/api/achievements/constants.js';

Meteor.startup(function () {
	/**
	 * Migration for additional achievements
	 */
	if (!Achievements.findOne({_id: ACHIEVEMENT_RAKSHASA})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_RAKSHASA,
			"isSecret": true,
			"name": "Rakshasa",
			"description": "Morph into all shapes in a single game",
			"type": "TIMES",
			"displayOrder": 32,
			"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 2}, {"level": 3, "number": 3}]
		});
	}
	if (!Achievements.findOne({_id: ACHIEVEMENT_TRIPLE_COLON})) {
		Achievements.insert({
			"_id": ACHIEVEMENT_TRIPLE_COLON,
			"isSecret": true,
			"name": "Triple colon",
			"description": "# of won games with the ::: shape against a different shape player",
			"type": "QUANTITY",
			"displayOrder": 33,
			"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 25}, {"level": 3, "number": 50}]
		});
	}
});
