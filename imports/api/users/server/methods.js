import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {USERNAME_CHANGE_FREQUENCY} from '/imports/api/users/constants.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {UserKeymaps} from '/imports/api/users/userKeymaps.js';
import {UserReactions} from '/imports/api/users/userReactions.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';
import {Accounts} from 'meteor/accounts-base';
import {check} from 'meteor/check';
import {Meteor} from 'meteor/meteor';

Meteor.methods({
	updateUserName: function(name) {
		check(this.userId, String);

		if (name.trim() === '') {
			throw new Error('Name must be filled.');
		}

		const userConfiguration = UserConfigurations.findOne({userId: this.userId});

		if (userConfiguration.name !== name) {
			if (
				userConfiguration.lastUsernameUpdate &&
				userConfiguration.lastUsernameUpdate + USERNAME_CHANGE_FREQUENCY > getUTCTimeStamp()
			) {
				throw new Meteor.Error(429, "You can change your username only once every 30 days.");
			}

			UserConfigurations.update({userId: this.userId}, {
				$set: {
					name: name,
					lastUsernameUpdate: getUTCTimeStamp()
				}
			});
			Players.update({userId: this.userId}, {$set: {name: name}}, {multi: true});
			Games.update({hostId: this.userId}, {$set: {hostName: name}}, {multi: true});
			Games.update({clientId: this.userId}, {$set: {clientName: name}}, {multi: true});
		}
	},

	saveZoomedInGame: function(zoomedIn) {
		check(this.userId, String);

		UserConfigurations.update({userId: this.userId}, {$set: {gameZoomedIn: zoomedIn}});
	},

	saveMuteNotifications: function() {
		check(this.userId, String);

		const userConfiguration = UserConfigurations.findOne({userId: this.userId});

		if (userConfiguration) {
			UserConfigurations.update(
				{userId: this.userId},
				{$set: {muteNotifications: !userConfiguration.muteNotifications}}
			);
		}
	},

	updateKeymaps: function(keymaps) {
		const user = Meteor.user();

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to setup keymaps');
		}

		const userKeymaps = UserKeymaps.findOne({userId: this.userId});

		if (userKeymaps) {
			UserKeymaps.update(
				{userId: this.userId},
				{$set: keymaps}
			);
		} else {
			UserKeymaps.insert(
				Object.assign(
					{userId: this.userId},
					keymaps
				)
			);
		}
	},

	updateReactions: function(reactions) {
		const user = Meteor.user();

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to setup reactions');
		}

		const userReactions = UserReactions.findOne({userId: this.userId});

		if (userReactions) {
			UserReactions.update(
				{userId: this.userId},
				{$set: reactions}
			);
		} else {
			UserReactions.insert(
				Object.assign(
					{userId: this.userId},
					reactions
				)
			);
		}
	},

	updateSkin: function(skinId) {
		UserConfigurations.update({userId: this.userId}, {$set: {skinId: skinId}});
	},

	updatePluginWeatherAdaptiveEnabled: function(isEnabled) {
		const user = Meteor.user();

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to enable/disable the plugin');
		}

		UserConfigurations.update({userId: this.userId}, {$set: {pluginWeatherAdaptiveEnabled: isEnabled ? 1 : 0}});
	},

	sendUserPasswordToken: function(email) {
		const user = Accounts.findUserByEmail(email);

		if (!user) {
			throw new Meteor.Error(403, "User not found");
		}

		const userConfiguration = UserConfigurations.findOne({userId: user._id});

		if (userConfiguration.lastRecovery && userConfiguration.lastRecovery + 900000 > getUTCTimeStamp()) {
			throw new Meteor.Error(429, "You can ask for password token only once every 15 minutes.");
		}

		UserConfigurations.update({_id: userConfiguration._id}, {$set: {lastRecovery: getUTCTimeStamp()}});

		Accounts.sendResetPasswordEmail(user._id);
	},

	unlinkFromService: function(serviceName) {
		const user = Meteor.user();

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to unlink from service');
		}

		Accounts.unlinkService(user._id, serviceName);
	}
});
