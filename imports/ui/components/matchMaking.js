import GameNotifier from '/imports/api/games/client/GameNotifier.js';
import MatchMakingGameConfiguration from '/imports/api/games/configuration/MatchMakingGameConfiguration.js';
import {Games} from '/imports/api/games/games.js';
import {MatchMakers} from '/imports/api/games/matchMakers.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import ButtonEnabler from '/imports/ui/util/ButtonEnabler.js';
import TipsUpdater from '/imports/ui/util/TipsUpdater.js';
import {Meteor} from "meteor/meteor";
import {Mongo} from "meteor/mongo";
import {Session} from "meteor/session";
import {Template} from "meteor/templating";
import './matchMaking.html';

class PlayableTournamentsCollection extends Mongo.Collection {}
const PlayableTournaments = new PlayableTournamentsCollection('playableTournaments');

const showModeSelection = function() {
	return !Session.get('matchMaking.isLoading') && !Session.get('matchMaking.modeSelection');
};

const showTournamentNotAvailable = function() {
	return (
		!Session.get('matchMaking.isLoading') &&
		Session.get('matchMaking.tournamentId') &&
		!PlayableTournaments.findOne({_id: Session.get('matchMaking.tournamentId')})
	);
};

const showShapeSelection = function() {
	return !Session.get('matchMaking.isLoading');
};

const startMatchMaking = function() {
	monitorWhenMatched();

	Meteor.call(
		'startMatchMaking',
		Session.get('matchMaking.modeSelection') || '1vs1',
		Session.get('matchMaking.tournamentId'),
		function(error) {}
	);
};

const monitorWhenMatched = function() {
	matchMakingTracker = MatchMakers.find().observeChanges({
		changed: (id, fields) => {
			if (fields.hasOwnProperty('matched')) {
				const match = MatchMakers.findOne({'matched.users': Meteor.userId()});

				if (match) {
					for (let matched of match.matched) {
						if (matched.users.indexOf(Meteor.userId()) !== -1) {
							Session.set('matchMaking.gameId', matched.gameId);
							monitorGameStart();
							break;
						}
					}
				}
			}
		}
	});
};

const monitorGameStart = function() {
	Meteor.subscribe('game', Session.get('matchMaking.gameId'));
	gameNotifier.onMatched();

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

				closeMatchMaking();
			}
		}
	});
};

const reinitSessionVariables = function() {
	Session.set('matchMaking.isLoading', false);
	Session.set('matchMaking.modeSelection', null);
	Session.set('matchMaking.tournamentId', null);
	Session.set('matchMaking.gameId', null);
	Session.set('matchMaking.playerIsReady', false);
};

const closeMatchMaking = function() {
	tipsUpdater.stop();
	if (matchMakingTracker) {
		matchMakingTracker.stop();
	}
	if (gameStartTracker) {
		gameStartTracker.stop();
	}
	reinitSessionVariables();
	Session.set('lightbox', false);
	Session.set('lightbox.closable', true);
};

const tipsUpdater = new TipsUpdater();
const gameNotifier = new GameNotifier();
let matchMakingTracker;
let gameStartTracker;

Template.matchMaking.onCreated(function() {
	tipsUpdater.start();
	Session.set('matchMaking.isLoading', true);
	Session.set('matchMaking.gameId', null);
	Session.set('matchMaking.playerIsReady', false);

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
				startMatchMaking();
			}
		})
		.catch(function() {});
});

Template.matchMaking.destroyed = function() {
	closeMatchMaking();
};

Template.matchMaking.helpers({
	showModeSelection: function() {
		return showModeSelection();
	},

	showSelectedModeTitle: function() {
		return !!Session.get('matchMaking.modeSelection');
	},

	showShare: function() {
		return !!Session.get('matchMaking.modeSelection') && !Session.get('matchMaking.gameId');
	},

	tournaments: function() {
		return PlayableTournaments.find({}, {sort: [['startDate', 'asc']]});
	},

	name: function() {
		if (this.name) {
			return this.name;
		}

		return this.mode.name;
	},

	description: function() {
		if (this.description) {
			return this.description;
		}

		return this.mode.description;
	},

	hasPlayersWaiting: function(modeSelection, tournamentId) {
		const match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});

		return match && match.usersToMatch && match.usersToMatch.length > 0;
	},

	numberOfPlayersWaiting: function(modeSelection, tournamentId) {
		const match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});

		if (match && match.usersToMatch) {
			return match.usersToMatch.length;
		}

		return 0;
	},

	showTournamentNotAvailable: function() {
		return showTournamentNotAvailable();
	},

	showShapeSelection: function() {
		return !showModeSelection() && !showTournamentNotAvailable() && showShapeSelection();
	},

	shapeEditionAllowed: function() {
		const configuration = new MatchMakingGameConfiguration(PlayableTournaments, Session.get('matchMaking.tournamentId'));
		const allowedListOfShapes = configuration.allowedListOfShapes() || [];

		return allowedListOfShapes.length > 1;
	},

	selectedShape: function() {
		const configuration = new MatchMakingGameConfiguration(PlayableTournaments, Session.get('matchMaking.tournamentId'));
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
		const configuration = new MatchMakingGameConfiguration(PlayableTournaments, Session.get('matchMaking.tournamentId'));

		return configuration.allowedListOfShapes() || [];
	},

	showStartGame: function() {
		if (!Session.get('matchMaking.gameId')) {
			return false;
		}

		const match = MatchMakers.findOne({'matched.users': Meteor.userId()});

		if (!match) {
			return false;
		}

		for (let matched of match.matched) {
			if (matched.users.indexOf(Meteor.userId()) !== -1) {
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
		return Session.get('matchMaking.isLoading') || Session.get('matchMaking.modeSelection');
	},

	showCancelMatchMaking: function() {
		return !Session.get('matchMaking.isLoading') && !Session.get('matchMaking.gameId');
	},

	selectedMode: function() {
		switch (Session.get('matchMaking.modeSelection')) {
			case '1vs1':
				return '1 VS 1';
			case 'tournament':
				const tournament = PlayableTournaments.findOne({_id: Session.get('matchMaking.tournamentId')});

				if (tournament) {
					return tournament.name || tournament.mode.name;
				}
		}

		return '';
	},

	selectedTournamentDescription: function() {
		switch (Session.get('matchMaking.modeSelection')) {
			case 'tournament':
				const tournament = PlayableTournaments.findOne({_id: Session.get('matchMaking.tournamentId')});

				if (tournament) {
					return tournament.description || tournament.mode.description;
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
		if (Session.get('matchMaking.gameId')) {
			return "You've been matched! Ready?";
		} else if (Session.get('matchMaking.modeSelection')) {
			return "Looking for players...";
		}

		return '';
	},

	matchMakingStatusClass: function() {
		if (Session.get('matchMaking.gameId')) {
			return 'matched-status';
		}

		return '';
	}
});

Template.matchMaking.events({
	'click [data-action=select-mode-selection]': function(e) {
		Session.set('matchMaking.tournamentId', $(e.currentTarget).attr('data-tournament-id'));
		Session.set('matchMaking.modeSelection', $(e.currentTarget).attr('data-mode-selection'));

		startMatchMaking();
	},

	'click [data-action="start-game"]:not([disabled])': function(e) {
		ButtonEnabler.disableButton(e.target);
		Meteor.call('setPlayerIsReady', Session.get('matchMaking.gameId'), function() {
			Session.set('matchMaking.playerIsReady', true);
		});
	},

	'click [data-action=cancel-match-making]:not([disabled])': function(e) {
		ButtonEnabler.disableButton(e.target);
		Meteor.call('cancelMatchMaking', function(error, cancelAllowed) {
			ButtonEnabler.enableButton(e.target);
			if (cancelAllowed) {
				closeMatchMaking();
			}
		});
	}
});
