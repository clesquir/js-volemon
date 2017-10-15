import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {getWinRate} from '/imports/lib/utils.js';

import './eloRanking.html';

Template.eloRanking.helpers({
	getHighlightedClassIfCurrentUser: function() {
		if (this.userId === Meteor.userId()) {
			return 'highlighted-row';
		}

		return '';
	},

	getRank: function(index) {
		return index + 1;
	},

	getUserName: function(users) {
		let userName = '-';

		users.forEach((user) => {
			if (this.userId === user._id) {
				userName = user.profile.name;
			}
		});

		return userName;
	},

	getWinRate: function() {
		return getWinRate(this);
	}
});
