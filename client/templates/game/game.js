import GameInitiator from '/client/lib/game/GameInitiator.js';
import KeepRegistrationAlive from '/client/lib/game/KeepRegistrationAlive.js';
import {
	isGameStatusStarted,
	isGameStatusFinished,
	isGameStatusOnGoing,
	isGameStatusTimeout,
	getWinnerName
} from '/client/lib/game/utils.js';
import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Config } from '/lib/config.js';

Template.game.helpers({
	isHost: function() {
		return this.game.createdBy === Meteor.userId();
	},

	isPlaying: function() {
		return isGameStatusOnGoing(this.game.status);
	},

	isUserNotPlaying: function() {
		var player = Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()});

		return (!player);
	},

	hostPoints: function() {
		return padNumber(this.game.hostPoints);
	},

	hostName: function() {
		var player = Players.findOne({gameId: Session.get('game'), userId: this.game.createdBy});

		if (player) {
			return player.name;
		} else {
			return 'Player 1';
		}
	},

	clientPoints: function() {
		return padNumber(this.game.clientPoints);
	},

	clientName: function() {
		var player = Players.findOne({gameId: Session.get('game'), userId: {$ne: this.game.createdBy}});

		if (player) {
			return player.name;
		} else {
			return 'Player 2';
		}
	},

	matchTimer: function() {
		return Session.get('matchTimer');
	},

	pointTimer: function() {
		return Session.get('pointTimer');
	},

	loggedPlayer: function() {
		return Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()});
	},

	opponents: function() {
		return Players.find({gameId: Session.get('game'), userId: {$ne: Meteor.userId()}});
	},

	/**
	 * The player can set ready or leave only if he has joined and he is ready yet
	 * @returns {boolean}
	 */
	canSetReadyOrLeave: function() {
		var player = Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()});

		return player && player.isReady === false;
	},

	/**
	 * The player has joined and is ready
	 * @returns {boolean}
	 */
	waitingForGameToStart: function() {
		var player = Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()});

		return player && player.isReady === true;
	},

	/**
	 * The user can join if the game has not all its players yet and if the user is not a player of the game yet
	 * @returns {boolean}
	 */
	canJoin: function() {
		var player = Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()}),
			players = Players.find({gameId: Session.get('game')});

		return (!player && Config.possibleNoPlayers.indexOf(players.count() + 1) !== -1);
	},

	/**
	 * The possible no of players is reached
	 * @returns {boolean}
	 */
	hasEnoughPlayers: function() {
		var players = Players.find({gameId: Session.get('game')});

		return (
			Config.possibleNoPlayers.indexOf(players.count()) !== -1
		);
	},

	/**
	 * All players are ready
	 * @returns {boolean}
	 */
	allPlayersAreReady: function() {
		var players = Players.find({gameId: Session.get('game')});

		let havePlayersNotReady = false;
		players.forEach(function(player) {
			if (player.isReady === false) {
				havePlayersNotReady = true;
			}
		});

		return !havePlayersNotReady;
	},

	isPrivateGame: function() {
		return this.game.isPrivate ? true : false;
	},

	hasBonusesGame: function() {
		return this.game.hasBonuses ? true : false;
	},

	isCurentPlayer: function() {
		return this.userId === Meteor.userId();
	},

	getStatusDependentClass: function() {
		if (isGameStatusStarted(this.game.status)) {
			return 'hidden-container';
		} else {
			return 'shown-container';
		}
	},

	isGameStatusFinished: function() {
		return isGameStatusFinished(this.game.status);
	},

	getAfterGameTitle: function() {
		if (isGameStatusTimeout(this.game.status)) {
			return 'The game has timed out...';
		} else if (isGameStatusFinished(this.game.status)) {
			return getWinnerName(this.game) + ' wins';
		}
	},

	getPlayerEloRating: function(player, profiles) {
		var eloRating = '-';

		profiles.forEach((profile) => {
			if (player.userId == profile.userId) {
				eloRating = profile.eloRating;
			}
		});

		return eloRating;
	},

	getPlayerProfile: function(player, profiles) {
		var playerProfile = null;

		profiles.forEach((profile) => {
			if (player.userId == profile.userId) {
				playerProfile = profile;
			}
		});

		return playerProfile;
	}
});

Template.game.events({
	'click [data-action="copy-url"]': function(e) {
		var url = Router.routes['game'].url({_id: Session.get('game')}),
			temporaryInput = $('<input>');

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

	'click [data-action="update-privacy"]': function(e) {
		var game = Games.findOne(Session.get('game')),
			isPrivate = !game.isPrivate;

		switchTargetButton(e, isPrivate);

		Meteor.call('updateGamePrivacy', Session.get('game'), isPrivate ? 1 : 0);
	},

	'click [data-action="update-has-bonuses"]': function(e) {
		var game = Games.findOne(Session.get('game')),
			hasBonuses = !game.hasBonuses;

		if (game.createdBy === Meteor.userId()) {
			switchTargetButton(e, hasBonuses);

			Meteor.call('updateGameHasBonuses', Session.get('game'), hasBonuses ? 1 : 0);
		}
	},

	'click [data-action="set-player-is-ready"]': function(e) {
		Meteor.call('setPlayerIsReady', Session.get('game'));
	},
	
	'click [data-action="start"]': function(e) {
		Meteor.call('startGame', Session.get('game'));
	},

	'click [data-action="join"]': function(e) {
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

	'click [data-action="leave"]': function(e) {
		Meteor.call('leaveGame', Session.get('game'));
	}
});

/** @type {GameInitiator}|null */
var gameInitiator = null;
/** @type {KeepRegistrationAlive}|null */
var keepRegistrationAlive = null;

Template.game.rendered = function() {
	gameInitiator = new GameInitiator(Session.get('game'));
	gameInitiator.init();
	keepRegistrationAlive = new KeepRegistrationAlive(Session.get('game'));
	keepRegistrationAlive.start();
};

Template.game.destroyed = function() {
	if (gameInitiator) {
		gameInitiator.stop();
	}
	if (keepRegistrationAlive) {
		keepRegistrationAlive.stop();
	}
};
