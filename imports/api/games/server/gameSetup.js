import DefaultGameConfiguration from '/imports/api/games/configuration/DefaultGameConfiguration.js';
import {ONE_VS_ONE_GAME_MODE, TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import GameForfeited from '/imports/api/games/events/GameForfeited.js';
import GameTimedOut from '/imports/api/games/events/GameTimedOut.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import GameInitiator from '/imports/api/games/server/GameInitiator.js';
import {finishGame} from '/imports/api/games/server/onGameFinished.js';
import {PLAYER_DEFAULT_SHAPE, PLAYER_SHAPE_RANDOM} from '/imports/api/games/shapeConstants.js';
import {
	GAME_STATUS_FORFEITED,
	GAME_STATUS_REGISTRATION,
	GAME_STATUS_STARTED,
	GAME_STATUS_TIMEOUT
} from '/imports/api/games/statusConstants.js';
import {isForfeiting, isGameStatusFinished} from '/imports/api/games/utils.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {playersCanPlayTournament} from '/imports/api/tournaments/utils.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {EventPublisher} from '/imports/lib/EventPublisher.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';
import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';

/**
 * @param {string} userId
 * @param {GameInitiator[]} gameInitiators
 * @param modeSelection
 * @param {boolean} isPrivate
 * @param {boolean} isPractice
 * @param {boolean} hasComputer
 * @param tournamentId
 * @returns {string}
 */
export const createGame = function(
	userId,
	gameInitiators,
	modeSelection,
	isPrivate,
	isPractice,
	hasComputer,
	tournamentId = null
) {
	let id = null;

	if (!playersCanPlayTournament(tournamentId, [{userId: userId}])) {
		throw new Meteor.Error('not-allowed', 'Cannot join this tournament');
	}

	let gameMode = ONE_VS_ONE_GAME_MODE;
	if (tournamentId) {
		const tournament = Tournaments.findOne(tournamentId);

		if (tournament && tournament.gameMode) {
			gameMode = tournament.gameMode;
		}
	} else {
		gameMode = modeSelection;
	}

	do {
		try {
			id = Games.insert({
				_id: Random.id(10),
				gameMode: gameMode,
				modeSelection: modeSelection,
				tournamentId: tournamentId,
				status: GAME_STATUS_REGISTRATION,
				createdAt: getUTCTimeStamp(),
				createdBy: userId,
				players: [],
				isPrivate: isPrivate,
				isPracticeGame: isPractice,
				hostPoints: 0,
				clientPoints: 0,
				lastPointTaken: null,
				activeBonuses: [],
				viewers: []
			});
		} catch (e) {
			//If the id is already taken loop until it finds a unique id
			if (e.code !== 11000) {
				throw e;
			}
		}
	} while (id === null);

	const configuration = new DefaultGameConfiguration(id);
	Games.update({_id: id}, {$set: {forfeitMinimumPoints: configuration.forfeitMinimumPoints()}});
	Games.update({_id: id}, {$set: {maximumPoints: configuration.maximumPoints()}});
	Games.update({_id: id}, {$set: {hasBonuses: configuration.hasBonuses()}});
	Games.update({_id: id}, {$set: {listOfShapes: configuration.listOfShapes()}});
	Games.update({_id: id}, {$set: {allowedListOfShapes: configuration.allowedListOfShapes()}});

	if (hasComputer && configuration.forcePracticeWithComputer()) {
		Games.update({_id: id}, {$set: {isPracticeGame: true}});
	}

	gameInitiators[id] = new GameInitiator(id);
	gameInitiators[id].init();

	return id;
};

/**
 * @param {{id: {string}, isMachineLearning: {boolean}, name: {string}}} user
 * @param {string} gameId
 * @param {boolean} isReady
 * @returns {*}
 */
export const joinGame = function(user, gameId, isReady = false) {
	const game = Games.findOne(gameId);

	if (!game) {
		throw new Meteor.Error(404, 'Game not found');
	}

	if (user.id !== 'CPU') {
		const player = Players.findOne({gameId: gameId, userId: user.id});
		if (player) {
			throw new Meteor.Error('not-allowed', 'Already joined');
		}
	}

	if (game.gameMode === ONE_VS_ONE_GAME_MODE && game.players.length >= 2) {
		throw new Meteor.Error('not-allowed', 'Maximum players reached');
	} else if (game.gameMode === TWO_VS_TWO_GAME_MODE && game.players.length >= 4) {
		throw new Meteor.Error('not-allowed', 'Maximum players reached');
	}

	if (!playersCanPlayTournament(game.tournamentId, [{userId: user.id}])) {
		throw new Meteor.Error('not-allowed', 'Cannot join this tournament');
	}

	let selectedShape = PLAYER_DEFAULT_SHAPE;

	if (user.id === 'CPU') {
		isReady = true;
	} else {
		const userConfiguration = UserConfigurations.findOne({userId: user.id});
		if (userConfiguration && userConfiguration.lastShapeUsed) {
			selectedShape = userConfiguration.lastShapeUsed;
		}
	}

	const allowedListOfShapes = game.allowedListOfShapes || [];
	const listOfShapes = game.listOfShapes || [];

	if (allowedListOfShapes.indexOf(selectedShape) === -1) {
		selectedShape = allowedListOfShapes[0];
	}

	let shape = selectedShape;
	if (selectedShape === PLAYER_SHAPE_RANDOM) {
		shape = Random.choice(listOfShapes);
	}

	Games.update(
		{_id: gameId},
		{
			$push: {
				players: {
					id: user.id,
					isMachineLearning: user.isMachineLearning,
					name: user.name,
					selectedShape: selectedShape,
					shape: shape
				}
			}
		}
	);

	return Players.insert({
		userId: user.id,
		name: user.name,
		gameId: gameId,
		joinedAt: getUTCTimeStamp(),
		isReady: isReady,
		askedForRematch: undefined,
		hasQuit: false
	});
};

/**
 * @param {string} gameId
 * @param {GameInitiator[]} gameInitiators
 */
export const startGame = function(gameId, gameInitiators) {
	let game = Games.findOne(gameId);

	if (!game) {
		throw new Meteor.Error(404, 'Game not found');
	}

	const players = Players.find({gameId: gameId});
	if (!playersCanPlayTournament(game.tournamentId, players)) {
		throw new Meteor.Error('not-allowed', 'One of the players cannot join this tournament');
	}

	let data = {
		status: GAME_STATUS_STARTED,
		startedAt: getUTCTimeStamp(),
		lastPointAt: getUTCTimeStamp(),
		pointsDuration: [],
		pointsSide: []
	};

	Games.update({_id: gameId}, {$set: data});

	if (gameInitiators[gameId]) {
		gameInitiators[gameId].start();
	}
};

const gameRematchInCreation = {};

/**
 * @param {string} userId
 * @param {string} gameId
 * @param {boolean} accepted
 * @param {GameInitiator[]} gameInitiators
 */
export const replyRematch = function(userId, gameId, accepted, gameInitiators) {
	const game = Games.findOne(gameId);

	if (!game) {
		throw new Meteor.Error(404, 'Game not found');
	}

	if (!isGameStatusFinished(game.status)) {
		throw new Meteor.Error('not-allowed', 'Only finished games can be rematched');
	}

	const player = Players.findOne({gameId: gameId, userId: userId});
	if (!player) {
		throw new Meteor.Error(404, 'Player not found');
	}

	Players.update({_id: player._id}, {$set: {askedForRematch: accepted}});
	Players.update(
		{gameId: gameId, userId: 'CPU'},
		{$set: {askedForRematch: accepted}},
		{multi: true}
	);

	const notAskingForRematch = Players.find({gameId: gameId, askedForRematch: {$ne: true}});
	if (notAskingForRematch.count() === 0 && gameRematchInCreation[gameId] === undefined) {
		gameRematchInCreation[gameId] = true;

		let rematchGameCreator = game.players[0].id;

		//Creator should switch to opponent if not CPU
		if (game.players[3] && game.players[3].id !== 'CPU') {
			rematchGameCreator = game.players[3].id;
		} else if (game.players[1] && game.players[1].id !== 'CPU') {
			rematchGameCreator = game.players[1].id;
		} else if (game.players[2] && game.players[2].id !== 'CPU') {
			rematchGameCreator = game.players[2].id;
		}

		let hasComputer = false;
		for (let user of game.players) {
			if (user.id === 'CPU') {
				hasComputer = true;
				break;
			}
		}

		const gameRematchId = createGame(
			rematchGameCreator,
			gameInitiators,
			game.modeSelection,
			game.isPrivate,
			game.isPracticeGame,
			hasComputer,
			game.tournamentId
		);

		if (game.gameMode === TWO_VS_TWO_GAME_MODE) {
			joinGame(game.players[3], gameRematchId, true);
			joinGame(game.players[2], gameRematchId, true);
			joinGame(game.players[1], gameRematchId, true);
			joinGame(game.players[0], gameRematchId, true);
		} else {
			joinGame(game.players[1], gameRematchId, true);
			joinGame(game.players[0], gameRematchId, true);
		}

		Games.update({_id: game._id}, {$set: {rematchGameId: gameRematchId}});

		Meteor.setTimeout(() => {
			startGame(gameRematchId, gameInitiators);
			delete gameRematchInCreation[gameId];
		}, 5000);
	}
};

export const onPlayerQuit = function(player) {
	const game = Games.findOne(player.gameId);

	if (game.status !== GAME_STATUS_REGISTRATION) {
		if (isForfeiting(game)) {
			Players.update({_id: player._id}, {$set: {hasForfeited: true}});
			Games.update({_id: game._id}, {$set: {status: GAME_STATUS_FORFEITED}});

			const winnerUserIds = [];
			const loserUserIds = [];
			if (game.gameMode === TWO_VS_TWO_GAME_MODE) {
				if (player.userId === game.players[0].id || player.userId === game.players[2].id) {
					winnerUserIds.push(game.players[1].id);
					winnerUserIds.push(game.players[3].id);
					loserUserIds.push(game.players[0].id);
					loserUserIds.push(game.players[2].id);
				} else if (player.userId === game.players[1].id || player.userId === game.players[3].id) {
					winnerUserIds.push(game.players[0].id);
					winnerUserIds.push(game.players[2].id);
					loserUserIds.push(game.players[1].id);
					loserUserIds.push(game.players[3].id);
				}
			} else {
				if (player.userId === game.players[0].id) {
					if (game.gameMode === ONE_VS_ONE_GAME_MODE) {
						winnerUserIds.push(game.players[1].id);
					}
					loserUserIds.push(game.players[0].id);
				} else {
					winnerUserIds.push(game.players[0].id);
					if (game.gameMode === ONE_VS_ONE_GAME_MODE) {
						loserUserIds.push(game.players[1].id);
					}
				}
			}

			finishGame(game._id, winnerUserIds, loserUserIds);
			EventPublisher.publish(new GameForfeited(game._id));
		} else if (game.status === GAME_STATUS_STARTED) {
			Games.update({_id: game._id}, {$set: {status: GAME_STATUS_TIMEOUT}});
			EventPublisher.publish(new GameTimedOut(game._id));
		}
	}
};
