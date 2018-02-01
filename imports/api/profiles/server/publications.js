import {Meteor} from 'meteor/meteor';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';

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
			userProfile.serviceName = 'facebook';
		} else if (user.services.google) {
			userProfile.email = user.services.google.email;
			userProfile.serviceName = 'google';
		}

		if (user.emails && user.emails.length) {
			userProfile.email = user.emails[0].address;
		}
		userProfile.username = userConfiguration.name;

		this.added('userprofiles', userId, userProfile);
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
		this.userConfigurationsTracker.stop();
	});
});
