import {POSSIBLE_NO_PLAYERS} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {playersCanPlayTournament} from '/imports/api/tournaments/utils.js';
import {Router} from 'meteor/iron:router';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

import './gameSetup.html';

Template.gameSetup.helpers({
	isHost: function() {
		return this.game.createdBy === Meteor.userId();
	},

	/**
	 * The player can set ready or leave only if he has joined and he is ready yet
	 * @returns {boolean}
	 */
	canSetReadyOrLeave: function() {
		const player = Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()});

		return player && player.isReady === false;
	},

	/**
	 * The player has joined and is ready
	 * @returns {boolean}
	 */
	waitingForGameToStart: function() {
		const player = Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()});

		return player && player.isReady === true;
	},

	/**
	 * The user can join if the game has not all its players yet and if the user is not a player of the game yet
	 * @returns {boolean}
	 */
	canJoin: function() {
		const player = Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()});
		const players = Players.find({gameId: Session.get('game')});

		return (
			!player &&
			this.game &&
			playersCanPlayTournament(this.game.tournamentId, [{userId: Meteor.userId()}]) &&
			POSSIBLE_NO_PLAYERS.indexOf(players.count() + 1) !== -1
		);
	},

	/**
	 * The possible no of players is reached
	 * @returns {boolean}
	 */
	hasEnoughPlayers: function() {
		const players = Players.find({gameId: Session.get('game')});

		return (
			POSSIBLE_NO_PLAYERS.indexOf(players.count()) !== -1
		);
	},

	/**
	 * All players are ready
	 * @returns {boolean}
	 */
	allPlayersAreReady: function() {
		const players = Players.find({gameId: Session.get('game')});

		let havePlayersNotReady = false;
		players.forEach(function(player) {
			if (player.isReady === false) {
				havePlayersNotReady = true;
			}
		});

		return !havePlayersNotReady;
	},

	shapeEditionAllowed: function() {
		const game = Games.findOne(Session.get('game'));

		if (game) {
			const allowedListOfShapes = game.allowedListOfShapes || [];

			return this.userId === Meteor.userId() && allowedListOfShapes.length > 1;
		} else {
			return [];
		}
	},

	allowedListOfShapes: function() {
		const game = Games.findOne(Session.get('game'));

		if (game) {
			return game.allowedListOfShapes || [];
		} else {
			return [];
		}
	}
});

Template.gameSetup.events({
	'click [data-action="set-player-is-ready"]': function() {
		Meteor.call('setPlayerIsReady', Session.get('game'));
	},

	'click [data-action="start"]': function() {
		Session.set('loadingMask', true);
		Meteor.call('startGame', Session.get('game'), function(error) {
			Session.set('loadingMask', false);
			if (error) {
				alert(error);
			}
		});
	},

	'click [data-action="join"]': function() {
		if (!Meteor.userId()) {
			Session.set('lightbox', 'login');
		} else {
			Meteor.call('joinGame', Session.get('game'), function(error) {
				if (error) {
					alert(error);
				}
			});
		}
	},

	'click [data-action="leave"]': function() {
		Meteor.call('leaveGame', Session.get('game'));
	}
});

