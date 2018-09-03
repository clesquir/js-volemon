import {ONE_VS_ONE_GAME_MODE} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {joinGame} from '/imports/api/games/server/gameSetup.js';
import {PLAYER_DEFAULT_SHAPE, PLAYER_SHAPE_CROWN, PLAYER_SHAPE_OBELISK} from '/imports/api/games/shapeConstants.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {assert} from 'chai';
import {Random} from 'meteor/random';
import {resetDatabase} from 'meteor/xolvio:cleaner';

describe('lib/client/gameSetup#joinGame', function() {
	beforeEach(function() {
		resetDatabase();
	});

	const userId = Random.id(5);
	const username = Random.id(5);
	const gameId = Random.id(5);

	it('does not allow to join if game does not exist', function() {
		let exception;

		try {
			joinGame(userId, Random.id(5));
		} catch(e) {
			exception = e;
		}

		assert.isObject(exception);
		assert.propertyVal(exception, 'error', 404);
		assert.propertyVal(exception, 'reason', 'Game not found');
	});
	it('does not allow to join if already joined', function() {
		let exception;

		try {
			Games.insert({_id: gameId, players: [{id: userId}]});
			Players.insert({userId: userId, gameId: gameId});
			joinGame(userId, gameId);
		} catch(e) {
			exception = e;
		}

		assert.isObject(exception);
		assert.propertyVal(exception, 'error', 'not-allowed');
		assert.propertyVal(exception, 'reason', 'Already joined');
	});
	it('does not allow to join if maximum number reached', function() {
		let exception;

		try {
			const user1 = Random.id(5);
			const user2 = Random.id(5);
			Games.insert({_id: gameId, gameMode: ONE_VS_ONE_GAME_MODE, players: [{id: user1}, {id: user2}]});
			Players.insert({userId: user1, gameId: gameId});
			Players.insert({userId: user2, gameId: gameId});
			joinGame(userId, gameId);
		} catch(e) {
			exception = e;
		}

		assert.isObject(exception);
		assert.propertyVal(exception, 'error', 'not-allowed');
		assert.propertyVal(exception, 'reason', 'Maximum players reached');
	});
	it('updates game player names', function() {
		Games.insert({_id: gameId});
		UserConfigurations.insert({userId: userId, name: username});
		joinGame(userId, gameId);

		const game = Games.findOne({_id: gameId});

		assert.deepEqual([{id: userId, name: username}], game.players);
	});
	it('join player', function() {
		Games.insert({_id: gameId});
		joinGame(userId, gameId);

		const player = Players.findOne({userId: userId});
		assert.isNotNull(player);

		const game = Games.findOne({_id: gameId});
		assert.equal(1, game.players.length);
		assert.equal(userId, game.players[0].id);
	});
	it('join player with last used shape', function() {
		Games.insert({_id: gameId, allowedListOfShapes: [PLAYER_DEFAULT_SHAPE, PLAYER_SHAPE_CROWN]});
		const lastShapeUsed = PLAYER_SHAPE_CROWN;
		UserConfigurations.insert({userId: userId, name: username, lastShapeUsed: lastShapeUsed});
		joinGame(userId, gameId);

		const game = Games.findOne({_id: gameId});
		assert.equal(lastShapeUsed, game.players[0].selectedShape);
		assert.equal(lastShapeUsed, game.players[0].shape);
	});
	it('join player with first allowed shape if last used shape is not allowed', function() {
		Games.insert({_id: gameId, allowedListOfShapes: [PLAYER_SHAPE_OBELISK, PLAYER_DEFAULT_SHAPE]});
		UserConfigurations.insert({userId: userId, name: username, lastShapeUsed: PLAYER_SHAPE_CROWN});
		joinGame(userId, gameId);

		const game = Games.findOne({_id: gameId});
		assert.equal(PLAYER_SHAPE_OBELISK, game.players[0].selectedShape);
		assert.equal(PLAYER_SHAPE_OBELISK, game.players[0].shape);
	});
	it('join player with default shape if no profile', function() {
		Games.insert({_id: gameId, allowedListOfShapes: [PLAYER_DEFAULT_SHAPE, PLAYER_SHAPE_CROWN]});
		joinGame(userId, gameId);

		const game = Games.findOne({_id: gameId});
		assert.equal(PLAYER_DEFAULT_SHAPE, game.players[0].selectedShape);
		assert.equal(PLAYER_DEFAULT_SHAPE, game.players[0].shape);
	});
	it('join player with default shape if last used is not defined', function() {
		Games.insert({_id: gameId, allowedListOfShapes: [PLAYER_DEFAULT_SHAPE, PLAYER_SHAPE_CROWN]});
		UserConfigurations.insert({userId: userId, name: username});
		joinGame(userId, gameId);

		const game = Games.findOne({_id: gameId});
		assert.equal(PLAYER_DEFAULT_SHAPE, game.players[0].selectedShape);
		assert.equal(PLAYER_DEFAULT_SHAPE, game.players[0].shape);
	});
});
