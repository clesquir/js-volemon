import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import initialAchievements from '/imports/api/achievements/server/migrations/data/initialAchievements.json';

Meteor.startup(function () {
	/**
	 * Migration for adding displayOrder to the achievements
	 */
	if (Achievements.find({displayOrder: {$exists: true}}).count() === 0) {
		initialAchievements.achievements.forEach(function(achievement) {
			Achievements.update({_id: achievement._id}, {$set: {displayOrder: achievement.displayOrder}});
		});
	}
});
