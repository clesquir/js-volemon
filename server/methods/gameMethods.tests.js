import { resetDatabase } from 'meteor/xolvio:cleaner';
import { chai } from 'meteor/practicalmeteor:chai';
import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Constants } from '/lib/constants.js';
import { getUTCTimeStamp } from '/lib/utils.js';
import { gameMethods } from '/server/methods/gameMethods.js';

describe('GameMethods#leaveGame', function() {
	var sandbox = sinon.sandbox.create(),
		userId = Random.id(4);

	beforeEach(function() {
		resetDatabase();
		sandbox.stub(Meteor, 'user', function() {
			return {_id: userId};
		});
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('throws 404 if game does not exist', function(done) {
		Meteor.call('leaveGame', Random.id(5), function(error) {
			try {
				chai.assert.isObject(error);
				chai.assert.propertyVal(error, 'error', 404);
				chai.assert.propertyVal(error, 'reason', 'Game not found');
			} catch (exception) {
				done(exception);
			}
			done();
		});
	});

	it('throws not-allowed if game status is not in registration', function(done) {
		var gameId = Random.id(5);
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_FINISHED});

		Meteor.call('leaveGame', gameId, function(error) {
			try {
				chai.assert.isObject(error);
				chai.assert.propertyVal(error, 'error', 'not-allowed');
				chai.assert.propertyVal(error, 'reason', 'Game already started');
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('throws 404 if player does not exist', function(done) {
		var gameId = Random.id(5);
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_REGISTRATION});

		Meteor.call('leaveGame', gameId, function(error) {
			try {
				chai.assert.isObject(error);
				chai.assert.propertyVal(error, 'error', 404);
				chai.assert.propertyVal(error, 'reason', 'Player not found');
			} catch (exception) {
				done(exception);
			}
			done();
		});
	});

	it('removes player if player is not game creator', function(done) {
		var gameId = Random.id(5),
			creatorPlayerId = '1';

		Games.insert({_id: gameId, status: Constants.GAME_STATUS_REGISTRATION, createdBy: creatorPlayerId});
		Players.insert({_id: '2', gameId: gameId, userId: userId});
		Players.insert({_id: creatorPlayerId, gameId: gameId, userId: 1});

		Meteor.call('leaveGame', gameId, function(error) {
			try {
				chai.assert.isUndefined(error);

				chai.assert.equal(Games.find().count(), 1);
				let players = Players.find();
				chai.assert.equal(players.count(), 1);

				players.forEach(function(player) {
					chai.assert.equal(player._id, creatorPlayerId);
				});
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('removes all player and game if player is game creator', function(done) {
		var gameId = Random.id(5),
			creatorPlayerId = '1';

		Games.insert({_id: gameId, status: Constants.GAME_STATUS_REGISTRATION, createdBy: userId});
		Players.insert({_id: creatorPlayerId, gameId: gameId, userId: userId});
		Players.insert({_id: '2', gameId: gameId, userId: 1});

		//Create second game and players related to that game to make sure it's not deleted along
		let notRelatedGameId = Random.id(5);
		creatorPlayerId = '3';
		Games.insert({_id: notRelatedGameId, status: Constants.GAME_STATUS_REGISTRATION, createdBy: userId});
		Players.insert({_id: creatorPlayerId, gameId: notRelatedGameId, userId: userId});
		Players.insert({_id: '4', gameId: notRelatedGameId, userId: 1});

		Meteor.call('leaveGame', gameId, function(error) {
			try {
				chai.assert.isUndefined(error);

				let games = Games.find();
				chai.assert.equal(games.count(), 1);
				games.forEach(function(game) {
					chai.assert.equal(game._id, notRelatedGameId);
				});

				let players = Players.find();
				chai.assert.equal(players.count(), 2);
				players.forEach(function(player) {
					chai.assert.equal(player.gameId, notRelatedGameId);
				});
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});
});

describe('GameMethods#quitGame', function() {
	var sandbox = sinon.sandbox.create(),
		userId = Random.id(4);

	beforeEach(function() {
		resetDatabase();
		sandbox.stub(Meteor, 'user', function() {
			return {_id: userId};
		});
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('throws 404 if game does not exist', function(done) {
		Meteor.call('quitGame', Random.id(5), function(error) {
			try {
				chai.assert.isObject(error);
				chai.assert.propertyVal(error, 'error', 404);
				chai.assert.propertyVal(error, 'reason', 'Game not found');
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('throws 404 if player does not exist', function(done) {
		var gameId = Random.id(5);
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_TIMEOUT});

		Meteor.call('quitGame', gameId, function(error) {
			try {
				chai.assert.isObject(error);
				chai.assert.propertyVal(error, 'error', 404);
				chai.assert.propertyVal(error, 'reason', 'Player not found');
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('calls leaveGame if game status is in registration', function(done) {
		var gameId = Random.id(5);
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_REGISTRATION});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: userId});

		let meteorCallSpy = sandbox.spy(Meteor, 'call');
		meteorCallSpy.withArgs('leaveGame');

		Meteor.call('quitGame', gameId, function(error) {
			try {
				chai.assert.isUndefined(error);
				chai.assert.isTrue(meteorCallSpy.withArgs('leaveGame').calledOnce);
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('does nothing if game status is finished', function(done) {
		var gameId = Random.id(5);
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_FINISHED});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: userId, hasQuit: false});

		Meteor.call('quitGame', gameId, function(error) {
			try {
				chai.assert.isUndefined(error);

				let game = Games.findOne({_id: gameId});
				chai.assert.isNotNull(game);

				let players = Players.find({gameId: gameId});
				chai.assert.equal(players.count(), 1);
				players.forEach(function(player) {
					chai.assert.strictEqual(player.hasQuit, false);
				});
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('updates player hasQuit if game status is timed out', function(done) {
		var gameId = Random.id(5);
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_TIMEOUT});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: userId, hasQuit: false});

		Meteor.call('quitGame', gameId, function(error) {
			try {
				chai.assert.isUndefined(error);

				let game = Games.findOne({_id: gameId});
				chai.assert.isNotNull(game);

				let players = Players.find({gameId: gameId});
				chai.assert.equal(players.count(), 1);
				players.forEach(function(player) {
					chai.assert.notStrictEqual(player.hasQuit, false);
				});
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('updates player hasQuit and sets game status to timed out if game status is started', function(done) {
		var gameId = Random.id(5);
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_STARTED});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: userId, hasQuit: false});

		Meteor.call('quitGame', gameId, function(error) {
			try {
				chai.assert.isUndefined(error);

				let game = Games.findOne({_id: gameId});
				chai.assert.isNotNull(game);
				chai.assert.strictEqual(game.status, Constants.GAME_STATUS_TIMEOUT);

				let players = Players.find({gameId: gameId});
				chai.assert.equal(players.count(), 1);
				players.forEach(function(player) {
					chai.assert.notStrictEqual(player.hasQuit, false);
				});
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});
});

describe('GameMethods#removeTimeoutPlayersAndGames', function() {
	beforeEach(function() {
		resetDatabase();
	});

	it('does nothing if no game has started status but has timed out players', function(done) {
		var gameId = Random.id(5);
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_FINISHED});
		Players.insert({_id: Random.id(5), gameId: gameId, hasQuit: false, lastKeepAlive: 0});

		Meteor.call('removeTimeoutPlayersAndGames', function(error) {
			try {
				chai.assert.isUndefined(error);

				let game = Games.findOne({_id: gameId});
				chai.assert.isNotNull(game);
				chai.assert.strictEqual(game.status, Constants.GAME_STATUS_FINISHED);

				let players = Players.find({gameId: gameId});
				chai.assert.equal(players.count(), 1);
				players.forEach(function(player) {
					chai.assert.strictEqual(player.hasQuit, false);
				});
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('does nothing if has no timed out players but game has started status', function(done) {
		var gameId = Random.id(5);
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_STARTED});
		Players.insert({_id: Random.id(5), gameId: gameId, hasQuit: false, lastKeepAlive: getUTCTimeStamp() * 2});

		Meteor.call('removeTimeoutPlayersAndGames', function(error) {
			try {
				chai.assert.isUndefined(error);

				let game = Games.findOne({_id: gameId});
				chai.assert.isNotNull(game);
				chai.assert.strictEqual(game.status, Constants.GAME_STATUS_STARTED);

				let players = Players.find({gameId: gameId});
				chai.assert.equal(players.count(), 1);
				players.forEach(function(player) {
					chai.assert.strictEqual(player.hasQuit, false);
				});
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('sets players hasQuit and sets game status to timed out', function(done) {
		var gameId = Random.id(5),
			playerId1 = Random.id(5),
			playerId2 = Random.id(5);

		Games.insert({_id: gameId, status: Constants.GAME_STATUS_STARTED});
		Players.insert({_id: playerId1, gameId: gameId, hasQuit: false, lastKeepAlive: 0});
		Players.insert({_id: playerId2, gameId: gameId, hasQuit: false, lastKeepAlive: getUTCTimeStamp() * 2});

		Meteor.call('removeTimeoutPlayersAndGames', function(error) {
			try {
				chai.assert.isUndefined(error);

				let game = Games.findOne({_id: gameId});
				chai.assert.isNotNull(game);
				chai.assert.strictEqual(game.status, Constants.GAME_STATUS_TIMEOUT);

				let players = Players.find({gameId: gameId});
				chai.assert.equal(players.count(), 2);
				players.forEach(function(player) {
					if (player._id == playerId1) {
						chai.assert.notStrictEqual(player.hasQuit, false);
					} else if (player._id == playerId2) {
						chai.assert.strictEqual(player.hasQuit, false);
					}
				});
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});
});
