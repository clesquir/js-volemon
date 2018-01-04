import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {initRecentGames} from '/imports/ui/views/recentGames.js';
import {loadStatistics} from '/imports/ui/views/statistics.js';
import CardSwitcher from '/imports/lib/client/CardSwitcher.js';
import {browserSupportsWebRTC, onMobileAndTablet} from '/imports/lib/utils.js';

import './home.html';

let cardSwitcher;

Template.home.onCreated(function() {
	this.autorun(() => {
		loadStatistics(Meteor.userId());
	});
});

Template.home.onRendered(function() {
	cardSwitcher = new CardSwitcher('.home-swiper-container', highlightSelectorContentMenuOnSwipe);
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

const highlightSelectorContentMenuOnSwipe = function() {
	switch ($(this.slides[this.activeIndex]).attr('data-slide')) {
		case 'user-statistics':
			viewUserStatistics();
			break;
		case 'user-achievements':
			viewUserAchievements();
			break;
		case 'user-recent-games':
			viewUserRecentGames();
			break;
	}
};

const viewUserStatistics = function() {
	const homeContents = document.getElementById('home-contents');

	if (!$(homeContents).is('.user-statistics-shown')) {
		removeShownClasses(homeContents);
		$(homeContents).addClass('user-statistics-shown');

		loadStatistics(Meteor.userId());
	}
};

const viewUserAchievements = function() {
	const homeContents = document.getElementById('home-contents');

	if (!$(homeContents).is('.user-achievements-shown')) {
		removeShownClasses(homeContents);
		$(homeContents).addClass('user-achievements-shown');
	}
};

const viewUserRecentGames = function() {
	const homeContents = document.getElementById('home-contents');

	if (!$(homeContents).is('.user-recent-games-shown')) {
		removeShownClasses(homeContents);
		$(homeContents).addClass('user-recent-games-shown');

		initRecentGames(Meteor.userId());
	}
};

const removeShownClasses = function(homeContents) {
	$(homeContents).removeClass('user-statistics-shown');
	$(homeContents).removeClass('user-achievements-shown');
	$(homeContents).removeClass('user-recent-games-shown');
};
