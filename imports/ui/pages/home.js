import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {initRecentGames} from '/imports/ui/views/recentGames.js';
import {loadStatistics} from '/imports/ui/views/statistics.js';
import CardSwitcher from '/imports/lib/client/CardSwitcher.js';
import {browserSupportsWebRTC, onMobileAndTablet} from '/imports/lib/utils.js';

import './home.html';

Template.home.onCreated(function() {
	this.autorun(() => {
		loadStatistics(Meteor.userId());
	});
});

let cardSwitcher;

Template.home.onRendered(function() {
	cardSwitcher = new CardSwitcher(
		'.home-swiper-container',
		{
			'user-statistics': HomeViews.viewUserStatistics,
			'user-achievements': HomeViews.viewUserAchievements,
			'user-recent-games': HomeViews.viewUserRecentGames,
		}
	);
});

Template.home.helpers({
	browserDoNotSupportsWebRTC: function() {
		return !browserSupportsWebRTC();
	},

	onMobile: function() {
		return onMobileAndTablet();
	},

	getUserId: function() {
		return Meteor.userId();
	}
});

Template.home.events({
	'click [data-action=view-user-statistics]': function() {
		cardSwitcher.slideTo(0);
	},

	'click [data-action=view-user-achievements]': function() {
		cardSwitcher.slideTo(1);
	},

	'click [data-action=view-user-recent-games]': function() {
		cardSwitcher.slideTo(2);
	}
});

class HomeViews {
	static viewUserStatistics() {
		const homeContents = document.getElementById('home-contents');

		if (!$(homeContents).is('.user-statistics-shown')) {
			HomeViews.removeShownClasses(homeContents);
			$(homeContents).addClass('user-statistics-shown');

			loadStatistics(Meteor.userId());
		}
	}

	static viewUserAchievements() {
		const homeContents = document.getElementById('home-contents');

		if (!$(homeContents).is('.user-achievements-shown')) {
			HomeViews.removeShownClasses(homeContents);
			$(homeContents).addClass('user-achievements-shown');
		}
	}

	static viewUserRecentGames() {
		const homeContents = document.getElementById('home-contents');

		if (!$(homeContents).is('.user-recent-games-shown')) {
			HomeViews.removeShownClasses(homeContents);
			$(homeContents).addClass('user-recent-games-shown');

			initRecentGames(Meteor.userId());
		}
	}

	static removeShownClasses(homeContents) {
		$(homeContents).removeClass('user-statistics-shown');
		$(homeContents).removeClass('user-achievements-shown');
		$(homeContents).removeClass('user-recent-games-shown');
	}
}
