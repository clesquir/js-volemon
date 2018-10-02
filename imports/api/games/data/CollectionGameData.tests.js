import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {PLAYER_DEFAULT_SHAPE, PLAYER_SHAPE_CROWN, PLAYER_SHAPE_RECTANGLE} from '/imports/api/games/shapeConstants.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';
import CollectionGameData from './CollectionGameData.js';

describe('CollectionGameData#getPlayerShapeFromKey', function() {
	before(function() {
		StubCollections.add([Games, Players]);
	});

	beforeEach(function() {
		StubCollections.stub();
	});

	afterEach(function() {
		StubCollections.restore();
	});

	it('returns default shape when player 1 does not exist', function() {
		const gameId = Random.id(5);
		Games.insert({_id: gameId, players: []});

		const gameData = new CollectionGameData(gameId, Random.id(5));
		gameData.init();
		assert.strictEqual(PLAYER_DEFAULT_SHAPE, gameData.getPlayerShapeFromKey('player1'));
	});

	it('returns default shape when player 2 does not exist', function() {
		const gameId = Random.id(5);
		Games.insert({_id: gameId, players: []});

		const gameData = new CollectionGameData(gameId, Random.id(5));
		gameData.init();
		assert.strictEqual(PLAYER_DEFAULT_SHAPE, gameData.getPlayerShapeFromKey('player2'));
	});

	it('returns player1 shape', function() {
		const gameId = Random.id(5);
		const createdByUserId = 1;
		Games.insert({_id: gameId, createdBy: createdByUserId, players: [{id: createdByUserId, shape: PLAYER_SHAPE_RECTANGLE}]});
		Players.insert({
			_id: Random.id(5),
			gameId: gameId,
			userId: createdByUserId
		});

		const gameData = new CollectionGameData(gameId, Random.id(5));
		gameData.init();
		assert.strictEqual(PLAYER_SHAPE_RECTANGLE, gameData.getPlayerShapeFromKey('player1'));
	});

	it('returns player2 shape', function() {
		const gameId = Random.id(5);
		Games.insert({_id: gameId, createdBy: 1, players: [{id: 1, shape: PLAYER_SHAPE_CROWN}, {id: 2, shape: PLAYER_SHAPE_RECTANGLE}]});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: 2});

		const gameData = new CollectionGameData(gameId, Random.id(5));
		gameData.init();
		assert.strictEqual(PLAYER_SHAPE_RECTANGLE, gameData.getPlayerShapeFromKey('player2'));
	});
});
