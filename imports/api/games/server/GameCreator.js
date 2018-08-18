import GameInitiatorCollection from '/imports/api/games/server/GameInitiatorCollection.js';
import {createGame, joinGame} from '/imports/api/games/server/gameSetup.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {Meteor} from "meteor/meteor";

export default class GameCreator {
	static fromMatchMaker(users, modeSelection, isPracticeGame, tournamentId) {
		return GameCreator.createGame(users, modeSelection, isPracticeGame, tournamentId);
	}

	static fromTournamentPractice(tournamentId) {
		const tournament = Tournaments.findOne({_id: tournamentId});
		const userId = Meteor.userId();
		const userConfiguration = UserConfigurations.findOne({userId: userId});
		let userName = '';
		if (userConfiguration) {
			userName = userConfiguration.name;
		}
		const user = {id: userId, name: userName};

		return GameCreator.createGame([user], tournament.gameMode, true, tournamentId);
	}

	/**
	 * @private
	 * @param users
	 * @param modeSelection
	 * @param isPracticeGame
	 * @param tournamentId
	 * @returns {string}
	 */
	static createGame(users, modeSelection, isPracticeGame, tournamentId) {
		const gameUsers = users.concat([]);
		const creator = gameUsers.shift();

		const gameId = createGame(
			creator.id,
			GameInitiatorCollection.get(),
			modeSelection,
			isPracticeGame,
			tournamentId
		);

		joinGame(creator.id, gameId);
		while (gameUsers.length) {
			joinGame(gameUsers.shift().id, gameId);
		}

		return gameId;
	}
}
