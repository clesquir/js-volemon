import '/imports/ui/components/achievements.html';

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {formatAchievementNumber} from '/imports/api/achievements/utils.js';

Template.achievements.helpers({
	achievementLevel: function(level) {
		let number = null;
		this.levels.forEach(function(achievementLevel) {
			if (achievementLevel.level === level) {
				number = achievementLevel.number;
			}
		});

		return formatAchievementNumber(this.type, number);
	},

	achievementStarClass: function(userAchievements, level) {
		let achievement = 0;
		this.levels.forEach(function(achievementLevel) {
			if (achievementLevel.level === level) {
				achievement = achievementLevel.number;
			}
		});

		let number = 0;
		userAchievements.forEach((userAchievement) => {
			if (userAchievement.achievementId === this._id) {
				number = userAchievement.number;
			}
		});

		if (number < achievement) {
			return 'level-not-completed';
		} else {
			return 'level-completed';
		}
	},

	achievementProgress: function(userAchievements) {
		let number = 0;
		userAchievements.forEach((userAchievement) => {
			if (userAchievement.achievementId === this._id) {
				number = userAchievement.number;
			}
		});

		return formatAchievementNumber(this.type, number);
	}
});
