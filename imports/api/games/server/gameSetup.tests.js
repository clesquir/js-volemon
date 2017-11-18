import {Random} from 'meteor/random';
import {assert} from 'chai';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {joinGame} from '/imports/api/games/server/gameSetup.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {PLAYER_DEFAULT_SHAPE} from '/imports/api/games/shapeConstants.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';

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
			Games.insert({_id: gameId});
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
			Games.insert({_id: gameId});
			Players.insert({userId: Random.id(5), gameId: gameId});
			Players.insert({userId: Random.id(5), gameId: gameId});
			joinGame(userId, gameId);
		} catch(e) {
			exception = e;
		}

		assert.isObject(exception);
		assert.propertyVal(exception, 'error', 'not-allowed');
		assert.propertyVal(exception, 'reason', 'Maximum players reached');
	});
	it('updates game clientId and clientName', function() {
		Games.insert({_id: gameId});
		UserConfigurations.insert({userId: userId, name: username});
		joinGame(userId, gameId);

		const game = Games.findOne({_id: gameId});
		assert.equal(userId, game.clientId);
		assert.equal(username, game.clientName);
	});
	it('insert player', function() {
		Games.insert({_id: gameId});
		joinGame(userId, gameId);

		const player = Players.findOne({userId: userId});
		assert.isNotNull(player);
	});
	it('insert player with last used shape', function() {
		Games.insert({_id: gameId});
		const lastShapeUsed = Random.id(5);
		UserConfigurations.insert({userId: userId, name: username, lastShapeUsed: lastShapeUsed});
		joinGame(userId, gameId);

		const player = Players.findOne({userId: userId});
		assert.isNotNull(player);
		assert.equal(lastShapeUsed, player.selectedShape);
		assert.equal(lastShapeUsed, player.shape);
	});
	it('insert player with default shape if no profile', function() {
		Games.insert({_id: gameId});
		joinGame(userId, gameId);

		const player = Players.findOne({userId: userId});
		assert.isNotNull(player);
		assert.equal(PLAYER_DEFAULT_SHAPE, player.selectedShape);
		assert.equal(PLAYER_DEFAULT_SHAPE, player.shape);
	});
	it('insert player with default shape if last used is not defined', function() {
		Games.insert({_id: gameId});
		UserConfigurations.insert({userId: userId, name: username});
		joinGame(userId, gameId);

		const player = Players.findOne({userId: userId});
		assert.isNotNull(player);
		assert.equal(PLAYER_DEFAULT_SHAPE, player.selectedShape);
		assert.equal(PLAYER_DEFAULT_SHAPE, player.shape);
	});
});