import {Random} from 'meteor/random';
import {chai} from 'meteor/practicalmeteor:chai';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {
	onGameFinished,
	updateProfilesOnGameFinished,
	updateEloScoresOnGameFinished,
	getEloScore,
	getEloRating
} from '/imports/api/games/server/onGameFinished.js';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {Constants} from '/imports/lib/constants.js';

describe('onGameFinished', function() {
	it('throws 404 if game does not exist', function() {
		chai.expect(() => {
			onGameFinished(Random.id(5));
		}).to.throw('Game not found');
	});

	it('throws not-allowed if game status is not finished', function() {
		const gameId = Random.id(5);
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_STARTED});

		chai.expect(() => {
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
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_FINISHED});

		updateEloScoresOnGameFinished(Games.findOne({_id: gameId}), Profiles.findOne({_id: hostProfileId}), Profiles.findOne({_id: clientProfileId}));

		let hostProfile = Profiles.findOne({_id: hostProfileId});
		chai.assert.isObject(hostProfile);
		chai.assert.propertyVal(hostProfile, 'eloRating', 1016);
		chai.assert.propertyVal(hostProfile, 'eloRatingLastChange', 16);

		let clientProfile = Profiles.findOne({_id: clientProfileId});
		chai.assert.isObject(clientProfile);
		chai.assert.propertyVal(clientProfile, 'eloRating', 984);
		chai.assert.propertyVal(clientProfile, 'eloRatingLastChange', -16);

		let eloScoresHost = EloScores.findOne({userId: hostUserId});
		chai.assert.isObject(eloScoresHost);
		chai.assert.propertyVal(eloScoresHost, 'eloRating', 1016);

		let eloScoresClient = EloScores.findOne({userId: clientUserId});
		chai.assert.isObject(eloScoresClient);
		chai.assert.propertyVal(eloScoresClient, 'eloRating', 984);
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
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_FINISHED});

		updateProfilesOnGameFinished(Games.findOne({_id: gameId}), Profiles.findOne({_id: hostProfileId}), Profiles.findOne({_id: clientProfileId}));

		let hostProfile = Profiles.findOne({_id: hostProfileId});
		chai.assert.isObject(hostProfile);
		chai.assert.propertyVal(hostProfile, 'numberOfWin', 1);
		chai.assert.propertyVal(hostProfile, 'numberOfLost', 0);

		let clientProfile = Profiles.findOne({_id: clientProfileId});
		chai.assert.isObject(clientProfile);
		chai.assert.propertyVal(clientProfile, 'numberOfWin', 0);
		chai.assert.propertyVal(clientProfile, 'numberOfLost', 1);

		updateProfilesOnGameFinished(Games.findOne({_id: gameId}), Profiles.findOne({_id: clientProfileId}), Profiles.findOne({_id: hostProfileId}));

		hostProfile = Profiles.findOne({_id: hostProfileId});
		chai.assert.isObject(hostProfile);
		chai.assert.propertyVal(hostProfile, 'numberOfWin', 1);
		chai.assert.propertyVal(hostProfile, 'numberOfLost', 1);

		clientProfile = Profiles.findOne({_id: clientProfileId});
		chai.assert.isObject(clientProfile);
		chai.assert.propertyVal(clientProfile, 'numberOfWin', 1);
		chai.assert.propertyVal(clientProfile, 'numberOfLost', 1);

		updateProfilesOnGameFinished(Games.findOne({_id: gameId}), Profiles.findOne({_id: hostProfileId}), Profiles.findOne({_id: clientProfileId}));

		hostProfile = Profiles.findOne({_id: hostProfileId});
		chai.assert.isObject(hostProfile);
		chai.assert.propertyVal(hostProfile, 'numberOfWin', 2);
		chai.assert.propertyVal(hostProfile, 'numberOfLost', 1);

		clientProfile = Profiles.findOne({_id: clientProfileId});
		chai.assert.isObject(clientProfile);
		chai.assert.propertyVal(clientProfile, 'numberOfWin', 1);
		chai.assert.propertyVal(clientProfile, 'numberOfLost', 2);
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
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_FINISHED, hostPoints: 5, clientPoints: 1});

		updateProfilesOnGameFinished(Games.findOne({_id: gameId}), Profiles.findOne({_id: hostProfileId}), Profiles.findOne({_id: clientProfileId}));

		let hostProfile = Profiles.findOne({_id: hostProfileId});
		chai.assert.isObject(hostProfile);
		chai.assert.propertyVal(hostProfile, 'numberOfShutouts', 0);
		chai.assert.propertyVal(hostProfile, 'numberOfShutoutLosses', 0);

		let clientProfile = Profiles.findOne({_id: clientProfileId});
		chai.assert.isObject(clientProfile);
		chai.assert.propertyVal(clientProfile, 'numberOfShutouts', 0);
		chai.assert.propertyVal(clientProfile, 'numberOfShutoutLosses', 0);

		/**
		 * 1-5
		 */
		gameId = Random.id(5);
		Players.insert({gameId: gameId, userId: clientUserId});
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_FINISHED, hostPoints: 1, clientPoints: 5});

		updateProfilesOnGameFinished(Games.findOne({_id: gameId}), Profiles.findOne({_id: clientProfileId}), Profiles.findOne({_id: hostProfileId}));

		hostProfile = Profiles.findOne({_id: hostProfileId});
		chai.assert.isObject(hostProfile);
		chai.assert.propertyVal(hostProfile, 'numberOfShutouts', 0);
		chai.assert.propertyVal(hostProfile, 'numberOfShutoutLosses', 0);

		clientProfile = Profiles.findOne({_id: clientProfileId});
		chai.assert.isObject(clientProfile);
		chai.assert.propertyVal(clientProfile, 'numberOfShutouts', 0);
		chai.assert.propertyVal(clientProfile, 'numberOfShutoutLosses', 0);

		/**
		 * 5-0
		 */
		gameId = Random.id(5);
		Players.insert({gameId: gameId, userId: clientUserId});
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_FINISHED, hostPoints: 5, clientPoints: 0});

		updateProfilesOnGameFinished(Games.findOne({_id: gameId}), Profiles.findOne({_id: hostProfileId}), Profiles.findOne({_id: clientProfileId}));

		hostProfile = Profiles.findOne({_id: hostProfileId});
		chai.assert.isObject(hostProfile);
		chai.assert.propertyVal(hostProfile, 'numberOfShutouts', 1);
		chai.assert.propertyVal(hostProfile, 'numberOfShutoutLosses', 0);

		clientProfile = Profiles.findOne({_id: clientProfileId});
		chai.assert.isObject(clientProfile);
		chai.assert.propertyVal(clientProfile, 'numberOfShutouts', 0);
		chai.assert.propertyVal(clientProfile, 'numberOfShutoutLosses', 1);

		/**
		 * 0-5
		 */
		gameId = Random.id(5);
		Players.insert({gameId: gameId, userId: clientUserId});
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_FINISHED, hostPoints: 0, clientPoints: 5});

		updateProfilesOnGameFinished(Games.findOne({_id: gameId}), Profiles.findOne({_id: clientProfileId}), Profiles.findOne({_id: hostProfileId}));

		hostProfile = Profiles.findOne({_id: hostProfileId});
		chai.assert.isObject(hostProfile);
		chai.assert.propertyVal(hostProfile, 'numberOfShutouts', 1);
		chai.assert.propertyVal(hostProfile, 'numberOfShutoutLosses', 1);

		clientProfile = Profiles.findOne({_id: clientProfileId});
		chai.assert.isObject(clientProfile);
		chai.assert.propertyVal(clientProfile, 'numberOfShutouts', 1);
		chai.assert.propertyVal(clientProfile, 'numberOfShutoutLosses', 1);
	});
});

describe('lib/server/gameProfileUpdate#getEloScore', function() {
	it('returns correct scores depending on the previous eloRating', function() {
		chai.assert.equal('0.5000', getEloScore(1000, 1000).toFixed(4));
		chai.assert.equal('0.4712', getEloScore(990, 1010).toFixed(4));
		chai.assert.equal('0.6401', getEloScore(1100, 1000).toFixed(4));
		chai.assert.equal('0.5144', getEloScore(1000, 990).toFixed(4));
		chai.assert.equal('0.5516', getEloScore(1200, 1164).toFixed(4));
		chai.assert.equal('0.9919', getEloScore(1469, 634).toFixed(4));
	});
});

describe('lib/server/gameProfileUpdate#getEloRating', function() {
	it('returns correct rating depending on the score and who wins', function() {
		let eloRating;
		let eloScore;

		eloRating = 1000;
		eloScore = getEloScore(eloRating, 1000);
		chai.assert.equal(1016, getEloRating(eloRating, eloScore, 1)); //+16
		chai.assert.equal(984, getEloRating(eloRating, eloScore, 0)); //-16

		eloRating = 990;
		eloScore = getEloScore(eloRating, 1010);
		chai.assert.equal(1007, getEloRating(eloRating, eloScore, 1)); //+17
		chai.assert.equal(975, getEloRating(eloRating, eloScore, 0)); //-15

		eloRating = 1100;
		eloScore = getEloScore(eloRating, 1000);
		chai.assert.equal(1112, getEloRating(eloRating, eloScore, 1)); //+12
		chai.assert.equal(1080, getEloRating(eloRating, eloScore, 0)); //-20

		eloRating = 1000;
		eloScore = getEloScore(eloRating, 990);
		chai.assert.equal(1016, getEloRating(eloRating, eloScore, 1)); //+16
		chai.assert.equal(984, getEloRating(eloRating, eloScore, 0)); //-16

		eloRating = 1200;
		eloScore = getEloScore(eloRating, 1164);
		chai.assert.equal(1214, getEloRating(eloRating, eloScore, 1)); //+14
		chai.assert.equal(1182, getEloRating(eloRating, eloScore, 0)); //-18

		eloRating = 1469;
		eloScore = getEloScore(eloRating, 634);
		chai.assert.equal(1469, getEloRating(eloRating, eloScore, 1)); //+0
		chai.assert.equal(1437, getEloRating(eloRating, eloScore, 0)); //-32
	});
});
