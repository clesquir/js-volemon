import {assert} from 'chai';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Random} from 'meteor/random';
import GameListener from './GameListener.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';

describe('AchievementListener#GameListener', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);

	beforeEach(function() {
		resetDatabase();
	});

	afterEach(function() {
		resetDatabase();
	});

	it('Returns if user is game player', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});

		assert.isFalse(listener.userIsGamePlayer());

		Players.insert({gameId: gameId, userId: userId});

		assert.isTrue(listener.userIsGamePlayer());
	});

	it('Returns null when player is not in game', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});

		assert.isNull(listener.userPlayerKey());
	});

	it('Returns user player key when host', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		assert.strictEqual('player1', listener.userPlayerKey());
	});

	it('Returns user player key when host', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});
		Players.insert({gameId: gameId, userId: userId});

		assert.strictEqual('player2', listener.userPlayerKey());
	});

	it('Returns if player key is user when not in game', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});

		assert.isFalse(listener.playerKeyIsUser('player1'));
		assert.isFalse(listener.playerKeyIsUser('player2'));
	});

	it('Returns if player key is user when host', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		assert.isTrue(listener.playerKeyIsUser('player1'));
		assert.isFalse(listener.playerKeyIsUser('player2'));
	});

	it('Returns if player key is user when client', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});
		Players.insert({gameId: gameId, userId: userId});

		assert.isTrue(listener.playerKeyIsUser('player2'));
		assert.isFalse(listener.playerKeyIsUser('player1'));
	});

	it('Returns if player key is opponent when not in game', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});

		assert.isFalse(listener.playerKeyIsOpponent('player1'));
		assert.isFalse(listener.playerKeyIsOpponent('player2'));
	});

	it('Returns if player key is opponent when host', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.isTrue(listener.playerKeyIsOpponent('player1'));
		assert.isFalse(listener.playerKeyIsOpponent('player2'));
	});

	it('Returns if player key is opponent when client', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.isTrue(listener.playerKeyIsOpponent('player2'));
		assert.isFalse(listener.playerKeyIsOpponent('player1'));
	});

	it('Returns if user player is host when not in game', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});

		assert.isFalse(listener.playerIsHost());
	});

	it('Returns if user player is host when host', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		assert.isTrue(listener.playerIsHost());
	});

	it('Returns if user player is host when client', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});
		Players.insert({gameId: gameId, userId: userId});

		assert.isFalse(listener.playerIsHost());
	});

	it('Returns if user player is client when not in game', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});

		assert.isFalse(listener.playerIsClient());
	});

	it('Returns if user player is client when host', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});
		Players.insert({gameId: gameId, userId: userId});

		assert.isTrue(listener.playerIsClient());
	});

	it('Returns if user player is client when client', function() {
		const listener = (new GameListener()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		assert.isFalse(listener.playerIsClient());
	});
});
