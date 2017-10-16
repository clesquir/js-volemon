import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {INITIAL_ACHIVEMENTS} from '/imports/api/achievements/server/migrations/data/initialAchievements.js';

Meteor.startup(function () {
	/**
	 * Migration for initial achievements insertion
	 */
	INITIAL_ACHIVEMENTS.forEach(function(achievement) {
		if (!Achievements.findOne({_id: achievement._id})) {
			Achievements.insert(achievement);
		}
	});
});
