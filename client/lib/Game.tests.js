import StubCollections from 'meteor/hwillson:stub-collections';
import { chai } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import BaseBonus from '/client/lib/game/bonus/BaseBonus.js';
import { Constants } from '/lib/constants.js';
import Game from '/client/lib/Game.js';
import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { GameStream } from '/lib/streams.js';
import { getUTCTimeStamp } from '/lib/utils.js';

describe('Game#getPlayerShapeFromKey', function() {
	it('returns default shape when games does not exist', function() {
		StubCollections.stub(Games);

		let game = new Game(Random.id(5));
		chai.assert.strictEqual(Constants.PLAYER_DEFAULT_SHAPE, game.getPlayerShapeFromKey('player1'));

		StubCollections.restore();
	});

	it('returns default shape when player 1 does not exist', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		let gameId = Random.id(5);
		Games.insert({_id: gameId});

		let game = new Game(gameId);
		chai.assert.strictEqual(Constants.PLAYER_DEFAULT_SHAPE, game.getPlayerShapeFromKey('player1'));

		StubCollections.restore();
	});

	it('returns default shape when player 2 does not exist', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		let gameId = Random.id(5);
		Games.insert({_id: gameId});

		let game = new Game(gameId);
		chai.assert.strictEqual(Constants.PLAYER_DEFAULT_SHAPE, game.getPlayerShapeFromKey('player2'));

		StubCollections.restore();
	});

	it('returns player1 shape', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		let gameId = Random.id(5);
		let createdByUserId = 1;
		Games.insert({_id: gameId, createdBy: createdByUserId});
		Players.insert({
			_id: Random.id(5),
			gameId: gameId,
			userId: createdByUserId,
			shape: Constants.PLAYER_SHAPE_RECTANGLE
		});

		let game = new Game(gameId);
		chai.assert.strictEqual(Constants.PLAYER_SHAPE_RECTANGLE, game.getPlayerShapeFromKey('player1'));

		StubCollections.restore();
	});

	it('returns player2 shape', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		let gameId = Random.id(5);
		Games.insert({_id: gameId, createdBy: 1});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: 2, shape: Constants.PLAYER_SHAPE_RECTANGLE});

		let game = new Game(gameId);
		chai.assert.strictEqual(Constants.PLAYER_SHAPE_RECTANGLE, game.getPlayerShapeFromKey('player2'));

		StubCollections.restore();
	});
});

describe('Game#isMatchPoint', function() {
	it('returns false if game does not exist', function() {
		StubCollections.stub(Games);

		let game = new Game(Random.id(5));
		chai.assert.isFalse(game.isMatchPoint());

		StubCollections.restore();
	});

	it('returns false if no players are at one point from maximum', function() {
		StubCollections.stub(Games);

		let gameId = Random.id(5);
		Games.insert({_id: gameId, hostPoints: 0, clientPoints: 0});

		let game = new Game(gameId);
		chai.assert.isFalse(game.isMatchPoint());

		StubCollections.restore();
	});

	it('returns true if hostPoints is at one point from maximum', function() {
		StubCollections.stub(Games);

		let gameId = Random.id(5);
		Games.insert({_id: gameId, hostPoints: Constants.MAXIMUM_POINTS - 1, clientPoints: 0});

		let game = new Game(gameId);
		chai.assert.isTrue(game.isMatchPoint());

		StubCollections.restore();
	});

	it('returns true if clientPoints is at one point from maximum', function() {
		StubCollections.stub(Games);

		let gameId = Random.id(5);
		Games.insert({_id: gameId, hostPoints: 0, clientPoints: Constants.MAXIMUM_POINTS - 1});

		let game = new Game(gameId);
		chai.assert.isTrue(game.isMatchPoint());

		StubCollections.restore();
	});

	it('returns true if both players are at one point from maximum', function() {
		StubCollections.stub(Games);

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			hostPoints: Constants.MAXIMUM_POINTS - 1,
			clientPoints: Constants.MAXIMUM_POINTS - 1
		});

		let game = new Game(gameId);
		chai.assert.isTrue(game.isMatchPoint());

		StubCollections.restore();
	});
});

describe('Game#isDeuce', function() {
	it('returns false if game does not exist', function() {
		StubCollections.stub(Games);

		let game = new Game(Random.id(5));
		chai.assert.isFalse(game.isDeucePoint());

		StubCollections.restore();
	});

	it('returns false if not both players are at one point from maximum', function() {
		StubCollections.stub(Games);

		let gameId = Random.id(5);
		Games.insert({_id: gameId, hostPoints: 0, clientPoints: 0});

		let game = new Game(gameId);
		chai.assert.isFalse(game.isDeucePoint());

		StubCollections.restore();
	});

	it('returns true if both players are at one point from maximum', function() {
		StubCollections.stub(Games);

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			hostPoints: Constants.MAXIMUM_POINTS - 1,
			clientPoints: Constants.MAXIMUM_POINTS - 1
		});

		let game = new Game(gameId);
		chai.assert.isTrue(game.isDeucePoint());

		StubCollections.restore();
	});
});

describe('Game#getBonusFromIdentifier', function() {
	it('returns null if the bonusIdentifier matches nothing', function() {
		var game = new Game(Random.id(5));

		game.bonuses = [
			{identifier: 'a'},
			{identifier: 'b'},
			{identifier: 'c'}
		];

		let bonus = game.getBonusFromIdentifier('d');

		chai.assert.isNull(bonus);
	});

	it('returns the matching bonus', function() {
		var game = new Game(Random.id(5)),
			bBonus = {identifier: 'b'};

		game.bonuses = [
			{identifier: 'a'},
			bBonus,
			{identifier: 'c'}
		];

		let bonus = game.getBonusFromIdentifier('b');

		chai.assert.equal(bBonus, bonus);
	});
});

describe('Game#isPlayerJumpingForward', function() {
	it('returns false if vertical speed is 0', function() {
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

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
	it('returns false if player1 x position is equal to ball x position', function() {
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

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
	it('returns false if ball y position is lower than player y position + half its height', function() {
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

		chai.assert.isFalse(game.isBallBelowPlayer(
			{
				body: {
					x: 200,
					y: 400 + (Constants.PLAYER_HEIGHT / 2)
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
		let game = new Game(Random.id(5));

		chai.assert.isTrue(game.isBallBelowPlayer(
			{
				body: {
					x: 200,
					y: 400 + (Constants.PLAYER_HEIGHT / 2) + 0.1
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
	it('returns true', function() {
		let game = new Game(Random.id(5));

		sinon.stub(game, 'isBallInFrontOfPlayer', function() {return true;});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {return false;});

		chai.assert.isTrue(game.isPlayerDoingDropShot(
			{},
			{doingDropShot: true},
			'player1'
		));
	});

	it('returns false if player is not doing a drop shot', function() {
		let game = new Game(Random.id(5));

		sinon.stub(game, 'isBallInFrontOfPlayer', function() {return true;});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {return false;});

		chai.assert.isFalse(game.isPlayerDoingDropShot(
			{},
			{doingDropShot: false},
			'player1'
		));
	});

	it('returns false if ball is not in front of player', function() {
		let game = new Game(Random.id(5));

		sinon.stub(game, 'isBallInFrontOfPlayer', function() {return false;});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {return false;});

		chai.assert.isFalse(game.isPlayerDoingDropShot(
			{},
			{doingDropShot: true},
			'player1'
		));
	});

	it('returns false if player is at ground level', function() {
		let game = new Game(Random.id(5));

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
	it('removes all speed velocity from ball object', function() {
		let game = new Game(Random.id(5));

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

		chai.assert.equal(0, ball.body.velocity.x);
		chai.assert.equal(0, ball.body.velocity.y);
	});
});

describe('Game#reboundBallOnPlayerHit', function() {
	it('adds the constant vertical speed velocity to ball object', function() {
		let game = new Game(Random.id(5));

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
		chai.assert.equal(Constants.BALL_VERTICAL_SPEED_ON_PLAYER_HIT, ball.body.velocity.y);
	});
});

describe('Game#onBallHitPlayer', function() {
	it('reboundBallOnPlayerHit is called', function() {
		let game = new Game(Random.id(5));

		sinon.stub(game, 'isPlayerJumpingForward', function() {return false;});
		sinon.stub(game, 'isBallBelowPlayer', function() {return false;});
		sinon.stub(game, 'isPlayerDoingDropShot', function() {return false;});
		sinon.stub(game.engine, 'constrainVelocity');

		let reboundBallOnPlayerHit = sinon.stub(game, 'reboundBallOnPlayerHit');

		game.onBallHitPlayer({}, {}, 'player1');

		chai.assert.isTrue(reboundBallOnPlayerHit.called);
	});

	it('reboundBallOnPlayerHit is not called if player is doing drop shot and ball is in front of the player', function() {
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

		sinon.stub(game, 'isPlayerJumpingForward', function() {return false;});
		sinon.stub(game, 'isBallBelowPlayer', function() {return true;});
		sinon.stub(game, 'isPlayerDoingDropShot', function() {return false;});
		sinon.stub(game.engine, 'constrainVelocity');

		let reboundBallOnPlayerHit = sinon.stub(game, 'reboundBallOnPlayerHit');

		game.onBallHitPlayer({}, {}, 'player1');

		chai.assert.isFalse(reboundBallOnPlayerHit.called);
	});

	it('reboundBallOnPlayerHit is called if the ball is not in front of the player', function() {
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

		sinon.stub(game, 'isPlayerJumpingForward', function() {return true;});
		sinon.stub(game, 'isBallInFrontOfPlayer', function() {return true;});
		sinon.stub(game, 'isPlayerDoingDropShot', function() {return false;});
		sinon.stub(game.engine, 'constrainVelocity');

		let smashBallOnPlayerHit = sinon.stub(game, 'smashBallOnPlayerHit');

		game.onBallHitPlayer({}, {}, 'player1');

		chai.assert.isTrue(smashBallOnPlayerHit.called);
	});

	it('smashBallOnPlayerHit is not called if player is doing a drop shot', function() {
		let game = new Game(Random.id(5));

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
	it('normal smash calculations', function() {
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

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
		let game = new Game(Random.id(5));

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
	it('returns false if there is no currentPlayer', function() {
		let game = new Game(Random.id(5));

		sinon.stub(game, 'getCurrentPlayer', function() {
			return null;
		});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		chai.assert.isFalse(game.inputs());
		chai.assert.isFalse(sendPlayerPositionStub.called);
	});

	it('sets engine Horizontal and Vertical speed to 0 if player is frozen and sends player position', function() {
		var game = new Game(Random.id(5)),
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
		var game = new Game(Random.id(5)),
			moveModifier = 100,
			velocity = 100,
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				isFrozen: false,
				leftMoveModifier: -moveModifier,
				rightMoveModifier: moveModifier,
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
		var game = new Game(Random.id(5)),
			moveModifier = 100,
			velocity = 100,
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				isFrozen: false,
				leftMoveModifier: -moveModifier,
				rightMoveModifier: moveModifier,
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
		var game = new Game(Random.id(5)),
			moveModifier = 100,
			velocity = 100,
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				isFrozen: false,
				leftMoveModifier: -moveModifier,
				rightMoveModifier: moveModifier,
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
		var game = new Game(Random.id(5)),
			moveModifier = 100,
			velocity = 100,
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				isFrozen: false,
				leftMoveModifier: -moveModifier,
				rightMoveModifier: moveModifier,
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
		var game = new Game(Random.id(5)),
			moveModifier = 100,
			velocity = 100,
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				isFrozen: false,
				leftMoveModifier: -moveModifier,
				rightMoveModifier: moveModifier,
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
		var game = new Game(Random.id(5)),
			moveModifier = 100,
			velocity = 100,
			horizontalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				isFrozen: false,
				leftMoveModifier: -moveModifier,
				rightMoveModifier: moveModifier,
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

describe('Game#setPlayerGravity', function() {
	it('sets gravity if player is not frozen', function() {
		var game = new Game(Random.id(5)),
			gravity = 2;

		game.player1 = {
			isFrozen: false,
			body: {
				data: {
					gravityScale: 1
				}
			}
		};

		game.setPlayerGravity('player1', gravity);

		chai.assert.equal(gravity, game.player1.body.data.gravityScale);
	});

	it('does not set gravity if player is frozen', function() {
		var game = new Game(Random.id(5)),
			initialGravity = 1,
			gravity = 2;

		game.player1 = {
			isFrozen: true,
			body: {
				data: {
					gravityScale: initialGravity
				}
			}
		};

		game.setPlayerGravity('player1', gravity);

		chai.assert.equal(initialGravity, game.player1.body.data.gravityScale);
	});
});

describe('Game#resetPlayerGravity', function() {
	it('resets gravity if player is frozen', function() {
		var game = new Game(Random.id(5)),
			initialGravity = 1,
			actualGravity = 2;

		game.player1 = {
			isFrozen: false,
			initialGravity: initialGravity,
			body: {
				data: {
					gravityScale: actualGravity
				}
			}
		};

		game.resetPlayerGravity('player1');

		chai.assert.equal(initialGravity, game.player1.body.data.gravityScale);
	});

	it('does not reset gravity if player is frozen', function() {
		var game = new Game(Random.id(5)),
			initialGravity = 1,
			actualGravity = 2;

		game.player1 = {
			isFrozen: true,
			initialGravity: initialGravity,
			body: {
				data: {
					gravityScale: actualGravity
				}
			}
		};

		game.resetPlayerGravity('player1');

		chai.assert.equal(actualGravity, game.player1.body.data.gravityScale);
	});
});

describe('Game#unFreezePlayer', function() {
	it('restores initial player mass and restores initial player gravity if active gravity is not set', function() {
		var game = new Game(Random.id(5)),
			initialMass = 200,
			initialGravity = 1;

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

		game.unFreezePlayer('player1');

		chai.assert.equal(initialMass, game.player1.body.mass);
		chai.assert.equal(initialGravity, game.player1.body.data.gravityScale);
	});

	it('restores initial player mass and restores active player gravity if set', function() {
		var game = new Game(Random.id(5)),
			initialMass = 200,
			initialGravity = 1,
			activeGravity = 2;

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

		game.unFreezePlayer('player1');

		chai.assert.equal(initialMass, game.player1.body.mass);
		chai.assert.equal(activeGravity, game.player1.body.data.gravityScale);
	});
});

describe('Game#createBonusIfTimeHasElapsed', function() {
	beforeEach(function(){
		if (GameStream.emit.restore) {
			GameStream.emit.restore();
		}
	});

	it('creates bonus if time has elapsed', function() {
		var gameId = Random.id(5);
		var game = new Game(gameId);
		var timestamp = getUTCTimeStamp();

		game.bonusFrequenceTime = 5000;
		game.lastGameRespawn = timestamp - 8000;

		game.engine = {
			addBonus: function() {
				return new BaseBonus();
			},
			collidesWith: function() {
			}
		};

		//Create spies
		let createBonusSpy = sinon.spy(game, 'createBonus');
		let regenerateLastBonusCreatedAndFrequenceTimeSpy = sinon.spy(game, 'regenerateLastBonusCreatedAndFrequenceTime');

		game.createBonusIfTimeHasElapsed();

		chai.assert.isTrue(createBonusSpy.calledOnce);
		chai.assert.isTrue(regenerateLastBonusCreatedAndFrequenceTimeSpy.calledOnce);
		chai.assert.property(game.bundledStreamsToEmit, 'createBonus');
	});

	it('does not create bonus if time has not elapsed', function() {
		var gameId = Random.id(5);
		var game = new Game(gameId);
		var timestamp = getUTCTimeStamp();

		game.bonusFrequenceTime = 5000;
		game.lastBonusCreated = timestamp;
		game.lastGameRespawn = timestamp;

		game.engine = {
			addBonus: function() {
				return new BaseBonus();
			},
			collidesWith: function() {
			}
		};

		//Create spies
		let createBonusSpy = sinon.spy(game, 'createBonus');
		let regenerateLastBonusCreatedAndFrequenceTimeSpy = sinon.spy(game, 'regenerateLastBonusCreatedAndFrequenceTime');

		game.createBonusIfTimeHasElapsed();

		sinon.assert.notCalled(createBonusSpy);
		sinon.assert.notCalled(regenerateLastBonusCreatedAndFrequenceTimeSpy);
		chai.assert.notProperty(game.bundledStreamsToEmit, 'createBonus');
	});

	it('does not create bonus if time is too short since last creation depending on bonusMinimumFrequence', function() {
		var gameId = Random.id(5);
		var game = new Game(gameId);
		var timestamp = getUTCTimeStamp();

		game.bonusFrequenceTime = 0;
		game.lastBonusCreated = timestamp - 1;
		game.lastGameRespawn = timestamp - 1;

		game.engine = {
			addBonus: function() {
				return new BaseBonus();
			},
			collidesWith: function() {
			}
		};

		//Create spies
		let createBonusSpy = sinon.spy(game, 'createBonus');
		let regenerateLastBonusCreatedAndFrequenceTimeSpy = sinon.spy(game, 'regenerateLastBonusCreatedAndFrequenceTime');

		game.createBonusIfTimeHasElapsed();

		sinon.assert.notCalled(createBonusSpy);
		sinon.assert.notCalled(regenerateLastBonusCreatedAndFrequenceTimeSpy);
		chai.assert.notProperty(game.bundledStreamsToEmit, 'createBonus');
	});
});

describe('Game#removeBonusSprite', function() {
	it ('removes and destroys the matching bonusIdentifier bonus from bonuses', function() {
		var game = new Game(Random.id(5)),
			aBonus = {identifier: 'a', destroy: function() {}},
			bBonus = {identifier: 'b', destroy: function() {}},
			cBonus = {identifier: 'c', destroy: function() {}};

		game.bonuses = [
			aBonus,
			bBonus,
			cBonus
		];

		let aSpy = sinon.spy(aBonus, 'destroy');
		let bSpy = sinon.spy(bBonus, 'destroy');
		let cSpy = sinon.spy(cBonus, 'destroy');

		game.removeBonusSprite('b');

		sinon.assert.notCalled(aSpy);
		sinon.assert.calledOnce(bSpy);
		sinon.assert.notCalled(cSpy);

		chai.assert.lengthOf(game.bonuses, 2);
		chai.assert.equal(game.bonuses[0], aBonus);
		chai.assert.equal(game.bonuses[1], cBonus);
	});

	it ('does not remove anything if nothing matches the bonusIdentifier in bonuses', function() {
		var game = new Game(Random.id(5)),
			aBonus = {identifier: 'a', destroy: function() {}},
			bBonus = {identifier: 'b', destroy: function() {}},
			cBonus = {identifier: 'c', destroy: function() {}};

		game.bonuses = [
			aBonus,
			bBonus,
			cBonus
		];

		let aSpy = sinon.spy(aBonus, 'destroy');
		let bSpy = sinon.spy(bBonus, 'destroy');
		let cSpy = sinon.spy(cBonus, 'destroy');

		game.removeBonusSprite('d');

		sinon.assert.notCalled(aSpy);
		sinon.assert.notCalled(bSpy);
		sinon.assert.notCalled(cSpy);

		chai.assert.lengthOf(game.bonuses, 3);
		chai.assert.equal(game.bonuses[0], aBonus);
		chai.assert.equal(game.bonuses[1], bBonus);
		chai.assert.equal(game.bonuses[2], cBonus);
	});
});
