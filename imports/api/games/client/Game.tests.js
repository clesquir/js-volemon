import {assert} from 'chai';
import sinon from 'sinon';
import {Random} from 'meteor/random';
import Game from './Game.js';
import GameData from '/imports/api/games/client/data/GameData.js';
import GameStreamBundler from '/imports/api/games/client/GameStreamBundler.js';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime.js';
import PhaserEngine from '/imports/api/games/engine/client/PhaserEngine.js';
import {BALL_VERTICAL_SPEED_ON_PLAYER_HIT} from '/imports/api/games/constants.js';
import StaticGameConfiguration from '/imports/api/games/configuration/StaticGameConfiguration.js';
import NullDeviceController from '/imports/api/games/client/deviceController/NullDeviceController.js';
import GameSkin from '/imports/api/games/client/skin/GameSkin.js';
import DefaultSkin from '/imports/api/skins/skins/DefaultSkin.js';

describe('Game#isPlayerJumpingForward', function() {
	const gameData = new GameData();
	const gameConfiguration = new StaticGameConfiguration();
	const deviceController = new NullDeviceController();
	const gameSkin = new GameSkin(new DefaultSkin());
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();

	it('returns false if vertical speed is 0', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});

		assert.isFalse(game.isPlayerJumpingForward(
			{
				body: {
					x: 200,
					y: 400,
					velocity: {
						x: 25,
						y: 0
					}
				}
			},
			'player1'
		));
	});

	it('returns false if vertical speed is positive', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});

		assert.isFalse(game.isPlayerJumpingForward(
			{
				body: {
					x: 200,
					y: 400,
					velocity: {
						x: 25,
						y: 25
					}
				}
			},
			'player1'
		));
	});

	it('returns false if vertical speed is negative but player is at ground level', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return true;});

		assert.isFalse(game.isPlayerJumpingForward(
			{
				body: {
					x: 200,
					y: 0,
					velocity: {
						x: 25,
						y: -25
					}
				}
			},
			'player1'
		));
	});

	it('returns false if player1 vertical speed is negative but horizontal speed is 0', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});

		assert.isFalse(game.isPlayerJumpingForward(
			{
				body: {
					x: 200,
					y: 400,
					velocity: {
						x: 0,
						y: -25
					}
				}
			},
			'player1'
		));
	});

	it('returns false if player1 vertical speed is negative but horizontal speed is negative', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});

		assert.isFalse(game.isPlayerJumpingForward(
			{
				body: {
					x: 200,
					y: 400,
					velocity: {
						x: -25,
						y: -25
					}
				}
			},
			'player1'
		));
	});

	it('returns true if player1 vertical speed is negative but horizontal speed is positive', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});

		assert.isTrue(game.isPlayerJumpingForward(
			{
				body: {
					x: 200,
					y: 400,
					velocity: {
						x: 25,
						y: -25
					}
				}
			},
			'player1'
		));
	});

	it('returns false if player2 vertical speed is negative but horizontal speed is 0', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});

		assert.isFalse(game.isPlayerJumpingForward(
			{
				body: {
					x: 200,
					y: 400,
					velocity: {
						x: 0,
						y: -25
					}
				}
			},
			'player2'
		));
	});

	it('returns false if player2 vertical speed is negative but horizontal speed is positive', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});

		assert.isFalse(game.isPlayerJumpingForward(
			{
				body: {
					x: 200,
					y: 400,
					velocity: {
						x: 25,
						y: -25
					}
				}
			},
			'player2'
		));
	});

	it('returns true if player2 vertical speed is negative and horizontal speed is negative', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});

		assert.isTrue(game.isPlayerJumpingForward(
			{
				body: {
					x: 200,
					y: 400,
					velocity: {
						x: -25,
						y: -25
					}
				}
			},
			'player2'
		));
	});
});

describe('Game#isBallInFrontOfPlayer', function() {
	const gameData = new GameData();
	const gameConfiguration = new StaticGameConfiguration();
	const gameSkin = new GameSkin(new DefaultSkin());
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const engine = new PhaserEngine(gameConfiguration, new NullDeviceController());

	it('returns false if player1 x position is equal to ball x position', function() {
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		assert.isFalse(game.isBallInFrontOfPlayer(
			{
				body: {
					x: 200,
					y: 400
				}
			},
			{
				body: {
					x: 200,
					y: 400
				}
			},
			'player1'
		));
	});

	it('returns false if player1 x position is greater than to ball x position', function() {
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		assert.isFalse(game.isBallInFrontOfPlayer(
			{
				body: {
					x: 198,
					y: 400
				}
			},
			{
				body: {
					x: 200,
					y: 400
				}
			},
			'player1'
		));
	});

	it('returns true if player1 x position is lower than to ball x position', function() {
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		assert.isTrue(game.isBallInFrontOfPlayer(
			{
				body: {
					x: 202,
					y: 400
				}
			},
			{
				body: {
					x: 200,
					y: 400
				}
			},
			'player1'
		));
	});

	it('returns false if player2 x position is equal to ball x position', function() {
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		assert.isFalse(game.isBallInFrontOfPlayer(
			{
				body: {
					x: 200,
					y: 400
				}
			},
			{
				body: {
					x: 200,
					y: 400
				}
			},
			'player2'
		));
	});

	it('returns false if player2 x position is lower than to ball x position', function() {
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		assert.isFalse(game.isBallInFrontOfPlayer(
			{
				body: {
					x: 202,
					y: 400
				}
			},
			{
				body: {
					x: 200,
					y: 400
				}
			},
			'player2'
		));
	});

	it('returns true if player2 x position is greater than to ball x position', function() {
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		assert.isTrue(game.isBallInFrontOfPlayer(
			{
				body: {
					x: 198,
					y: 400
				}
			},
			{
				body: {
					x: 200,
					y: 400
				}
			},
			'player2'
		));
	});
});

describe('Game#isBallBelowPlayer', function() {
	const gameData = new GameData();
	const gameConfiguration = new StaticGameConfiguration();
	const gameSkin = new GameSkin(new DefaultSkin());
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const engine = new PhaserEngine(gameConfiguration, new NullDeviceController());

	it('returns false if ball y position is lower than player y position + half its height', function() {
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		assert.isFalse(game.isBallBelowPlayer(
			{
				body: {
					x: 200,
					y: 400
				}
			},
			{
				body: {
					x: 200,
					y: 400
				}
			}
		));
	});

	it('returns false if ball y position is equal than player y position + half its height', function() {
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		const playerHeight = 20;

		assert.isFalse(game.isBallBelowPlayer(
			{
				body: {
					x: 200,
					y: 400 + (playerHeight / 2)
				}
			},
			{
				body: {
					x: 200,
					y: 400
				},
				height: playerHeight
			}
		));
	});

	it('returns true if ball y position is greater than player y position + half its height', function() {
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		const playerHeight = 20;

		assert.isTrue(game.isBallBelowPlayer(
			{
				body: {
					x: 200,
					y: 400 + (playerHeight / 2) + 0.1
				}
			},
			{
				body: {
					x: 200,
					y: 400
				},
				height: playerHeight
			}
		));
	});
});

describe('Game#isPlayerDoingDropShot', function() {
	const gameData = new GameData();
	const gameConfiguration = new StaticGameConfiguration();
	const gameSkin = new GameSkin(new DefaultSkin());
	const deviceController = new NullDeviceController();
	const streamBundler = new GameStreamBundler();

	const serverNormalizedTime = new ServerNormalizedTime();
	it('returns true', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isBallInFrontOfPlayer').callsFake(function() {return true;});
		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});

		assert.isTrue(game.isPlayerDoingDropShot(
			{},
			{
				data: {
					doingDropShot: true
				}
			},
			'player1'
		));
	});

	it('returns false if player is not doing a drop shot', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isBallInFrontOfPlayer').callsFake(function() {return true;});
		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});

		assert.isFalse(game.isPlayerDoingDropShot(
			{},
			{
				data: {
					doingDropShot: false
				}
			},
			'player1'
		));
	});

	it('returns true even if ball is not in front of player', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isBallInFrontOfPlayer').callsFake(function() {return false;});
		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});

		assert.isTrue(game.isPlayerDoingDropShot(
			{},
			{
				data: {
					doingDropShot: true
				}
			},
			'player1'
		));
	});

	it('returns false if player is at ground level', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isBallInFrontOfPlayer').callsFake(function() {return true;});
		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return true;});

		assert.isFalse(game.isPlayerDoingDropShot(
			{},
			{
				data: {
					doingDropShot: true
				}
			},
			'player1'
		));
	});
});

describe('Game#dropShotBallOnPlayerHit', function() {
	const gameData = new GameData();
	const gameConfiguration = new StaticGameConfiguration();
	const gameSkin = new GameSkin(new DefaultSkin());
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const engine = new PhaserEngine(gameConfiguration, new NullDeviceController());

	it('removes all speed velocity from ball object', function() {
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		let ball = {
			body: {
				x: 200,
				y: 400,
				velocity: {
					x: 300,
					y: 200
				}
			}
		};

		game.dropShotBallOnPlayerHit(ball);

		assert.equal(300, ball.body.velocity.x);
		assert.equal(200, ball.body.velocity.y);
	});
});

describe('Game#reboundBallOnPlayerHit', function() {
	const gameData = new GameData();
	const gameConfiguration = new StaticGameConfiguration();
	const gameSkin = new GameSkin(new DefaultSkin());
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const engine = new PhaserEngine(gameConfiguration, new NullDeviceController());

	it('adds the constant vertical speed velocity to ball object', function() {
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		let horizontalVelocity = 300;
		let ball = {
			body: {
				x: 200,
				y: 400,
				velocity: {
					x: horizontalVelocity,
					y: 200
				}
			}
		};

		game.reboundBallOnPlayerHit(ball);

		assert.equal(horizontalVelocity, ball.body.velocity.x);
		assert.equal(BALL_VERTICAL_SPEED_ON_PLAYER_HIT, ball.body.velocity.y);
	});
});

describe('Game#onBallHitPlayer', function() {
	const gameData = new GameData();
	const gameConfiguration = new StaticGameConfiguration();
	const gameSkin = new GameSkin(new DefaultSkin());
	const deviceController = new NullDeviceController();
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();

	it('reboundBallOnPlayerHit is called', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isPlayerJumpingForward').callsFake(function() {return false;});
		sinon.stub(game, 'isBallBelowPlayer').callsFake(function() {return false;});
		sinon.stub(game, 'isPlayerDoingDropShot').callsFake(function() {return false;});
		sinon.stub(game.engine, 'constrainVelocity');

		let reboundBallOnPlayerHit = sinon.stub(game, 'reboundBallOnPlayerHit');

		game.onBallHitPlayer({}, {}, 'player1');

		assert.isTrue(reboundBallOnPlayerHit.called);
	});

	it('reboundBallOnPlayerHit is not called if player is doing drop shot and ball is in front of the player', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isPlayerJumpingForward').callsFake(function() {return false;});
		sinon.stub(game, 'isBallBelowPlayer').callsFake(function() {return false;});
		sinon.stub(game, 'isPlayerDoingDropShot').callsFake(function() {return true;});
		sinon.stub(game, 'isBallInFrontOfPlayer').callsFake(function() {return true;});
		sinon.stub(game.engine, 'constrainVelocity');

		let dropShotBallOnPlayerHit = sinon.stub(game, 'dropShotBallOnPlayerHit');
		let reboundBallOnPlayerHit = sinon.stub(game, 'reboundBallOnPlayerHit');

		game.onBallHitPlayer({}, {}, 'player1');

		assert.isFalse(reboundBallOnPlayerHit.called);
		assert.isTrue(dropShotBallOnPlayerHit.called);
	});

	it('reboundBallOnPlayerHit is not called if the player is not jumping forward and the ball is below the player', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isPlayerJumpingForward').callsFake(function() {return false;});
		sinon.stub(game, 'isBallBelowPlayer').callsFake(function() {return true;});
		sinon.stub(game, 'isPlayerDoingDropShot').callsFake(function() {return false;});
		sinon.stub(game.engine, 'constrainVelocity');

		let reboundBallOnPlayerHit = sinon.stub(game, 'reboundBallOnPlayerHit');

		game.onBallHitPlayer({}, {}, 'player1');

		assert.isFalse(reboundBallOnPlayerHit.called);
	});

	it('reboundBallOnPlayerHit is called if the ball is not in front of the player', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isPlayerJumpingForward').callsFake(function() {return true;});
		sinon.stub(game, 'isBallInFrontOfPlayer').callsFake(function() {return false;});
		sinon.stub(game, 'isBallBelowPlayer').callsFake(function() {return false;});
		sinon.stub(game, 'isPlayerDoingDropShot').callsFake(function() {return false;});
		sinon.stub(game.engine, 'constrainVelocity');

		let reboundBallOnPlayerHit = sinon.stub(game, 'reboundBallOnPlayerHit');

		game.onBallHitPlayer({}, {}, 'player1');

		assert.isTrue(reboundBallOnPlayerHit.called);
	});

	it('smashBallOnPlayerHit is called', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isPlayerJumpingForward').callsFake(function() {return true;});
		sinon.stub(game, 'isBallInFrontOfPlayer').callsFake(function() {return true;});
		sinon.stub(game, 'isPlayerDoingDropShot').callsFake(function() {return false;});
		sinon.stub(game.engine, 'constrainVelocity');

		let smashBallOnPlayerHit = sinon.stub(game, 'smashBallOnPlayerHit');

		game.onBallHitPlayer({}, {}, 'player1');

		assert.isTrue(smashBallOnPlayerHit.called);
	});

	it('smashBallOnPlayerHit is not called if player is doing a drop shot', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isPlayerJumpingForward').callsFake(function() {return true;});
		sinon.stub(game, 'isBallInFrontOfPlayer').callsFake(function() {return true;});
		sinon.stub(game, 'isPlayerDoingDropShot').callsFake(function() {return true;});
		sinon.stub(game.engine, 'constrainVelocity');

		let dropShotBallOnPlayerHit = sinon.stub(game, 'dropShotBallOnPlayerHit');
		let smashBallOnPlayerHit = sinon.stub(game, 'smashBallOnPlayerHit');

		game.onBallHitPlayer({}, {}, 'player1');

		assert.isFalse(smashBallOnPlayerHit.called);
		assert.isTrue(dropShotBallOnPlayerHit.called);
	});
});

describe('Game#smashBallOnPlayerHit', function() {
	const gameData = new GameData();
	const gameConfiguration = new StaticGameConfiguration();
	const gameSkin = new GameSkin(new DefaultSkin());
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();
	const engine = new PhaserEngine(gameConfiguration, new NullDeviceController());

	it('normal smash calculations', function() {
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		let horizontalSpeed = 300;
		let verticalSpeed = 200;
		let ball = {
			body: {
				velocity: {
					x: horizontalSpeed,
					y: verticalSpeed
				}
			}
		};

		game.smashBallOnPlayerHit(
			ball,
			'player1'
		);

		assert.equal(horizontalSpeed * 2, ball.body.velocity.x);
		assert.equal(verticalSpeed / 4, ball.body.velocity.y);
	});

	it('ball is smashed towards ground if its vertical speed was negative', function() {
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		let horizontalSpeed = 300;
		let verticalSpeed = -200;
		let ball = {
			body: {
				velocity: {
					x: horizontalSpeed,
					y: verticalSpeed
				}
			}
		};

		game.smashBallOnPlayerHit(
			ball,
			'player1'
		);

		assert.equal(horizontalSpeed * 2, ball.body.velocity.x);
		assert.equal(-verticalSpeed / 4, ball.body.velocity.y);
	});

	it('for player1, ball direction is reversed if it is smashed', function() {
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		let horizontalSpeed = -300;
		let verticalSpeed = -200;
		let ball = {
			body: {
				velocity: {
					x: horizontalSpeed,
					y: verticalSpeed
				}
			}
		};

		game.smashBallOnPlayerHit(
			ball,
			'player1'
		);

		assert.equal(-horizontalSpeed * 2, ball.body.velocity.x);
		assert.equal(-verticalSpeed / 4, ball.body.velocity.y);
	});

	it('for player2, ball direction is reversed if it is smashed', function() {
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		let horizontalSpeed = 300;
		let verticalSpeed = -200;
		let ball = {
			body: {
				velocity: {
					x: horizontalSpeed,
					y: verticalSpeed
				}
			}
		};

		game.smashBallOnPlayerHit(
			ball,
			'player2'
		);

		assert.equal(-horizontalSpeed * 2, ball.body.velocity.x);
		assert.equal(-verticalSpeed / 4, ball.body.velocity.y);
	});
});

describe('Game#inputs', function() {
	const gameData = new GameData();
	const gameConfiguration = new StaticGameConfiguration();
	const gameSkin = new GameSkin(new DefaultSkin());
	const deviceController = new NullDeviceController();
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();

	it('returns false if there is no currentPlayer', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		let game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'getCurrentPlayer').callsFake(function() {
			return null;
		});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		assert.isFalse(game.inputs());
		assert.isFalse(sendPlayerPositionStub.called);
	});

	it('sets engine Horizontal and Vertical speed to 0 if player is frozen and sends player position', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		let horizontalSpeedValue = null;
		let verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer').callsFake(function() {
			return {
				data: {
					isFrozen: true
				}
			};
		});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine.setHorizontalSpeed = function(player, value) {
			horizontalSpeedValue = value;
		};
		game.engine.setVerticalSpeed = function(player, value) {
			verticalSpeedValue = value;
		};

		assert.isTrue(game.inputs());
		assert.equal(0, horizontalSpeedValue);
		assert.equal(0, verticalSpeedValue);
		assert.isTrue(sendPlayerPositionStub.called);
	});

	it('sets engine Horizontal speed if left is pressed and sends player position', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		const moveModifier = 1;
		const velocity = 100;
		let horizontalSpeedValue = null;
		let verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer').callsFake(function() {
			return {
				data: {
					isFrozen: false,
					moveModifier: moveModifier,
					velocityXOnMove: velocity,
					velocityYOnJump: velocity
				}
			};
		});
		sinon.stub(game, 'isLeftKeyDown').callsFake(function() {return true;});
		sinon.stub(game, 'isRightKeyDown').callsFake(function() {return false;});
		sinon.stub(game, 'isUpKeyDown').callsFake(function() {return false;});
		sinon.stub(game, 'isDropShotKeyDown').callsFake(function() {return false;});
		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return true;});
		const sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine.setHorizontalSpeed = function(player, value) {
			horizontalSpeedValue = value;
		};
		game.engine.setVerticalSpeed = function(player, value) {
			verticalSpeedValue = value;
		};

		assert.isTrue(game.inputs());
		assert.equal(-moveModifier * velocity, horizontalSpeedValue);
		assert.equal(0, verticalSpeedValue);
		assert.isTrue(sendPlayerPositionStub.called);
	});

	it('sets engine Horizontal speed if right is pressed and sends player position', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		const moveModifier = 1;
		const velocity = 100;
		let horizontalSpeedValue = null;
		let verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer').callsFake(function() {
			return {
				data: {
					isFrozen: false,
					moveModifier: moveModifier,
					velocityXOnMove: velocity,
					velocityYOnJump: velocity
				}
			};
		});
		sinon.stub(game, 'isLeftKeyDown').callsFake(function() {return false;});
		sinon.stub(game, 'isRightKeyDown').callsFake(function() {return true;});
		sinon.stub(game, 'isUpKeyDown').callsFake(function() {return false;});
		sinon.stub(game, 'isDropShotKeyDown').callsFake(function() {return false;});
		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return true;});
		const sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine.setHorizontalSpeed = function(player, value) {
			horizontalSpeedValue = value;
		};
		game.engine.setVerticalSpeed = function(player, value) {
			verticalSpeedValue = value;
		};

		assert.isTrue(game.inputs());
		assert.equal(moveModifier * velocity, horizontalSpeedValue);
		assert.equal(0, verticalSpeedValue);
		assert.isTrue(sendPlayerPositionStub.called);
	});

	it('sets engine Horizontal speed to 0 if neither left or right is pressed and sends player position', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		const moveModifier = 1;
		const velocity = 100;
		let horizontalSpeedValue = null;
		let verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer').callsFake(function() {
			return {
				data: {
					isFrozen: false,
					moveModifier: moveModifier,
					velocityXOnMove: velocity,
					velocityYOnJump: velocity
				}
			};
		});
		sinon.stub(game, 'isLeftKeyDown').callsFake(function() {return false;});
		sinon.stub(game, 'isRightKeyDown').callsFake(function() {return false;});
		sinon.stub(game, 'isUpKeyDown').callsFake(function() {return false;});
		sinon.stub(game, 'isDropShotKeyDown').callsFake(function() {return false;});
		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return true;});
		const sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine.setHorizontalSpeed = function(player, value) {
			horizontalSpeedValue = value;
		};
		game.engine.setVerticalSpeed = function(player, value) {
			verticalSpeedValue = value;
		};

		assert.isTrue(game.inputs());
		assert.equal(0, horizontalSpeedValue);
		assert.equal(0, verticalSpeedValue);
		assert.isTrue(sendPlayerPositionStub.called);
	});

	it('sets engine Vertical speed if up is pressed and sends player position', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		const moveModifier = 1;
		const velocity = 100;
		let horizontalSpeedValue = null;
		let verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer').callsFake(function() {
			return {
				data: {
					isFrozen: false,
					canJump: true,
					moveModifier: moveModifier,
					velocityXOnMove: velocity,
					velocityYOnJump: velocity
				}
			};
		});
		sinon.stub(game, 'isLeftKeyDown').callsFake(function() {return false;});
		sinon.stub(game, 'isRightKeyDown').callsFake(function() {return false;});
		sinon.stub(game, 'isUpKeyDown').callsFake(function() {return true;});
		sinon.stub(game, 'isDropShotKeyDown').callsFake(function() {return false;});
		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return true;});
		const sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine.setHorizontalSpeed = function(player, value) {
			horizontalSpeedValue = value;
		};
		game.engine.setVerticalSpeed = function(player, value) {
			verticalSpeedValue = value;
		};

		assert.isTrue(game.inputs());
		assert.equal(0, horizontalSpeedValue);
		assert.equal(-velocity, verticalSpeedValue);
		assert.isTrue(sendPlayerPositionStub.called);
	});

	it('sets engine Vertical speed to 0 if up is not pressed and sends player position', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		const moveModifier = 1;
		const velocity = 100;
		let horizontalSpeedValue = null;
		let verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer').callsFake(function() {
			return {
				data: {
					isFrozen: false,
					moveModifier: moveModifier,
					velocityXOnMove: velocity,
					velocityYOnJump: velocity
				}
			};
		});
		sinon.stub(game, 'isLeftKeyDown').callsFake(function() {return false;});
		sinon.stub(game, 'isRightKeyDown').callsFake(function() {return false;});
		sinon.stub(game, 'isUpKeyDown').callsFake(function() {return false;});
		sinon.stub(game, 'isDropShotKeyDown').callsFake(function() {return false;});
		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return true;});
		const sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine.setHorizontalSpeed = function(player, value) {
			horizontalSpeedValue = value;
		};
		game.engine.setVerticalSpeed = function(player, value) {
			verticalSpeedValue = value;
		};

		assert.isTrue(game.inputs());
		assert.equal(0, horizontalSpeedValue);
		assert.equal(0, verticalSpeedValue);
		assert.isTrue(sendPlayerPositionStub.called);
	});

	it('does not increase engine Vertical speed if player is not at ground level and sends player position', function() {
		const engine = new PhaserEngine(gameConfiguration, deviceController);
		const game = new Game(Random.id(5), engine, gameData, gameConfiguration, gameSkin, streamBundler, serverNormalizedTime);
		const moveModifier = 1;
		const velocity = 100;
		let horizontalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer').callsFake(function() {
			return {
				data: {
					isFrozen: false,
					moveModifier: moveModifier,
					velocityXOnMove: velocity,
					velocityYOnJump: velocity
				}
			};
		});
		sinon.stub(game, 'isLeftKeyDown').callsFake(function() {return false;});
		sinon.stub(game, 'isRightKeyDown').callsFake(function() {return false;});
		sinon.stub(game, 'isUpKeyDown').callsFake(function() {return false;});
		sinon.stub(game, 'isDropShotKeyDown').callsFake(function() {return false;});
		sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});
		const sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine.setHorizontalSpeed = function(player, value) {
			horizontalSpeedValue = value;
		};
		game.engine.setVerticalSpeed = function(player, value) {
		};
		let setVerticalSpeedStub = sinon.stub(game.engine, 'setVerticalSpeed');

		assert.isTrue(game.inputs());
		assert.equal(0, horizontalSpeedValue);
		assert.isFalse(setVerticalSpeedStub.called);
		assert.isTrue(sendPlayerPositionStub.called);
	});
});
