import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {assert} from 'chai';
import sinon from 'sinon';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import PlayerLost from '/imports/api/games/events/PlayerLost.js';
import GameForfeited from '/imports/api/games/events/GameForfeited.js';
import GameFinished from '/imports/api/games/events/GameFinished.js';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {HOST_POINTS_COLUMN} from '/imports/api/games/constants.js';
import {
	GAME_STATUS_REGISTRATION,
	GAME_STATUS_STARTED,
	GAME_STATUS_FINISHED,
	GAME_STATUS_TIMEOUT
} from '/imports/api/games/statusConstants.js';
import '/imports/api/games/server/methods.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {EventPublisher} from '/imports/lib/EventPublisher.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

describe('games/methods#leaveGame', function() {
	const sandbox = sinon.sandbox.create();
	const userId = Random.id(4);

	beforeEach(function() {
		resetDatabase();
		sandbox.stub(Meteor, 'user').callsFake(function() {
			return {_id: userId};
		});
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('throws 404 if game does not exist', function(done) {
		Meteor.call('leaveGame', Random.id(5), function(error) {
			try {
				assert.isObject(error);
				assert.propertyVal(error, 'error', 404);
				assert.propertyVal(error, 'reason', 'Game not found');
			} catch (exception) {
				done(exception);
			}
			done();
		});
	});

	it('throws not-allowed if game status is not in registration', function(done) {
		const gameId = Random.id(5);
		Games.insert({_id: gameId, status: GAME_STATUS_FINISHED});

		Meteor.call('leaveGame', gameId, function(error) {
			try {
				assert.isObject(error);
				assert.propertyVal(error, 'error', 'not-allowed');
				assert.propertyVal(error, 'reason', 'Game already started');
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('throws 404 if player does not exist', function(done) {
		const gameId = Random.id(5);
		Games.insert({_id: gameId, status: GAME_STATUS_REGISTRATION});

		Meteor.call('leaveGame', gameId, function(error) {
			try {
				assert.isObject(error);
				assert.propertyVal(error, 'error', 404);
				assert.propertyVal(error, 'reason', 'Player not found');
			} catch (exception) {
				done(exception);
			}
			done();
		});
	});

	it('removes player if player is not game creator', function(done) {
		const gameId = Random.id(5);
		const creatorPlayerId = '1';

		Games.insert({_id: gameId, status: GAME_STATUS_REGISTRATION, createdBy: creatorPlayerId});
		Players.insert({_id: '2', gameId: gameId, userId: userId});
		Players.insert({_id: creatorPlayerId, gameId: gameId, userId: 1});

		Meteor.call('leaveGame', gameId, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				assert.equal(Games.find().count(), 1);
				let players = Players.find();
				assert.equal(players.count(), 1);

				players.forEach(function(player) {
					assert.equal(player._id, creatorPlayerId);
				});
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('removes all player and game if player is game creator', function(done) {
		const gameId = Random.id(5);
		let creatorPlayerId = '1';

		Games.insert({_id: gameId, status: GAME_STATUS_REGISTRATION, createdBy: userId});
		Players.insert({_id: creatorPlayerId, gameId: gameId, userId: userId});
		Players.insert({_id: '2', gameId: gameId, userId: 1});

		//Create second game and players related to that game to make sure it's not deleted along
		let notRelatedGameId = Random.id(5);
		creatorPlayerId = '3';
		Games.insert({_id: notRelatedGameId, status: GAME_STATUS_REGISTRATION, createdBy: userId});
		Players.insert({_id: creatorPlayerId, gameId: notRelatedGameId, userId: userId});
		Players.insert({_id: '4', gameId: notRelatedGameId, userId: 1});

		Meteor.call('leaveGame', gameId, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				let games = Games.find();
				assert.equal(games.count(), 1);
				games.forEach(function(game) {
					assert.equal(game._id, notRelatedGameId);
				});

				let players = Players.find();
				assert.equal(players.count(), 2);
				players.forEach(function(player) {
					assert.equal(player.gameId, notRelatedGameId);
				});
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});
});

describe('GameMethods#quitGame', function() {
	const sandbox = sinon.sandbox.create();
	const gameId = Random.id(5);
	const userId1 = Random.id(5);
	const userId2 = Random.id(5);
	const playerId1 = Random.id(5);
	const playerId2 = Random.id(5);

	const stubUser = function(userId) {
		sandbox.stub(Meteor, 'user').callsFake(function() {
			return {_id: userId};
		});
	};

	beforeEach(function() {
		resetDatabase();
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('does not throw exception if game does not exist', function(done) {
		stubUser(userId1);
		Meteor.call('quitGame', Random.id(5), function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('does not throw exception if player does not exist', function(done) {
		Games.insert({_id: gameId, status: GAME_STATUS_TIMEOUT});

		stubUser(userId1);
		Meteor.call('quitGame', gameId, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('calls leaveGame if game status is in registration', function(done) {
		Games.insert({_id: gameId, status: GAME_STATUS_REGISTRATION});
		Players.insert({_id: playerId1, gameId: gameId, userId: userId1});

		let meteorCallSpy = sandbox.spy(Meteor, 'call');
		meteorCallSpy.withArgs('leaveGame');

		stubUser(userId1);
		Meteor.call('quitGame', gameId, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);
				assert.isTrue(meteorCallSpy.withArgs('leaveGame').calledOnce);
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('quits if game status is finished', function(done) {
		Games.insert({_id: gameId, status: GAME_STATUS_FINISHED});
		Players.insert({_id: playerId1, gameId: gameId, userId: userId1, hasQuit: false});

		stubUser(userId1);
		Meteor.call('quitGame', gameId, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				let game = Games.findOne({_id: gameId});
				assert.isNotNull(game);

				let players = Players.find({gameId: gameId});
				assert.equal(players.count(), 1);
				players.forEach(function(player) {
					assert.isNotNull(player.hasQuit);
				});
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('updates player hasQuit if game status is timed out', function(done) {
		Games.insert({_id: gameId, status: GAME_STATUS_TIMEOUT});
		Players.insert({_id: playerId1, gameId: gameId, userId: userId1, hasQuit: false});

		stubUser(userId1);
		Meteor.call('quitGame', gameId, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				let game = Games.findOne({_id: gameId});
				assert.isNotNull(game);

				let players = Players.find({gameId: gameId});
				assert.equal(players.count(), 1);
				players.forEach(function(player) {
					assert.notStrictEqual(player.hasQuit, false);
				});
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('updates player hasQuit and sets game status to timed out if game status is started', function(done) {
		Games.insert({_id: gameId, status: GAME_STATUS_STARTED});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: userId1, hasQuit: false});

		stubUser(userId1);
		Meteor.call('quitGame', gameId, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				let game = Games.findOne({_id: gameId});
				assert.isNotNull(game);
				assert.strictEqual(game.status, GAME_STATUS_TIMEOUT);

				let players = Players.find({gameId: gameId});
				assert.equal(players.count(), 1);
				players.forEach(function(player) {
					assert.notStrictEqual(player.hasQuit, false);
				});
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('client player should win on forfeit if 3 points are scored winning', function(done) {
		Games.insert({
			_id: gameId,
			createdBy: userId1,
			hostId: userId1,
			clientId: userId2,
			status: GAME_STATUS_STARTED,
			hostPoints: 3,
			clientPoints: 0,
			forfeitMinimumPoints: 3,
			maximumPoints: 5
		});
		Players.insert({_id: playerId1, userId: userId1, gameId: gameId});
		Players.insert({_id: playerId2, userId: userId2, gameId: gameId});
		Profiles.insert({userId: userId1, numberOfWin: 0, numberOfLost: 0});
		Profiles.insert({userId: userId2, numberOfWin: 0, numberOfLost: 0});

		stubUser(userId1);
		Meteor.call('quitGame', gameId, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				const hostProfile = Profiles.findOne({userId: userId1});

				assert.equal(1, hostProfile.numberOfLost);

				const clientProfile = Profiles.findOne({userId: userId2});

				assert.equal(1, clientProfile.numberOfWin);
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('client player should win on forfeit if 3 points are scored losing', function(done) {
		Games.insert({
			_id: gameId,
			createdBy: userId1,
			hostId: userId1,
			clientId: userId2,
			status: GAME_STATUS_STARTED,
			hostPoints: 0,
			clientPoints: 3,
			forfeitMinimumPoints: 3,
			maximumPoints: 5
		});
		Players.insert({_id: playerId1, userId: userId1, gameId: gameId});
		Players.insert({_id: playerId2, userId: userId2, gameId: gameId});
		Profiles.insert({userId: userId1, numberOfWin: 0, numberOfLost: 0});
		Profiles.insert({userId: userId2, numberOfWin: 0, numberOfLost: 0});

		stubUser(userId1);
		Meteor.call('quitGame', gameId, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				const hostProfile = Profiles.findOne({userId: userId1});

				assert.equal(1, hostProfile.numberOfLost);

				const clientProfile = Profiles.findOne({userId: userId2});

				assert.equal(1, clientProfile.numberOfWin);
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('host player should win on forfeit if 3 points are scored winning', function(done) {
		Games.insert({
			_id: gameId,
			createdBy: userId1,
			hostId: userId1,
			clientId: userId2,
			status: GAME_STATUS_STARTED,
			hostPoints: 3,
			clientPoints: 0,
			forfeitMinimumPoints: 3,
			maximumPoints: 5
		});
		Players.insert({_id: playerId1, userId: userId1, gameId: gameId});
		Players.insert({_id: playerId2, userId: userId2, gameId: gameId});
		Profiles.insert({userId: userId1, numberOfWin: 0, numberOfLost: 0});
		Profiles.insert({userId: userId2, numberOfWin: 0, numberOfLost: 0});

		stubUser(userId2);
		Meteor.call('quitGame', gameId, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				const hostProfile = Profiles.findOne({userId: userId1});

				assert.equal(1, hostProfile.numberOfWin);

				const clientProfile = Profiles.findOne({userId: userId2});

				assert.equal(1, clientProfile.numberOfLost);
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('host player should win on forfeit if 3 points are scored losing', function(done) {
		Games.insert({
			_id: gameId,
			createdBy: userId1,
			hostId: userId1,
			clientId: userId2,
			status: GAME_STATUS_STARTED,
			hostPoints: 0,
			clientPoints: 3,
			forfeitMinimumPoints: 3,
			maximumPoints: 5
		});
		Players.insert({_id: playerId1, userId: userId1, gameId: gameId});
		Players.insert({_id: playerId2, userId: userId2, gameId: gameId});
		Profiles.insert({userId: userId1, numberOfWin: 0, numberOfLost: 0});
		Profiles.insert({userId: userId2, numberOfWin: 0, numberOfLost: 0});

		stubUser(userId2);
		Meteor.call('quitGame', gameId, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				const hostProfile = Profiles.findOne({userId: userId1});

				assert.equal(1, hostProfile.numberOfWin);

				const clientProfile = Profiles.findOne({userId: userId2});

				assert.equal(1, clientProfile.numberOfLost);
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('updates eloRating, eloRatingLastChange and inserts EloScores on host forfeit', function(done) {
		Games.insert({
			_id: gameId,
			createdBy: userId1,
			hostId: userId1,
			clientId: userId2,
			status: GAME_STATUS_STARTED,
			hostPoints: 4,
			clientPoints: 0,
			forfeitMinimumPoints: 3,
			maximumPoints: 5
		});
		Players.insert({_id: playerId1, userId: userId1, gameId: gameId});
		Players.insert({_id: playerId2, userId: userId2, gameId: gameId});
		Profiles.insert({userId: userId1, eloRating: 1000});
		Profiles.insert({userId: userId2, eloRating: 1000});

		stubUser(userId1);
		Meteor.call('quitGame', gameId, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				const hostProfile = Profiles.findOne({userId: userId1});

				assert.equal(984, hostProfile.eloRating);
				assert.equal(-16, hostProfile.eloRatingLastChange);

				const clientProfile = Profiles.findOne({userId: userId2});

				assert.equal(1016, clientProfile.eloRating);
				assert.equal(16, clientProfile.eloRatingLastChange);

				const hostEloScores = EloScores.find({userId: userId1});
				assert.equal(1, hostEloScores.count());

				const clientEloScores = EloScores.find({userId: userId2});
				assert.equal(1, clientEloScores.count());
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('updates eloRating, eloRatingLastChange and inserts EloScores on client forfeit', function(done) {
		Games.insert({
			_id: gameId,
			createdBy: userId1,
			hostId: userId1,
			clientId: userId2,
			status: GAME_STATUS_STARTED,
			hostPoints: 4,
			clientPoints: 0,
			forfeitMinimumPoints: 3,
			maximumPoints: 5
		});
		Players.insert({_id: playerId1, userId: userId1, gameId: gameId});
		Players.insert({_id: playerId2, userId: userId2, gameId: gameId});
		Profiles.insert({userId: userId1, eloRating: 1000});
		Profiles.insert({userId: userId2, eloRating: 1000});

		stubUser(userId2);
		Meteor.call('quitGame', gameId, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				const hostProfile = Profiles.findOne({userId: userId1});

				assert.equal(1016, hostProfile.eloRating);
				assert.equal(16, hostProfile.eloRatingLastChange);

				const clientProfile = Profiles.findOne({userId: userId2});

				assert.equal(984, clientProfile.eloRating);
				assert.equal(-16, clientProfile.eloRatingLastChange);

				const hostEloScores = EloScores.find({userId: userId1});
				assert.equal(1, hostEloScores.count());

				const clientEloScores = EloScores.find({userId: userId2});
				assert.equal(1, clientEloScores.count());
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('publishes PlayerWon, PlayerLost and GameFinished on forfeit', function(done) {
		Games.insert({
			_id: gameId,
			createdBy: userId1,
			hostId: userId1,
			clientId: userId2,
			status: GAME_STATUS_STARTED,
			hostPoints: 4,
			clientPoints: 0,
			forfeitMinimumPoints: 3,
			maximumPoints: 5
		});
		Players.insert({_id: playerId1, userId: userId1, gameId: gameId});
		Players.insert({_id: playerId2, userId: userId2, gameId: gameId});
		Profiles.insert({userId: userId1});
		Profiles.insert({userId: userId2});

		let playerWonCalled = false;
		let playerLostCalled = false;
		let gameFinishedCalled = false;
		let gameForfeitedCalled = false;
		EventPublisher.on(PlayerWon.prototype.constructor.name, function() {playerWonCalled = true;}, this);
		EventPublisher.on(PlayerLost.prototype.constructor.name, function() {playerLostCalled = true;}, this);
		EventPublisher.on(GameFinished.prototype.constructor.name, function() {gameFinishedCalled = true;}, this);
		EventPublisher.on(GameForfeited.prototype.constructor.name, function() {gameForfeitedCalled = true;}, this);

		stubUser(userId1);
		Meteor.call('quitGame', gameId, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				assert.isTrue(playerWonCalled);
				assert.isTrue(playerLostCalled);
				assert.isTrue(gameFinishedCalled);
				assert.isTrue(gameForfeitedCalled);
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
		const gameId = Random.id(5);
		Games.insert({_id: gameId, status: GAME_STATUS_FINISHED});
		Players.insert({_id: Random.id(5), gameId: gameId, hasQuit: false, lastKeepAlive: 0});

		Meteor.call('removeTimeoutPlayersAndGames', 0, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				let game = Games.findOne({_id: gameId});
				assert.isNotNull(game);
				assert.strictEqual(game.status, GAME_STATUS_FINISHED);

				let players = Players.find({gameId: gameId});
				assert.equal(players.count(), 1);
				players.forEach(function(player) {
					assert.strictEqual(player.hasQuit, false);
				});
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('does nothing if has no timed out players but game has started status', function(done) {
		const gameId = Random.id(5);
		Games.insert({_id: gameId, status: GAME_STATUS_STARTED});
		Players.insert({_id: Random.id(5), gameId: gameId, hasQuit: false, lastKeepAlive: getUTCTimeStamp() * 2});

		Meteor.call('removeTimeoutPlayersAndGames', 0, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				let game = Games.findOne({_id: gameId});
				assert.isNotNull(game);
				assert.strictEqual(game.status, GAME_STATUS_STARTED);

				let players = Players.find({gameId: gameId});
				assert.equal(players.count(), 1);
				players.forEach(function(player) {
					assert.strictEqual(player.hasQuit, false);
				});
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('sets players hasQuit and sets game status to timed out', function(done) {
		const gameId = Random.id(5);
		const playerId1 = Random.id(5);
		const playerId2 = Random.id(5);

		Games.insert({_id: gameId, status: GAME_STATUS_STARTED});
		Players.insert({_id: playerId1, gameId: gameId, hasQuit: false, lastKeepAlive: 0});
		Players.insert({_id: playerId2, gameId: gameId, hasQuit: false, lastKeepAlive: getUTCTimeStamp() * 2});

		Meteor.call('removeTimeoutPlayersAndGames', 0, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				let game = Games.findOne({_id: gameId});
				assert.isNotNull(game);
				assert.strictEqual(game.status, GAME_STATUS_TIMEOUT);

				let players = Players.find({gameId: gameId});
				assert.equal(players.count(), 2);
				players.forEach(function(player) {
					if (player._id === playerId1) {
						assert.notStrictEqual(player.hasQuit, false);
					} else if (player._id === playerId2) {
						assert.strictEqual(player.hasQuit, false);
					}
				});
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});
});

describe('GameMethods#addGamePoints', function() {
	const gameId = Random.id(5);
	const userId1 = Random.id(5);
	const userId2 = Random.id(5);
	const playerId1 = Random.id(5);
	const playerId2 = Random.id(5);

	beforeEach(function() {
		resetDatabase();
	});

	it('updates numberOfWin, numberOfLost, numberOfShutouts and numberOfShutoutLosses when at maximum points', function(done) {
		Games.insert({
			_id: gameId,
			createdBy: userId1,
			hostId: userId1,
			clientId: userId2,
			status: GAME_STATUS_STARTED,
			hostPoints: 4,
			clientPoints: 0,
			forfeitMinimumPoints: 3,
			maximumPoints: 5
		});
		Players.insert({_id: playerId1, userId: userId1, gameId: gameId});
		Players.insert({_id: playerId2, userId: userId2, gameId: gameId});
		Profiles.insert({userId: userId1, numberOfWin: 0, numberOfShutouts: 0, numberOfLost: 0, numberOfShutoutLosses: 0});
		Profiles.insert({userId: userId2, numberOfWin: 0, numberOfShutouts: 0, numberOfLost: 0, numberOfShutoutLosses: 0});

		Meteor.call('addGamePoints', gameId, HOST_POINTS_COLUMN, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				const hostProfile = Profiles.findOne({userId: userId1});

				assert.equal(1, hostProfile.numberOfWin);
				assert.equal(1, hostProfile.numberOfShutouts);

				const clientProfile = Profiles.findOne({userId: userId2});

				assert.equal(1, clientProfile.numberOfLost);
				assert.equal(1, clientProfile.numberOfShutoutLosses);
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('updates eloRating, eloRatingLastChange and inserts EloScores when at maximum points', function(done) {
		Games.insert({
			_id: gameId,
			createdBy: userId1,
			hostId: userId1,
			clientId: userId2,
			status: GAME_STATUS_STARTED,
			hostPoints: 4,
			clientPoints: 0,
			forfeitMinimumPoints: 3,
			maximumPoints: 5
		});
		Players.insert({_id: playerId1, userId: userId1, gameId: gameId});
		Players.insert({_id: playerId2, userId: userId2, gameId: gameId});
		Profiles.insert({userId: userId1, eloRating: 1000});
		Profiles.insert({userId: userId2, eloRating: 1000});

		Meteor.call('addGamePoints', gameId, HOST_POINTS_COLUMN, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				const hostProfile = Profiles.findOne({userId: userId1});

				assert.equal(1016, hostProfile.eloRating);
				assert.equal(16, hostProfile.eloRatingLastChange);

				const clientProfile = Profiles.findOne({userId: userId2});

				assert.equal(984, clientProfile.eloRating);
				assert.equal(-16, clientProfile.eloRatingLastChange);

				const hostEloScores = EloScores.find({userId: userId1});
				assert.equal(1, hostEloScores.count());

				const clientEloScores = EloScores.find({userId: userId2});
				assert.equal(1, clientEloScores.count());
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});

	it('publishes PointTaken, PlayerWon, PlayerLost and GameFinished when at maximum points', function(done) {
		Games.insert({
			_id: gameId,
			createdBy: userId1,
			hostId: userId1,
			clientId: userId2,
			status: GAME_STATUS_STARTED,
			hostPoints: 4,
			clientPoints: 0,
			forfeitMinimumPoints: 3,
			maximumPoints: 5
		});
		Players.insert({_id: playerId1, userId: userId1, gameId: gameId});
		Players.insert({_id: playerId2, userId: userId2, gameId: gameId});
		Profiles.insert({userId: userId1});
		Profiles.insert({userId: userId2});

		let pointTakenCalled = false;
		let playerWonCalled = false;
		let playerLostCalled = false;
		let gameFinishedCalled = false;
		EventPublisher.on(PointTaken.prototype.constructor.name, function() {pointTakenCalled = true;}, this);
		EventPublisher.on(PlayerWon.prototype.constructor.name, function() {playerWonCalled = true;}, this);
		EventPublisher.on(PlayerLost.prototype.constructor.name, function() {playerLostCalled = true;}, this);
		EventPublisher.on(GameFinished.prototype.constructor.name, function() {gameFinishedCalled = true;}, this);

		Meteor.call('addGamePoints', gameId, HOST_POINTS_COLUMN, function(error) {
			try {
				assert.isUndefined(error, error ? error.reason : null);

				assert.isTrue(pointTakenCalled);
				assert.isTrue(playerWonCalled);
				assert.isTrue(playerLostCalled);
				assert.isTrue(gameFinishedCalled);
			} catch(exception) {
				done(exception);
			}
			done();
		});
	});
});
