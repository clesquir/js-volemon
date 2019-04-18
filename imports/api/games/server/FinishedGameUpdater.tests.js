import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import EloScoreCreator from '/imports/api/games/server/EloScoreCreator';
import {GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import ProfileUpdater from '/imports/api/profiles/server/ProfileUpdater';
import {assert} from 'chai'
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';
import FinishedGameUpdater from './FinishedGameUpdater';

describe('FinishedGameUpdater', function() {
	const finishedGameUpdater = new FinishedGameUpdater(
		new ProfileUpdater(),
		new EloScoreCreator(),
		null,
		null
	);

	before(function() {
		StubCollections.add([Profiles, EloScores, Games]);
	});

	beforeEach(function() {
		StubCollections.stub();
	});

	afterEach(function() {
		StubCollections.restore();
	});

	it('updates elo ratings', function() {
		const gameId = Random.id(5);
		const hostProfileId = Random.id(5);
		const hostUserId = 1;
		const clientProfileId = Random.id(5);
		const clientUserId = 2;

		Profiles.insert({
			_id: hostProfileId,
			userId: hostUserId,
			numberOfWin: 0,
			numberOfLost: 0,
			eloRating: 1000,
			eloRatingLastChange: null
		});
		Profiles.insert({
			_id: clientProfileId,
			userId: clientUserId,
			numberOfWin: 0,
			numberOfLost: 0,
			eloRating: 1000,
			eloRatingLastChange: null
		});
		Games.insert({_id: gameId, status: GAME_STATUS_FINISHED});

		finishedGameUpdater.updateElo(gameId, [hostUserId], [clientUserId]);

		let hostProfile = Profiles.findOne({_id: hostProfileId});
		assert.isObject(hostProfile);
		assert.propertyVal(hostProfile, 'eloRating', 1016);
		assert.propertyVal(hostProfile, 'eloRatingLastChange', 16);

		let clientProfile = Profiles.findOne({_id: clientProfileId});
		assert.isObject(clientProfile);
		assert.propertyVal(clientProfile, 'eloRating', 984);
		assert.propertyVal(clientProfile, 'eloRatingLastChange', -16);
	});

	it('updates elo scores', function() {
		const gameId = Random.id(5);
		const hostProfileId = Random.id(5);
		const hostUserId = 1;
		const clientProfileId = Random.id(5);
		const clientUserId = 2;

		Profiles.insert({
			_id: hostProfileId,
			userId: hostUserId,
			numberOfWin: 0,
			numberOfLost: 0,
			eloRating: 1000,
			eloRatingLastChange: null
		});
		Profiles.insert({
			_id: clientProfileId,
			userId: clientUserId,
			numberOfWin: 0,
			numberOfLost: 0,
			eloRating: 1000,
			eloRatingLastChange: null
		});
		Games.insert({_id: gameId, status: GAME_STATUS_FINISHED});

		finishedGameUpdater.updateElo(gameId, [hostUserId], [clientUserId]);

		let eloScoresHost = EloScores.findOne({userId: hostUserId});
		assert.isObject(eloScoresHost);
		assert.propertyVal(eloScoresHost, 'eloRating', 1016);

		let eloScoresClient = EloScores.findOne({userId: clientUserId});
		assert.isObject(eloScoresClient);
		assert.propertyVal(eloScoresClient, 'eloRating', 984);
	});

	it('updates number of win and lost', function() {
		const gameId = Random.id(5);
		const hostProfileId = Random.id(5);
		const hostUserId = 1;
		const clientProfileId = Random.id(5);
		const clientUserId = 2;

		Profiles.insert({
			_id: hostProfileId,
			userId: hostUserId,
			numberOfWin: 0,
			numberOfLost: 0
		});
		Profiles.insert({
			_id: clientProfileId,
			userId: clientUserId,
			numberOfWin: 0,
			numberOfLost: 0
		});
		Games.insert({_id: gameId, status: GAME_STATUS_FINISHED});

		finishedGameUpdater.updateStatistics(gameId, [hostUserId], [clientUserId]);

		let hostProfile = Profiles.findOne({_id: hostProfileId});
		assert.isObject(hostProfile);
		assert.propertyVal(hostProfile, 'numberOfWin', 1);
		assert.propertyVal(hostProfile, 'numberOfLost', 0);

		let clientProfile = Profiles.findOne({_id: clientProfileId});
		assert.isObject(clientProfile);
		assert.propertyVal(clientProfile, 'numberOfWin', 0);
		assert.propertyVal(clientProfile, 'numberOfLost', 1);

		finishedGameUpdater.updateStatistics(gameId, [clientUserId], [hostUserId]);

		hostProfile = Profiles.findOne({_id: hostProfileId});
		assert.isObject(hostProfile);
		assert.propertyVal(hostProfile, 'numberOfWin', 1);
		assert.propertyVal(hostProfile, 'numberOfLost', 1);

		clientProfile = Profiles.findOne({_id: clientProfileId});
		assert.isObject(clientProfile);
		assert.propertyVal(clientProfile, 'numberOfWin', 1);
		assert.propertyVal(clientProfile, 'numberOfLost', 1);

		finishedGameUpdater.updateStatistics(gameId, [hostUserId], [clientUserId]);

		hostProfile = Profiles.findOne({_id: hostProfileId});
		assert.isObject(hostProfile);
		assert.propertyVal(hostProfile, 'numberOfWin', 2);
		assert.propertyVal(hostProfile, 'numberOfLost', 1);

		clientProfile = Profiles.findOne({_id: clientProfileId});
		assert.isObject(clientProfile);
		assert.propertyVal(clientProfile, 'numberOfWin', 1);
		assert.propertyVal(clientProfile, 'numberOfLost', 2);
	});

	it('updates numberOfShutouts and numberOfShutoutLosses', function() {
		const hostProfileId = Random.id(5);
		const hostUserId = 1;
		const clientProfileId = Random.id(5);
		const clientUserId = 2;

		Profiles.insert({
			_id: hostProfileId,
			userId: hostUserId,
			numberOfWin: 0,
			numberOfLost: 0,
			numberOfShutouts: 0,
			numberOfShutoutLosses: 0,
			eloRating: 1000,
			eloRatingLastChange: null
		});
		Profiles.insert({
			_id: clientProfileId,
			userId: clientUserId,
			numberOfWin: 0,
			numberOfLost: 0,
			numberOfShutouts: 0,
			numberOfShutoutLosses: 0,
			eloRating: 1000,
			eloRatingLastChange: null
		});

		/**
		 * 5-1
		 */
		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: GAME_STATUS_FINISHED,
			hostPoints: 5,
			clientPoints: 1,
			forfeitMinimumPoints: 3,
			maximumPoints: 5
		});

		finishedGameUpdater.updateStatistics(gameId, [hostUserId], [clientUserId]);

		let hostProfile = Profiles.findOne({_id: hostProfileId});
		assert.isObject(hostProfile);
		assert.propertyVal(hostProfile, 'numberOfShutouts', 0);
		assert.propertyVal(hostProfile, 'numberOfShutoutLosses', 0);

		let clientProfile = Profiles.findOne({_id: clientProfileId});
		assert.isObject(clientProfile);
		assert.propertyVal(clientProfile, 'numberOfShutouts', 0);
		assert.propertyVal(clientProfile, 'numberOfShutoutLosses', 0);

		/**
		 * 1-0
		 */
		gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: GAME_STATUS_FINISHED,
			hostPoints: 1,
			clientPoints: 0,
			forfeitMinimumPoints: 0,
			maximumPoints: 1
		});

		finishedGameUpdater.updateStatistics(gameId, [hostUserId], [clientUserId]);

		hostProfile = Profiles.findOne({_id: hostProfileId});
		assert.isObject(hostProfile);
		assert.propertyVal(hostProfile, 'numberOfShutouts', 0);
		assert.propertyVal(hostProfile, 'numberOfShutoutLosses', 0);

		clientProfile = Profiles.findOne({_id: clientProfileId});
		assert.isObject(clientProfile);
		assert.propertyVal(clientProfile, 'numberOfShutouts', 0);
		assert.propertyVal(clientProfile, 'numberOfShutoutLosses', 0);

		/**
		 * 0-1
		 */
		gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: GAME_STATUS_FINISHED,
			hostPoints: 0,
			clientPoints: 1,
			forfeitMinimumPoints: 0,
			maximumPoints: 1
		});

		finishedGameUpdater.updateStatistics(gameId, [hostUserId], [clientUserId]);

		hostProfile = Profiles.findOne({_id: hostProfileId});
		assert.isObject(hostProfile);
		assert.propertyVal(hostProfile, 'numberOfShutouts', 0);
		assert.propertyVal(hostProfile, 'numberOfShutoutLosses', 0);

		clientProfile = Profiles.findOne({_id: clientProfileId});
		assert.isObject(clientProfile);
		assert.propertyVal(clientProfile, 'numberOfShutouts', 0);
		assert.propertyVal(clientProfile, 'numberOfShutoutLosses', 0);

		/**
		 * 1-5
		 */
		gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: GAME_STATUS_FINISHED,
			hostPoints: 1,
			clientPoints: 5,
			forfeitMinimumPoints: 3,
			maximumPoints: 5
		});

		finishedGameUpdater.updateStatistics(gameId, [clientUserId], [hostUserId]);

		hostProfile = Profiles.findOne({_id: hostProfileId});
		assert.isObject(hostProfile);
		assert.propertyVal(hostProfile, 'numberOfShutouts', 0);
		assert.propertyVal(hostProfile, 'numberOfShutoutLosses', 0);

		clientProfile = Profiles.findOne({_id: clientProfileId});
		assert.isObject(clientProfile);
		assert.propertyVal(clientProfile, 'numberOfShutouts', 0);
		assert.propertyVal(clientProfile, 'numberOfShutoutLosses', 0);

		/**
		 * 5-0
		 */
		gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: GAME_STATUS_FINISHED,
			hostPoints: 5,
			clientPoints: 0,
			forfeitMinimumPoints: 3,
			maximumPoints: 5
		});

		finishedGameUpdater.updateStatistics(gameId, [hostUserId], [clientUserId]);

		hostProfile = Profiles.findOne({_id: hostProfileId});
		assert.isObject(hostProfile);
		assert.propertyVal(hostProfile, 'numberOfShutouts', 1);
		assert.propertyVal(hostProfile, 'numberOfShutoutLosses', 0);

		clientProfile = Profiles.findOne({_id: clientProfileId});
		assert.isObject(clientProfile);
		assert.propertyVal(clientProfile, 'numberOfShutouts', 0);
		assert.propertyVal(clientProfile, 'numberOfShutoutLosses', 1);

		/**
		 * 0-5
		 */
		gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: GAME_STATUS_FINISHED,
			hostPoints: 0,
			clientPoints: 5,
			forfeitMinimumPoints: 3,
			maximumPoints: 5
		});

		finishedGameUpdater.updateStatistics(gameId, [clientUserId], [hostUserId]);

		hostProfile = Profiles.findOne({_id: hostProfileId});
		assert.isObject(hostProfile);
		assert.propertyVal(hostProfile, 'numberOfShutouts', 1);
		assert.propertyVal(hostProfile, 'numberOfShutoutLosses', 1);

		clientProfile = Profiles.findOne({_id: clientProfileId});
		assert.isObject(clientProfile);
		assert.propertyVal(clientProfile, 'numberOfShutouts', 1);
		assert.propertyVal(clientProfile, 'numberOfShutoutLosses', 1);
	});
});
