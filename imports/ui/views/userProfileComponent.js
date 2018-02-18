import {Template} from 'meteor/templating';
import {UserProfiles} from '/imports/api/profiles/userprofiles.js';
import CardSwitcher from '/imports/lib/client/CardSwitcher.js';
import {initRecentGames} from '/imports/ui/views/recentGames.js';
import {loadStatistics} from '/imports/ui/views/statistics.js';

import './userProfileComponent.html';

Template.userProfileComponent.onCreated(function() {
	loadStatistics(Session.get('userProfile'), Session.get('tournament'));
});

let cardSwitcher;

Template.userProfileComponent.onRendered(function() {
	cardSwitcher = new CardSwitcher(
		'.user-profile-swiper-container',
		{
			'user-profile-statistics': UserProfileViews.viewUserStatistics,
			'user-profile-recent-games': UserProfileViews.viewUserRecentGames,
		}
	);
});

Template.userProfileComponent.helpers({
	userProfileName: function() {
		const userProfile = UserProfiles.findOne({userId: Session.get('userProfile')});

		return userProfile ? userProfile.username : '-';
	},

	userProfileId: function() {
		const userProfile = UserProfiles.findOne({userId: Session.get('userProfile')});

		return userProfile ? '#' + userProfile.userId : '-';
	},

	userProfileEmail: function() {
		const userProfile = UserProfiles.findOne({userId: Session.get('userProfile')});

		return userProfile ? userProfile.email.split('').reverse().join('') : '-';
	},

	userProfileServiceName: function() {
		const userProfile = UserProfiles.findOne({userId: Session.get('userProfile')});

		return userProfile ? userProfile.serviceName : '';
	},

	getUserId: function() {
		return Session.get('userProfile');
	}
});

Template.userProfileComponent.events({
	'click [data-action=view-user-profile-statistics]': function() {
		cardSwitcher.slideTo(0);
	},

	'click [data-action=view-user-profile-recent-games]': function() {
		cardSwitcher.slideTo(1);
	}
});

class UserProfileViews {
	static viewUserStatistics() {
		const userProfileContents = document.getElementById('user-profile-contents');

		if (!$(userProfileContents).is('.user-profile-statistics-shown')) {
			UserProfileViews.removeShownClasses(userProfileContents);
			$(userProfileContents).addClass('user-profile-statistics-shown');

			loadStatistics(Session.get('userProfile'), Session.get('tournament'));
		}
	}

	static viewUserRecentGames() {
		const userProfileContents = document.getElementById('user-profile-contents');

		if (!$(userProfileContents).is('.user-profile-recent-games-shown')) {
			UserProfileViews.removeShownClasses(userProfileContents);
			$(userProfileContents).addClass('user-profile-recent-games-shown');

			initRecentGames(Session.get('userProfile'), Session.get('tournament'));
		}
	}

	static removeShownClasses(homeContents) {
		$(homeContents).removeClass('user-profile-statistics-shown');
		$(homeContents).removeClass('user-profile-recent-games-shown');
	}
}
