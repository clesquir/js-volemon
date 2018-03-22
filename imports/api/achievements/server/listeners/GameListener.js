import {GAME_MAXIMUM_POINTS} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import TournamentModeFactory from '/imports/api/tournaments/modes/TournamentModeFactory.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import Listener from './Listener';

export default class GameListener extends Listener {
	/**
	 * @param gameId
	 * @param userId
	 * @returns {Listener}
	 */
	forGame(gameId, userId) {
		this.gameId = gameId;
		this.userId = userId;

		if (this.allowedForGame()) {
			this.addListeners();
		}

		return this;
	}

	allowedForGame() {
		if (this.isTournamentGame() && !this.allowedForTournamentGame()) {
			return false;
		}
		if (this.isPracticeGame() && !this.allowedForPracticeGame()) {
			return false;
		}

		return true;
	}

	allowedForTournamentGame() {
		return true;
	}

	allowedForPracticeGame() {
		return false;
	}

	userPlayer() {
		return Players.findOne({gameId: this.gameId, userId: this.userId});
	}

	/**
	 * @returns {boolean}
	 */
	userIsGamePlayer() {
		return !!this.userPlayer();
	}

	/**
	 * @returns {string|null}
	 */
	userPlayerKey() {
		const game = Games.findOne({_id: this.gameId});

		let userPlayerKey = null;
		if (game) {
			if (game.createdBy === this.userId) {
				userPlayerKey = 'player1';
			} else if (this.userIsGamePlayer()) {
				userPlayerKey = 'player2';
			}
		}

		return userPlayerKey;
	}

	isTournamentGame() {
		const game = Games.findOne({_id: this.gameId});

		return game && !!game.tournamentId;
	}

	/**
	 * @returns {Classic}
	 */
	tournamentMode() {
		if (!this.isTournamentGame()) {
			throw 'This is not a tournament game';
		}

		const game = Games.findOne({_id: this.gameId});
		const tournament = Tournaments.findOne({_id: game.tournamentId});
		return TournamentModeFactory.fromId(tournament.mode._id);
	}

	isPracticeGame() {
		const game = Games.findOne({_id: this.gameId});

		return game && !!game.isPracticeGame;
	}

	gameMaximumPoints() {
		const game = Games.findOne({_id: this.gameId});

		if (game) {
			return game.maximumPoints;
		}

		return GAME_MAXIMUM_POINTS;
	}

	currentPlayerShape() {
		const player = this.userPlayer();

		if (player) {
			return player.shape;
		}

		return null;
	}

	oppositePlayerShape() {
		const player = Players.findOne({gameId: this.gameId, userId: {$ne: this.userId}});

		if (player) {
			return player.shape;
		}

		return null;
	}

	/**
	 * @param {string} playerKey
	 * @returns {boolean}
	 */
	playerKeyIsUser(playerKey) {
		return playerKey === this.userPlayerKey();
	}

	/**
	 * @param {string} playerKey
	 * @returns {boolean}
	 */
	playerKeyIsOpponent(playerKey) {
		const userPlayerKey = this.userPlayerKey();

		return userPlayerKey !== null && playerKey !== userPlayerKey;
	}

	/**
	 * @returns {boolean}
	 */
	playerIsHost() {
		return 'player1' === this.userPlayerKey();
	}

	/**
	 * @returns {boolean}
	 */
	playerIsClient() {
		return 'player2' === this.userPlayerKey();
	}
}
