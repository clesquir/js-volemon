import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Profiles} from '/imports/api/profiles/profiles.js';

export const UserProfileController = RouteController.extend({
	waitOn: function() {
		return [
			Meteor.subscribe('profileData', this.params.userId),
			Meteor.subscribe('userProfile', this.params.userId)
		];
	},
	data: function() {
		return {
			profile: Profiles.findOne({userId: this.params.userId})
		};
	},
	onBeforeAction: function() {
		const profile = Profiles.findOne({userId: this.params.userId});

		if (!profile) {
			Router.go('home');
		} else {
			Session.set('userProfile', this.params.userId);
		}

		this.next();
	}
});
