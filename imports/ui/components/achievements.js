import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {formatAchievementNumber} from '/imports/api/achievements/utils.js';

import './achievements.html';

const getAchievementNumber = function(achievement, level) {
	let achievementNumber = null;
	achievement.levels.forEach(function(achievementLevel) {
		if (achievementLevel.level === level) {
			achievementNumber = achievementLevel.number;
		}
	});

	return achievementNumber;
};

const getUserAchievementNumber = function(achievement, userAchievements) {
	let userAchievementNumber = 0;
	userAchievements.forEach((userAchievement) => {
		if (userAchievement.achievementId === achievement._id) {
			userAchievementNumber = userAchievement.number;
		}
	});

	return userAchievementNumber;
};

const achievementLevelReached = function(achievement, userAchievements, level) {
	const achievementNumber = getAchievementNumber(achievement, level);
	const userAchievementNumber = getUserAchievementNumber(achievement, userAchievements);

	return (userAchievementNumber >= achievementNumber);
};

Template.achievements.helpers({
	achievementLevel: function(userAchievements, level) {
		if (this.isSecret && !achievementLevelReached(this, userAchievements, level)) {
			return '?';
		}

		const achievementNumber = getAchievementNumber(this, level);

		return formatAchievementNumber(this.type, achievementNumber);
	},

	achievementLevelReached: function(userAchievements, level) {
		return achievementLevelReached(this, userAchievements, level);
	},

	achievementProgress: function(userAchievements) {
		let number = 0;
		userAchievements.forEach((userAchievement) => {
			if (userAchievement.achievementId === this._id) {
				number = userAchievement.number;
			}
		});

		const userAchievementNumber = getUserAchievementNumber(this, userAchievements);

		return formatAchievementNumber(this.type, userAchievementNumber);
	}
});
