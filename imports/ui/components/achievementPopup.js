import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {formatAchievementNumber} from '/imports/api/achievements/utils.js';

import './achievementPopup.html';

Template.achievementPopup.helpers({
	visible: function() {
		return Session.get('achievement-reached-visible');
	},

	achievementLevel: function() {
		const achievement = Session.get('achievement-reached');
		if (achievement) {
			return achievement.level;
		}
		return '';
	},

	achievementLevelNumber: function() {
		const achievement = Session.get('achievement-reached');
		if (achievement) {
			return formatAchievementNumber(achievement.type, achievement.levelNumber);
		}
		return '';
	},

	achievementName: function() {
		const achievement = Session.get('achievement-reached');
		if (achievement) {
			return achievement.name;
		}
		return '';
	},

	achievementDescription: function() {
		const achievement = Session.get('achievement-reached');
		if (achievement) {
			return achievement.description + ': ' + formatAchievementNumber(achievement.type, achievement.number);
		}
		return '';
	}
});

Template.achievementPopup.events({
	'click [data-action="close-achievement-popup"]': function(e) {
		$(e.currentTarget).removeClass('achievement-popup-visible');
	}
});
