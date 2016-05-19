Template.home.helpers({
	numberOfGamesPlayed: function() {
		return this.profile.numberOfWin + this.profile.numberOfLost;
	},

	winRate: function() {
		return getWinRate(this.profile);
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
	},

	hasMoreGames: function() {
		var controller = Iron.controller();

		return controller.gamesCount() >= controller.state.get('gamesLimit');
	}
});

Template.home.events({
	'click [data-action="show-more-games"]': function(e) {
		var controller = Iron.controller();

		e.preventDefault();
		controller.state.set('gamesLimit', controller.state.get('gamesLimit') + controller.gamesIncrement());
	}
});
