Template.home.helpers({
	numberOfGamesPlayed: function() {
		return this.profile.numberOfWin + this.profile.numberOfLost;
	},

	winRate: function() {
		return getWinRate(this.profile);
	},

	getStartedAtDate: function() {
		return moment(this.startedAt).format('YYYY-MM-DD');
	},

	getStartedAtDateTime: function() {
		return moment(this.startedAt).format('YYYY-MM-DD HH:mm');
	},

	longestGameInformation: function(attribute) {
		if (Session.get(attribute)) {
			return 'Game date: ' + moment(Session.get(attribute).startedAt).format('YYYY-MM-DD HH:mm') + '<br />' +
				'Opponent: ' + Session.get(attribute).playerName;
		}
		return '';
	},

	longestGameDuration: function(attribute) {
		if (Session.get(attribute)) {
			return moment(Session.get(attribute).duration).format('mm:ss');
		}
		return '-';
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

		return '<span class="' + scoreClass + '">' + padNumber(userPoints) + '</span>' + ' - ' + padNumber(opponentPoints);
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
