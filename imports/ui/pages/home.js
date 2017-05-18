import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {loadStatistics} from '/imports/ui/components/statistics.js';

import './home.html';

Template.home.onCreated(function() {
	this.autorun(() => {
		loadStatistics(Meteor.userId());
	});
});

Template.home.events({
	'click [data-action=view-user-statistics]': function(e) {
		const homeContents = document.getElementById('home-contents');

		if (!$(homeContents).is('.user-statistics-shown')) {
			removeShownClasses(homeContents);
			$(homeContents).addClass('user-statistics-shown');

			loadStatistics(Meteor.userId());
		}
	},

	'click [data-action=view-user-achievements]': function(e) {
		const homeContents = document.getElementById('home-contents');

		if (!$(homeContents).is('.user-achievements-shown')) {
			removeShownClasses(homeContents);
			$(homeContents).addClass('user-achievements-shown');
		}
	},

	'click [data-action=view-user-recent-games]': function(e) {
		const homeContents = document.getElementById('home-contents');

		if (!$(homeContents).is('.user-recent-games-shown')) {
			removeShownClasses(homeContents);
			$(homeContents).addClass('user-recent-games-shown');
		}
	}
});

const removeShownClasses = function(homeContents) {
	$(homeContents).removeClass('user-statistics-shown');
	$(homeContents).removeClass('user-achievements-shown');
	$(homeContents).removeClass('user-recent-games-shown');
};
