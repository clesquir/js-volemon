import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {UserProfiles} from '/imports/api/profiles/userprofiles.js';

export const UserProfileController = RouteController.extend({
	waitOn: function() {
		return [
			Meteor.subscribe('userProfile', this.params.userId)
		];
	},
	onBeforeAction: function() {
		const profile = UserProfiles.findOne({userId: this.params.userId});

		if (!profile) {
			Router.go('home');
		} else {
			Session.set('userProfile', this.params.userId);
		}

		this.next();
	}
});
