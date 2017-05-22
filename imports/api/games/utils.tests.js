import {assert} from 'chai';
import {Random} from 'meteor/random';
import StubCollections from 'meteor/hwillson:stub-collections';
import {GAME_MAXIMUM_POINTS} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {GAME_STATUS_STARTED, GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';
import {getWinnerName, isMatchPoint, isDeucePoint} from '/imports/api/games/utils.js';

describe('game/utils#getWinnerName', function() {
	it('returns Nobody if game is not finished', function() {
		StubCollections.stub(Games, Players);

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: GAME_STATUS_STARTED,
			hostPoints: GAME_MAXIMUM_POINTS,
			clientPoints: GAME_MAXIMUM_POINTS
		});

		assert.equal(getWinnerName(Games.findOne({_id: gameId})), 'Nobody');

		StubCollections.restore();
	});

	it('returns Nobody if none of the players are at maximum points', function() {
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

	it('returns Player 1 if hostPoints is at maximum points but there is no players anymore set for the host', function() {
		StubCollections.stub(Games, Players);

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: GAME_STATUS_FINISHED,
			hostPoints: GAME_MAXIMUM_POINTS,
			clientPoints: 0
		});

		assert.equal(getWinnerName(Games.findOne({_id: gameId})), 'Player 1');

		StubCollections.restore();
	});

	it('returns host player name if hostPoints is at maximum points', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		let gameId = Random.id(5);
		let createdByUserId = 1;
		Games.insert({
			_id: gameId,
			createdBy: createdByUserId,
			status: GAME_STATUS_FINISHED,
			hostPoints: GAME_MAXIMUM_POINTS,
			clientPoints: 0
		});
		let hostPlayerName = 'Host player name';
		Players.insert({_id: Random.id(5), gameId: gameId, userId: createdByUserId, name: hostPlayerName});

		assert.equal(getWinnerName(Games.findOne({_id: gameId})), hostPlayerName);

		StubCollections.restore();
	});

	it('returns Player 2 if clientPoints is at maximum points but there is no players anymore set for the client', function() {
		StubCollections.stub(Games, Players);

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: GAME_STATUS_FINISHED,
			hostPoints: 0,
			clientPoints: GAME_MAXIMUM_POINTS
		});

		assert.equal(getWinnerName(Games.findOne({_id: gameId})), 'Player 2');

		StubCollections.restore();
	});

	it('returns client player name if clientPoints is at maximum points', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			createdBy: 1,
			status: GAME_STATUS_FINISHED,
			hostPoints: 0,
			clientPoints: GAME_MAXIMUM_POINTS
		});
		let clientPlayerName = 'Client player name';
		Players.insert({_id: Random.id(5), gameId: gameId, userId: 2, name: clientPlayerName});

		assert.equal(getWinnerName(Games.findOne({_id: gameId})), clientPlayerName);

		StubCollections.restore();
	});
});

describe('game/utils#isMatchPoint', function() {
	it('returns false if no players are at one point from maximum', function() {
		assert.isFalse(isMatchPoint(0, 0));
	});

	it('returns true if hostPoints is at one point from maximum', function() {
		assert.isTrue(isMatchPoint(GAME_MAXIMUM_POINTS - 1, 0));
	});

	it('returns true if clientPoints is at one point from maximum', function() {
		assert.isTrue(isMatchPoint(0, GAME_MAXIMUM_POINTS - 1));
	});

	it('returns true if both players are at one point from maximum', function() {
		assert.isTrue(isMatchPoint(GAME_MAXIMUM_POINTS - 1, GAME_MAXIMUM_POINTS - 1));
	});
});

describe('game/utils#isDeuce', function() {
	it('returns false if both players are not at one point from maximum', function() {
		assert.isFalse(isDeucePoint(0, 0));
	});

	it('returns false if hostPoints is at one point from maximum', function() {
		assert.isFalse(isDeucePoint(GAME_MAXIMUM_POINTS - 1, 0));
	});

	it('returns false if clientPoints is at one point from maximum', function() {
		assert.isFalse(isDeucePoint(0, GAME_MAXIMUM_POINTS - 1));
	});

	it('returns true if both players are at one point from maximum', function() {
		assert.isTrue(isDeucePoint(GAME_MAXIMUM_POINTS - 1, GAME_MAXIMUM_POINTS - 1));
	});
});
