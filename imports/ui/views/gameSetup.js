import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {Router} from 'meteor/iron:router';
import DefaultGameConfiguration from '/imports/api/games/configuration/DefaultGameConfiguration.js';
import {POSSIBLE_NO_PLAYERS} from '/imports/api/games/constants.js';
import {Players} from '/imports/api/games/players.js';
import {playersCanPlayTournament} from '/imports/api/tournaments/utils.js';

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
			playersCanPlayTournament(this.game, [{userId: Meteor.userId()}]) &&
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
		const configuration = new DefaultGameConfiguration(Session.get('game'));
		configuration.init();

		return this.userId === Meteor.userId() && configuration.allowedListOfShapes().length > 1;
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
		});
	},

	'click [data-action="join"]': function() {
		actionAfterLoginCreateUser = function() {
			Meteor.call('joinGame', Session.get('game'), function(error) {
				if (error) {
					alert(error)
				}
			});
		};

		if (!Meteor.userId()) {
			actionOnLighboxClose = function() {
				actionAfterLoginCreateUser = null;
			};

			return Session.set('lightbox', 'login');
		}

		actionAfterLoginCreateUser();
		actionAfterLoginCreateUser = null;
	},

	'click [data-action="leave"]': function() {
		Meteor.call('leaveGame', Session.get('game'));
	}
});

