import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {Profiles} from '/imports/api/profiles/profiles.js';

export const HomeController = RouteController.extend({
	waitOn: function() {
		return Meteor.subscribe('skins');
	},
	data: function() {
		return {
			achievements: Achievements.find({}, {sort: [['displayOrder', 'asc']]}),
			userAchievements: UserAchievements.find({userId: Meteor.userId()}),
			profile: Profiles.findOne({userId: Meteor.userId()})
		};
	}
});
