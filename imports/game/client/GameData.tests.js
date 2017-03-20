import StubCollections from 'meteor/hwillson:stub-collections';
import {chai} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Random} from 'meteor/random';
import {Games} from '/collections/games.js';
import {Players} from '/collections/players.js';
import GameData from '/imports/game/client/GameData.js';
import {Constants} from '/imports/lib/constants.js';

describe('GameData#getPlayerShapeFromKey', function() {
	it('returns default shape when player 1 does not exist', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		const gameId = Random.id(5);
		Games.insert({_id: gameId});

		const gameData = new GameData(gameId);
		chai.assert.strictEqual(Constants.PLAYER_DEFAULT_SHAPE, gameData.getPlayerShapeFromKey('player1'));

		StubCollections.restore();
	});

	it('returns default shape when player 2 does not exist', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		const gameId = Random.id(5);
		Games.insert({_id: gameId});

		const gameData = new GameData(gameId);
		chai.assert.strictEqual(Constants.PLAYER_DEFAULT_SHAPE, gameData.getPlayerShapeFromKey('player2'));

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
			shape: Constants.PLAYER_SHAPE_RECTANGLE
		});

		const gameData = new GameData(gameId);
		gameData.init();
		chai.assert.strictEqual(Constants.PLAYER_SHAPE_RECTANGLE, gameData.getPlayerShapeFromKey('player1'));

		StubCollections.restore();
	});

	it('returns player2 shape', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		const gameId = Random.id(5);
		Games.insert({_id: gameId, createdBy: 1});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: 2, shape: Constants.PLAYER_SHAPE_RECTANGLE});

		const gameData = new GameData(gameId);
		gameData.init();
		chai.assert.strictEqual(Constants.PLAYER_SHAPE_RECTANGLE, gameData.getPlayerShapeFromKey('player2'));

		StubCollections.restore();
	});
});
