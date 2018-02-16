import {UserProfiles} from '/imports/api/profiles/userprofiles.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {onMobileAndTablet} from '/imports/lib/utils.js';
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import {Template} from "meteor/templating";

import './userSettings.html';

Template.userSettings.helpers({
	userProfileName: function() {
		const userProfile = UserProfiles.findOne({userId: Meteor.userId()});

		return userProfile ? userProfile.username : '-';
	},

	userProfileId: function() {
		return '#' + Meteor.userId();
	},

	userProfileEmail: function() {
		const userProfile = UserProfiles.findOne({userId: Meteor.userId()});

		return userProfile ? userProfile.email.split('').reverse().join('') : '-';
	},

	gameNotificationsSound: function() {
		const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});

		return userConfiguration && !userConfiguration.muteNotifications;
	},

	hasPassword: function() {
		const userProfile = UserProfiles.findOne({userId: Meteor.userId()});

		return userProfile && userProfile.hasPassword;
	},

	linkedToFacebook: function() {
		const userProfile = UserProfiles.findOne({userId: Meteor.userId()});

		return userProfile && userProfile.linkedToFacebook;
	},

	linkedToGoogle: function() {
		const userProfile = UserProfiles.findOne({userId: Meteor.userId()});

		return userProfile && userProfile.linkedToGoogle;
	},

	canUnlinkExternalAccounts: function() {
		const userProfile = UserProfiles.findOne({userId: Meteor.userId()});

		return userProfile && userProfile.hasPassword;
	},

	onDesktop: function() {
		return !onMobileAndTablet();
	}
});

Template.userSettings.events({
	'click [data-action=activate-user-notifications]': function() {
		Meteor.call('saveMuteNotifications');
	},

	'click [data-action=user-change-controls]': function() {
		Session.set('lightbox', 'keymaps');
	},

	'click [data-action=user-change-reactions]': function() {
		Session.set('lightbox', 'userReactions');
	},

	'click [data-action=user-change-skin]': function() {
		Session.set('lightbox', 'skins');
	},

	'click [data-action=user-change-name]': function() {
		Session.set('lightbox', 'username');
	},

	'click [data-action=user-change-password]': function() {
		Session.set('lightbox', 'passwordChange');
	},

	'click [data-action=user-link-to-facebook]': function() {
		Meteor.linkWithFacebook({requestPermissions: ['public_profile', 'email']}, function(error) {
			if (error && error.error) {
				alert(error.error);
			}
		});
	},

	'click [data-action=user-unlink-facebook]': function() {
		Meteor.call('unlinkFromService', 'facebook');
	},

	'click [data-action=user-link-to-google]': function() {
		Meteor.linkWithGoogle({}, function(error) {
			if (error && error.error) {
				alert(error.error);
			}
		});
	},

	'click [data-action=user-unlink-google]': function() {
		Meteor.call('unlinkFromService', 'google');
	}
});
