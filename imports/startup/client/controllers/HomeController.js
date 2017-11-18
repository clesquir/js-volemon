import {Meteor} from 'meteor/meteor';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {Profiles} from '/imports/api/profiles/profiles.js';

export const HomeController = RouteController.extend({
	data: function() {
		return {
			userAchievements: UserAchievements.find({userId: Meteor.userId()}),
			profile: Profiles.findOne({userId: Meteor.userId()})
		};
	}
});
