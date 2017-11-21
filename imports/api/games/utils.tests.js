import {assert} from 'chai';
import {Random} from 'meteor/random';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {GAME_STATUS_STARTED, GAME_STATUS_FORFEITED, GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';
import {forfeitPlayerName, getWinnerName, isMatchPoint, isDeucePoint} from '/imports/api/games/utils.js';

describe('game/utils#forfeitPlayerName', function() {
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
			hostPoints: 5,
			clientPoints: 0
		});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: hostUserId, name: player1Name});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: clientUserId, name: player2Name});

		assert.equal(forfeitPlayerName(Games.findOne({_id: gameId})), nobodyName);

		StubCollections.restore();
	});

	it('returns Nobody if both have forfeit but game is not forfeit', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		Games.insert({
			_id: gameId,
			createdBy: hostUserId,
			status: GAME_STATUS_FINISHED,
			hostPoints: 5,
			clientPoints: 0
		});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: hostUserId, name: player1Name, hasForfeited: true});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: clientUserId, name: player2Name, hasForfeited: true});

		assert.equal(forfeitPlayerName(Games.findOne({_id: gameId})), nobodyName);

		StubCollections.restore();
	});

	it('returns Player 1 if host has forfeit', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		Games.insert({
			_id: gameId,
			createdBy: hostUserId,
			status: GAME_STATUS_FORFEITED,
			hostPoints: 5,
			clientPoints: 0
		});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: hostUserId, name: player1Name, hasForfeited: true});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: clientUserId, name: player2Name});

		assert.equal(forfeitPlayerName(Games.findOne({_id: gameId})), player1Name);

		StubCollections.restore();
	});

	it('returns Player 2 if client has forfeit', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		Games.insert({
			_id: gameId,
			createdBy: hostUserId,
			status: GAME_STATUS_FORFEITED,
			hostPoints: 5,
			clientPoints: 0
		});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: hostUserId, name: player1Name});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: clientUserId, name: player2Name, hasForfeited: true});

		assert.equal(forfeitPlayerName(Games.findOne({_id: gameId})), player2Name);

		StubCollections.restore();
	});
});

describe('game/utils#getWinnerName', function() {
	it('returns Nobody if game is not finished', function() {
		StubCollections.stub(Games, Players);

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: GAME_STATUS_STARTED,
			hostPoints: 5,
			clientPoints: 5
		});

		assert.equal(getWinnerName(Games.findOne({_id: gameId})), 'Nobody');

		StubCollections.restore();
	});

	it('returns Nobody if players have same points', function() {
		StubCollections.stub(Games, Players);

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: GAME_STATUS_FINISHED,
			hostPoints: 0,
			clientPoints: 0
		});

		assert.equal(getWinnerName(Games.findOne({_id: gameId})), 'Nobody');

		StubCollections.restore();
	});

	it('returns Player 1 if hostPoints are higher but there is no players anymore set for the host', function() {
		StubCollections.stub(Games, Players);

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: GAME_STATUS_FINISHED,
			hostPoints: 5,
			clientPoints: 0
		});

		assert.equal(getWinnerName(Games.findOne({_id: gameId})), 'Player 1');

		StubCollections.restore();
	});

	it('returns host player name if hostPoints are higher', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		let gameId = Random.id(5);
		let createdByUserId = 1;
		Games.insert({
			_id: gameId,
			createdBy: createdByUserId,
			status: GAME_STATUS_FINISHED,
			hostPoints: 5,
			clientPoints: 0
		});
		let hostPlayerName = 'Host player name';
		Players.insert({_id: Random.id(5), gameId: gameId, userId: createdByUserId, name: hostPlayerName});

		assert.equal(getWinnerName(Games.findOne({_id: gameId})), hostPlayerName);

		StubCollections.restore();
	});

	it('returns Player 2 if clientPoints are higher but there is no players anymore set for the client', function() {
		StubCollections.stub(Games, Players);

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: GAME_STATUS_FINISHED,
			hostPoints: 0,
			clientPoints: 5
		});

		assert.equal(getWinnerName(Games.findOne({_id: gameId})), 'Player 2');

		StubCollections.restore();
	});

	it('returns client player name if clientPoints are higher', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			createdBy: 1,
			status: GAME_STATUS_FINISHED,
			hostPoints: 0,
			clientPoints: 5
		});
		let clientPlayerName = 'Client player name';
		Players.insert({_id: Random.id(5), gameId: gameId, userId: 2, name: clientPlayerName});

		assert.equal(getWinnerName(Games.findOne({_id: gameId})), clientPlayerName);

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

	it('returns false if maximum is 1', function() {
		assert.isFalse(isMatchPoint(0, 0, 1));
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

	it('returns false if maximum is 1', function() {
		assert.isFalse(isDeucePoint(0, 0, 1));
	});
});
