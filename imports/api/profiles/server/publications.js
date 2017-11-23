import {Meteor} from 'meteor/meteor';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';

Meteor.publish('profileData', function(userId) {
	return Profiles.find({userId: userId});
});

Meteor.publish('tournamentProfileData', function(tournamentId, userId) {
	return TournamentProfiles.find({tournamentId: tournamentId, userId: userId});
});

Meteor.publish('userProfile', function(userId) {
	const userProfile = {};

	UserConfigurations.find({userId: userId}).forEach((userConfiguration) => {
		const userId = userConfiguration.userId;

		userProfile.userId = userId;
		userProfile.email = Meteor.users.findOne(userId).emails[0].address;
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
