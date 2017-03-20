import {chai} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Random} from 'meteor/random';
import GameData from '/imports/game/client/GameData.js';
import GameStreamBundler from '/imports/game/client/GameStreamBundler.js';
import ServerNormalizedTime from '/imports/game/client/ServerNormalizedTime.js';
import PhaserEngine from '/imports/game/engine/client/PhaserEngine.js';
import Game from '/imports/game/client/Game.js';
import GameBonus from '/imports/game/client/GameBonus.js';
import BaseBonus from '/imports/game/bonus/BaseBonus.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

describe('GameBonus#getBonusSpriteFromIdentifier', function() {
	const gameId = Random.id(5);
	const engine = new PhaserEngine();
	const gameData = new GameData(gameId);
	const gameStreamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const game = new Game(gameId, engine, gameData, gameStreamBundler, serverNormalizedTime);

	it('returns null if the bonusIdentifier matches nothing', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameStreamBundler, serverNormalizedTime);

		gameBonus.bonuses = [
			{identifier: 'a'},
			{identifier: 'b'},
			{identifier: 'c'}
		];

		let bonus = gameBonus.getBonusSpriteFromIdentifier('d');

		chai.assert.isNull(bonus);
	});

	it('returns the matching bonus', function() {
		const game = new GameBonus(game, engine, gameData, gameStreamBundler, serverNormalizedTime);
		const bBonus = {identifier: 'b'};

		game.bonuses = [
			{identifier: 'a'},
			bBonus,
			{identifier: 'c'}
		];

		let bonus = game.getBonusSpriteFromIdentifier('b');

		chai.assert.equal(bBonus, bonus);
	});
});

describe('GameBonus#createBonusIfTimeHasElapsed', function() {
	const gameId = Random.id(5);
	const engine = new PhaserEngine();
	const gameData = new GameData(gameId);
	const gameStreamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const game = new Game(gameId, engine, gameData, gameStreamBundler, serverNormalizedTime);

	sinon.stub(game, 'collidesWithNetHitDelimiter', function() {});
	sinon.stub(game, 'collidesWithGroundHitDelimiter', function() {});
	sinon.stub(game, 'collidesWithBall', function() {});

	sinon.stub(engine, 'addBonus', function() {return new BaseBonus();});
	sinon.stub(engine, 'collidesWith', function() {});

	beforeEach(function() {
		gameStreamBundler.resetBundledStreams();
	});

	it('creates bonus if time has elapsed', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameStreamBundler, serverNormalizedTime);
		const timestamp = getUTCTimeStamp();

		gameBonus.bonusFrequenceTime = 5000;
		gameBonus.lastGameRespawn = timestamp - 8000;

		//Create spies
		let createBonusSpy = sinon.spy(gameBonus, 'createBonus');
		let regenerateLastBonusCreatedAndFrequenceTimeSpy = sinon.spy(gameBonus, 'regenerateLastBonusCreatedAndFrequenceTime');

		gameBonus.createBonusIfTimeHasElapsed();

		chai.assert.isTrue(createBonusSpy.calledOnce);
		chai.assert.isTrue(regenerateLastBonusCreatedAndFrequenceTimeSpy.calledOnce);
		chai.assert.property(gameStreamBundler.bundledStreamsToEmit, 'createBonus');
	});

	it('does not create bonus if time has not elapsed', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameStreamBundler, serverNormalizedTime);
		const timestamp = getUTCTimeStamp();

		gameBonus.bonusFrequenceTime = 5000;
		gameBonus.lastBonusCreated = timestamp;
		gameBonus.lastGameRespawn = timestamp;

		//Create spies
		let createBonusSpy = sinon.spy(gameBonus, 'createBonus');
		let regenerateLastBonusCreatedAndFrequenceTimeSpy = sinon.spy(gameBonus, 'regenerateLastBonusCreatedAndFrequenceTime');

		gameBonus.createBonusIfTimeHasElapsed();

		sinon.assert.notCalled(createBonusSpy);
		sinon.assert.notCalled(regenerateLastBonusCreatedAndFrequenceTimeSpy);
		chai.assert.notProperty(gameStreamBundler.bundledStreamsToEmit, 'createBonus');
	});

	it('does not create bonus if time is too short since last creation depending on bonusMinimumFrequence', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameStreamBundler, serverNormalizedTime);
		const timestamp = getUTCTimeStamp();

		gameBonus.bonusFrequenceTime = 0;
		gameBonus.lastBonusCreated = timestamp - 1;
		gameBonus.lastGameRespawn = timestamp - 1;

		//Create spies
		let createBonusSpy = sinon.spy(gameBonus, 'createBonus');
		let regenerateLastBonusCreatedAndFrequenceTimeSpy = sinon.spy(gameBonus, 'regenerateLastBonusCreatedAndFrequenceTime');

		gameBonus.createBonusIfTimeHasElapsed();

		sinon.assert.notCalled(createBonusSpy);
		sinon.assert.notCalled(regenerateLastBonusCreatedAndFrequenceTimeSpy);
		chai.assert.notProperty(gameStreamBundler.bundledStreamsToEmit, 'createBonus');
	});
});

describe('GameBonus#removeBonusSprite', function() {
	const gameId = Random.id(5);
	const engine = new PhaserEngine();
	const gameData = new GameData(gameId);
	const gameStreamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const game = new Game(gameId, engine, gameData, gameStreamBundler, serverNormalizedTime);

	it ('removes and destroys the matching bonusIdentifier bonus from bonuses', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameStreamBundler, serverNormalizedTime);
		const aBonus = {identifier: 'a', destroy: function() {}};
		const bBonus = {identifier: 'b', destroy: function() {}};
		const cBonus = {identifier: 'c', destroy: function() {}};

		gameBonus.bonuses = [
			aBonus,
			bBonus,
			cBonus
		];

		let aSpy = sinon.spy(aBonus, 'destroy');
		let bSpy = sinon.spy(bBonus, 'destroy');
		let cSpy = sinon.spy(cBonus, 'destroy');

		gameBonus.removeBonusSprite('b');

		sinon.assert.notCalled(aSpy);
		sinon.assert.calledOnce(bSpy);
		sinon.assert.notCalled(cSpy);

		chai.assert.lengthOf(gameBonus.bonuses, 2);
		chai.assert.equal(gameBonus.bonuses[0], aBonus);
		chai.assert.equal(gameBonus.bonuses[1], cBonus);
	});

	it ('does not remove anything if nothing matches the bonusIdentifier in bonuses', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameStreamBundler, serverNormalizedTime);
		const aBonus = {identifier: 'a', destroy: function() {}};
		const bBonus = {identifier: 'b', destroy: function() {}};
		const cBonus = {identifier: 'c', destroy: function() {}};

		gameBonus.bonuses = [
			aBonus,
			bBonus,
			cBonus
		];

		let aSpy = sinon.spy(aBonus, 'destroy');
		let bSpy = sinon.spy(bBonus, 'destroy');
		let cSpy = sinon.spy(cBonus, 'destroy');

		gameBonus.removeBonusSprite('d');

		sinon.assert.notCalled(aSpy);
		sinon.assert.notCalled(bSpy);
		sinon.assert.notCalled(cSpy);

		chai.assert.lengthOf(gameBonus.bonuses, 3);
		chai.assert.equal(gameBonus.bonuses[0], aBonus);
		chai.assert.equal(gameBonus.bonuses[1], bBonus);
		chai.assert.equal(gameBonus.bonuses[2], cBonus);
	});
});

describe('GameBonus#setPlayerGravity', function() {
	const gameId = Random.id(5);
	const engine = new PhaserEngine();
	const gameData = new GameData(gameId);
	const gameStreamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const game = new Game(gameId, engine, gameData, gameStreamBundler, serverNormalizedTime);

	it('sets gravity if player is not frozen', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameStreamBundler, serverNormalizedTime);
		const gravity = 2;

		game.player1 = {
			isFrozen: false,
			body: {
				data: {
					gravityScale: 1
				}
			}
		};

		gameBonus.setPlayerGravity('player1', gravity);

		chai.assert.equal(gravity, game.player1.body.data.gravityScale);
	});

	it('does not set gravity if player is frozen', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameStreamBundler, serverNormalizedTime);
		const initialGravity = 1;
		const gravity = 2;

		game.player1 = {
			isFrozen: true,
			body: {
				data: {
					gravityScale: initialGravity
				}
			}
		};

		gameBonus.setPlayerGravity('player1', gravity);

		chai.assert.equal(initialGravity, game.player1.body.data.gravityScale);
	});
});

describe('GameBonus#resetPlayerGravity', function() {
	const gameId = Random.id(5);
	const engine = new PhaserEngine();
	const gameData = new GameData(gameId);
	const gameStreamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const game = new Game(gameId, engine, gameData, gameStreamBundler, serverNormalizedTime);

	it('resets gravity if player is frozen', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameStreamBundler, serverNormalizedTime);
		const initialGravity = 1;
		const actualGravity = 2;

		game.player1 = {
			isFrozen: false,
			initialGravity: initialGravity,
			body: {
				data: {
					gravityScale: actualGravity
				}
			}
		};

		gameBonus.resetPlayerGravity('player1');

		chai.assert.equal(initialGravity, game.player1.body.data.gravityScale);
	});

	it('does not reset gravity if player is frozen', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameStreamBundler, serverNormalizedTime);
		const initialGravity = 1;
		const actualGravity = 2;

		game.player1 = {
			isFrozen: true,
			initialGravity: initialGravity,
			body: {
				data: {
					gravityScale: actualGravity
				}
			}
		};

		gameBonus.resetPlayerGravity('player1');

		chai.assert.equal(actualGravity, game.player1.body.data.gravityScale);
	});
});

describe('GameBonus#unFreezePlayer', function() {
	const gameId = Random.id(5);
	const engine = new PhaserEngine();
	const gameData = new GameData(gameId);
	const gameStreamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const game = new Game(gameId, engine, gameData, gameStreamBundler, serverNormalizedTime);

	it('restores initial player mass and restores initial player gravity if active gravity is not set', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameStreamBundler, serverNormalizedTime);
		const initialMass = 200;
		const initialGravity = 1;

		game.player1 = {
			initialMass: initialMass,
			initialGravity: initialGravity,
			activeGravity: null,
			body: {
				mass: 0,
				data: {
					gravityScale: 0
				}
			}
		};

		gameBonus.unFreezePlayer('player1');

		chai.assert.equal(initialMass, game.player1.body.mass);
		chai.assert.equal(initialGravity, game.player1.body.data.gravityScale);
	});

	it('restores initial player mass and restores active player gravity if set', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameStreamBundler, serverNormalizedTime);
		const initialMass = 200;
		const initialGravity = 1;
		const activeGravity = 2;

		game.player1 = {
			initialMass: initialMass,
			initialGravity: initialGravity,
			activeGravity: activeGravity,
			body: {
				mass: 0,
				data: {
					gravityScale: 0
				}
			}
		};

		gameBonus.unFreezePlayer('player1');

		chai.assert.equal(initialMass, game.player1.body.mass);
		chai.assert.equal(activeGravity, game.player1.body.data.gravityScale);
	});
});
