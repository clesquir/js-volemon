import {isTwoVersusTwoGameMode} from '/imports/api/games/constants.js';
import {padNumber, timeElapsedSince} from '/imports/lib/utils.js';
import {Meteor} from 'meteor/meteor';
import moment from 'moment';
import {Mongo} from 'meteor/mongo';
import {ReactiveDict} from 'meteor/reactive-dict';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import './recentGames.html';

const he = require('he');

const RECENT_GAMES_LIMIT = 5;
const RECENT_GAMES_INCREMENT = 5;

class RecentGamesCollection extends Mongo.Collection {}
const RecentGames = new RecentGamesCollection(null);
const RecentGamesState = new ReactiveDict();

Template.recentGames.helpers({
	recentGames: function() {
		return RecentGames.find({}, {sort: [['startedAt', 'desc']]});
	},

	getStartedAtDate: function() {
		Template.instance().uptime.get();
		return timeElapsedSince(this.startedAt);
	},

	getStartedAtDateTime: function() {
		return moment(this.startedAt).format('YYYY-MM-DD HH:mm');
	},

	wonOrLoss: function(userId) {
		const hostPoints = this.hostPoints;
		const clientPoints = this.clientPoints;

		if (
			(
				(this.players[0].id === userId || (this.players[2] && this.players[2].id === userId)) &&
				hostPoints > clientPoints
			) || (
				((this.players[1] && this.players[1].id === userId) || (this.players[3] && this.players[3].id === userId)) &&
				clientPoints > hostPoints
			)
		) {
			return '<span class="winning-score">WON</span>';
		} else {
			return '<span class="loosing-score">LOST</span>';
		}
	},

	getScore: function(userId) {
		const hostPoints = this.hostPoints;
		const clientPoints = this.clientPoints;
		let hostScoreClass = '';
		let clientScoreClass = '';

		if (this.players[0].id === userId || (this.players[2] && this.players[2].id === userId)) {
			hostScoreClass = 'loosing-score';
			if (hostPoints > clientPoints) {
				hostScoreClass = 'winning-score';
			}
		} else {
			clientScoreClass = 'loosing-score';
			if (clientPoints > hostPoints) {
				clientScoreClass = 'winning-score';
			}
		}

		return '<span class="' + hostScoreClass + '">' + padNumber(hostPoints) + '</span>' + '&nbsp;-&nbsp;' +
			'<span class="' + clientScoreClass + '">' + padNumber(clientPoints) + '</span>';
	},

	hostNames: function() {
		if (isTwoVersusTwoGameMode(this.gameMode)) {
			return he.encode(this.players[0].name) + '<br />' + he.encode(this.players[2].name);
		} else {
			return he.encode(this.players[0].name);
		}
	},

	clientNames: function() {
		if (isTwoVersusTwoGameMode(this.gameMode)) {
			return he.encode(this.players[3].name) + '<br />' + he.encode(this.players[1].name);
		} else {
			return he.encode(this.players[1].name);
		}
	},

	shape: function(index) {
		if (this.players[index]) {
			return this.players[index].shape;
		}

		return undefined;
	},

	hasMoreGames: function() {
		return RecentGamesState.get('hasMoreGames');
	}
});

Template.recentGames.events({
	'click [data-action="show-more-games"]': function(e) {
		e.preventDefault();

		RecentGamesState.set('currentSkip', RecentGamesState.get('currentSkip') + RECENT_GAMES_INCREMENT);
		updateRecentGames(this.userId, this.tournamentId);
	}
});

Template.recentGames.onCreated(function() {
	this.uptime = new ReactiveVar(0);
	this.uptimeInterval = Meteor.setInterval(() => {
		this.uptime.set((new Date()).getTime());
	}, 10000);
});

Template.recentGames.destroyed = function() {
	Meteor.clearInterval(this.uptimeInterval);
};

export const initRecentGames = function(userId, tournamentId) {
	RecentGames.remove({});
	RecentGamesState.set('currentSkip', 0);
	RecentGamesState.set('hasMoreGames', true);

	updateRecentGames(userId, tournamentId);
};

export const updateRecentGames = function(userId, tournamentId) {
	Session.set('recentGamesLoadingMask', true);
	Meteor.call(
		'recentGames',
		userId,
		tournamentId,
		RecentGamesState.get('currentSkip'),
		RECENT_GAMES_LIMIT,
		function(error, games) {
			Session.set('recentGamesLoadingMask', false);
			if (games) {
				for (let game of games) {
					RecentGames.insert(game);
				}

				if (games.length < RECENT_GAMES_LIMIT) {
					RecentGamesState.set('hasMoreGames', false);
				}
			}
		}
	);
};
