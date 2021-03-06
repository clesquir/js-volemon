import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {getWinRateFromNumbers} from '/imports/lib/utils.js';

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

	getWinRate: function() {
		return getWinRateFromNumbers(this.numberOfWin, this.numberOfLost);
	}
});
