import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import initialAchievements from '/imports/api/achievements/server/migrations/data/initialAchievements.json';

Meteor.startup(function () {
	/**
	 * Migration for initial achievements insertion
	 */
	if (Achievements.find().count() === 0) {
		initialAchievements.achievements.forEach(function(achievement) {
			Achievements.insert(achievement);
		});
	}
});
