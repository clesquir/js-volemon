import {Games} from '/imports/api/games/games.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';
import GameListener from './GameListener.js';

describe('AchievementListener#GameListener', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);

	before(function() {
		StubCollections.add([Games]);
	});

	beforeEach(function() {
		StubCollections.stub();
	});

	afterEach(function() {
		StubCollections.restore();
	});

	it('Returns if user is game player', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.isTrue(listener.userIsGamePlayer());
	});

	it('Returns if user is not game player', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: Random.id(5)}, {id: opponentUserId}]});

		assert.isFalse(listener.userIsGamePlayer());
	});

	it('Returns null when player is not in game', function() {
		const listener = (new GameListener()).forGame(gameId, Random.id(5));
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});

		assert.isNull(listener.userPlayerKey());
	});

	it('Returns user player key when host', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.strictEqual('player1', listener.userPlayerKey());
	});

	it('Returns user player key when host', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});

		assert.strictEqual('player2', listener.userPlayerKey());
	});

	it('Returns if player key is user when not in game', function() {
		const listener = (new GameListener()).forGame(gameId, Random.id(5));
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});

		assert.isFalse(listener.playerKeyIsUser('player1'));
		assert.isFalse(listener.playerKeyIsUser('player2'));
	});

	it('Returns if player key is user when host', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.isTrue(listener.playerKeyIsUser('player1'));
		assert.isFalse(listener.playerKeyIsUser('player2'));
	});

	it('Returns if player key is user when client', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});

		assert.isTrue(listener.playerKeyIsUser('player2'));
		assert.isFalse(listener.playerKeyIsUser('player1'));
	});

	it('Returns if player key is opponent when not in game', function() {
		const listener = (new GameListener()).forGame(gameId, Random.id(5));
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});

		assert.isFalse(listener.playerKeyIsOpponent('player1'));
		assert.isFalse(listener.playerKeyIsOpponent('player2'));
	});

	it('Returns if player key is opponent when host', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});

		assert.isTrue(listener.playerKeyIsOpponent('player1'));
		assert.isFalse(listener.playerKeyIsOpponent('player2'));
	});

	it('Returns if player key is opponent when client', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.isTrue(listener.playerKeyIsOpponent('player2'));
		assert.isFalse(listener.playerKeyIsOpponent('player1'));
	});

	it('Returns if user player is host when not in game', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});

		assert.isFalse(listener.isPlayerHostSide());
	});

	it('Returns if user player is host when host', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.isTrue(listener.isPlayerHostSide());
	});

	it('Returns if user player is host when client', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});

		assert.isFalse(listener.isPlayerHostSide());
	});

	it('Returns if user player is client when not in game', function() {
		const listener = (new GameListener()).forGame(gameId, Random.id(5));
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});

		assert.isFalse(listener.isPlayerClientSide());
	});

	it('Returns if user player is client when host', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});

		assert.isTrue(listener.isPlayerClientSide());
	});

	it('Returns if user player is client when client', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.isFalse(listener.isPlayerClientSide());
	});
});
