import {TestGameBoot} from '/imports/api/games/client/boot/TestGameBoot';
import SkinManager from '/imports/api/games/client/component/SkinManager';
import NullServerAdapter from '/imports/api/games/client/serverAdapter/NullServerAdapter';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime';
import CountStreamBundler from '/imports/api/games/client/streamBundler/CountStreamBundler';
import StaticShapesGameConfiguration from '/imports/api/games/configuration/StaticShapesGameConfiguration';
import StaticGameData from '/imports/api/games/data/StaticGameData';
import NullDeviceController from '/imports/api/games/deviceController/NullDeviceController';
import {assert} from 'chai';
import {Random} from 'meteor/random';
import {BONUS_SHAPE_SHIFT} from '../../bonusConstants';
import ShapeShiftMonsterBonus from '../ShapeShiftMonsterBonus';

describe('ShapeShiftMonsterBonus', function() {
	const deviceController = new NullDeviceController();
	const gameConfiguration = new StaticShapesGameConfiguration();
	const gameData = new StaticGameData();
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

	it('activates a shape different that the initial one', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.gameResumed = true;
		mainScene.createComponents();
		const bonuses = mainScene.bonuses;

		gameConfiguration.setListOfShapes(['a', 'b']);
		mainScene.players.player1.initialShape = 'a';
		mainScene.players.player1.currentShape = 'a';

		const bonus = new ShapeShiftMonsterBonus(BONUS_SHAPE_SHIFT);
		bonus.beforeActivation(bonuses, {player: 'player1'});

		const beforeActivationData = bonus.beforeActivationData();
		assert.propertyVal(beforeActivationData, 'playerShape', 'b');
	});

	it('activates a shape different that the current one and the initial one', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.gameResumed = true;
		mainScene.createComponents();
		const bonuses = mainScene.bonuses;

		gameConfiguration.setListOfShapes(['a', 'b', 'c']);
		mainScene.players.player1.initialShape = 'a';
		mainScene.players.player1.currentShape = 'b';

		const bonus = new ShapeShiftMonsterBonus(BONUS_SHAPE_SHIFT);
		bonus.beforeActivation(bonuses, {player: 'player1'});

		const beforeActivationData = bonus.beforeActivationData();
		assert.propertyVal(beforeActivationData, 'playerShape', 'c');
	});

	it('activates the only shape different that the initial one if there is one', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.gameResumed = true;
		mainScene.createComponents();
		const bonuses = mainScene.bonuses;

		gameConfiguration.setListOfShapes(['a', 'b']);
		mainScene.players.player1.initialShape = 'a';
		mainScene.players.player1.currentShape = 'b';

		const bonus = new ShapeShiftMonsterBonus(BONUS_SHAPE_SHIFT);
		bonus.beforeActivation(bonuses, {player: 'player1'});

		const beforeActivationData = bonus.beforeActivationData();
		assert.propertyVal(beforeActivationData, 'playerShape', 'b');
	});

	it('activates the only shape available even if it is the initial one', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.gameResumed = true;
		mainScene.createComponents();
		const bonuses = mainScene.bonuses;

		gameConfiguration.setListOfShapes(['a']);
		mainScene.players.player1.initialShape = 'a';
		mainScene.players.player1.currentShape = 'a';

		const bonus = new ShapeShiftMonsterBonus(BONUS_SHAPE_SHIFT);
		bonus.beforeActivation(bonuses, {player: 'player1'});

		const beforeActivationData = bonus.beforeActivationData();
		assert.propertyVal(beforeActivationData, 'playerShape', 'a');
	});
});
