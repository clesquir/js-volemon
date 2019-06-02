import {TestGameBoot} from '/imports/api/games/client/boot/TestGameBoot';
import SkinManager from '/imports/api/games/client/component/SkinManager';
import NullServerAdapter from '/imports/api/games/client/serverAdapter/NullServerAdapter';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime';
import NullStreamBundler from '/imports/api/games/client/streamBundler/NullStreamBundler';
import StaticGameConfiguration from '/imports/api/games/configuration/StaticGameConfiguration';
import StaticGameData from '/imports/api/games/data/StaticGameData';
import NullDeviceController from '/imports/api/games/deviceController/NullDeviceController';
import {assert} from 'chai';

describe('Ball#smash', function() {
	const deviceController = new NullDeviceController();
	const gameConfiguration = new StaticGameConfiguration();
	const gameData = new StaticGameData();
	const streamBundler = new NullStreamBundler();
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
	});

	it('normal smash calculations for host', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const ball = mainScene.balls.firstBall();

		let horizontalSpeed = 300;
		let verticalSpeed = 200;

		ball.ballObject.body.velocity.x = horizontalSpeed;
		ball.ballObject.body.velocity.y = verticalSpeed;

		ball.smash(true);

		assert.equal(horizontalSpeed * 2, ball.positionData().velocityX);
		assert.equal(verticalSpeed / 4, ball.positionData().velocityY);
	});

	it('normal smash calculations for client', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const ball = mainScene.balls.firstBall();

		let horizontalSpeed = -300;
		let verticalSpeed = 200;

		ball.ballObject.body.velocity.x = horizontalSpeed;
		ball.ballObject.body.velocity.y = verticalSpeed;

		ball.smash(false);

		assert.equal(horizontalSpeed * 2, ball.positionData().velocityX);
		assert.equal(verticalSpeed / 4, ball.positionData().velocityY);
	});

	it('ball is smashed towards ground if its vertical speed was negative for host', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const ball = mainScene.balls.firstBall();

		let horizontalSpeed = 300;
		let verticalSpeed = -200;

		ball.ballObject.body.velocity.x = horizontalSpeed;
		ball.ballObject.body.velocity.y = verticalSpeed;

		ball.smash(true);

		assert.equal(horizontalSpeed * 2, ball.positionData().velocityX);
		assert.equal(-verticalSpeed / 4, ball.positionData().velocityY);
	});

	it('ball is smashed towards ground if its vertical speed was negative for client', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const ball = mainScene.balls.firstBall();

		let horizontalSpeed = -300;
		let verticalSpeed = -200;

		ball.ballObject.body.velocity.x = horizontalSpeed;
		ball.ballObject.body.velocity.y = verticalSpeed;

		ball.smash(false);

		assert.equal(horizontalSpeed * 2, ball.positionData().velocityX);
		assert.equal(-verticalSpeed / 4, ball.positionData().velocityY);
	});

	it('ball direction is reversed if it is smashed by host', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const ball = mainScene.balls.firstBall();

		let horizontalSpeed = -300;
		let verticalSpeed = -200;

		ball.ballObject.body.velocity.x = horizontalSpeed;
		ball.ballObject.body.velocity.y = verticalSpeed;

		ball.smash(true);

		assert.equal(-horizontalSpeed * 2, ball.positionData().velocityX);
		assert.equal(-verticalSpeed / 4, ball.positionData().velocityY);
	});

	it('ball direction is reversed if it is smashed by client', function() {
		const mainScene = gameBoot.gameBoot.mainScene;
		mainScene.createComponents();
		const ball = mainScene.balls.firstBall();

		let horizontalSpeed = 300;
		let verticalSpeed = -200;

		ball.ballObject.body.velocity.x = horizontalSpeed;
		ball.ballObject.body.velocity.y = verticalSpeed;

		ball.smash(false);

		assert.equal(-horizontalSpeed * 2, ball.positionData().velocityX);
		assert.equal(-verticalSpeed / 4, ball.positionData().velocityY);
	});
});
