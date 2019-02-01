import {ONE_VS_COMPUTER_GAME_MODE, ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE} from '/imports/api/games/constants';
import {GAME_MAXIMUM_POINTS, isTwoVersusTwoGameMode} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import TournamentMode from '/imports/api/tournaments/TournamentMode';
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

	getCurrentGamePlayer() {
		for (let player of this.getGame().players) {
			if (player.id === this.userId) {
				return player;
			}
		}

		return null;
	}

	getCurrentPlayerProfile() {
		if (!this.currentPlayerProfile) {
			this.currentPlayerProfile = Profiles.findOne({userId: this.userId});
		}

		return this.currentPlayerProfile;
	}

	getOppositeGamePlayer() {
		for (let player of this.getGame().players) {
			if (player.id !== this.userId) {
				return player;
			}
		}

		return null;
	}

	getOppositePlayerProfile() {
		if (!this.oppositePlayerProfile) {
			const opponentPlayer = this.getOppositeGamePlayer();
			this.oppositePlayerProfile = Profiles.findOne({userId: opponentPlayer.id});
		}

		return this.oppositePlayerProfile;
	}

	/**
	 * @returns {boolean}
	 */
	userIsGamePlayer() {
		return !!this.getCurrentGamePlayer();
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
	 * @returns {TournamentMode}
	 */
	tournamentMode() {
		if (!this.isTournamentGame()) {
			throw 'This is not a tournament game';
		}

		const tournament = this.getTournament();
		return TournamentMode.fromTournament(tournament);
	}

	isPracticeGame() {
		const game = this.getGame();

		return game && !!game.isPracticeGame;
	}

	is1VsCpuGame() {
		const game = this.getGame();

		return (game && game.gameMode === ONE_VS_COMPUTER_GAME_MODE);
	}

	is1VsMLCpuGame() {
		const game = this.getGame();

		return (game && game.gameMode === ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE);
	}

	is2Vs2Game() {
		const game = this.getGame();

		return (game && isTwoVersusTwoGameMode(game.gameMode));
	}

	gameMaximumPoints() {
		const game = this.getGame();

		if (game) {
			return game.maximumPoints;
		}

		return GAME_MAXIMUM_POINTS;
	}

	currentPlayerShape() {
		const player = this.getCurrentGamePlayer();

		if (player) {
			return player.shape;
		}

		return null;
	}

	oppositePlayerShape() {
		const player = this.getOppositeGamePlayer();

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
