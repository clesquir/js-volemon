import { chai } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { EloScores } from '/collections/eloscores.js';
import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Profiles } from '/collections/profiles.js';
import { Constants } from '/lib/constants.js';
import { game } from '/server/lib/game.js';

describe('Game Profile Update', function() {
	it('updateProfilesOnGameFinish throws 404 if game does not exist', function() {
		chai.expect(() => {
			updateProfilesOnGameFinish(Random.id(5));
		}).to.throw('Game not found');
	});

	it('updateProfilesOnGameFinish throws not-allowed if game status is not finished', function() {
		let gameId = Random.id(5);
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_STARTED});

		chai.expect(() => {
			updateProfilesOnGameFinish(gameId);
		}).to.throw('Only finished games can be used for Elo calculations');
	});

	it('updateProfilesOnGameFinish updates Profiles and inserts EloScores', function() {
		var gameId = Random.id(5),
			hostProfileId = Random.id(5),
			createdByUserId = 1,
			clientProfileId = Random.id(5),
			notCreatedByUserId = 2;

		resetDatabase();

		Profiles.insert({
			_id: hostProfileId,
			userId: createdByUserId,
			numberOfWin: 0,
			numberOfLost: 0,
			eloRating: 1000,
			eloRatingLastChange: null
		});
		Profiles.insert({
			_id: clientProfileId,
			userId: notCreatedByUserId,
			numberOfWin: 0,
			numberOfLost: 0,
			eloRating: 1000,
			eloRatingLastChange: null
		});
		Players.insert({gameId: gameId, userId: notCreatedByUserId});
		Games.insert({_id: gameId, createdBy: createdByUserId, status: Constants.GAME_STATUS_FINISHED});

		updateProfilesOnGameFinish(gameId, Constants.HOST_POINTS_COLUMN);

		let hostProfile = Profiles.findOne({_id: hostProfileId});
		console.log(hostProfile);
		chai.assert.isObject(hostProfile);
		chai.assert.propertyVal(hostProfile, 'numberOfWin', 1);
		chai.assert.propertyVal(hostProfile, 'numberOfLost', 0);
		chai.assert.propertyVal(hostProfile, 'eloRating', 1016);
		chai.assert.propertyVal(hostProfile, 'eloRatingLastChange', 16);

		let clientProfile = Profiles.findOne({_id: clientProfileId});
		chai.assert.isObject(clientProfile);
		chai.assert.propertyVal(clientProfile, 'numberOfWin', 0);
		chai.assert.propertyVal(clientProfile, 'numberOfLost', 1);
		chai.assert.propertyVal(clientProfile, 'eloRating', 984);
		chai.assert.propertyVal(clientProfile, 'eloRatingLastChange', -16);

		let eloScoresHost = EloScores.findOne({userId: createdByUserId});
		chai.assert.isObject(eloScoresHost);
		chai.assert.propertyVal(eloScoresHost, 'eloRating', 1016);

		let eloScoresClient = EloScores.findOne({userId: notCreatedByUserId});
		chai.assert.isObject(eloScoresClient);
		chai.assert.propertyVal(eloScoresClient, 'eloRating', 984);
	});

	it('getEloScore', function() {
		chai.assert.equal('0.5000', getEloScore(1000, 1000).toFixed(4));
		chai.assert.equal('0.4712', getEloScore(990, 1010).toFixed(4));
		chai.assert.equal('0.6401', getEloScore(1100, 1000).toFixed(4));
		chai.assert.equal('0.5144', getEloScore(1000, 990).toFixed(4));
		chai.assert.equal('0.5516', getEloScore(1200, 1164).toFixed(4));
		chai.assert.equal('0.9919', getEloScore(1469, 634).toFixed(4));
	});

	it('getEloRating', function() {
		var eloScore, eloRating;

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
