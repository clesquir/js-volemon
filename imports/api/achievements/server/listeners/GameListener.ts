import {GAME_MAXIMUM_POINTS, isTwoVersusTwoGameMode} from '../../../games/constants';
import GameOverride from '../../../games/GameOverride';
import {Games} from '../../../games/games';
import {Profiles} from '../../../profiles/profiles';
import {Tournaments} from '../../../tournaments/tournaments';
import Listener from './Listener';
import GameOverrideFactory from "../../../games/GameOverrideFactory";

export default class GameListener extends Listener {
	gameId: string;
	game: any;
	tournament: {gameOverride: any};
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
		if (!this.allowedForGameMode(this.gameMode())) {
			return false;
		}
		if (this.hasGameOverride() && !this.allowedForGameOverride()) {
			return false;
		}
		if (this.isPracticeGame() && !this.allowedForPracticeGame()) {
			return false;
		}

		return true;
	}

	allowedForGameMode(gameMode: string): boolean {
		return true;
	}

	allowedForGameOverride(): boolean {
		return true;
	}

	allowedForPracticeGame(): boolean {
		return false;
	}

	getGame(): any {
		if (!this.game) {
			this.game = Games.findOne({_id: this.gameId});
		}

		return this.game;
	}

	gameMode(): string {
		const game = this.getGame();

		if (game) {
			return game.gameMode;
		}

		return null;
	}

	getTournament(): {gameOverride: any} {
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

	hasGameOverride(): boolean {
		return (
			GameOverrideFactory.gameModeHasGameOverride(this.gameMode()) ||
			this.isTournamentGame()
		);
	}

	gameOverride(): GameOverride {
		if (GameOverrideFactory.gameModeHasGameOverride(this.gameMode())) {
			return GameOverrideFactory.fromGameMode(this.gameMode());
		}

		const tournament = this.getTournament();
		return GameOverrideFactory.fromTournament(tournament);
	}

	isPracticeGame(): boolean {
		const game = this.getGame();

		return game && !!game.isPracticeGame;
	}

	is2Vs2Game(): boolean {
		return isTwoVersusTwoGameMode(this.gameMode());
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
