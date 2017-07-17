import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import * as Moment from 'meteor/momentjs:moment';
import {Players} from '/imports/api/games/players.js';
import {
	isGamePlayer,
	isGameStatusFinished,
	isGameStatusTimeout,
	getWinnerName
} from '/imports/api/games/utils.js';
import {
	playerAcceptedRematch,
	playerDeclinedRematch,
	playerHasNotRepliedRematch,
	playerLeftGame,
	currentPlayerHasRepliedRematch,
	currentPlayerAcceptedRematch
} from '/imports/lib/client/gameSetup.js';

import './afterGame.html';

Template.afterGame.helpers({
	isGamePlayer: function() {
		return isGamePlayer(Session.get('game'));
	},

	gameIsFinished: function() {
		return isGameStatusFinished(this.game.status);
	},

	isPracticeGame: function() {
		return this.game.isPracticeGame;
	},

	isNotAPracticeGame: function() {
		return !this.game.isPracticeGame;
	},

	gameDurations: function() {
		const durationsSorted = Array.from(this.game.pointsDuration).sort(function(a, b) {
			return a - b;
		});

		return Array.from(this.game.pointsDuration).map((value, index) => {
			let durationClass = '';

			if (durationsSorted[0] === value) {
				durationClass += 'lowest-game-duration ';
			} else if (durationsSorted[durationsSorted.length - 1] === value) {
				durationClass += 'highest-game-duration ';
			}

			if (this.game.pointsSide[index]) {
				durationClass += 'game-duration-winner-' + this.game.pointsSide[index] + ' ';
			}

			return '<span class="' + durationClass + '">' + Moment.moment(value).format('mm:ss') + "</span>";
		}).join('<span class="game-duration-separator"> &#8226; </span>');
	},

	getAfterGameTitle: function() {
		if (isGameStatusTimeout(this.game.status)) {
			return 'The game has timed out...';
		} else if (isGameStatusFinished(this.game.status)) {
			return getWinnerName(this.game) + ' wins';
		}
	},

	getPlayerEloRating: function(player, eloScores) {
		let eloRating = '-';

		eloScores.forEach((eloScore) => {
			if (player.userId === eloScore.userId) {
				eloRating = eloScore.eloRating;
			}
		});

		return eloRating;
	},

	getPlayerGameEloRatingChange: function(player, eloScores) {
		let gameEloRatingChange = null;

		eloScores.forEach((eloScore) => {
			if (player.userId === eloScore.userId) {
				gameEloRatingChange = eloScore.eloRatingChange;
			}
		});

		return gameEloRatingChange;
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

Template.afterGame.events({
	'click [data-action="game-rematch"]': function() {
		Meteor.call('replyRematch', Session.get('game'), true);
	},

	'click [data-action="declined-game-rematch"]': function() {
		Meteor.call('replyRematch', Session.get('game'), false);
	},

	'click [data-action=view-elo-scores]': function(e) {
		const gameStatisticsContents = document.getElementById('game-statistics-contents');

		if (!$(gameStatisticsContents).is('.after-game-elo-scores-shown')) {
			removeShownClasses(gameStatisticsContents);
			$(gameStatisticsContents).addClass('after-game-elo-scores-shown');
		}
	},

	'click [data-action=view-game-durations]': function(e) {
		const gameStatisticsContents = document.getElementById('game-statistics-contents');

		if (!$(gameStatisticsContents).is('.after-game-durations-shown')) {
			removeShownClasses(gameStatisticsContents);
			$(gameStatisticsContents).addClass('after-game-durations-shown');
		}
	}
});

const removeShownClasses = function(gameStatisticsContents) {
	$(gameStatisticsContents).removeClass('after-game-elo-scores-shown');
	$(gameStatisticsContents).removeClass('after-game-durations-shown');
};
