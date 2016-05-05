Template.eloRatingChange.helpers({
	isEloRatingLastChangePositive: function() {
		return (this.eloRatingLastChange > 0);
	},

	isEloRatingLastChangeNegative: function() {
		return (this.eloRatingLastChange < 0);
	},

	displayEloRatingLastChange: function() {
		return (this.eloRatingLastChange != 0);
	},

	eloRatingLastChange: function() {
		return this.eloRatingLastChange;
	}
});
