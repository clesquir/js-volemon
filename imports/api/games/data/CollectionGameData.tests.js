import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {PLAYER_DEFAULT_SHAPE, PLAYER_SHAPE_RECTANGLE} from '/imports/api/games/shapeConstants.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';
import CollectionGameData from './CollectionGameData.js';

describe('CollectionGameData#getPlayerShapeFromKey', function() {
	it('returns default shape when player 1 does not exist', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		const gameId = Random.id(5);
		Games.insert({_id: gameId});

		const gameData = new CollectionGameData(gameId, Random.id(5));
		assert.strictEqual(PLAYER_DEFAULT_SHAPE, gameData.getPlayerShapeFromKey('player1'));

		StubCollections.restore();
	});

	it('returns default shape when player 2 does not exist', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		const gameId = Random.id(5);
		Games.insert({_id: gameId});

		const gameData = new CollectionGameData(gameId, Random.id(5));
		assert.strictEqual(PLAYER_DEFAULT_SHAPE, gameData.getPlayerShapeFromKey('player2'));

		StubCollections.restore();
	});

	it('returns player1 shape', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		const gameId = Random.id(5);
		const createdByUserId = 1;
		Games.insert({_id: gameId, createdBy: createdByUserId});
		Players.insert({
			_id: Random.id(5),
			gameId: gameId,
			userId: createdByUserId,
			shape: PLAYER_SHAPE_RECTANGLE
		});

		const gameData = new CollectionGameData(gameId, Random.id(5));
		gameData.init();
		assert.strictEqual(PLAYER_SHAPE_RECTANGLE, gameData.getPlayerShapeFromKey('player1'));

		StubCollections.restore();
	});

	it('returns player2 shape', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		const gameId = Random.id(5);
		Games.insert({_id: gameId, createdBy: 1});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: 2, shape: PLAYER_SHAPE_RECTANGLE});

		const gameData = new CollectionGameData(gameId, Random.id(5));
		gameData.init();
		assert.strictEqual(PLAYER_SHAPE_RECTANGLE, gameData.getPlayerShapeFromKey('player2'));

		StubCollections.restore();
	});
});
