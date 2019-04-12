import {TestGameBoot} from '/imports/api/games/client/boot/TestGameBoot';
import SkinManager from '/imports/api/games/client/component/SkinManager';
import NullServerAdapter from '/imports/api/games/client/serverAdapter/NullServerAdapter';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime';
import CountStreamBundler from '/imports/api/games/client/streamBundler/CountStreamBundler';
import StaticGameConfiguration from '/imports/api/games/configuration/StaticGameConfiguration';
import StaticGameData from '/imports/api/games/data/StaticGameData';
import NullDeviceController from '/imports/api/games/deviceController/NullDeviceController';
import {assert} from 'chai';

describe('Bonuses#createBonusIfTimeHasElapsed', function() {
	const deviceController = new NullDeviceController();
	const gameConfiguration = new StaticGameConfiguration();
	const gameData = new StaticGameData();
	gameData.hasBonuses = true;
	const streamBundler = new CountStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const skinManager = SkinManager.withDefaults(gameConfiguration);
	const serverAdapter = new NullServerAdapter();

	const gameBoot = new TestGameBoot(
		deviceController,
		gameData,
		gameConfiguration,
		skinManager,
		streamBundler,
		serverNormalizedTime,
		serverAdapter
	);
	gameBoot.init();

	before(function() {
		gameBoot.warmUpCache();
		gameBoot.gameBoot.mainScene.level.createComponentsPrerequisites();
	});

	it('creates bonus if time has elapsed', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.gameResumed = true;
		const bonuses = mainScene.bonuses;

		bonuses.reset();
		bonuses.bonusFrequenceTime = 5000;
		bonuses.lastBonusCreated = 0;
		bonuses.lastGameRespawn = Date.now() - 8000;
		streamBundler.resetBundledStreams();

		bonuses.update();

		assert.equal(2, streamBundler.addedCount);
	});

	it('does not create bonus if time has not elapsed', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.gameResumed = true;
		const bonuses = mainScene.bonuses;

		bonuses.reset();
		const now = Date.now();
		bonuses.bonusFrequenceTime = 5000;
		bonuses.lastBonusCreated = now;
		bonuses.lastGameRespawn = now;
		streamBundler.resetBundledStreams();

		bonuses.update();

		assert.equal(0, streamBundler.addedCount);
	});

	it('does not create bonus if time is too short since last creation depending on bonusMinimumFrequence', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.gameResumed = true;
		const bonuses = mainScene.bonuses;

		bonuses.reset();
		const now = Date.now();
		bonuses.bonusFrequenceTime = 0;
		bonuses.lastBonusCreated = now - 1;
		bonuses.lastGameRespawn = now - 1;
		streamBundler.resetBundledStreams();

		bonuses.update();

		assert.equal(0, streamBundler.addedCount);
	});
});
