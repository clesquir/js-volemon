import {Template} from 'meteor/templating';
import {Achievements} from '/imports/api/achievements/achievements.js';
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

const getUserAchievementNumberSinceLastReset = function(achievement, userAchievements) {
	let numberSinceLastReset = undefined;
	userAchievements.forEach((userAchievement) => {
		if (userAchievement.achievementId === achievement._id) {
			numberSinceLastReset = userAchievement.numberSinceLastReset;
		}
	});

	return numberSinceLastReset;
};

const achievementLevelReached = function(achievement, userAchievements, level) {
	const achievementNumber = getAchievementNumber(achievement, level);
	const userAchievementNumber = getUserAchievementNumber(achievement, userAchievements);

	return (userAchievementNumber >= achievementNumber);
};

Template.achievements.helpers({
	achievements: function() {
		return Achievements.find({}, {sort: [['displayOrder', 'asc']]});
	},

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

	showDescription: function(userAchievements) {
		return (!this.isSecret || achievementLevelReached(this, userAchievements, 1));
	},

	achievementProgress: function(userAchievements) {
		const userAchievementNumber = getUserAchievementNumber(this, userAchievements);

		return formatAchievementNumber(this.type, userAchievementNumber);
	},

	showCurrentStreak: function(userAchivements) {
		return getUserAchievementNumberSinceLastReset(this, userAchivements) !== undefined;
	},

	achievementCurrentStreak: function(userAchivements) {
		return getUserAchievementNumberSinceLastReset(this, userAchivements);
	}
});
