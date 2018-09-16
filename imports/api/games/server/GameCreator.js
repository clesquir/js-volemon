import GameInitiatorCollection from '/imports/api/games/server/GameInitiatorCollection.js';
import {createGame, joinGame} from '/imports/api/games/server/gameSetup.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {Meteor} from "meteor/meteor";

export default class GameCreator {
	static fromMatchMaker(users, modeSelection, tournamentId) {
		return GameCreator.createGame(users, modeSelection, false, tournamentId);
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

		return GameCreator.createGame([user, {id: 'CPU', name: 'CPU'}], tournament.gameMode, true, tournamentId);
	}

	/**
	 * @private
	 * @param users
	 * @param modeSelection
	 * @param isPrivate
	 * @param tournamentId
	 * @returns {string}
	 */
	static createGame(users, modeSelection, isPrivate, tournamentId) {
		const gameUsers = users.concat([]);
		const creator = gameUsers.shift();

		//The game is a practice if there is a CPU in players
		let isPracticeGame = false;
		for (let user of gameUsers) {
			if (user.id === 'CPU') {
				isPracticeGame = true;
				break;
			}
		}

		const gameId = createGame(
			creator.id,
			GameInitiatorCollection.get(),
			modeSelection,
			isPracticeGame,
			isPrivate,
			tournamentId
		);

		joinGame(creator, gameId);
		while (gameUsers.length) {
			let user = gameUsers.shift();
			joinGame(user, gameId);
		}

		return gameId;
	}
}
