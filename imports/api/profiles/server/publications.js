import {Profiles} from '/imports/api/profiles/profiles.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {Meteor} from 'meteor/meteor';

Meteor.publish('profileData', function(userId) {
	return Profiles.find({userId: userId});
});

Meteor.publish('userProfile', function(userId) {
	const userProfile = {};

	UserConfigurations.find({userId: userId}).forEach((userConfiguration) => {
		const userId = userConfiguration.userId;
		const user = Meteor.users.findOne(userId);

		userProfile.userId = userId;

		if (user.services.facebook) {
			userProfile.email = user.services.facebook.email;
		} else if (user.services.google) {
			userProfile.email = user.services.google.email;
		}

		if (user.emails && user.emails.length) {
			userProfile.email = user.emails[0].address;
		}
		userProfile.username = userConfiguration.name;
		userProfile.hasPassword = !!user.services.password;
		userProfile.linkedToFacebook = !!user.services.facebook;
		userProfile.linkedToGoogle = !!user.services.google;

		this.added('userprofiles', userId, userProfile);
	});

	this.usersTracker = Meteor.users.find({_id: userId}).observe({
		changed: (user) => {
			const userId = user._id;

			userProfile.linkedToFacebook = !!user.services.facebook;
			userProfile.linkedToGoogle = !!user.services.google;

			this.changed('userprofiles', userId, userProfile);
		}
	});

	this.userConfigurationsTracker = UserConfigurations.find({userId: userId}).observe({
		changed: (userConfiguration, oldUserConfiguration) => {
			if (userConfiguration.name !== oldUserConfiguration.name) {
				const userId = userConfiguration.userId;

				userProfile.username = userConfiguration.name;

				this.changed('userprofiles', userId, userProfile);
			}
		}
	});

	this.ready();

	this.onStop(() => {
		this.usersTracker.stop();
		this.userConfigurationsTracker.stop();
	});
});
