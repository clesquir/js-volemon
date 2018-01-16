import {assert} from 'chai';
import {Random} from 'meteor/random';
import ShapeShiftMonsterBonus from '/imports/api/games/bonus/ShapeShiftMonsterBonus.js';
import {BONUS_SHAPE_SHIFT} from '/imports/api/games/bonusConstants.js';
import GameData from '/imports/api/games/client/data/GameData.js';
import NullDeviceController from '/imports/api/games/client/deviceController/NullDeviceController.js';
import Game from '/imports/api/games/client/Game.js';
import GameStreamBundler from '/imports/api/games/client/GameStreamBundler.js';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime.js';
import GameSkin from '/imports/api/games/client/skin/GameSkin.js';
import StaticGameConfiguration from '/imports/api/games/configuration/StaticGameConfiguration.js';
import PhaserEngine from '/imports/api/games/engine/client/PhaserEngine.js';
import DefaultSkin from '/imports/api/skins/skins/DefaultSkin.js';
import NullStream from '/imports/lib/stream/NullStream.js';

describe('ShapeShiftMonsterBonus', function() {
	const gameConfiguration = new StaticGameConfiguration();
	const engine = new PhaserEngine(gameConfiguration, new NullDeviceController());
	const gameSkin = new GameSkin(new DefaultSkin());
	const streamBundler = new GameStreamBundler(new NullStream());
	const serverNormalizedTime = new ServerNormalizedTime();

	it('activates a shape different that the initial one', function() {
		const gameData = new GameData();
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		gameData.listOfShapes = ['a', 'b'];
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
		const gameData = new GameData();
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		gameData.listOfShapes = ['a', 'b', 'c'];
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
		const gameData = new GameData();
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		gameData.listOfShapes = ['a', 'b'];
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
		const gameData = new GameData();
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		gameData.listOfShapes = ['a'];
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
