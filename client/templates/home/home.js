Template.home.helpers({
	numberOfGamesPlayed: function() {
		return this.profile.numberOfWin + this.profile.numberOfLost;
	},

	winRate: function() {
		if (this.profile.numberOfWin + this.profile.numberOfLost == 0) {
			return 'N/A';
		} else if (this.profile.numberOfLost == 0) {
			return '100%';
		} else {
			return Math.round(this.profile.numberOfWin / (this.profile.numberOfWin + this.profile.numberOfLost) * 100) + '%';
		}
	},

	getDate: function() {
		var date = new Date(this.startedAt),
			month = date.getMonth() + 1,
			day = date.getDate();

		if (month < 10) {
			month = '0' + month;
		}

		if (day < 10) {
			day = '0' + day;
		}

		return date.getFullYear() + '-' + month + '-' + day;
	},

	getOpponent: function(players) {
		var opponentUserId;

		players.forEach((player) => {
			if (this._id == player.gameId) {
				opponentUserId = player.name;
			}
		});

		if (opponentUserId) {
			return opponentUserId;
		} else {
			return 'N/A';
		}
	},

	getScore: function() {
		var userPoints, opponentPoints;

		if (Meteor.userId() == this.createdBy) {
			userPoints = this.hostPoints;
			opponentPoints = this.clientPoints;
		} else {
			userPoints = this.clientPoints;
			opponentPoints = this.hostPoints;
		}

		let scoreClass = 'loosing-score';
		if (userPoints > opponentPoints) {
			scoreClass = 'winning-score';
		}

		return '<span class="' + scoreClass + '">' + padPoints(userPoints) + '</span>' + ' - ' + padPoints(opponentPoints);
	}
});
