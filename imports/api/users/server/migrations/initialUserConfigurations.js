import {Meteor} from 'meteor/meteor';
import {PLAYER_DEFAULT_SHAPE} from '/imports/api/games/shapeConstants.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';

Meteor.startup(function() {
	/**
	 * Migration for initial user configurations insertion from profile data
	 */
	const users = Meteor.users.find();
	users.forEach(function(user) {
		const userConfiguration = UserConfigurations.findOne({userId: user._id});

		if (!userConfiguration) {
			UserConfigurations.insert({
				userId: user._id,
				name: user.profile.name,
				lastShapeUsed: PLAYER_DEFAULT_SHAPE
			});

			Meteor.users.update({_id: user._id}, {$unset: {profile: ''}});
		}
	});

	const profiles = Profiles.find();
	profiles.forEach(function(profile) {
		const dataToUpdate = {};

		if (profile.gameZoomedIn !== undefined) {
			dataToUpdate.gameZoomedIn = profile.gameZoomedIn;
			Profiles.update({_id: profile._id}, {$unset: {gameZoomedIn: ''}});
		}
		if (profile.muteNotifications !== undefined) {
			dataToUpdate.muteNotifications = profile.muteNotifications;
			Profiles.update({_id: profile._id}, {$unset: {muteNotifications: ''}});
		}
		if (profile.lastRecovery !== undefined) {
			dataToUpdate.lastRecovery = profile.lastRecovery;
			Profiles.update({_id: profile._id}, {$unset: {lastRecovery: ''}});
		}
		if (profile.lastShapeUsed !== undefined) {
			dataToUpdate.lastShapeUsed = profile.lastShapeUsed;
			Profiles.update({_id: profile._id}, {$unset: {lastShapeUsed: ''}});
		}
		if (profile.retiredAt !== undefined) {
			Profiles.update({_id: profile._id}, {$unset: {retiredAt: ''}});
		}

		if (Object.keys(dataToUpdate).length) {
			UserConfigurations.update(
				{userId: profile.userId},
				{$set: dataToUpdate}
			);
		}
	});
});
