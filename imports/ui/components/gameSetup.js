import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {POSSIBLE_NO_PLAYERS} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {isUserHost} from '/imports/api/games/utils.js';

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

		return (!player && POSSIBLE_NO_PLAYERS.indexOf(players.count() + 1) !== -1);
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

	isPracticeGame: function() {
		return !!this.game.isPracticeGame;
	},

	isPrivateGame: function() {
		return !!this.game.isPrivate;
	},

	isCurentPlayer: function() {
		return this.userId === Meteor.userId();
	}
});

Template.gameSetup.events({
	'click [data-action="copy-url"]': function(e) {
		const url = Router.routes['game'].url({_id: Session.get('game')});
		const temporaryInput = $('<input>');

		$('body').append(temporaryInput);
		temporaryInput.val(url).select();
		document.execCommand('copy');
		temporaryInput.remove();

		$(e.target).attr('data-tooltip', 'Copied!');
		$(e.target).trigger('mouseover');

		$(e.target).mouseout(function() {
			$(e.target).attr('data-tooltip', 'Copy to clipboard');
		});
	},

	'click [data-action="update-practice-game"]': function(e) {
		const game = Games.findOne(Session.get('game'));
		const isPracticeGame = !game.isPracticeGame;

		if (isUserHost(Session.get('game'))) {
			switchTargetButton(e, isPracticeGame);

			Meteor.call('updatePracticeGame', Session.get('game'), isPracticeGame ? 1 : 0);
		}
	},

	'click [data-action="update-privacy"]': function(e) {
		const game = Games.findOne(Session.get('game'));
		const isPrivate = !game.isPrivate;

		if (isUserHost(Session.get('game'))) {
			switchTargetButton(e, isPrivate);

			Meteor.call('updateGamePrivacy', Session.get('game'), isPrivate ? 1 : 0);
		}
	},

	'click [data-action="set-player-is-ready"]': function() {
		Meteor.call('setPlayerIsReady', Session.get('game'));
	},

	'click [data-action="start"]': function() {
		Session.set('loadingmask', true);
		Meteor.call('startGame', Session.get('game'), function(error) {
			Session.set('loadingmask', false);
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

