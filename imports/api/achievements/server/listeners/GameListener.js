import {GAME_MAXIMUM_POINTS} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import TournamentModeFactory from '/imports/api/tournaments/modes/TournamentModeFactory.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
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
		if (this.is2Vs2Game() && !this.allowedFor2Vs2()) {
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

	allowedFor2Vs2() {
		return true;
	}

	getGame() {
		if (!this.game) {
			this.game = Games.findOne({_id: this.gameId});
		}

		return this.game;
	}

	getTournament() {
		if (!this.tournament) {
			const game = this.getGame();
			this.tournament = Tournaments.findOne({_id: game.tournamentId});
		}

		return this.tournament;
	}

	getCurrentPlayer() {
		if (!this.currentPlayer) {
			this.currentPlayer = Players.findOne({gameId: this.gameId, userId: this.userId});
		}

		return this.currentPlayer;
	}

	getCurrentPlayerProfile() {
		if (!this.currentPlayerProfile) {
			this.currentPlayerProfile = Profiles.findOne({userId: this.userId});
		}

		return this.currentPlayerProfile;
	}

	getOppositePlayer() {
		if (!this.oppositePlayer) {
			this.oppositePlayer = Players.findOne({gameId: this.gameId, userId: {$ne: this.userId}});
		}

		return this.oppositePlayer;
	}

	getOppositePlayerProfile() {
		if (!this.oppositePlayerProfile) {
			const opponentPlayer = this.getOppositePlayer();
			this.oppositePlayerProfile = Profiles.findOne({userId: opponentPlayer.userId});
		}

		return this.oppositePlayerProfile;
	}

	/**
	 * @returns {boolean}
	 */
	userIsGamePlayer() {
		return !!this.getCurrentPlayer();
	}

	/**
	 * @returns {string|null}
	 */
	userPlayerKey() {
		const game = this.getGame();

		let userPlayerKey = null;
		if (game) {
			if (game.players[0].id === this.userId) {
				userPlayerKey = 'player1';
			} else if (game.players[1].id === this.userId) {
				userPlayerKey = 'player2';
			} else if (this.is2Vs2Game() && game.players[2].id === this.userId) {
				userPlayerKey = 'player3';
			} else if (this.is2Vs2Game() && game.players[3].id === this.userId) {
				userPlayerKey = 'player4';
			}
		}

		return userPlayerKey;
	}

	isTournamentGame() {
		const game = this.getGame();

		return game && !!game.tournamentId;
	}

	/**
	 * @returns {Classic}
	 */
	tournamentMode() {
		if (!this.isTournamentGame()) {
			throw 'This is not a tournament game';
		}

		const tournament = this.getTournament();
		return TournamentModeFactory.fromId(tournament.mode._id);
	}

	isPracticeGame() {
		const game = this.getGame();

		return game && !!game.isPracticeGame;
	}

	is2Vs2Game() {
		const game = this.getGame();

		return game && game.gameMode === TWO_VS_TWO_GAME_MODE;
	}

	gameMaximumPoints() {
		const game = this.getGame();

		if (game) {
			return game.maximumPoints;
		}

		return GAME_MAXIMUM_POINTS;
	}

	currentPlayerShape() {
		const player = this.getCurrentPlayer();

		if (player) {
			return player.shape;
		}

		return null;
	}

	oppositePlayerShape() {
		const player = this.getOppositePlayer();

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

	playerKeyIsTeammate(playerKey) {
		return (
			playerKey !== this.userPlayerKey() &&
			this.isPlayerHostSide() === this.isPlayerKeyHostSide(playerKey)
		);
	}

	/**
	 * @param {string} playerKey
	 * @returns {boolean}
	 */
	playerKeyIsOpponent(playerKey) {
		const userPlayerKey = this.userPlayerKey();

		return userPlayerKey !== null && playerKey !== userPlayerKey;
	}

	isPlayerHostSide() {
		return this.isPlayerKeyHostSide(this.userPlayerKey());
	}

	isPlayerKeyHostSide(playerKey) {
		return ('player1' === playerKey || 'player3' === playerKey);
	}

	isPlayerClientSide() {
		return this.isPlayerKeyClientSide(this.userPlayerKey());
	}

	isPlayerKeyClientSide(playerKey) {
		return ('player2' === playerKey || 'player4' === playerKey);
	}
}
