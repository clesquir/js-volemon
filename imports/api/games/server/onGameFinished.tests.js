import {assert, expect} from 'chai'
import {Random} from 'meteor/random';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {
	onGameFinished,
	updateProfilesOnGameFinished,
	updateEloScoresOnGameFinished,
	getEloScore,
	getEloRating
} from '/imports/api/games/server/onGameFinished.js';
import {GAME_MAXIMUM_POINTS} from '/imports/api/games/constants.js';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {GAME_STATUS_STARTED, GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';
import {Profiles} from '/imports/api/profiles/profiles.js';

describe('onGameFinished', function() {
	it('throws 404 if game does not exist', function() {
		expect(() => {
			onGameFinished(Random.id(5));
		}).to.throw('Game not found');
	});

	it('throws not-allowed if game status is not finished', function() {
		const gameId = Random.id(5);
		Games.insert({_id: gameId, status: GAME_STATUS_STARTED});

		expect(() => {
			onGameFinished(gameId);
		}).to.throw('Only finished games can be used for Elo calculations');
	});

	it('updates elo ratings and scores', function() {
		const gameId = Random.id(5);
		const hostProfileId = Random.id(5);
		const hostUserId = 1;
		const clientProfileId = Random.id(5);
		const clientUserId = 2;

		resetDatabase();

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
		Players.insert({gameId: gameId, userId: clientUserId});
		Games.insert({_id: gameId, status: GAME_STATUS_FINISHED});

		updateEloScoresOnGameFinished(Games.findOne({_id: gameId}), Profiles.findOne({_id: hostProfileId}), Profiles.findOne({_id: clientProfileId}));

		let hostProfile = Profiles.findOne({_id: hostProfileId});
		assert.isObject(hostProfile);
		assert.propertyVal(hostProfile, 'eloRating', 1016);
		assert.propertyVal(hostProfile, 'eloRatingLastChange', 16);

		let clientProfile = Profiles.findOne({_id: clientProfileId});
		assert.isObject(clientProfile);
		assert.propertyVal(clientProfile, 'eloRating', 984);
		assert.propertyVal(clientProfile, 'eloRatingLastChange', -16);

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

		resetDatabase();

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
		Players.insert({gameId: gameId, userId: clientUserId});
		Games.insert({_id: gameId, status: GAME_STATUS_FINISHED});

		updateProfilesOnGameFinished(Games.findOne({_id: gameId}), Profiles.findOne({_id: hostProfileId}), Profiles.findOne({_id: clientProfileId}));

		let hostProfile = Profiles.findOne({_id: hostProfileId});
		assert.isObject(hostProfile);
		assert.propertyVal(hostProfile, 'numberOfWin', 1);
		assert.propertyVal(hostProfile, 'numberOfLost', 0);

		let clientProfile = Profiles.findOne({_id: clientProfileId});
		assert.isObject(clientProfile);
		assert.propertyVal(clientProfile, 'numberOfWin', 0);
		assert.propertyVal(clientProfile, 'numberOfLost', 1);

		updateProfilesOnGameFinished(Games.findOne({_id: gameId}), Profiles.findOne({_id: clientProfileId}), Profiles.findOne({_id: hostProfileId}));

		hostProfile = Profiles.findOne({_id: hostProfileId});
		assert.isObject(hostProfile);
		assert.propertyVal(hostProfile, 'numberOfWin', 1);
		assert.propertyVal(hostProfile, 'numberOfLost', 1);

		clientProfile = Profiles.findOne({_id: clientProfileId});
		assert.isObject(clientProfile);
		assert.propertyVal(clientProfile, 'numberOfWin', 1);
		assert.propertyVal(clientProfile, 'numberOfLost', 1);

		updateProfilesOnGameFinished(Games.findOne({_id: gameId}), Profiles.findOne({_id: hostProfileId}), Profiles.findOne({_id: clientProfileId}));

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

		resetDatabase();

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
		Players.insert({gameId: gameId, userId: clientUserId});
		Games.insert({_id: gameId, status: GAME_STATUS_FINISHED, hostPoints: GAME_MAXIMUM_POINTS, clientPoints: 1});

		updateProfilesOnGameFinished(Games.findOne({_id: gameId}), Profiles.findOne({_id: hostProfileId}), Profiles.findOne({_id: clientProfileId}));

		let hostProfile = Profiles.findOne({_id: hostProfileId});
		assert.isObject(hostProfile);
		assert.propertyVal(hostProfile, 'numberOfShutouts', 0);
		assert.propertyVal(hostProfile, 'numberOfShutoutLosses', 0);

		let clientProfile = Profiles.findOne({_id: clientProfileId});
		assert.isObject(clientProfile);
		assert.propertyVal(clientProfile, 'numberOfShutouts', 0);
		assert.propertyVal(clientProfile, 'numberOfShutoutLosses', 0);

		/**
		 * 1-5
		 */
		gameId = Random.id(5);
		Players.insert({gameId: gameId, userId: clientUserId});
		Games.insert({_id: gameId, status: GAME_STATUS_FINISHED, hostPoints: 1, clientPoints: GAME_MAXIMUM_POINTS});

		updateProfilesOnGameFinished(Games.findOne({_id: gameId}), Profiles.findOne({_id: clientProfileId}), Profiles.findOne({_id: hostProfileId}));

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
		Players.insert({gameId: gameId, userId: clientUserId});
		Games.insert({_id: gameId, status: GAME_STATUS_FINISHED, hostPoints: GAME_MAXIMUM_POINTS, clientPoints: 0});

		updateProfilesOnGameFinished(Games.findOne({_id: gameId}), Profiles.findOne({_id: hostProfileId}), Profiles.findOne({_id: clientProfileId}));

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
		Players.insert({gameId: gameId, userId: clientUserId});
		Games.insert({_id: gameId, status: GAME_STATUS_FINISHED, hostPoints: 0, clientPoints: GAME_MAXIMUM_POINTS});

		updateProfilesOnGameFinished(Games.findOne({_id: gameId}), Profiles.findOne({_id: clientProfileId}), Profiles.findOne({_id: hostProfileId}));

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

describe('lib/server/gameProfileUpdate#getEloScore', function() {
	it('returns correct scores depending on the previous eloRating', function() {
		assert.equal('0.5000', getEloScore(1000, 1000).toFixed(4));
		assert.equal('0.4712', getEloScore(990, 1010).toFixed(4));
		assert.equal('0.6401', getEloScore(1100, 1000).toFixed(4));
		assert.equal('0.5144', getEloScore(1000, 990).toFixed(4));
		assert.equal('0.5516', getEloScore(1200, 1164).toFixed(4));
		assert.equal('0.9919', getEloScore(1469, 634).toFixed(4));
	});
});

describe('lib/server/gameProfileUpdate#getEloRating', function() {
	it('returns correct rating depending on the score and who wins', function() {
		let eloRating;
		let eloScore;

		eloRating = 1000;
		eloScore = getEloScore(eloRating, 1000);
		assert.equal(1016, getEloRating(eloRating, eloScore, 1)); //+16
		assert.equal(984, getEloRating(eloRating, eloScore, 0)); //-16

		eloRating = 990;
		eloScore = getEloScore(eloRating, 1010);
		assert.equal(1007, getEloRating(eloRating, eloScore, 1)); //+17
		assert.equal(975, getEloRating(eloRating, eloScore, 0)); //-15

		eloRating = 1100;
		eloScore = getEloScore(eloRating, 1000);
		assert.equal(1112, getEloRating(eloRating, eloScore, 1)); //+12
		assert.equal(1080, getEloRating(eloRating, eloScore, 0)); //-20

		eloRating = 1000;
		eloScore = getEloScore(eloRating, 990);
		assert.equal(1016, getEloRating(eloRating, eloScore, 1)); //+16
		assert.equal(984, getEloRating(eloRating, eloScore, 0)); //-16

		eloRating = 1200;
		eloScore = getEloScore(eloRating, 1164);
		assert.equal(1214, getEloRating(eloRating, eloScore, 1)); //+14
		assert.equal(1182, getEloRating(eloRating, eloScore, 0)); //-18

		eloRating = 1469;
		eloScore = getEloScore(eloRating, 634);
		assert.equal(1469, getEloRating(eloRating, eloScore, 1)); //+0
		assert.equal(1437, getEloRating(eloRating, eloScore, 0)); //-32
	});
});
