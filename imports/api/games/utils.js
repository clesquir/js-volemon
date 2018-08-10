import {Meteor} from 'meteor/meteor';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {
	GAME_STATUS_STARTED,
	GAME_STATUS_FORFEITED,
	GAME_STATUS_FINISHED,
	GAME_STATUS_TIMEOUT
} from '/imports/api/games/statusConstants.js';

export const isUserHost = function(gameId) {
	const game = Games.findOne(gameId);

	return (game.createdBy === Meteor.userId());
};

export const isGamePlayer = function(gameId) {
	return !!Players.findOne({gameId: gameId, userId: Meteor.userId()});
};

export const isGameStatusOnGoing = function(gameStatus) {
	const finishedStatuses = [
		GAME_STATUS_STARTED,
		GAME_STATUS_FORFEITED,
		GAME_STATUS_FINISHED,
		GAME_STATUS_TIMEOUT
	];
	return finishedStatuses.indexOf(gameStatus) !== -1;
};

export const isGameStatusStarted = function(gameStatus) {
	return (gameStatus === GAME_STATUS_STARTED);
};

export const isGameStatusTimeout = function(gameStatus) {
	return (gameStatus === GAME_STATUS_TIMEOUT);
};

export const isGameStatusForfeit = function(gameStatus) {
	return (gameStatus === GAME_STATUS_FORFEITED);
};

export const isGameStatusFinished = function(gameStatus) {
	return (gameStatus === GAME_STATUS_FINISHED);
};

export const hasGameStatusEndedWithAWinner = function(gameStatus) {
	return isGameStatusForfeit(gameStatus) || isGameStatusFinished(gameStatus);
};

export const hasGameAborted = function(gameStatus) {
	return isGameStatusForfeit(gameStatus) || isGameStatusTimeout(gameStatus);
};

export const isForfeiting = function(game) {
	return (
		game.status === GAME_STATUS_STARTED &&
		game.hostPoints + game.clientPoints >= game.forfeitMinimumPoints
	);
};

export const isMatchPoint = function(hostPoints, clientPoints, maximumPoints) {
	let matchPoint = maximumPoints - 1;

	return hostPoints === matchPoint || clientPoints === matchPoint;
};

export const isDeucePoint = function(hostPoints, clientPoints, maximumPoints) {
	let matchPoint = maximumPoints - 1;

	return hostPoints === matchPoint && clientPoints === matchPoint;
};

export const forfeitSide = function(game) {
	if (isGameStatusForfeit(game.status)) {
		const forfeitPlayer = Players.findOne({gameId: game._id, hasForfeited: true});

		if (forfeitPlayer) {
			if (
				game.players[0].id === forfeitPlayer.userId ||
				(game.players[2] && game.players[2].id === forfeitPlayer.userId)
			) {
				return 'Red';
			} else if (
				game.players[1].id === forfeitPlayer.userId ||
				(game.players[3] && game.players[3].id === forfeitPlayer.userId)
			) {
				return 'Blue';
			}
		}
	}

	return 'Nobody';
};

export const winnerSide = function(game) {
	if (isGameStatusFinished(game.status)) {
		if (game.hostPoints > game.clientPoints) {
			return 'Red';
		} else if (game.clientPoints > game.hostPoints) {
			return 'Blue';
		}
	}

	return 'Nobody';
};
