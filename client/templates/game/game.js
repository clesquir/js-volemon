import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import GameData from '/imports/game/client/GameData.js';
import GameInitiator from '/imports/game/client/GameInitiator.js';
import GameReaction from '/imports/game/client/GameReaction.js';
import GameRematch from '/imports/game/client/GameRematch.js';
import StreamManager from '/imports/game/client/StreamManager.js';
import {
	isUserHost,
	isGameStatusStarted,
	isGameStatusFinished,
	isGameStatusOnGoing,
	isGameStatusTimeout,
	getWinnerName
} from '/imports/game/utils.js';
import {Games} from '/collections/games.js';
import {Players} from '/collections/players.js';
import {Config} from '/imports/lib/config.js';
import {
	playerAcceptedRematch,
	playerDeclinedRematch,
	playerHasNotRepliedRematch,
	playerLeftGame,
	currentPlayerHasRepliedRematch,
	currentPlayerAcceptedRematch
} from '/imports/lib/client/gameSetup.js';
import ClientSocketIo from '/imports/lib/stream/client/ClientSocketIo.js';

Template.game.helpers({
	isHost: function() {
		return this.game.createdBy === Meteor.userId();
	},

	isGameOnGoing: function() {
		return isGameStatusOnGoing(this.game.status);
	},

	hostPoints: function() {
		return padNumber(this.game.hostPoints);
	},

	hostName: function() {
		const player = Players.findOne({gameId: Session.get('game'), userId: this.game.createdBy});

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
		const player = Players.findOne({gameId: Session.get('game'), userId: {$ne: this.game.createdBy}});

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

	hasViewer: function() {
		return this.game.viewers > 0;
	},

	viewers: function() {
		return this.game.viewers;
	},

	isGamePlayer: function() {
		return !!Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()});
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

		return (!player && Config.possibleNoPlayers.indexOf(players.count() + 1) !== -1);
	},

	/**
	 * The possible no of players is reached
	 * @returns {boolean}
	 */
	hasEnoughPlayers: function() {
		const players = Players.find({gameId: Session.get('game')});

		return (
			Config.possibleNoPlayers.indexOf(players.count()) !== -1
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

	isPrivateGame: function() {
		return !!this.game.isPrivate;
	},

	hasBonusesGame: function() {
		return !!this.game.hasBonuses;
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
		let eloRating = '-';

		profiles.forEach((profile) => {
			if (player.userId == profile.userId) {
				eloRating = profile.eloRating;
			}
		});

		return eloRating;
	},

	getPlayerProfile: function(player, profiles) {
		let playerProfile = null;

		profiles.forEach((profile) => {
			if (player.userId == profile.userId) {
				playerProfile = profile;
			}
		});

		return playerProfile;
	},

	gameZoomedInClass(profiles) {
		let gameZoomedIn = false;

		profiles.forEach((profile) => {
			if (Meteor.userId() == profile.userId) {
				gameZoomedIn = profile.gameZoomedIn;
			}
		});

		return gameZoomedIn ? 'extra-big-game-size' : '';
	},

	showActionAfterGame() {
		const players = Players.find({gameId: Session.get('game')});

		return (
			!playerAcceptedRematch(players) ||
			playerDeclinedRematch(players) ||
			playerLeftGame(players)
		);
	},

	showAskForRematch() {
		const players = Players.find({gameId: Session.get('game')});

		return (
			!playerAcceptedRematch(players) &&
			!playerDeclinedRematch(players) &&
			!playerLeftGame(players)
		);
	},

	showWaitingForReply() {
		const players = Players.find({gameId: Session.get('game')});

		return (
			currentPlayerAcceptedRematch(players, Meteor.userId()) &&
			playerHasNotRepliedRematch(players) &&
			!playerLeftGame(players)
		);
	},

	showPlayerLeftTheGame() {
		const players = Players.find({gameId: Session.get('game')});

		return (
			playerLeftGame(players) &&
			!playerDeclinedRematch(players)
		);
	},

	showOpponentDeclinedRematch() {
		const players = Players.find({gameId: Session.get('game')});

		return (
			currentPlayerAcceptedRematch(players, Meteor.userId()) &&
			playerDeclinedRematch(players)
		);
	},

	askForRematchReply() {
		const players = Players.find({gameId: Session.get('game')});

		return (
			playerAcceptedRematch(players) &&
			!currentPlayerHasRepliedRematch(players, Meteor.userId()) &&
			!playerDeclinedRematch(players) &&
			!playerLeftGame(players)
		);
	},

	showCreatingGame() {
		const players = Players.find({gameId: Session.get('game')});

		return (
			!playerDeclinedRematch(players) &&
			!playerHasNotRepliedRematch(players)
		);
	}
});

Template.game.events({
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

	'click [data-action="update-privacy"]': function(e) {
		const game = Games.findOne(Session.get('game'));
		const isPrivate = !game.isPrivate;

		switchTargetButton(e, isPrivate);

		Meteor.call('updateGamePrivacy', Session.get('game'), isPrivate ? 1 : 0);
	},

	'click [data-action="update-has-bonuses"]': function(e) {
		const game = Games.findOne(Session.get('game'));
		const hasBonuses = !game.hasBonuses;

		if (isUserHost(Session.get('game'))) {
			switchTargetButton(e, hasBonuses);

			Meteor.call('updateGameHasBonuses', Session.get('game'), hasBonuses ? 1 : 0);
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
	},

	'click [data-action="expand-extra-big-game"]': function() {
		const gameContainer = $('.game-container').first();
		let zoomedIn = false;

		if ($(gameContainer).is('.extra-big-game-size')) {
			$(gameContainer).removeClass('extra-big-game-size');
		} else {
			$(gameContainer).addClass('extra-big-game-size');
			zoomedIn = true;
		}

		if (Meteor.userId()) {
			Meteor.call('saveZoomedInGame', zoomedIn);
		}
	},

	'click [data-action="trigger-reaction-list"]': function(e) {
		gameReaction.toggleSelectorDisplay($(e.currentTarget));
	},

	'click [data-action="send-reaction"]': function(e) {
		gameReaction.onReactionSelection($(e.currentTarget), isUserHost(Session.get('game')));
	},

	'click [data-action="game-rematch"]': function() {
		Meteor.call('replyRematch', Session.get('game'), true);
	},

	'click [data-action="declined-game-rematch"]': function() {
		Meteor.call('replyRematch', Session.get('game'), false);
	}
});

/** @type {StreamManager} */
let streamManager = null;
/** @type {GameReaction} */
let gameReaction = null;
/** @type {GameInitiator}|null */
let gameInitiator = null;
/** @type {GameRematch}|null */
let gameRematch = null;

Template.game.rendered = function() {
	const stream = new ClientSocketIo();
	const gameData = new GameData(Session.get('game'));
	gameData.init();
	streamManager = new StreamManager(stream);
	streamManager.init();
	streamManager.connect(Session.get('game'));
	gameReaction = new GameReaction(Session.get('game'), stream);
	gameReaction.init();
	gameInitiator = new GameInitiator(Session.get('game'), stream, gameData);
	gameInitiator.init();
	gameRematch = new GameRematch(Session.get('game'), gameData);
	gameRematch.init();
};

Template.game.destroyed = function() {
	Meteor.call('quitGame', Session.get('game'), function() {});

	if (gameInitiator) {
		gameInitiator.stop();
	}
	if (gameRematch) {
		gameRematch.stop();
	}
	if (gameReaction) {
		gameReaction.stop();
	}
	if (streamManager) {
		streamManager.disconnect(Session.get('game'));
	}

	Session.set('game', undefined);
	Session.set('userCurrentlyPlaying', false);
};

Meteor.startup(function(){
	$(window).bind('beforeunload', function() {
		if (Session.get('game')) {
			Meteor.call('quitGame', Session.get('game'), function() {});

			if (gameInitiator) {
				gameInitiator.stop();
			}
			if (gameRematch) {
				gameRematch.stop();
			}
			if (gameReaction) {
				gameReaction.stop();
			}
			if (streamManager) {
				streamManager.disconnect(Session.get('game'));
			}
		}
	});
});
