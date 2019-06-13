import {ONE_VS_COMPUTER_GAME_MODE, ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE} from '../../../games/constants';
import {GAME_MAXIMUM_POINTS, isTwoVersusTwoGameMode} from '../../../games/constants';
import {Games} from '../../../games/games';
import {Profiles} from '../../../profiles/profiles';
import TournamentMode from '../../../tournaments/TournamentMode';
import {Tournaments} from '../../../tournaments/tournaments';
import Listener from './Listener';

export default class GameListener extends Listener {
	gameId: string;
	game: any;
	tournament: {mode: any};
	currentPlayerProfile: {eloRating: number};
	oppositePlayerProfile: {eloRating: number};

	forGame(gameId: string, userId: string): Listener {
		this.gameId = gameId;
		this.userId = userId;

		if (this.allowedForGame()) {
			this.addListeners();
		}

		return this;
	}

	allowedForGame(): boolean {
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

	allowedForTournamentGame(): boolean {
		return true;
	}

	allowedForPracticeGame(): boolean {
		return false;
	}

	allowedFor2Vs2(): boolean {
		return true;
	}

	getGame(): any {
		if (!this.game) {
			this.game = Games.findOne({_id: this.gameId});
		}

		return this.game;
	}

	getTournament(): {mode: any} {
		if (!this.tournament) {
			const game = this.getGame();
			this.tournament = Tournaments.findOne({_id: game.tournamentId});
		}

		return this.tournament;
	}

	getCurrentGamePlayer(): {selectedShape: string, shape: string} {
		for (let player of this.getGame().players) {
			if (player.id === this.userId) {
				return player;
			}
		}

		return null;
	}

	getCurrentPlayerProfile(): {eloRating: number} {
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

	getOppositePlayerProfile(): {eloRating: number} {
		if (!this.oppositePlayerProfile) {
			const opponentPlayer = this.getOppositeGamePlayer();
			this.oppositePlayerProfile = Profiles.findOne({userId: opponentPlayer.id});
		}

		return this.oppositePlayerProfile;
	}

	userIsGamePlayer(): boolean {
		return !!this.getCurrentGamePlayer();
	}

	userPlayerKey(): string | null {
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

	isTournamentGame(): boolean {
		const game = this.getGame();

		return game && !!game.tournamentId;
	}

	tournamentMode(): TournamentMode {
		if (!this.isTournamentGame()) {
			throw 'This is not a tournament game';
		}

		const tournament = this.getTournament();
		return TournamentMode.fromTournament(tournament);
	}

	isPracticeGame(): boolean {
		const game = this.getGame();

		return game && !!game.isPracticeGame;
	}

	is1VsCpuGame(): boolean {
		const game = this.getGame();

		return (game && game.gameMode === ONE_VS_COMPUTER_GAME_MODE);
	}

	is1VsMLCpuGame(): boolean {
		const game = this.getGame();

		return (game && game.gameMode === ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE);
	}

	is2Vs2Game(): boolean {
		const game = this.getGame();

		return (game && isTwoVersusTwoGameMode(game.gameMode));
	}

	gameMaximumPoints(): number {
		const game = this.getGame();

		if (game) {
			return game.maximumPoints;
		}

		return GAME_MAXIMUM_POINTS;
	}

	currentPlayerShape(): string | null {
		const player = this.getCurrentGamePlayer();

		if (player) {
			return player.shape;
		}

		return null;
	}

	oppositePlayerShape(): string | null {
		const player = this.getOppositeGamePlayer();

		if (player) {
			return player.shape;
		}

		return null;
	}

	playerKeyIsUser(playerKey: string): boolean {
		return playerKey === this.userPlayerKey();
	}

	playerKeyIsTeammate(playerKey): boolean {
		return (
			playerKey !== this.userPlayerKey() &&
			this.isPlayerHostSide() === this.isPlayerKeyHostSide(playerKey)
		);
	}

	playerKeyIsOpponent(playerKey: string): boolean {
		const userPlayerKey = this.userPlayerKey();

		return userPlayerKey !== null && playerKey !== userPlayerKey;
	}

	isPlayerHostSide(): boolean {
		return this.isPlayerKeyHostSide(this.userPlayerKey());
	}

	isPlayerKeyHostSide(playerKey: string): boolean {
		return ('player1' === playerKey || 'player3' === playerKey);
	}

	isPlayerClientSide(): boolean {
		return this.isPlayerKeyClientSide(this.userPlayerKey());
	}

	isPlayerKeyClientSide(playerKey: string): boolean {
		return ('player2' === playerKey || 'player4' === playerKey);
	}
}
