import {chai} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Random} from 'meteor/random';
import Game from '/imports/game/client/Game.js';
import GameData from '/imports/game/client/GameData.js';
import GameStreamBundler from '/imports/game/client/GameStreamBundler.js';
import ServerNormalizedTime from '/imports/game/client/ServerNormalizedTime.js';
import PhaserEngine from '/imports/game/engine/client/PhaserEngine.js';
import {PLAYER_HEIGHT, BALL_VERTICAL_SPEED_ON_PLAYER_HIT} from '/imports/api/games/constants.js';

describe('Game#isPlayerJumpingForward', function() {
	const engine = new PhaserEngine();
	const gameData = new GameData();
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();

	it('returns false if vertical speed is 0', function() {
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isFalse(game.isPlayerJumpingForward(
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
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isFalse(game.isPlayerJumpingForward(
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
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isPlayerAtGroundLevel', function() {return true;});

		chai.assert.isFalse(game.isPlayerJumpingForward(
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
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isFalse(game.isPlayerJumpingForward(
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
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isFalse(game.isPlayerJumpingForward(
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
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isTrue(game.isPlayerJumpingForward(
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
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isFalse(game.isPlayerJumpingForward(
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
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isFalse(game.isPlayerJumpingForward(
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
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isTrue(game.isPlayerJumpingForward(
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
	const engine = new PhaserEngine();
	const gameData = new GameData();
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();

	it('returns false if player1 x position is equal to ball x position', function() {
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isFalse(game.isBallInFrontOfPlayer(
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
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isFalse(game.isBallInFrontOfPlayer(
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
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isTrue(game.isBallInFrontOfPlayer(
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
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isFalse(game.isBallInFrontOfPlayer(
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
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isFalse(game.isBallInFrontOfPlayer(
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
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isTrue(game.isBallInFrontOfPlayer(
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
	const engine = new PhaserEngine();
	const gameData = new GameData();
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();

	it('returns false if ball y position is lower than player y position + half its height', function() {
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isFalse(game.isBallBelowPlayer(
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
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isFalse(game.isBallBelowPlayer(
			{
				body: {
					x: 200,
					y: 400 + (PLAYER_HEIGHT / 2)
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

	it('returns true if ball y position is greater than player y position + half its height', function() {
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		chai.assert.isTrue(game.isBallBelowPlayer(
			{
				body: {
					x: 200,
					y: 400 + (PLAYER_HEIGHT / 2) + 0.1
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
});

describe('Game#isPlayerDoingDropShot', function() {
	const engine = new PhaserEngine();
	const gameData = new GameData();
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();

	it('returns true', function() {
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isBallInFrontOfPlayer', function() {return true;});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {return false;});

		chai.assert.isTrue(game.isPlayerDoingDropShot(
			{},
			{doingDropShot: true},
			'player1'
		));
	});

	it('returns false if player is not doing a drop shot', function() {
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isBallInFrontOfPlayer', function() {return true;});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {return false;});

		chai.assert.isFalse(game.isPlayerDoingDropShot(
			{},
			{doingDropShot: false},
			'player1'
		));
	});

	it('returns false if ball is not in front of player', function() {
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isBallInFrontOfPlayer', function() {return false;});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {return false;});

		chai.assert.isFalse(game.isPlayerDoingDropShot(
			{},
			{doingDropShot: true},
			'player1'
		));
	});

	it('returns false if player is at ground level', function() {
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isBallInFrontOfPlayer', function() {return true;});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {return true;});

		chai.assert.isFalse(game.isPlayerDoingDropShot(
			{},
			{doingDropShot: true},
			'player1'
		));
	});
});

describe('Game#dropShotBallOnPlayerHit', function() {
	const engine = new PhaserEngine();
	const gameData = new GameData();
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();

	it('removes all speed velocity from ball object', function() {
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

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

		chai.assert.equal(300, ball.body.velocity.x);
		chai.assert.equal(200, ball.body.velocity.y);
	});
});

describe('Game#reboundBallOnPlayerHit', function() {
	const engine = new PhaserEngine();
	const gameData = new GameData();
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();

	it('adds the constant vertical speed velocity to ball object', function() {
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

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

		chai.assert.equal(horizontalVelocity, ball.body.velocity.x);
		chai.assert.equal(BALL_VERTICAL_SPEED_ON_PLAYER_HIT, ball.body.velocity.y);
	});
});

describe('Game#onBallHitPlayer', function() {
	const gameData = new GameData();
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();

	it('reboundBallOnPlayerHit is called', function() {
		const engine = new PhaserEngine();
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isPlayerJumpingForward', function() {return false;});
		sinon.stub(game, 'isBallBelowPlayer', function() {return false;});
		sinon.stub(game, 'isPlayerDoingDropShot', function() {return false;});
		sinon.stub(game.engine, 'constrainVelocity');

		let reboundBallOnPlayerHit = sinon.stub(game, 'reboundBallOnPlayerHit');

		game.onBallHitPlayer({}, {}, 'player1');

		chai.assert.isTrue(reboundBallOnPlayerHit.called);
	});

	it('reboundBallOnPlayerHit is not called if player is doing drop shot and ball is in front of the player', function() {
		const engine = new PhaserEngine();
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isPlayerJumpingForward', function() {return false;});
		sinon.stub(game, 'isBallBelowPlayer', function() {return false;});
		sinon.stub(game, 'isPlayerDoingDropShot', function() {return true;});
		sinon.stub(game, 'isBallInFrontOfPlayer', function() {return true;});
		sinon.stub(game.engine, 'constrainVelocity');

		let dropShotBallOnPlayerHit = sinon.stub(game, 'dropShotBallOnPlayerHit');
		let reboundBallOnPlayerHit = sinon.stub(game, 'reboundBallOnPlayerHit');

		game.onBallHitPlayer({}, {}, 'player1');

		chai.assert.isFalse(reboundBallOnPlayerHit.called);
		chai.assert.isTrue(dropShotBallOnPlayerHit.called);
	});

	it('reboundBallOnPlayerHit is not called if the player is not jumping forward and the ball is below the player', function() {
		const engine = new PhaserEngine();
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isPlayerJumpingForward', function() {return false;});
		sinon.stub(game, 'isBallBelowPlayer', function() {return true;});
		sinon.stub(game, 'isPlayerDoingDropShot', function() {return false;});
		sinon.stub(game.engine, 'constrainVelocity');

		let reboundBallOnPlayerHit = sinon.stub(game, 'reboundBallOnPlayerHit');

		game.onBallHitPlayer({}, {}, 'player1');

		chai.assert.isFalse(reboundBallOnPlayerHit.called);
	});

	it('reboundBallOnPlayerHit is called if the ball is not in front of the player', function() {
		const engine = new PhaserEngine();
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isPlayerJumpingForward', function() {return true;});
		sinon.stub(game, 'isBallInFrontOfPlayer', function() {return false;});
		sinon.stub(game, 'isBallBelowPlayer', function() {return false;});
		sinon.stub(game, 'isPlayerDoingDropShot', function() {return false;});
		sinon.stub(game.engine, 'constrainVelocity');

		let reboundBallOnPlayerHit = sinon.stub(game, 'reboundBallOnPlayerHit');

		game.onBallHitPlayer({}, {}, 'player1');

		chai.assert.isTrue(reboundBallOnPlayerHit.called);
	});

	it('smashBallOnPlayerHit is called', function() {
		const engine = new PhaserEngine();
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isPlayerJumpingForward', function() {return true;});
		sinon.stub(game, 'isBallInFrontOfPlayer', function() {return true;});
		sinon.stub(game, 'isPlayerDoingDropShot', function() {return false;});
		sinon.stub(game.engine, 'constrainVelocity');

		let smashBallOnPlayerHit = sinon.stub(game, 'smashBallOnPlayerHit');

		game.onBallHitPlayer({}, {}, 'player1');

		chai.assert.isTrue(smashBallOnPlayerHit.called);
	});

	it('smashBallOnPlayerHit is not called if player is doing a drop shot', function() {
		const engine = new PhaserEngine();
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'isPlayerJumpingForward', function() {return true;});
		sinon.stub(game, 'isBallInFrontOfPlayer', function() {return true;});
		sinon.stub(game, 'isPlayerDoingDropShot', function() {return true;});
		sinon.stub(game.engine, 'constrainVelocity');

		let dropShotBallOnPlayerHit = sinon.stub(game, 'dropShotBallOnPlayerHit');
		let smashBallOnPlayerHit = sinon.stub(game, 'smashBallOnPlayerHit');

		game.onBallHitPlayer({}, {}, 'player1');

		chai.assert.isFalse(smashBallOnPlayerHit.called);
		chai.assert.isTrue(dropShotBallOnPlayerHit.called);
	});
});

describe('Game#smashBallOnPlayerHit', function() {
	const engine = new PhaserEngine();
	const gameData = new GameData();
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();

	it('normal smash calculations', function() {
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

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

		chai.assert.equal(horizontalSpeed * 2, ball.body.velocity.x);
		chai.assert.equal(verticalSpeed / 4, ball.body.velocity.y);
	});

	it('ball is smashed towards ground if its vertical speed was negative', function() {
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

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

		chai.assert.equal(horizontalSpeed * 2, ball.body.velocity.x);
		chai.assert.equal(-verticalSpeed / 4, ball.body.velocity.y);
	});

	it('for player1, ball direction is reversed if it is smashed', function() {
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

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

		chai.assert.equal(-horizontalSpeed * 2, ball.body.velocity.x);
		chai.assert.equal(-verticalSpeed / 4, ball.body.velocity.y);
	});

	it('for player2, ball direction is reversed if it is smashed', function() {
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

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

		chai.assert.equal(-horizontalSpeed * 2, ball.body.velocity.x);
		chai.assert.equal(-verticalSpeed / 4, ball.body.velocity.y);
	});
});

describe('Game#inputs', function() {
	const engine = new PhaserEngine();
	const gameData = new GameData();
	const streamBundler = new GameStreamBundler();
	const serverNormalizedTime = new ServerNormalizedTime();

	it('returns false if there is no currentPlayer', function() {
		let game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime);

		sinon.stub(game, 'getCurrentPlayer', function() {
			return null;
		});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		chai.assert.isFalse(game.inputs());
		chai.assert.isFalse(sendPlayerPositionStub.called);
	});

	it('sets engine Horizontal and Vertical speed to 0 if player is frozen and sends player position', function() {
		var game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime),
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {isFrozen: true};
		});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine = {
			setHorizontalSpeed(player, value) {
				horizontalSpeedValue = value;
			},
			setVerticalSpeed(player, value) {
				verticalSpeedValue = value;
			}
		};

		chai.assert.isTrue(game.inputs());
		chai.assert.equal(0, horizontalSpeedValue);
		chai.assert.equal(0, verticalSpeedValue);
		chai.assert.isTrue(sendPlayerPositionStub.called);
	});

	it('sets engine Horizontal speed if left is pressed and sends player position', function() {
		var game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime),
			moveModifier = 1,
			velocity = 100,
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				isFrozen: false,
				moveModifier: moveModifier,
				velocityXOnMove: velocity,
				velocityYOnJump: velocity
			};
		});
		sinon.stub(game, 'isLeftKeyDown', function() {return true;});
		sinon.stub(game, 'isRightKeyDown', function() {return false;});
		sinon.stub(game, 'isUpKeyDown', function() {return false;});
		sinon.stub(game, 'isDropShotKeyDown', function() {return false;});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {return true;});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine = {
			setHorizontalSpeed(player, value) {
				horizontalSpeedValue = value;
			},
			setVerticalSpeed(player, value) {
				verticalSpeedValue = value;
			}
		};

		chai.assert.isTrue(game.inputs());
		chai.assert.equal(-moveModifier * velocity, horizontalSpeedValue);
		chai.assert.equal(0, verticalSpeedValue);
		chai.assert.isTrue(sendPlayerPositionStub.called);
	});

	it('sets engine Horizontal speed if right is pressed and sends player position', function() {
		var game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime),
			moveModifier = 1,
			velocity = 100,
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				isFrozen: false,
				moveModifier: moveModifier,
				velocityXOnMove: velocity,
				velocityYOnJump: velocity
			};
		});
		sinon.stub(game, 'isLeftKeyDown', function() {return false;});
		sinon.stub(game, 'isRightKeyDown', function() {return true;});
		sinon.stub(game, 'isUpKeyDown', function() {return false;});
		sinon.stub(game, 'isDropShotKeyDown', function() {return false;});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {return true;});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine = {
			setHorizontalSpeed(player, value) {
				horizontalSpeedValue = value;
			},
			setVerticalSpeed(player, value) {
				verticalSpeedValue = value;
			}
		};

		chai.assert.isTrue(game.inputs());
		chai.assert.equal(moveModifier * velocity, horizontalSpeedValue);
		chai.assert.equal(0, verticalSpeedValue);
		chai.assert.isTrue(sendPlayerPositionStub.called);
	});

	it('sets engine Horizontal speed to 0 if neither left or right is pressed and sends player position', function() {
		var game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime),
			moveModifier = 1,
			velocity = 100,
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				isFrozen: false,
				moveModifier: moveModifier,
				velocityXOnMove: velocity,
				velocityYOnJump: velocity
			};
		});
		sinon.stub(game, 'isLeftKeyDown', function() {return false;});
		sinon.stub(game, 'isRightKeyDown', function() {return false;});
		sinon.stub(game, 'isUpKeyDown', function() {return false;});
		sinon.stub(game, 'isDropShotKeyDown', function() {return false;});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {return true;});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine = {
			setHorizontalSpeed(player, value) {
				horizontalSpeedValue = value;
			},
			setVerticalSpeed(player, value) {
				verticalSpeedValue = value;
			}
		};

		chai.assert.isTrue(game.inputs());
		chai.assert.equal(0, horizontalSpeedValue);
		chai.assert.equal(0, verticalSpeedValue);
		chai.assert.isTrue(sendPlayerPositionStub.called);
	});

	it('sets engine Vertical speed if up is pressed and sends player position', function() {
		var game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime),
			moveModifier = 1,
			velocity = 100,
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				isFrozen: false,
				canJump: true,
				moveModifier: moveModifier,
				velocityXOnMove: velocity,
				velocityYOnJump: velocity
			};
		});
		sinon.stub(game, 'isLeftKeyDown', function() {return false;});
		sinon.stub(game, 'isRightKeyDown', function() {return false;});
		sinon.stub(game, 'isUpKeyDown', function() {return true;});
		sinon.stub(game, 'isDropShotKeyDown', function() {return false;});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {return true;});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine = {
			setHorizontalSpeed(player, value) {
				horizontalSpeedValue = value;
			},
			setVerticalSpeed(player, value) {
				verticalSpeedValue = value;
			}
		};

		chai.assert.isTrue(game.inputs());
		chai.assert.equal(0, horizontalSpeedValue);
		chai.assert.equal(-velocity, verticalSpeedValue);
		chai.assert.isTrue(sendPlayerPositionStub.called);
	});

	it('sets engine Vertical speed to 0 if up is not pressed and sends player position', function() {
		var game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime),
			moveModifier = 1,
			velocity = 100,
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				isFrozen: false,
				moveModifier: moveModifier,
				velocityXOnMove: velocity,
				velocityYOnJump: velocity
			};
		});
		sinon.stub(game, 'isLeftKeyDown', function() {return false;});
		sinon.stub(game, 'isRightKeyDown', function() {return false;});
		sinon.stub(game, 'isUpKeyDown', function() {return false;});
		sinon.stub(game, 'isDropShotKeyDown', function() {return false;});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {return true;});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine = {
			setHorizontalSpeed(player, value) {
				horizontalSpeedValue = value;
			},
			setVerticalSpeed(player, value) {
				verticalSpeedValue = value;
			}
		};

		chai.assert.isTrue(game.inputs());
		chai.assert.equal(0, horizontalSpeedValue);
		chai.assert.equal(0, verticalSpeedValue);
		chai.assert.isTrue(sendPlayerPositionStub.called);
	});

	it('does not increase engine Vertical speed if player is not at ground level and sends player position', function() {
		var game = new Game(Random.id(5), engine, gameData, streamBundler, serverNormalizedTime),
			moveModifier = 1,
			velocity = 100,
			horizontalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				isFrozen: false,
				moveModifier: moveModifier,
				velocityXOnMove: velocity,
				velocityYOnJump: velocity
			};
		});
		sinon.stub(game, 'isLeftKeyDown', function() {return false;});
		sinon.stub(game, 'isRightKeyDown', function() {return false;});
		sinon.stub(game, 'isUpKeyDown', function() {return false;});
		sinon.stub(game, 'isDropShotKeyDown', function() {return false;});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {return false;});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine = {
			setHorizontalSpeed(player, value) {
				horizontalSpeedValue = value;
			},
			setVerticalSpeed(player, value) {
			}
		};
		let setVerticalSpeedStub = sinon.stub(game.engine, 'setVerticalSpeed');

		chai.assert.isTrue(game.inputs());
		chai.assert.equal(0, horizontalSpeedValue);
		chai.assert.isFalse(setVerticalSpeedStub.called);
		chai.assert.isTrue(sendPlayerPositionStub.called);
	});
});
