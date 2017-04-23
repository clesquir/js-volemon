import {Template} from 'meteor/templating';

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
