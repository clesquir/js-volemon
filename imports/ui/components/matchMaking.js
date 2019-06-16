import GameNotifier from '/imports/api/games/client/GameNotifier';
import MatchMakingGameConfiguration from '/imports/api/games/configuration/MatchMakingGameConfiguration';
import {
	ONE_VS_COMPUTER_GAME_MODE,
	ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE,
	ONE_VS_ONE_GAME_MODE,
	TOURNAMENT_GAME_SELECTION,
	TWO_VS_TWO_GAME_MODE
} from '/imports/api/games/constants.js';
import GameOverrideFactory from '/imports/api/games/GameOverrideFactory';
import {Games} from '/imports/api/games/games.js';
import {MatchMakers} from '/imports/api/games/matchMakers.js';
import {tournamentName} from "/imports/api/tournaments/utils.js";
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {EventPublisher} from '/imports/lib/EventPublisher.js';
import PageUnload from '/imports/lib/events/PageUnload.js';
import ButtonEnabler from '/imports/ui/util/ButtonEnabler.js';
import TipsUpdater from '/imports/ui/util/TipsUpdater.js';
import {Tooltips} from 'meteor/lookback:tooltips';
import {Meteor} from "meteor/meteor";
import {Mongo} from "meteor/mongo";
import {Session} from "meteor/session";
import {Template} from "meteor/templating";

import './matchMaking.html';

const he = require('he');

class PlayableTournamentsCollection extends Mongo.Collection {}
const PlayableTournaments = new PlayableTournamentsCollection('playableTournaments');

const tipsUpdater = new TipsUpdater();
const gameNotifier = new GameNotifier();
let matchMakingTracker;
let gameStartTracker;

class MatchMakingView {
	static init() {
		tipsUpdater.start();
		Session.set('matchMaking.isLoading', true);
		Session.set('matchMaking.gameId', null);
		Session.set('matchMaking.playerIsReady', false);
		Session.set('matchMaking.kickedOut', false);

		Promise.resolve()
			.then(function() {
				return new Promise(function(resolve) {
					Meteor.subscribe('matchMakings', function() {
						resolve();
					});
				});
			})
			.then(function() {
				return new Promise(function(resolve) {
					Meteor.subscribe('playableTournaments', Meteor.userId(), function() {
						resolve();
					});
				});
			})
			.then(function() {
				Session.set('matchMaking.isLoading', false);

				if (Session.get('matchMaking.modeSelection')) {
					MatchMakingView.startMatchMaking();
				}
			})
			.catch(function() {});

		EventPublisher.on(
			PageUnload.prototype.constructor.name,
			MatchMakingView.unbindOnPageLeft,
			null
		);
	}

	static destroy() {
		MatchMakingView.unbindOnPageLeft();

		EventPublisher.off(
			PageUnload.prototype.constructor.name,
			MatchMakingView.unbindOnPageLeft,
			null
		);
	}

	static showModeSelection() {
		return !Session.get('matchMaking.isLoading') && !Session.get('matchMaking.modeSelection');
	}

	static showTournamentNotAvailable() {
		return (
			!Session.get('matchMaking.isLoading') &&
			Session.get('matchMaking.tournamentId') &&
			!PlayableTournaments.findOne({_id: Session.get('matchMaking.tournamentId')})
		);
	}

	static userPresentInArray(users, userId) {
		for (let user of users) {
			if (user.id === userId) {
				return true;
			}
		}

		return false;
	}

	static startMatchMaking() {
		MatchMakingView.monitorWhenMatched();

		Meteor.call(
			'startMatchMaking',
			Session.get('matchMaking.modeSelection') || ONE_VS_ONE_GAME_MODE,
			Session.get('matchMaking.tournamentId'),
			function(error) {}
		);

		Meteor.subscribe('matchMakingKeepAlive');
	}

	static monitorWhenMatched() {
		matchMakingTracker = MatchMakers.find().observeChanges({
			changed: (id, fields) => {
				if (fields.hasOwnProperty('matched')) {
					const match = MatchMakers.findOne(
						{
							'matched.users.id': Meteor.userId(),
							'matched.users.connectionId': Meteor.connection._lastSessionId
						}
					);

					if (match) {
						for (let matched of match.matched) {
							if (MatchMakingView.userPresentInArray(matched.users, Meteor.userId())) {
								if (!Session.get('matchMaking.gameId')) {
									Session.set('matchMaking.gameId', matched.gameId);
									MatchMakingView.monitorGameStart();
								}
								return;
							}
						}
					}

					if (Session.get('matchMaking.gameId')) {
						Session.set('matchMaking.kickedOut', true);
					}
				}
			}
		});
	}

	static monitorGameStart() {
		Meteor.subscribe('game', Session.get('matchMaking.gameId'));
		gameNotifier.onMatched();
		Tooltips.hide();
		ButtonEnabler.enableButton($('.buttons'));

		gameStartTracker = Games.find(Session.get('matchMaking.gameId')).observeChanges({
			changed: (id, fields) => {
				if (fields.hasOwnProperty('isReady') && fields.isReady === true) {
					Session.set('appLoadingMask', true);
					Session.set('appLoadingMask.text', 'Creating game...');
					gameNotifier.onGameReady();

					if (Session.get('matchMaking.tournamentId')) {
						Router.go('tournamentGame', {tournamentId: Session.get('matchMaking.tournamentId'), gameId: Session.get('matchMaking.gameId')});
					} else {
						Router.go('game', {_id: Session.get('matchMaking.gameId')});
					}

					MatchMakingView.closeMatchMaking();
				}
			}
		});
	}

	static closeMatchMaking() {
		tipsUpdater.stop();
		if (matchMakingTracker) {
			matchMakingTracker.stop();
		}
		if (gameStartTracker) {
			gameStartTracker.stop();
		}
		MatchMakingView.reinitSessionVariables();
		Session.set('lightbox', false);
		Session.set('lightbox.closable', true);
	}

	static reinitSessionVariables() {
		Session.set('matchMaking.isLoading', false);
		Session.set('matchMaking.modeSelection', null);
		Session.set('matchMaking.tournamentId', null);
		Session.set('matchMaking.gameId', null);
		Session.set('matchMaking.playerIsReady', false);
		Session.set('matchMaking.kickedOut', false);
	}

	static unbindOnPageLeft() {
		MatchMakingView.closeMatchMaking();
		Meteor.call('cancelMatchMaking', Meteor.userId());
	}
}

Template.matchMaking.onCreated(function() {
	MatchMakingView.init();
});

Template.matchMaking.destroyed = function() {
	MatchMakingView.destroy();
};

Template.matchMaking.helpers({
	showModeSelection: function() {
		return MatchMakingView.showModeSelection();
	},

	showSelectedModeTitle: function() {
		return !!Session.get('matchMaking.modeSelection');
	},

	showShare: function() {
		return !!Session.get('matchMaking.modeSelection') && !Session.get('matchMaking.gameId') && !Session.get('matchMaking.kickedOut');
	},

	tournaments: function() {
		return PlayableTournaments.find({}, {sort: [['startDate', 'asc']]});
	},

	name: function() {
		return tournamentName(this);
	},

	description: function() {
		if (this.description) {
			return this.description;
		}

		return '';
	},

	hasPlayersWaiting: function(modeSelection, tournamentId) {
		const match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});

		return match && match.usersToMatch && match.usersToMatch.length > 0;
	},

	playersWaiting: function(modeSelection, tournamentId) {
		const match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});

		if (match && match.usersToMatch) {
			const players = [];

			for (let userToMatch of match.usersToMatch) {
				players.push(he.encode(userToMatch.name));
			}

			return players.join('<br />');
		}

		return '';
	},

	numberOfPlayersWaiting: function(modeSelection, tournamentId) {
		const match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});

		if (match && match.usersToMatch) {
			return match.usersToMatch.length;
		}

		return 0;
	},

	showTournamentNotAvailable: function() {
		return MatchMakingView.showTournamentNotAvailable();
	},

	canIncludeComputer: function() {
		if (!Session.get('matchMaking.modeSelection') || Session.get('matchMaking.gameId')) {
			return false;
		}

		const configuration = new MatchMakingGameConfiguration(
			Session.get('matchMaking.modeSelection'),
			PlayableTournaments,
			Session.get('matchMaking.tournamentId')
		);

		return configuration.canIncludeComputer();
	},

	includeComputerTooltip: function() {
		if (!Session.get('matchMaking.modeSelection') || Session.get('matchMaking.gameId')) {
			return false;
		}

		const configuration = new MatchMakingGameConfiguration(
			Session.get('matchMaking.modeSelection'),
			PlayableTournaments,
			Session.get('matchMaking.tournamentId')
		);

		if (configuration.forcePracticeWithComputer()) {
			return 'The ELO scores are not calculated when adding a CPU';
		} else {
			return '';
		}
	},

	shapeEditionAllowed: function(id) {
		if (id !== Meteor.userId()) {
			return false;
		}

		const configuration = new MatchMakingGameConfiguration(
			Session.get('matchMaking.modeSelection'),
			PlayableTournaments,
			Session.get('matchMaking.tournamentId')
		);
		const allowedListOfShapes = configuration.allowedListOfShapes() || [];

		return allowedListOfShapes.length > 1;
	},

	selectedShape: function() {
		const configuration = new MatchMakingGameConfiguration(
			Session.get('matchMaking.modeSelection'),
			PlayableTournaments,
			Session.get('matchMaking.tournamentId')
		);
		const allowedListOfShapes = configuration.allowedListOfShapes() || [];
		const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});
		let selectedShape = null;

		if (userConfiguration && userConfiguration.matchMakingSelectedShape) {
			selectedShape = userConfiguration.matchMakingSelectedShape;
		}

		if (allowedListOfShapes.indexOf(selectedShape) === -1) {
			selectedShape = allowedListOfShapes[0];
		}

		return selectedShape;
	},

	allowedListOfShapes: function() {
		const configuration = new MatchMakingGameConfiguration(
			Session.get('matchMaking.modeSelection'),
			PlayableTournaments,
			Session.get('matchMaking.tournamentId')
		);

		return configuration.allowedListOfShapes() || [];
	},

	showStartGame: function() {
		if (!Session.get('matchMaking.gameId')) {
			return false;
		}

		const match = MatchMakers.findOne(
			{
				'matched.users.id': Meteor.userId(),
				'matched.users.connectionId': Meteor.connection._lastSessionId
			}
		);

		if (!match) {
			return false;
		}

		for (let matched of match.matched) {
			if (MatchMakingView.userPresentInArray(matched.users, Meteor.userId())) {
				return true;
			}
		}

		return false;
	},

	startGameDisabling: function() {
		if (Session.get('matchMaking.playerIsReady')) {
			return 'disabled';
		}

		return '';
	},

	showLoading: function() {
		return (Session.get('matchMaking.isLoading') || Session.get('matchMaking.modeSelection')) && !Session.get('matchMaking.kickedOut');
	},

	showRetry: function() {
		return Session.get('matchMaking.kickedOut');
	},

	showCancelMatchMaking: function() {
		return !Session.get('matchMaking.isLoading') || Session.get('matchMaking.kickedOut');
	},

	waitingForPlayersReady: function() {
		return Session.get('matchMaking.playerIsReady') && !Session.get('matchMaking.kickedOut');
	},

	matchSelectionItems: function() {
		const tournaments = PlayableTournaments.find({}, {sort: [['startDate', 'asc']]});
		const gameModes = [
			{
				gameModeCode: ONE_VS_COMPUTER_GAME_MODE,
				gameModeTournamentId: null,
				gameModeName: '1 VS CPU',
				gameModeDescription: '',
				showPlayersWaitingIndicator: false,
			},
			{
				gameModeCode: ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE,
				gameModeTournamentId: null,
				gameModeName: '1 VS Machine Learning CPU',
				gameModeDescription: '',
				showPlayersWaitingIndicator: false,
			},
		];

		//1v1
		gameModes.push(
			{
				gameModeCode: ONE_VS_ONE_GAME_MODE,
				gameModeTournamentId: null,
				gameModeName: '1 VS 1',
				gameModeDescription: '',
				showPlayersWaitingIndicator: true,
			}
		);

		const oneVersusOneGameOverrideModes = GameOverrideFactory.oneVersusOneGameOverrideModes();
		for (let mode of oneVersusOneGameOverrideModes) {
			gameModes.push(
				{
					gameModeCode: mode.gameModeCode(),
					gameModeTournamentId: null,
					gameModeName: '1 VS 1: ' + mode.gameModeName(),
					gameModeDescription: '',
					showPlayersWaitingIndicator: true,
				}
			);
		}

		tournaments.forEach(function(tournament) {
			if (tournament.gameMode === ONE_VS_ONE_GAME_MODE) {
				gameModes.push(
					{
						gameModeCode: 'tournament',
						gameModeTournamentId: tournament._id,
						gameModeName: tournamentName(tournament),
						gameModeDescription: tournament.description,
						showPlayersWaitingIndicator: true,
					}
				);
			}
		});

		//2v2
		gameModes.push(
			{
				gameModeCode: TWO_VS_TWO_GAME_MODE,
				gameModeTournamentId: null,
				gameModeName: '2 VS 2',
				gameModeDescription: '',
				showPlayersWaitingIndicator: true,
			}
		);

		const twoVersusTwoGameOverrideModes = GameOverrideFactory.twoVersusTwoGameOverrideModes();
		for (let mode of twoVersusTwoGameOverrideModes) {
			gameModes.push(
				{
					gameModeCode: mode.gameModeCode(),
					gameModeTournamentId: null,
					gameModeName: '2 VS 2: ' + mode.gameModeName(),
					gameModeDescription: '',
					showPlayersWaitingIndicator: true,
				}
			);
		}

		tournaments.forEach(function(tournament) {
			if (tournament.gameMode === TWO_VS_TWO_GAME_MODE) {
				gameModes.push(
					{
						gameModeCode: 'tournament',
						gameModeTournamentId: tournament._id,
						gameModeName: tournamentName(tournament),
						gameModeDescription: tournament.description,
						showPlayersWaitingIndicator: true,
					}
				);
			}
		});

		return gameModes;
	},

	selectedModeTitle: function() {
		const modeSelection = Session.get('matchMaking.modeSelection');

		switch (modeSelection) {
			case ONE_VS_COMPUTER_GAME_MODE:
				return '1 VS CPU';
			case ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE:
				return '1 VS Machine Learning CPU';
			case ONE_VS_ONE_GAME_MODE:
				return '1 VS 1';
			case TWO_VS_TWO_GAME_MODE:
				return '2 VS 2';
			case TOURNAMENT_GAME_SELECTION:
				const tournament = PlayableTournaments.findOne({_id: Session.get('matchMaking.tournamentId')});

				return tournament && tournamentName(tournament);
			default:
				if (GameOverrideFactory.gameModeHasGameOverride(modeSelection)) {
					let gameMode = '1 VS 1';
					if (GameOverrideFactory.gameOverrideModeFromGameMode(modeSelection).isTwoVersusTwo()) {
						gameMode = '2 VS 2';
					}

					return gameMode + ': ' + GameOverrideFactory.nameFromGameMode(modeSelection);
				}
		}

		return '';
	},

	showCurrentWaitingForMode: function() {
		return (
			Session.get('matchMaking.modeSelection') !== ONE_VS_COMPUTER_GAME_MODE &&
			Session.get('matchMaking.modeSelection') !== ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE
		);
	},

	selectedTournamentDescription: function() {
		switch (Session.get('matchMaking.modeSelection')) {
			case TOURNAMENT_GAME_SELECTION:
				const tournament = PlayableTournaments.findOne({_id: Session.get('matchMaking.tournamentId')});

				if (tournament) {
					return tournament.description;
				}
		}

		return '';
	},

	modeSelection: function() {
		return Session.get('matchMaking.modeSelection');
	},

	tournamentId: function() {
		return Session.get('matchMaking.tournamentId');
	},

	tournamentIdForUrl: function() {
		return Session.get('matchMaking.tournamentId') || 'none';
	},

	tips: function() {
		return tipsUpdater.currentTip.get();
	},

	matchMakingStatus: function() {
		if (Session.get('matchMaking.kickedOut')) {
			return "Your opponent has left...";
		} else if (Session.get('matchMaking.gameId')) {
			return "You've been matched! Ready?";
		} else if (Session.get('matchMaking.modeSelection')) {
			return "Looking for players...";
		}

		return '';
	},

	showListOfMatched: function() {
		return !!Session.get('matchMaking.gameId');
	},

	listOfMatched: function() {
		const match = MatchMakers.findOne(
			{
				'matched.users.id': Meteor.userId(),
				'matched.users.connectionId': Meteor.connection._lastSessionId
			}
		);

		if (match) {
			for (let matched of match.matched) {
				if (MatchMakingView.userPresentInArray(matched.users, Meteor.userId())) {
					return matched.users;
				}
			}
		}

		return [];
	},

	shape: function(id) {
		const game = Games.findOne(Session.get('matchMaking.gameId'));

		if (game && game.players) {
			for (let player of game.players) {
				if (player.id === id) {
					return player.selectedShape;
				}
			}
		}

		return '';
	},

	matchMakingStatusClass: function() {
		if (Session.get('matchMaking.kickedOut') || Session.get('matchMaking.gameId')) {
			return 'matched-status';
		}

		return '';
	}
});

Template.matchMaking.events({
	'click [data-action=select-game-mode-selection]': function(e) {
		Session.set('matchMaking.tournamentId', $(e.currentTarget).attr('data-tournament-id'));
		Session.set('matchMaking.modeSelection', $(e.currentTarget).attr('data-game-mode-selection'));

		Tooltips.hide();
		MatchMakingView.startMatchMaking();
	},

	'click [data-action=retry-match-making]:not([disabled])': function(e) {
		ButtonEnabler.disableButton(e.target.parentNode);

		Session.set('matchMaking.gameId', null);
		Session.set('matchMaking.playerIsReady', false);
		Session.set('matchMaking.kickedOut', false);
		if (matchMakingTracker) {
			matchMakingTracker.stop();
		}
		if (gameStartTracker) {
			gameStartTracker.stop();
		}

		MatchMakingView.startMatchMaking();

		ButtonEnabler.enableButton(e.target.parentNode);
	},

	'click [data-action=include-computer]:not([disabled])': function(e) {
		ButtonEnabler.disableButton(e.target.parentNode);
		Meteor.call(
			'addComputerToMatch',
			Session.get('matchMaking.modeSelection') || ONE_VS_ONE_GAME_MODE,
			Session.get('matchMaking.tournamentId'),
			function() {
				setTimeout(
					() => {
						ButtonEnabler.enableButton(e.target.parentNode);
					},
					1000
				);
			}
		);
	},

	'click [data-action=include-ml-computer]:not([disabled])': function(e) {
		ButtonEnabler.disableButton(e.target.parentNode);
		Meteor.call(
			'addMachineLearningComputerToMatch',
			Session.get('matchMaking.modeSelection') || ONE_VS_ONE_GAME_MODE,
			Session.get('matchMaking.tournamentId'),
			function() {
				setTimeout(
					() => {
						ButtonEnabler.enableButton(e.target.parentNode);
					},
					1000
				);
			}
		);
	},

	'click [data-action="start-game"]:not([disabled])': function(e) {
		ButtonEnabler.disableButton(e.target.parentNode);
		Meteor.call('setPlayerIsReady', Session.get('matchMaking.gameId'), function() {
			Session.set('matchMaking.playerIsReady', true);
			ButtonEnabler.enableButton(e.target.parentNode);
		});
	},

	'click [data-action=cancel-match-making]:not([disabled])': function(e) {
		ButtonEnabler.disableButton(e.target.parentNode);
		Meteor.call('cancelMatchMaking', Meteor.userId(), function(error, cancelAllowed) {
			ButtonEnabler.enableButton(e.target.parentNode);
			if (cancelAllowed) {
				MatchMakingView.closeMatchMaking();
			}
		});
	}
});
