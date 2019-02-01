import NullStreamBundler from '/imports/api/games/client/streamBundler/NullStreamBundler';
import {assert} from 'chai';
import {Random} from 'meteor/random';

describe('Bonuses#createBonusIfTimeHasElapsed', function() {
	const streamBundler = new NullStreamBundler();

	beforeEach(function() {
		streamBundler.resetBundledStreams();
	});

	it('creates bonus if time has elapsed', function() {
		// const gameBonus = new Bonuses(game, engine, gameData, gameConfiguration, streamBundler, serverNormalizedTime);
		// const timestamp = getUTCTimeStamp();
		//
		// gameBonus.bonusFrequenceTime = 5000;
		// gameBonus.lastGameRespawn = timestamp - 8000;
		//
		// //Create spies
		// let createBonusSpy = sinon.spy(gameBonus, 'createBonus');
		// let regenerateLastBonusCreatedAndFrequenceTimeSpy = sinon.spy(gameBonus, 'regenerateLastBonusCreatedAndFrequenceTime');
		//
		// gameBonus.createBonusIfTimeHasElapsed();
		//
		// assert.isTrue(createBonusSpy.calledOnce);
		// assert.isTrue(regenerateLastBonusCreatedAndFrequenceTimeSpy.calledOnce);
		// assert.property(streamBundler.bundledStreamsToEmit, 'createBonus');
	});

	it('does not create bonus if time has not elapsed', function() {
		// const gameBonus = new Bonuses(game, engine, gameData, gameConfiguration, streamBundler, serverNormalizedTime);
		// const timestamp = getUTCTimeStamp();
		//
		// gameBonus.bonusFrequenceTime = 5000;
		// gameBonus.lastBonusCreated = timestamp;
		// gameBonus.lastGameRespawn = timestamp;
		//
		// //Create spies
		// let createBonusSpy = sinon.spy(gameBonus, 'createBonus');
		// let regenerateLastBonusCreatedAndFrequenceTimeSpy = sinon.spy(gameBonus, 'regenerateLastBonusCreatedAndFrequenceTime');
		//
		// gameBonus.createBonusIfTimeHasElapsed();
		//
		// sinon.assert.notCalled(createBonusSpy);
		// sinon.assert.notCalled(regenerateLastBonusCreatedAndFrequenceTimeSpy);
		// assert.notProperty(streamBundler.bundledStreamsToEmit, 'createBonus');
	});

	it('does not create bonus if time is too short since last creation depending on bonusMinimumFrequence', function() {
		// const gameBonus = new Bonuses(game, engine, gameData, gameConfiguration, streamBundler, serverNormalizedTime);
		// const timestamp = getUTCTimeStamp();
		//
		// gameBonus.bonusFrequenceTime = 0;
		// gameBonus.lastBonusCreated = timestamp - 1;
		// gameBonus.lastGameRespawn = timestamp - 1;
		//
		// //Create spies
		// let createBonusSpy = sinon.spy(gameBonus, 'createBonus');
		// let regenerateLastBonusCreatedAndFrequenceTimeSpy = sinon.spy(gameBonus, 'regenerateLastBonusCreatedAndFrequenceTime');
		//
		// gameBonus.createBonusIfTimeHasElapsed();
		//
		// sinon.assert.notCalled(createBonusSpy);
		// sinon.assert.notCalled(regenerateLastBonusCreatedAndFrequenceTimeSpy);
		// assert.notProperty(streamBundler.bundledStreamsToEmit, 'createBonus');
	});
});
