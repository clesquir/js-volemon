import {Meteor} from 'meteor/meteor';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Constants} from '/imports/lib/constants.js';

export const isUserHost = function(gameId) {
	const game = Games.findOne(gameId);

	return (game.createdBy === Meteor.userId());
};

export const isGamePlayer = function(gameId) {
	return !!Players.findOne({gameId: gameId, userId: Meteor.userId()});
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

export const isMatchPoint = function(hostPoints, clientPoints) {
	let matchPoint = Constants.MAXIMUM_POINTS - 1;

	return (hostPoints === matchPoint || clientPoints === matchPoint);
};

export const isDeucePoint = function(hostPoints, clientPoints) {
	let matchPoint = Constants.MAXIMUM_POINTS - 1;

	return (hostPoints === matchPoint && clientPoints === matchPoint);
};

export const getWinnerName = function(game) {
	let winnerName = 'Nobody';
	let winner;

	if (isGameStatusFinished(game.status)) {
		if (game.hostPoints >= Constants.MAXIMUM_POINTS) {
			winner = Players.findOne({gameId: game._id, userId: game.createdBy});

			if (winner) {
				winnerName = winner.name;
			} else {
				winnerName = 'Player 1';
			}
		} else if (game.clientPoints >= Constants.MAXIMUM_POINTS) {
			winner = Players.findOne({gameId: game._id, userId: {$ne: game.createdBy}});

			if (winner) {
				winnerName = winner.name;
			} else {
				winnerName = 'Player 2';
			}
		}
	}

	return winnerName;
};
