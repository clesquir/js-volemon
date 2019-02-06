import {assert} from 'chai';
import {TestGameBoot} from '/imports/api/games/client/boot/TestGameBoot';
import SkinManager from '/imports/api/games/client/component/SkinManager';
import NullServerAdapter from '/imports/api/games/client/serverAdapter/NullServerAdapter';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime';
import CountStreamBundler from '/imports/api/games/client/streamBundler/CountStreamBundler';
import StaticGameConfiguration from '/imports/api/games/configuration/StaticGameConfiguration';
import StaticGameData from '/imports/api/games/data/StaticGameData';
import NullDeviceController from '/imports/api/games/deviceController/NullDeviceController';
import {Random} from 'meteor/random';

describe('Player#isJumpingForward', function() {
	const deviceController = new NullDeviceController();
	const gameConfiguration = new StaticGameConfiguration();
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

	it('returns false if vertical speed is 0', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.containerPhysics.setVelocity(25, 0);
		player.hasBottomTouching = false;

		assert.isFalse(player.isJumpingForward());
	});

	it('returns false if vertical speed is positive', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.containerPhysics.setVelocity(25, 25);
		player.hasBottomTouching = false;

		assert.isFalse(player.isJumpingForward());
	});

	it('returns false if vertical speed is negative but player is at ground level', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.containerPhysics.setVelocity(25, -25);
		player.hasBottomTouching = true;

		assert.isFalse(player.isJumpingForward());
	});

	it('returns false if player1 vertical speed is negative but horizontal speed is 0', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.containerPhysics.setVelocity(0, -25);
		player.hasBottomTouching = false;

		assert.isFalse(player.isJumpingForward());
	});

	it('returns false if player1 vertical speed is negative but horizontal speed is negative', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.containerPhysics.setVelocity(-25, -25);
		player.hasBottomTouching = false;

		assert.isFalse(player.isJumpingForward());
	});

	it('returns true if player1 vertical speed is negative but horizontal speed is positive', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.containerPhysics.setVelocity(25, -25);
		player.hasBottomTouching = false;

		assert.isTrue(player.isJumpingForward());
	});

	it('returns false if player2 vertical speed is negative but horizontal speed is 0', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player2;

		player.containerPhysics.setVelocity(0, -25);
		player.hasBottomTouching = false;

		assert.isFalse(player.isJumpingForward());
	});

	it('returns false if player2 vertical speed is negative but horizontal speed is positive', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player2;

		player.containerPhysics.setVelocity(25, -25);
		player.hasBottomTouching = false;

		assert.isFalse(player.isJumpingForward());
	});

	it('returns true if player2 vertical speed is negative and horizontal speed is negative', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player2;

		player.containerPhysics.setVelocity(-25, -25);
		player.hasBottomTouching = false;

		assert.isTrue(player.isJumpingForward());
	});
});

describe('Player#isInFrontOfPlayer', function() {
	const deviceController = new NullDeviceController();
	const gameConfiguration = new StaticGameConfiguration();
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

	it('returns false if player1 x position is equal to ball x position', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.containerPhysics.x = 200;
		player.containerPhysics.y = 400;

		assert.isFalse(player.isInFrontOfPlayer(200));
	});

	it('returns false if player1 x position is greater than to ball x position', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.containerPhysics.x = 200;
		player.containerPhysics.y = 400;

		assert.isFalse(player.isInFrontOfPlayer(198));
	});

	it('returns true if player1 x position is lower than to ball x position', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.containerPhysics.x = 200;
		player.containerPhysics.y = 400;

		assert.isTrue(player.isInFrontOfPlayer(202));
	});

	it('returns false if player2 x position is equal to ball x position', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player2;

		player.containerPhysics.x = 200;
		player.containerPhysics.y = 400;

		assert.isFalse(player.isInFrontOfPlayer(200));
	});

	it('returns false if player2 x position is lower than to ball x position', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player2;

		player.containerPhysics.x = 200;
		player.containerPhysics.y = 400;

		assert.isFalse(player.isInFrontOfPlayer(202));
	});

	it('returns true if player2 x position is greater than to ball x position', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player2;

		player.containerPhysics.x = 200;
		player.containerPhysics.y = 400;

		assert.isTrue(player.isInFrontOfPlayer(198));
	});
});

describe('Player#isBallBelow', function() {
	const deviceController = new NullDeviceController();
	const gameConfiguration = new StaticGameConfiguration();
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

	it('returns false if ball y position is lower than player y position + half its height', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.containerPhysics.x = 200;
		player.containerPhysics.y = 400;

		assert.isFalse(player.isBallBelow(400));
	});

	it('returns false if ball y position is equal than player y position + half its height', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.containerPhysics.x = 200;
		player.containerPhysics.y = 400;

		assert.isFalse(player.isBallBelow(400 + player.playerObject.height / 2));
	});

	it('returns true if ball y position is greater than player y position + half its height', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.containerPhysics.x = 200;
		player.containerPhysics.y = 400;

		assert.isTrue(player.isBallBelow(400 + player.playerObject.height / 2 + 0.1));
	});
});

describe('Player#move', function() {
	const deviceController = new NullDeviceController();
	const gameConfiguration = new StaticGameConfiguration();
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

	it('sets Horizontal and Vertical speed to 0 if player is frozen', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.freeze();

		player.move(true, false, true, false);

		assert.equal(0, player.positionData().velocityX);
		assert.equal(0, player.positionData().velocityY);
	});

	it('sets Horizontal speed if left is pressed', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.move(true, false, false, false);

		assert.equal(player.horizontalMoveMultiplier * -player.velocityXOnMove, player.positionData().velocityX);
		assert.equal(0, player.positionData().velocityY);
	});

	it('sets Horizontal speed if right is pressed', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.move(false, true, false, false);

		assert.equal(player.horizontalMoveMultiplier * player.velocityXOnMove, player.positionData().velocityX);
		assert.equal(0, player.positionData().velocityY);
	});

	it('sets Horizontal speed to 0 if neither left or right is pressed', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.move(false, false, false, false);

		assert.equal(0, player.positionData().velocityX);
		assert.equal(0, player.positionData().velocityY);
	});

	it('sets Vertical speed if up is pressed', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.hasBottomTouching = true;
		player.move(false, false, true, false);

		assert.equal(0, player.positionData().velocityX);
		assert.equal(player.verticalMoveMultiplier * -player.velocityYOnJump, player.positionData().velocityY);
	});

	it('sets Vertical speed to 0 if up is not pressed', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.hasBottomTouching = true;
		player.move(false, false, false, false);

		assert.equal(0, player.positionData().velocityX);
		assert.equal(0, player.positionData().velocityY);
	});

	it('does not increase Vertical speed if player is not at ground level', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const player = mainScene.players.player1;

		player.hasBottomTouching = false;
		player.move(false, false, true, false);

		assert.equal(0, player.positionData().velocityX);
		assert.equal(0, player.positionData().velocityY);
	});
});
