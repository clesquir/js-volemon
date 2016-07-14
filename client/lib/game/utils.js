import { Players } from '/collections/players.js';
import { Constants } from '/lib/constants.js';

export const getGameHostPlayer = function(game) {
	return Players.findOne({gameId: game._id, userId: game.createdBy});
};

export const getGameClientPlayer = function(game) {
	return Players.findOne({gameId: game._id, userId: {$ne: game.createdBy}});
};

export const isGameStatusOnGoing = function(gameStatus) {
	return [Constants.GAME_STATUS_STARTED, Constants.GAME_STATUS_FINISHED, Constants.GAME_STATUS_TIMEOUT].indexOf(gameStatus) !== -1;
};

export const isGameStatusStarted = function(gameStatus) {
	return (gameStatus === Constants.GAME_STATUS_STARTED);
};

export const isGameStatusTimeout = function(gameStatus) {
	return (gameStatus === Constants.GAME_STATUS_TIMEOUT);
};

export const isGameStatusFinished = function(gameStatus) {
	return (gameStatus === Constants.GAME_STATUS_FINISHED);
};

export const getWinnerName = function(game) {
	var winnerName = 'Nobody',
		winner;

	if (isGameStatusFinished(game.status)) {
		if (game.hostPoints >= Constants.MAXIMUM_POINTS) {
			winner = getGameHostPlayer(game);

			if (winner) {
				winnerName = winner.name;
			} else {
				winnerName = 'Player 1';
			}
		} else if (game.clientPoints >= Constants.MAXIMUM_POINTS) {
			winner = getGameClientPlayer(game);

			if (winner) {
				winnerName = winner.name;
			} else {
				winnerName = 'Player 2';
			}
		}
	}

	return winnerName;
};