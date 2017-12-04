import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Achievements} from '/imports/api/achievements/achievements.js';

import './achievementRanking.html';

Template.achievementRanking.helpers({
	getHighlightedClassIfCurrentUser: function() {
		if (this.userId === Meteor.userId()) {
			return 'highlighted-row';
		}

		return '';
	},

	getRank: function(index) {
		return index + 1;
	},

	achievementsLevel1: function() {
		return orderedAchievementsLevels(this.achievementsLevel1);
	},

	achievementsLevel2: function() {
		return orderedAchievementsLevels(this.achievementsLevel2);
	},

	achievementsLevel3: function() {
		return orderedAchievementsLevels(this.achievementsLevel3);
	}
});

const orderedAchievementsLevels = function(userAchievements) {
	const achievements = Achievements.find({}, {sort: ['displayOrder']});
	const userAchievementsList = [];

	achievements.forEach((achievement) => {
		if (userAchievements.indexOf(achievement._id) !== -1) {
			userAchievementsList.push(achievement.name);
		}
	});

	return userAchievementsList.join('<br />');
};
