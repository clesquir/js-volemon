import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import * as Moment from 'meteor/momentjs:moment';
import {getUTCTimeStamp, timeElapsedSince} from '/imports/lib/utils.js';

import './recentGames.html';

Template.recentGames.helpers({
	getStartedAtDate: function() {
		Template.instance().uptime.get();
		return timeElapsedSince(this.startedAt);
	},

	getStartedAtDateTime: function() {
		return Moment.moment(this.startedAt).format('YYYY-MM-DD HH:mm');
	},

	getPlayerName: function(players, host) {
		let playerName;

		if (host && this.createdBy === Meteor.userId()) {
			return Meteor.user().profile.name;
		} else if (!host && this.createdBy !== Meteor.userId()) {
			return Meteor.user().profile.name;
		}

		players.forEach((player) => {
			if (this._id === player.gameId) {
				playerName = player.name;
			}
		});

		if (playerName) {
			return playerName;
		} else {
			return 'N/A';
		}
	},

	getScore: function() {
		let hostPoints;
		let clientPoints;
		let hostScoreClass = '';
		let clientScoreClass = '';

		if (Meteor.userId() === this.createdBy) {
			hostPoints = this.hostPoints;
			clientPoints = this.clientPoints;

			hostScoreClass = 'loosing-score';
			if (hostPoints > clientPoints) {
				hostScoreClass = 'winning-score';
			}
		} else {
			hostPoints = this.clientPoints;
			clientPoints = this.hostPoints;

			clientScoreClass = 'loosing-score';
			if (clientPoints > hostPoints) {
				clientScoreClass = 'winning-score';
			}
		}

		return '<span class="' + hostScoreClass + '">' + padNumber(hostPoints) + '</span>' + '&nbsp;-&nbsp;' +
			'<span class="' + clientScoreClass + '">' + padNumber(clientPoints) + '</span>';
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

Template.recentGames.onCreated(function() {
	this.uptime = new ReactiveVar(0);
	this.uptimeInterval = Meteor.setInterval(() => {
		this.uptime.set(getUTCTimeStamp());
		console.log('allo!');
	}, 10000);
});

Template.recentGames.destroyed = function() {
	Meteor.clearInterval(this.uptimeInterval);
};
