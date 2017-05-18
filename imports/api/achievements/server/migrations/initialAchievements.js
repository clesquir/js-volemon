import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import initialAchievements from '/imports/api/achievements/server/migrations/data/initialAchievements.json';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

Meteor.startup(function () {
	/**
	 * Migration for initial achievements insertion
	 */
	if (Achievements.find().count() === 0) {
		initialAchievements.achievements.forEach(function(achievement) {
			achievement.modifiedAt = getUTCTimeStamp();
			Achievements.insert(achievement);
		});
	}
});
