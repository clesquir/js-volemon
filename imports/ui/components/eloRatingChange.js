import {Template} from 'meteor/templating';

import './eloRatingChange.html';

Template.eloRatingChange.helpers({
	isEloRatingLastChangePositive: function(eloRatingChange) {
		return (eloRatingChange > 0);
	},

	isEloRatingLastChangeNegative: function(eloRatingChange) {
		return (eloRatingChange < 0);
	},

	displayEloRatingLastChange: function(eloRatingChange) {
		return (eloRatingChange !== 0);
	}
});
