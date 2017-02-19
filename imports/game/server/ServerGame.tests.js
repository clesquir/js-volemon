import { chai } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import BaseBonus from '/imports/game/bonus/BaseBonus.js';
import ServerGame from '/imports/game/server/ServerGame.js';
import { ServerStream } from '/imports/lib/streams.js';
import { getUTCTimeStamp } from '/imports/lib/utils.js';

describe('Game#createBonusIfTimeHasElapsed', function() {
	beforeEach(function(){
		if (ServerStream.emit.restore) {
			ServerStream.emit.restore();
		}
	});

	it('creates bonus if time has elapsed', function() {
		var gameId = Random.id(5);
		var game = new ServerGame(gameId);
		var timestamp = getUTCTimeStamp();

		game.bonusFrequenceTime = 5000;
		game.lastGameRespawn = timestamp - 8000;

		game.engine = {
			addBonus: function() {
				return new BaseBonus();
			},
			collidesWith: function() {
			}
		};

		//Create spies
		let createBonusSpy = sinon.spy(game, 'createBonus');
		let regenerateLastBonusCreatedAndFrequenceTimeSpy = sinon.spy(game, 'regenerateLastBonusCreatedAndFrequenceTime');

		game.createBonusIfTimeHasElapsed();

		chai.assert.isTrue(createBonusSpy.calledOnce);
		chai.assert.isTrue(regenerateLastBonusCreatedAndFrequenceTimeSpy.calledOnce);
		chai.assert.property(game.bundledStreamsToEmit, 'createBonus');
	});

	it('does not create bonus if time has not elapsed', function() {
		var gameId = Random.id(5);
		var game = new ServerGame(gameId);
		var timestamp = getUTCTimeStamp();

		game.bonusFrequenceTime = 5000;
		game.lastBonusCreated = timestamp;
		game.lastGameRespawn = timestamp;

		game.engine = {
			addBonus: function() {
				return new BaseBonus();
			},
			collidesWith: function() {
			}
		};

		//Create spies
		let createBonusSpy = sinon.spy(game, 'createBonus');
		let regenerateLastBonusCreatedAndFrequenceTimeSpy = sinon.spy(game, 'regenerateLastBonusCreatedAndFrequenceTime');

		game.createBonusIfTimeHasElapsed();

		sinon.assert.notCalled(createBonusSpy);
		sinon.assert.notCalled(regenerateLastBonusCreatedAndFrequenceTimeSpy);
		chai.assert.notProperty(game.bundledStreamsToEmit, 'createBonus');
	});

	it('does not create bonus if time is too short since last creation depending on bonusMinimumFrequence', function() {
		var gameId = Random.id(5);
		var game = new ServerGame(gameId);
		var timestamp = getUTCTimeStamp();

		game.bonusFrequenceTime = 0;
		game.lastBonusCreated = timestamp - 1;
		game.lastGameRespawn = timestamp - 1;

		game.engine = {
			addBonus: function() {
				return new BaseBonus();
			},
			collidesWith: function() {
			}
		};

		//Create spies
		let createBonusSpy = sinon.spy(game, 'createBonus');
		let regenerateLastBonusCreatedAndFrequenceTimeSpy = sinon.spy(game, 'regenerateLastBonusCreatedAndFrequenceTime');

		game.createBonusIfTimeHasElapsed();

		sinon.assert.notCalled(createBonusSpy);
		sinon.assert.notCalled(regenerateLastBonusCreatedAndFrequenceTimeSpy);
		chai.assert.notProperty(game.bundledStreamsToEmit, 'createBonus');
	});
});
