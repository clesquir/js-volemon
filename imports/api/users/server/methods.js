import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import {Accounts} from 'meteor/accounts-base';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

Meteor.methods({
	updateUserName: function(name) {
		check(this.userId, String);

		UserConfigurations.update({userId: this.userId}, {$set: {name: name}});
		Players.update({userId: this.userId}, {$set: {name: name}}, {multi: true});
		Games.update({hostId: this.userId}, {$set: {hostName: name}}, {multi: true});
		Games.update({clientId: this.userId}, {$set: {clientName: name}}, {multi: true});
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

	updateSkin: function(skinId) {
		UserConfigurations.update({userId: this.userId}, {$set: {skinId: skinId}});
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
	}
});
