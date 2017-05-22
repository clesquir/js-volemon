import '/imports/ui/components/achievementPopup.html';

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {formatAchievementNumber} from '/imports/api/achievements/utils.js';

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

	achievementText: function() {
		const achievement = Session.get('achievement-reached');
		if (achievement) {
			return achievement.name + ': ' + formatAchievementNumber(achievement.type, achievement.number);
		}
		return '';
	}
});

Template.achievementPopup.events({
	'click [data-action="close-achievement-popup"]': function(e) {
		$(e.currentTarget).removeClass('achievement-popup-visible');
	}
});
