import {TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import GameInitiatorCollection from '/imports/api/games/server/GameInitiatorCollection.js';
import {createGame, joinGame} from '/imports/api/games/server/gameSetup.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {Meteor} from "meteor/meteor";

export default class GameCreator {
	static fromMatchMaker(users, modeSelection, tournamentId) {
		return GameCreator.createGame(users, modeSelection, false, false, tournamentId);
	}

	static fromTournamentPractice(tournamentId) {
		const tournament = Tournaments.findOne({_id: tournamentId});
		const userId = Meteor.userId();
		const userConfiguration = UserConfigurations.findOne({userId: userId});
		let userName = '';
		if (userConfiguration) {
			userName = userConfiguration.name;
		}
		const users = [{id: userId, name: userName}, {id: 'CPU', name: 'CPU'}];

		if (tournament.gameMode === TWO_VS_TWO_GAME_MODE) {
			users.push({id: 'CPU', name: 'CPU'});
			users.push({id: 'CPU', name: 'CPU'});
		}

		return GameCreator.createGame(users, tournament.gameMode, true, true, tournamentId);
	}

	/**
	 * @private
	 * @param users
	 * @param modeSelection
	 * @param isPrivate
	 * @param isPractice
	 * @param tournamentId
	 * @returns {string}
	 */
	static createGame(users, modeSelection, isPrivate, isPractice, tournamentId) {
		let creator;

		if (users[0] && users[0].id !== 'CPU') {
			creator = users[0].id;
		} else if (users[2] && users[2].id !== 'CPU') {
			creator = users[2].id;
		} else if (users[1] && users[1].id !== 'CPU') {
			creator = users[1].id;
		} else if (users[3] && users[3].id !== 'CPU') {
			creator = users[3].id;
		}

		let hasComputer = false;
		for (let user of users) {
			if (user.id === 'CPU') {
				hasComputer = true;
				break;
			}
		}

		const gameId = createGame(
			creator,
			GameInitiatorCollection.get(),
			modeSelection,
			isPrivate,
			isPractice,
			hasComputer,
			tournamentId
		);

		const game = Games.findOne({_id: gameId});
		if (game.gameMode === TWO_VS_TWO_GAME_MODE) {
			joinGame(users[0], gameId);
			joinGame(users[1], gameId);
			joinGame(users[2], gameId);
			joinGame(users[3], gameId);
		} else {
			joinGame(users[0], gameId);
			joinGame(users[1], gameId);
		}

		return gameId;
	}
}
