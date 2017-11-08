import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {loadStatistics} from '/imports/ui/components/statistics.js';

import './userProfileComponent.html';

class UserProfilesCollection extends Mongo.Collection {}
const UserProfiles = new UserProfilesCollection('userprofiles');

Template.userProfileComponent.onCreated(function() {
	this.autorun(() => {
		loadStatistics(Session.get('userProfile'));
	});
});

Template.userProfileComponent.helpers({
	userProfileName: function() {
		const userProfile = UserProfiles.findOne({userId: Session.get('userProfile')});

		return userProfile ? userProfile.username : '-';
	},

	userProfileId: function() {
		const userProfile = UserProfiles.findOne({userId: Session.get('userProfile')});

		return userProfile ? '#' + userProfile.userId : '-';
	}
});

Template.userProfileComponent.events({
	'click [data-action=view-user-statistics]': function(e) {
		const userProfileContents = document.getElementById('user-profile-contents');

		if (!$(userProfileContents).is('.user-statistics-shown')) {
			removeShownClasses(userProfileContents);
			$(userProfileContents).addClass('user-statistics-shown');

			loadStatistics(Session.get('userProfile'));
		}
	}
});

const removeShownClasses = function(homeContents) {
	$(homeContents).removeClass('user-statistics-shown');
};
