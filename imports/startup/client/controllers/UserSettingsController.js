import {UserProfiles} from '/imports/api/profiles/userprofiles.js';
import {Meteor} from 'meteor/meteor';

export const UserSettingsController = RouteController.extend({
	waitOn: function() {
		return [
			Meteor.subscribe('userProfile', Meteor.userId())
		];
	},
	onBeforeAction: function() {
		const profile = UserProfiles.findOne({userId: Meteor.userId()});

		if (!profile) {
			Router.go('home');
		}

		this.next();
	}
});
