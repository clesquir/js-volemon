import {
	currentPlayerAcceptedRematch,
	currentPlayerHasRepliedRematch,
	playerAcceptedRematch,
	playerDeclinedRematch,
	playerHasNotRepliedRematch,
	playerLeftGame
} from '/imports/api/games/client/gameSetup.js';
import {ONE_VS_COMPUTER_GAME_MODE, TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {
	forfeitSide,
	hasGameStatusEndedWithAWinner,
	isGamePlayer,
	isGameStatusFinished,
	isGameStatusForfeit,
	isGameStatusTimeout,
	winnerSide
} from '/imports/api/games/utils.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {playersCanPlayTournament} from '/imports/api/tournaments/utils.js';
import CardSwitcher from '/imports/lib/client/CardSwitcher.js';
import ButtonEnabler from '/imports/ui/util/ButtonEnabler.js';
import {Meteor} from 'meteor/meteor';
import * as Moment from 'meteor/momentjs:moment';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

import './afterGame.html';

let cardSwitcher;

Template.afterGame.onRendered(function() {
	Meteor.setTimeout(function() {
		const afterGameContainer = document.getElementById('afterGameContainer');

		if (afterGameContainer) {
			$(afterGameContainer).addClass('after-game-shown');
			cardSwitcher = new CardSwitcher(
				'.after-game-swiper-container',
				{
					'after-game-elo-scores': AfterGameViews.viewEloScores,
					'after-game-durations': AfterGameViews.viewGameDurations,
				}
			);
		}
	}, 0);
});

Template.afterGame.helpers({
	isGamePlayer: function() {
		return isGamePlayer(Session.get('game'));
	},

	gameIsFinished: function() {
		return hasGameStatusEndedWithAWinner(this.game.status);
	},

	isPracticeGame: function() {
		return this.game.isPracticeGame;
	},

	isNotAPracticeGame: function() {
		return !this.game.isPracticeGame;
	},

	isTournament: function() {
		return !!this.game.tournamentId;
	},

	isDraftTournament: function() {
		const tournament = Tournaments.findOne(this.game.tournamentId);

		return tournament && tournament.status.id === 'draft';
	},

	isTwoVersusTwo: function() {
		return this.game.gameMode === TWO_VS_TWO_GAME_MODE;
	},

	playersList: function(playersCollection) {
		if (this.game.gameMode === TWO_VS_TWO_GAME_MODE) {
			const players = {};

			playersCollection.forEach((player) => {
				if (this.game.players[0].id === player.userId) {
					players[0] = player;
				} else if (this.game.players[1].id === player.userId) {
					players[1] = player;
				} else if (this.game.players[2].id === player.userId) {
					players[2] = player;
				} else if (this.game.players[3].id === player.userId) {
					players[3] = player;
				}
			});

			return [
				players[0],
				players[2],
				players[3],
				players[1],
			];
		} else {
			return playersCollection;
		}
	},

	gameDurations: function() {
		const pointsDuration = Array.from(this.game.pointsDuration);
		const durationsSorted = Array.from(this.game.pointsDuration).sort(function(a, b) {
			return a - b;
		});

		return pointsDuration.map((value, index) => {
			let durationClass = '';

			if (pointsDuration.length > 1) {
				if (durationsSorted[0] === value) {
					durationClass += 'lowest-game-duration ';
				} else if (durationsSorted[durationsSorted.length - 1] === value) {
					durationClass += 'highest-game-duration ';
				}
			}

			if (this.game.pointsSide[index]) {
				durationClass += 'game-duration-winner-' + this.game.pointsSide[index] + ' ';
			}

			return '<span class="' + durationClass + '">' + Moment.moment(value).format('mm:ss') + "</span>";
		}).join('<span class="game-duration-separator"> &#8226; </span>');
	},

	afterGameColorClass: function() {
		if (isGameStatusFinished(this.game.status)) {
			switch(winnerSide(this.game)) {
				case 'Red':
					return 'game-won-red-color';
				case 'Blue':
					return 'game-won-blue-color';
			}
		}

		return '';
	},

	getAfterGameTitle: function() {
		if (isGameStatusTimeout(this.game.status)) {
			return 'The game has timed out...';
		} else if (isGameStatusForfeit(this.game.status)) {
			return forfeitSide(this.game) + ' has forfeited';
		} else if (isGameStatusFinished(this.game.status)) {
			return winnerSide(this.game) + ' wins';
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
			!isGamePlayer(Session.get('game')) ||
			!playerAcceptedRematch(players) ||
			playerDeclinedRematch(players) ||
			playerLeftGame(players)
		);
	},

	showAskForRematch() {
		const players = Players.find({gameId: Session.get('game')});

		return (
			this.game.gameMode !== ONE_VS_COMPUTER_GAME_MODE &&
			isGamePlayer(Session.get('game')) &&
			playersCanPlayTournament(this.game.tournamentId, players) &&
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
			this.game.gameMode !== ONE_VS_COMPUTER_GAME_MODE &&
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
			playersCanPlayTournament(this.game.tournamentId, players) &&
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
	'click [data-action="game-rematch"]:not([disabled])': function(e) {
		ButtonEnabler.disableButton(e.target);
		Meteor.call('replyRematch', Session.get('game'), true, function() {
			ButtonEnabler.enableButton(e.target);
		});
	},

	'click [data-action="declined-game-rematch"]:not([disabled])': function(e) {
		ButtonEnabler.disableButton(e.target);
		Meteor.call('replyRematch', Session.get('game'), false, function() {
			ButtonEnabler.enableButton(e.target);
		});
	},

	'click [data-action=view-elo-scores]': function() {
		cardSwitcher.slideTo(0);
	},

	'click [data-action=view-game-durations]': function() {
		const game = Games.findOne(Session.get('game'));

		if (!game.isPracticeGame) {
			cardSwitcher.slideTo(1);
		}
	}
});

class AfterGameViews {
	static viewEloScores() {
		const gameStatisticsContents = document.getElementById('game-statistics-contents');

		if (!$(gameStatisticsContents).is('.after-game-elo-scores-shown')) {
			AfterGameViews.removeShownClasses(gameStatisticsContents);
			$(gameStatisticsContents).addClass('after-game-elo-scores-shown');
		}
	}

	static viewGameDurations() {
		const gameStatisticsContents = document.getElementById('game-statistics-contents');

		if (!$(gameStatisticsContents).is('.after-game-durations-shown')) {
			AfterGameViews.removeShownClasses(gameStatisticsContents);
			$(gameStatisticsContents).addClass('after-game-durations-shown');
		}
	}

	static removeShownClasses(gameStatisticsContents) {
		$(gameStatisticsContents).removeClass('after-game-elo-scores-shown');
		$(gameStatisticsContents).removeClass('after-game-durations-shown');
	}
}
