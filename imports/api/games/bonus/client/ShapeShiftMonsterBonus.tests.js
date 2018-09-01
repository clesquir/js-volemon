import ShapeShiftMonsterBonus from '/imports/api/games/bonus/ShapeShiftMonsterBonus.js';
import {BONUS_SHAPE_SHIFT} from '/imports/api/games/bonusConstants.js';
import Game from '/imports/api/games/client/Game.js';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime.js';
import GameSkin from '/imports/api/games/client/skin/GameSkin.js';
import NullStreamBundler from '/imports/api/games/client/streamBundler/NullStreamBundler.js';
import StaticShapesGameConfiguration from '/imports/api/games/configuration/StaticShapesGameConfiguration.js';
import StaticGameData from '/imports/api/games/data/StaticGameData.js';
import NullDeviceController from '/imports/api/games/deviceController/NullDeviceController.js';
import NullEngine from '/imports/api/games/engine/NullEngine.js';
import DefaultSkin from '/imports/api/skins/skins/DefaultSkin.js';
import {assert} from 'chai';
import {Random} from 'meteor/random';

describe('ShapeShiftMonsterBonus', function() {
	const deviceController = new NullDeviceController();
	const engine = new NullEngine();
	const gameData = new StaticGameData();
	const gameSkin = new GameSkin(new DefaultSkin());
	const streamBundler = new NullStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();

	it('activates a shape different that the initial one', function() {
		const gameConfiguration = new StaticShapesGameConfiguration(['a', 'b']);
		const game = new Game(Random.id(5), deviceController, engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		game.player1 = {data: {}};
		game.player1.data.initialPolygonObject = 'player-a';
		game.player1.data.currentPolygonObject = 'player-a';

		const bonus = new ShapeShiftMonsterBonus(game, BONUS_SHAPE_SHIFT);
		bonus.beforeActivation({player: 'player1'});
		const beforeActivationData = bonus.beforeActivationData();

		assert.isObject(beforeActivationData);
		assert.propertyVal(beforeActivationData, 'playerShape', 'b');
	});

	it('activates a shape different that the current one and the initial one', function() {
		const gameConfiguration = new StaticShapesGameConfiguration(['a', 'b', 'c']);
		const game = new Game(Random.id(5), deviceController, engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		game.player1 = {data: {}};
		game.player1.data.initialPolygonObject = 'player-a';
		game.player1.data.currentPolygonObject = 'player-b';

		const bonus = new ShapeShiftMonsterBonus(game, BONUS_SHAPE_SHIFT);
		bonus.beforeActivation({player: 'player1'});
		const beforeActivationData = bonus.beforeActivationData();

		assert.isObject(beforeActivationData);
		assert.propertyVal(beforeActivationData, 'playerShape', 'c');
	});

	it('activates the only shape different that the initial one if there is one', function() {
		const gameConfiguration = new StaticShapesGameConfiguration(['a', 'b']);
		const game = new Game(Random.id(5), deviceController, engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		game.player1 = {data: {}};
		game.player1.data.initialPolygonObject = 'player-a';
		game.player1.data.currentPolygonObject = 'player-b';

		const bonus = new ShapeShiftMonsterBonus(game, BONUS_SHAPE_SHIFT);
		bonus.beforeActivation({player: 'player1'});
		const beforeActivationData = bonus.beforeActivationData();

		assert.isObject(beforeActivationData);
		assert.propertyVal(beforeActivationData, 'playerShape', 'b');
	});

	it('activates the only shape available even if it is the initial one', function() {
		const gameConfiguration = new StaticShapesGameConfiguration(['a']);
		const game = new Game(Random.id(5), deviceController, engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		game.player1 = {data: {}};
		game.player1.data.initialPolygonObject = 'player-a';
		game.player1.data.currentPolygonObject = 'player-a';

		const bonus = new ShapeShiftMonsterBonus(game, BONUS_SHAPE_SHIFT);
		bonus.beforeActivation({player: 'player1'});
		const beforeActivationData = bonus.beforeActivationData();

		assert.isObject(beforeActivationData);
		assert.propertyVal(beforeActivationData, 'playerShape', 'a');
	});
});
