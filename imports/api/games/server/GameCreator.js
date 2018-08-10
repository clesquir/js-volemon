import GameInitiatorCollection from '/imports/api/games/server/GameInitiatorCollection.js';
import {createGame, joinGame} from '/imports/api/games/server/gameSetup.js';
import {Meteor} from "meteor/meteor";

export default class GameCreator {
	static fromMatchMaker(users, modeSelection, tournamentId) {
		const gameUsers = users.concat([]);
		const creator = gameUsers.shift();

		const gameId = createGame(creator.id, GameInitiatorCollection.get(), modeSelection, tournamentId);

		joinGame(creator.id, gameId);
		while (gameUsers.length) {
			joinGame(gameUsers.shift().id, gameId);
		}

		return gameId;
	}
}
