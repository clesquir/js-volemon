import {assert} from 'chai';
import sinon from 'sinon';
import {Random} from 'meteor/random';
import StaticGameConfiguration from '/imports/api/games/client/configuration/StaticGameConfiguration.js';
import GameData from '/imports/api/games/client/data/GameData.js';
import NullDeviceController from '/imports/api/games/client/deviceController/NullDeviceController.js';
import GameSkin from '/imports/api/games/client/skin/GameSkin.js';
import GameStreamBundler from '/imports/api/games/client/GameStreamBundler.js';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime.js';
import PhaserEngine from '/imports/api/games/engine/client/PhaserEngine.js';
import Game from '/imports/api/games/client/Game.js';
import GameBonus from './GameBonus.js';
import {PLAYER_FROZEN_MASS} from '/imports/api/games/constants.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';
import DefaultSkin from '/imports/api/skins/skins/DefaultSkin.js';

describe('GameBonus#getBonusSpriteFromIdentifier', function() {
	const gameId = Random.id(5);
	const gameData = new GameData(gameId);
	const gameConfiguration = new StaticGameConfiguration(gameId);
	const gameStreamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const engine = new PhaserEngine(gameConfiguration, new NullDeviceController());
	const game = new Game(gameId, engine, gameData, gameConfiguration, new GameSkin(new DefaultSkin()), gameStreamBundler, serverNormalizedTime);

	it('returns null if the bonusIdentifier matches nothing', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameConfiguration, gameStreamBundler, serverNormalizedTime);

		gameBonus.bonuses = [
			{identifier: 'a'},
			{identifier: 'b'},
			{identifier: 'c'}
		];

		let bonus = gameBonus.getBonusSpriteFromIdentifier('d');

		assert.isNull(bonus);
	});

	it('returns the matching bonus', function() {
		const game = new GameBonus(game, engine, gameData, gameConfiguration, gameStreamBundler, serverNormalizedTime);
		const bBonus = {identifier: 'b'};

		game.bonuses = [
			{identifier: 'a'},
			bBonus,
			{identifier: 'c'}
		];

		let bonus = game.getBonusSpriteFromIdentifier('b');

		assert.equal(bBonus, bonus);
	});
});

describe('GameBonus#createBonusIfTimeHasElapsed', function() {
	const gameId = Random.id(5);
	const gameData = new GameData(gameId);
	const gameConfiguration = new StaticGameConfiguration(gameId);
	const gameStreamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const engine = new PhaserEngine(gameConfiguration, new NullDeviceController());
	const game = new Game(gameId, engine, gameData, gameConfiguration, new GameSkin(new DefaultSkin()), gameStreamBundler, serverNormalizedTime);

	sinon.stub(game, 'collidesWithNetHitDelimiter').callsFake(function() {});
	sinon.stub(game, 'collidesWithGroundHitDelimiter').callsFake(function() {});
	sinon.stub(game, 'collidesWithBall').callsFake(function() {});

	sinon.stub(engine, 'addBonus').callsFake(function() {
		return {data: {}};
	});
	sinon.stub(engine, 'collidesWith').callsFake(function() {});

	beforeEach(function() {
		gameStreamBundler.resetBundledStreams();
	});

	it('creates bonus if time has elapsed', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameConfiguration, gameStreamBundler, serverNormalizedTime);
		const timestamp = getUTCTimeStamp();

		gameBonus.bonusFrequenceTime = 5000;
		gameBonus.lastGameRespawn = timestamp - 8000;

		//Create spies
		let createBonusSpy = sinon.spy(gameBonus, 'createBonus');
		let regenerateLastBonusCreatedAndFrequenceTimeSpy = sinon.spy(gameBonus, 'regenerateLastBonusCreatedAndFrequenceTime');

		gameBonus.createBonusIfTimeHasElapsed();

		assert.isTrue(createBonusSpy.calledOnce);
		assert.isTrue(regenerateLastBonusCreatedAndFrequenceTimeSpy.calledOnce);
		assert.property(gameStreamBundler.bundledStreamsToEmit, 'createBonus');
	});

	it('does not create bonus if time has not elapsed', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameConfiguration, gameStreamBundler, serverNormalizedTime);
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
		assert.notProperty(gameStreamBundler.bundledStreamsToEmit, 'createBonus');
	});

	it('does not create bonus if time is too short since last creation depending on bonusMinimumFrequence', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameConfiguration, gameStreamBundler, serverNormalizedTime);
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
		assert.notProperty(gameStreamBundler.bundledStreamsToEmit, 'createBonus');
	});
});

describe('GameBonus#removeBonusSprite', function() {
	const gameId = Random.id(5);
	const gameData = new GameData(gameId);
	const gameConfiguration = new StaticGameConfiguration(gameId);
	const gameStreamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const engine = new PhaserEngine(gameConfiguration, new NullDeviceController());
	const game = new Game(gameId, engine, gameData, gameConfiguration, new GameSkin(new DefaultSkin()), gameStreamBundler, serverNormalizedTime);

	it ('removes and destroys the matching bonusIdentifier bonus from bonuses', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameConfiguration, gameStreamBundler, serverNormalizedTime);
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

		assert.lengthOf(gameBonus.bonuses, 2);
		assert.equal(gameBonus.bonuses[0], aBonus);
		assert.equal(gameBonus.bonuses[1], cBonus);
	});

	it ('does not remove anything if nothing matches the bonusIdentifier in bonuses', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameConfiguration, gameStreamBundler, serverNormalizedTime);
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

		assert.lengthOf(gameBonus.bonuses, 3);
		assert.equal(gameBonus.bonuses[0], aBonus);
		assert.equal(gameBonus.bonuses[1], bBonus);
		assert.equal(gameBonus.bonuses[2], cBonus);
	});
});

describe('GameBonus#setPlayerGravity', function() {
	const gameId = Random.id(5);
	const gameData = new GameData(gameId);
	const gameConfiguration = new StaticGameConfiguration(gameId);
	const gameStreamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const engine = new PhaserEngine(gameConfiguration, new NullDeviceController());
	const game = new Game(gameId, engine, gameData, gameConfiguration, new GameSkin(new DefaultSkin()), gameStreamBundler, serverNormalizedTime);

	it('sets gravity if player is not frozen', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameConfiguration, gameStreamBundler, serverNormalizedTime);
		const initialGravity = 1;
		const currentGravity = 2;
		const gravity = 3;

		game.player1 = {
			loadTexture: () => {},
			data: {
				isFrozen: false,
				initialGravity: initialGravity,
				currentGravity: currentGravity
			},
			body: {
				setZeroRotation: () => {},
				setZeroVelocity: () => {},
				setMaterial: () => {},
				setCollisionGroup: () => {},
				collides: () => {},
				data: {
					gravityScale: currentGravity
				}
			}
		};

		gameBonus.setPlayerGravity('player1', gravity);

		assert.equal(gravity, engine.getGravity(game.player1));
	});

	it('does not set gravity if player is frozen', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameConfiguration, gameStreamBundler, serverNormalizedTime);
		const initialGravity = 1;
		const currentGravity = 2;
		const gravity = 3;

		game.player1 = {
			loadTexture: () => {},
			data: {
				isFrozen: true,
				initialGravity: initialGravity,
				currentGravity: currentGravity
			},
			body: {
				setZeroRotation: () => {},
				setZeroVelocity: () => {},
				setMaterial: () => {},
				setCollisionGroup: () => {},
				collides: () => {},
				data: {
					gravityScale: currentGravity
				}
			}
		};

		gameBonus.setPlayerGravity('player1', gravity);

		assert.equal(0, engine.getGravity(game.player1));
	});
});

describe('GameBonus#resetPlayerGravity', function() {
	const gameId = Random.id(5);
	const gameData = new GameData(gameId);
	const gameConfiguration = new StaticGameConfiguration(gameId);
	const gameStreamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const engine = new PhaserEngine(gameConfiguration, new NullDeviceController());
	const game = new Game(gameId, engine, gameData, gameConfiguration, new GameSkin(new DefaultSkin()), gameStreamBundler, serverNormalizedTime);

	it('resets gravity if player is not frozen', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameConfiguration, gameStreamBundler, serverNormalizedTime);
		const initialGravity = 1;
		const currentGravity = 2;

		game.player1 = {
			loadTexture: () => {},
			data: {
				isFrozen: false,
				initialGravity: initialGravity,
				currentGravity: currentGravity
			},
			body: {
				setZeroRotation: () => {},
				setZeroVelocity: () => {},
				setMaterial: () => {},
				setCollisionGroup: () => {},
				collides: () => {},
				data: {
					gravityScale: currentGravity
				}
			}
		};

		gameBonus.resetPlayerGravity('player1');

		assert.equal(initialGravity, engine.getGravity(game.player1));
	});

	it('does not reset gravity if player is frozen', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameConfiguration, gameStreamBundler, serverNormalizedTime);
		const initialGravity = 1;
		const currentGravity = 2;

		game.player1 = {
			loadTexture: () => {},
			data: {
				isFrozen: true,
				initialGravity: initialGravity,
				currentGravity: currentGravity
			},
			body: {
				setZeroRotation: () => {},
				setZeroVelocity: () => {},
				setMaterial: () => {},
				setCollisionGroup: () => {},
				collides: () => {},
				data: {
					gravityScale: currentGravity
				}
			}
		};

		gameBonus.resetPlayerGravity('player1');

		assert.equal(0, engine.getGravity(game.player1));
	});
});

describe('GameBonus#freezePlayer', function() {
	const gameId = Random.id(5);
	const gameData = new GameData(gameId);
	const gameConfiguration = new StaticGameConfiguration(gameId);
	const gameStreamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const engine = new PhaserEngine(gameConfiguration, new NullDeviceController());
	const game = new Game(gameId, engine, gameData, gameConfiguration, new GameSkin(new DefaultSkin()), gameStreamBundler, serverNormalizedTime);

	it('sets player mass and zeroize gravity on freeze', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameConfiguration, gameStreamBundler, serverNormalizedTime);
		const initialMass = 200;
		const currentMass = 500;
		const initialGravity = 1;
		const currentGravity = 2;

		game.player1 = {
			loadTexture: () => {},
			data: {
				isFrozen: false,
				initialMass: initialMass,
				currentMass: currentMass,
				initialGravity: initialGravity,
				currentGravity: currentGravity
			},
			body: {
				setZeroRotation: () => {},
				setZeroVelocity: () => {},
				setMaterial: () => {},
				setCollisionGroup: () => {},
				collides: () => {},
				mass: currentMass,
				data: {
					gravityScale: currentGravity
				}
			}
		};

		gameBonus.freezePlayer('player1');

		assert.isTrue(engine.getIsFrozen(game.player1));
		assert.equal(PLAYER_FROZEN_MASS, engine.getMass(game.player1));
		assert.equal(0, engine.getGravity(game.player1));
	});
});

describe('GameBonus#unFreezePlayer', function() {
	const gameId = Random.id(5);
	const gameData = new GameData(gameId);
	const gameConfiguration = new StaticGameConfiguration(gameId);
	const gameStreamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const engine = new PhaserEngine(gameConfiguration, new NullDeviceController());
	const game = new Game(gameId, engine, gameData, gameConfiguration, new GameSkin(new DefaultSkin()), gameStreamBundler, serverNormalizedTime);

	it('restores initial player mass and current gravity on unfreeze', function() {
		const gameBonus = new GameBonus(game, engine, gameData, gameConfiguration, gameStreamBundler, serverNormalizedTime);
		const initialMass = 200;
		const currentMass = 500;
		const initialGravity = 1;
		const currentGravity = 2;

		game.player1 = {
			loadTexture: () => {},
			data: {
				isFrozen: true,
				initialMass: initialMass,
				currentMass: currentMass,
				initialGravity: initialGravity,
				currentGravity: currentGravity
			},
			body: {
				setZeroRotation: () => {},
				setZeroVelocity: () => {},
				setMaterial: () => {},
				setCollisionGroup: () => {},
				collides: () => {},
				mass: currentMass,
				data: {
					gravityScale: currentGravity
				}
			}
		};

		gameBonus.unFreezePlayer('player1');

		assert.isFalse(engine.getIsFrozen(game.player1));
		assert.equal(initialMass, engine.getMass(game.player1));
		assert.equal(currentGravity, engine.getGravity(game.player1));
	});
});