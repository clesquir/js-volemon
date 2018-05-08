import {assert} from 'chai';
import {Random} from 'meteor/random';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {GAME_STATUS_STARTED, GAME_STATUS_FORFEITED, GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';
import {forfeitSide, winnerSide, isMatchPoint, isDeucePoint} from '/imports/api/games/utils.js';

describe('game/utils#forfeitSide', function() {
	const gameId = Random.id(5);
	const hostUserId = Random.id(5);
	const clientUserId = Random.id(5);
	const nobodyName = 'Nobody';
	const player1Name = 'Player 1';
	const player2Name = 'Player 2';

	it('returns Nobody if no player has forfeit', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		Games.insert({
			_id: gameId,
			createdBy: hostUserId,
			status: GAME_STATUS_FORFEITED,
			players: [
				{id: hostUserId, name: player1Name},
				{id: clientUserId, name: player2Name}
			],
			hostPoints: 5,
			clientPoints: 0
		});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: hostUserId, name: player1Name});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: clientUserId, name: player2Name});

		assert.equal(forfeitSide(Games.findOne({_id: gameId})), nobodyName);

		StubCollections.restore();
	});

	it('returns Nobody if both have forfeit but game is not forfeit', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		Games.insert({
			_id: gameId,
			createdBy: hostUserId,
			status: GAME_STATUS_FINISHED,
			players: [
				{id: hostUserId, name: player1Name},
				{id: clientUserId, name: player2Name}
			],
			hostPoints: 5,
			clientPoints: 0
		});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: hostUserId, name: player1Name, hasForfeited: true});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: clientUserId, name: player2Name, hasForfeited: true});

		assert.equal(forfeitSide(Games.findOne({_id: gameId})), nobodyName);

		StubCollections.restore();
	});

	it('returns Red if host has forfeit', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		Games.insert({
			_id: gameId,
			createdBy: hostUserId,
			status: GAME_STATUS_FORFEITED,
			players: [
				{id: hostUserId, name: player1Name},
				{id: clientUserId, name: player2Name}
			],
			hostPoints: 5,
			clientPoints: 0
		});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: hostUserId, name: player1Name, hasForfeited: true});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: clientUserId, name: player2Name});

		assert.equal(forfeitSide(Games.findOne({_id: gameId})), 'Red');

		StubCollections.restore();
	});

	it('returns Blue if client has forfeit', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		Games.insert({
			_id: gameId,
			createdBy: hostUserId,
			status: GAME_STATUS_FORFEITED,
			players: [
				{id: hostUserId, name: player1Name},
				{id: clientUserId, name: player2Name}
			],
			hostPoints: 5,
			clientPoints: 0
		});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: hostUserId, name: player1Name});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: clientUserId, name: player2Name, hasForfeited: true});

		assert.equal(forfeitSide(Games.findOne({_id: gameId})), 'Blue');

		StubCollections.restore();
	});
});

describe('game/utils#winnerSide', function() {
	const gameId = Random.id(5);
	const hostUserId = Random.id(5);
	const clientUserId = Random.id(5);
	const nobodyName = 'Nobody';
	const player1Name = 'Player 1';
	const player2Name = 'Player 2';

	it('returns Nobody if game is not finished', function() {
		StubCollections.stub(Games, Players);

		Games.insert({
			_id: gameId,
			status: GAME_STATUS_STARTED,
			players: [
				{id: hostUserId, name: player1Name},
				{id: clientUserId, name: player2Name}
			],
			hostPoints: 5,
			clientPoints: 5
		});

		assert.equal(winnerSide(Games.findOne({_id: gameId})), nobodyName);

		StubCollections.restore();
	});

	it('returns Nobody if players have same points', function() {
		StubCollections.stub(Games, Players);

		Games.insert({
			_id: gameId,
			status: GAME_STATUS_FINISHED,
			players: [
				{id: hostUserId, name: player1Name},
				{id: clientUserId, name: player2Name}
			],
			hostPoints: 0,
			clientPoints: 0
		});

		assert.equal(winnerSide(Games.findOne({_id: gameId})), nobodyName);

		StubCollections.restore();
	});

	it('returns Red if hostPoints are higher', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		Games.insert({
			_id: gameId,
			createdBy: hostUserId,
			status: GAME_STATUS_FINISHED,
			players: [
				{id: hostUserId, name: player1Name},
				{id: clientUserId, name: player2Name}
			],
			hostPoints: 5,
			clientPoints: 0
		});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: hostUserId, name: player1Name});

		assert.equal(winnerSide(Games.findOne({_id: gameId})), 'Red');

		StubCollections.restore();
	});

	it('returns Blue if clientPoints are higher', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		Games.insert({
			_id: gameId,
			createdBy: 1,
			status: GAME_STATUS_FINISHED,
			players: [
				{id: hostUserId, name: player1Name},
				{id: clientUserId, name: player2Name}
			],
			hostPoints: 0,
			clientPoints: 5
		});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: clientUserId, name: player2Name});

		assert.equal(winnerSide(Games.findOne({_id: gameId})), 'Blue');

		StubCollections.restore();
	});
});

describe('game/utils#isMatchPoint', function() {
	it('returns false if no players are at one point from maximum', function() {
		assert.isFalse(isMatchPoint(0, 0, 5));
	});

	it('returns true if hostPoints is at one point from maximum', function() {
		assert.isTrue(isMatchPoint(4, 0, 5));
	});

	it('returns true if clientPoints is at one point from maximum', function() {
		assert.isTrue(isMatchPoint(0, 4, 5));
	});

	it('returns true if both players are at one point from maximum', function() {
		assert.isTrue(isMatchPoint(4, 4, 5));
	});

	it('returns true if maximum is 1', function() {
		assert.isTrue(isMatchPoint(0, 0, 1));
	});
});

describe('game/utils#isDeuce', function() {
	it('returns false if both players are not at one point from maximum', function() {
		assert.isFalse(isDeucePoint(0, 0, 5));
	});

	it('returns false if hostPoints is at one point from maximum', function() {
		assert.isFalse(isDeucePoint(4, 0, 5));
	});

	it('returns false if clientPoints is at one point from maximum', function() {
		assert.isFalse(isDeucePoint(0, 4, 5));
	});

	it('returns true if both players are at one point from maximum', function() {
		assert.isTrue(isDeucePoint(4, 4, 5));
	});

	it('returns true if maximum is 1', function() {
		assert.isTrue(isDeucePoint(0, 0, 1));
	});
});
