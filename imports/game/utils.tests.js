import StubCollections from 'meteor/hwillson:stub-collections';
import { getWinnerName, isMatchPoint, isDeucePoint } from '/imports/game/utils.js';
import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Constants } from '/imports/lib/constants.js';

describe('game/utils#getWinnerName', function() {
	it('returns Nobody if game is not finished', function() {
		StubCollections.stub(Games, Players);

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: Constants.GAME_STATUS_STARTED,
			hostPoints: Constants.MAXIMUM_POINTS,
			clientPoints: Constants.MAXIMUM_POINTS
		});

		chai.assert.equal(getWinnerName(Games.findOne({_id: gameId})), 'Nobody');

		StubCollections.restore();
	});

	it('returns Nobody if none of the players are at maximum points', function() {
		StubCollections.stub(Games, Players);

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: Constants.GAME_STATUS_FINISHED,
			hostPoints: 0,
			clientPoints: 0
		});

		chai.assert.equal(getWinnerName(Games.findOne({_id: gameId})), 'Nobody');

		StubCollections.restore();
	});

	it('returns Player 1 if hostPoints is at maximum points but there is no players anymore set for the host', function() {
		StubCollections.stub(Games, Players);

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: Constants.GAME_STATUS_FINISHED,
			hostPoints: Constants.MAXIMUM_POINTS,
			clientPoints: 0
		});

		chai.assert.equal(getWinnerName(Games.findOne({_id: gameId})), 'Player 1');

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
			status: Constants.GAME_STATUS_FINISHED,
			hostPoints: Constants.MAXIMUM_POINTS,
			clientPoints: 0
		});
		let hostPlayerName = 'Host player name';
		Players.insert({_id: Random.id(5), gameId: gameId, userId: createdByUserId, name: hostPlayerName});

		chai.assert.equal(getWinnerName(Games.findOne({_id: gameId})), hostPlayerName);

		StubCollections.restore();
	});

	it('returns Player 2 if clientPoints is at maximum points but there is no players anymore set for the client', function() {
		StubCollections.stub(Games, Players);

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: Constants.GAME_STATUS_FINISHED,
			hostPoints: 0,
			clientPoints: Constants.MAXIMUM_POINTS
		});

		chai.assert.equal(getWinnerName(Games.findOne({_id: gameId})), 'Player 2');

		StubCollections.restore();
	});

	it('returns client player name if clientPoints is at maximum points', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			createdBy: 1,
			status: Constants.GAME_STATUS_FINISHED,
			hostPoints: 0,
			clientPoints: Constants.MAXIMUM_POINTS
		});
		let clientPlayerName = 'Client player name';
		Players.insert({_id: Random.id(5), gameId: gameId, userId: 2, name: clientPlayerName});

		chai.assert.equal(getWinnerName(Games.findOne({_id: gameId})), clientPlayerName);

		StubCollections.restore();
	});
});

describe('game/utils#isMatchPoint', function() {
	it('returns false if no players are at one point from maximum', function() {
		chai.assert.isFalse(isMatchPoint(0, 0));
	});

	it('returns true if hostPoints is at one point from maximum', function() {
		chai.assert.isTrue(isMatchPoint(Constants.MAXIMUM_POINTS - 1, 0));
	});

	it('returns true if clientPoints is at one point from maximum', function() {
		chai.assert.isTrue(isMatchPoint(0, Constants.MAXIMUM_POINTS - 1));
	});

	it('returns true if both players are at one point from maximum', function() {
		chai.assert.isTrue(isMatchPoint(Constants.MAXIMUM_POINTS - 1, Constants.MAXIMUM_POINTS - 1));
	});
});

describe('game/utils#isDeuce', function() {
	it('returns false if both players are not at one point from maximum', function() {
		chai.assert.isFalse(isDeucePoint(0, 0));
	});

	it('returns false if hostPoints is at one point from maximum', function() {
		chai.assert.isFalse(isDeucePoint(Constants.MAXIMUM_POINTS - 1, 0));
	});

	it('returns false if clientPoints is at one point from maximum', function() {
		chai.assert.isFalse(isDeucePoint(0, Constants.MAXIMUM_POINTS - 1));
	});

	it('returns true if both players are at one point from maximum', function() {
		chai.assert.isTrue(isDeucePoint(Constants.MAXIMUM_POINTS - 1, Constants.MAXIMUM_POINTS - 1));
	});
});
