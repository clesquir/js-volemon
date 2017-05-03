import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import {Accounts} from 'meteor/accounts-base';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

Meteor.methods({
	updateUserName: function(name) {
		check(this.userId, String);

		Meteor.users.update({_id: this.userId}, {$set: {'profile.name': name}});
		Players.update({userId: this.userId}, {$set: {name: name}}, {multi: true});
		Games.update({createdBy: this.userId}, {$set: {creatorName: name}}, {multi: true});
	},

	saveZoomedInGame: function(zoomedIn) {
		check(this.userId, String);

		Profiles.update({userId: this.userId}, {$set: {gameZoomedIn: zoomedIn}});
	},

	sendUserPasswordToken: function(email) {
		const user = Accounts.findUserByEmail(email);

		if (!user) {
			throw new Meteor.Error(403, "User not found");
		}

		const profile = Profiles.findOne({userId: user._id});

		if (profile.lastRecovery && profile.lastRecovery + 900000 > getUTCTimeStamp()) {
			throw new Meteor.Error(429, "You can ask for password token only once every 15 minutes.");
		}

		Profiles.update({_id: profile._id}, {$set: {lastRecovery: getUTCTimeStamp()}});

		Accounts.sendResetPasswordEmail(user._id);
	}
});
