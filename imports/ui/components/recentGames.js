import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import * as Moment from 'meteor/momentjs:moment';

import './recentGames.html';

Template.recentGames.helpers({
	getStartedAtDate: function() {
		return Moment.moment(this.startedAt).format('YYYY-MM-DD');
	},

	getStartedAtDateTime: function() {
		return Moment.moment(this.startedAt).format('YYYY-MM-DD HH:mm');
	},

	getOpponent: function(players) {
		let opponentUserId;

		players.forEach((player) => {
			if (this._id === player.gameId) {
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
		let userPoints, opponentPoints;

		if (Meteor.userId() === this.createdBy) {
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

		return '<span class="' + scoreClass + '">' + padNumber(userPoints) + '</span>' + '<span>&nbsp;-&nbsp;' + padNumber(opponentPoints) + '</span>';
	},

	getEloRatingChange: function(eloScores) {
		let gameEloScoreChange = null;

		eloScores.forEach((eloScore) => {
			if (this._id === eloScore.gameId) {
				gameEloScoreChange = eloScore.eloRatingChange;
			}
		});

		return gameEloScoreChange;
	},

	hasMoreGames: function() {
		const controller = Iron.controller();

		return controller.gamesCount() >= controller.state.get('gamesLimit');
	}
});

Template.recentGames.events({
	'click [data-action="show-more-games"]': function(e) {
		const controller = Iron.controller();

		e.preventDefault();
		controller.state.set('gamesLimit', controller.state.get('gamesLimit') + controller.gamesIncrement());
	}
});
