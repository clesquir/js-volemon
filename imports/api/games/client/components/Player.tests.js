import {assert} from 'chai';
import {Random} from 'meteor/random';

describe('Player#isJumpingForward', function() {
	it('returns false if vertical speed is 0', function() {
		// const engine = null;
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// sinon.stub(engine, 'getHorizontalSpeed').callsFake(function() {return 25;});
		// sinon.stub(engine, 'getVerticalSpeed').callsFake(function() {return 0;});
		// sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});
		//
		// assert.isFalse(game.isPlayerJumpingForward({data: {key: 'player1', isHost: true}}));
	});

	it('returns false if vertical speed is positive', function() {
		// const engine = null;
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// sinon.stub(engine, 'getHorizontalSpeed').callsFake(function() {return 25;});
		// sinon.stub(engine, 'getVerticalSpeed').callsFake(function() {return 25;});
		// sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});
		//
		// assert.isFalse(game.isPlayerJumpingForward({data: {key: 'player1', isHost: true}}));
	});

	it('returns false if vertical speed is negative but player is at ground level', function() {
		// const engine = null;
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// sinon.stub(engine, 'getHorizontalSpeed').callsFake(function() {return 25;});
		// sinon.stub(engine, 'getVerticalSpeed').callsFake(function() {return -25;});
		// sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return true;});
		//
		// assert.isFalse(game.isPlayerJumpingForward({data: {key: 'player1', isHost: true}}));
	});

	it('returns false if player1 vertical speed is negative but horizontal speed is 0', function() {
		// const engine = null;
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// sinon.stub(engine, 'getHorizontalSpeed').callsFake(function() {return 0;});
		// sinon.stub(engine, 'getVerticalSpeed').callsFake(function() {return -25;});
		// sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});
		//
		// assert.isFalse(game.isPlayerJumpingForward({data: {key: 'player1', isHost: true}}));
	});

	it('returns false if player1 vertical speed is negative but horizontal speed is negative', function() {
		// const engine = null;
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// sinon.stub(engine, 'getHorizontalSpeed').callsFake(function() {return -25;});
		// sinon.stub(engine, 'getVerticalSpeed').callsFake(function() {return -25;});
		// sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});
		//
		// assert.isFalse(game.isPlayerJumpingForward({data: {key: 'player1', isHost: true}}));
	});

	it('returns true if player1 vertical speed is negative but horizontal speed is positive', function() {
		// const engine = null;
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// sinon.stub(engine, 'getHorizontalSpeed').callsFake(function() {return 25;});
		// sinon.stub(engine, 'getVerticalSpeed').callsFake(function() {return -25;});
		// sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});
		//
		// assert.isTrue(game.isPlayerJumpingForward({data: {key: 'player1', isHost: true}}));
	});

	it('returns false if player2 vertical speed is negative but horizontal speed is 0', function() {
		// const engine = null;
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// sinon.stub(engine, 'getHorizontalSpeed').callsFake(function() {return 0;});
		// sinon.stub(engine, 'getVerticalSpeed').callsFake(function() {return -25;});
		// sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});
		//
		// assert.isFalse(game.isPlayerJumpingForward({data: {key: 'player2', isClient: true}}));
	});

	it('returns false if player2 vertical speed is negative but horizontal speed is positive', function() {
		// const engine = null;
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// sinon.stub(engine, 'getHorizontalSpeed').callsFake(function() {return 25;});
		// sinon.stub(engine, 'getVerticalSpeed').callsFake(function() {return -25;});
		// sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});
		//
		// assert.isFalse(game.isPlayerJumpingForward({data: {key: 'player2', isClient: true}}));
	});

	it('returns true if player2 vertical speed is negative and horizontal speed is negative', function() {
		// const engine = null;
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// sinon.stub(engine, 'getHorizontalSpeed').callsFake(function() {return -25;});
		// sinon.stub(engine, 'getVerticalSpeed').callsFake(function() {return -25;});
		// sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});
		//
		// assert.isTrue(game.isPlayerJumpingForward({data: {key: 'player2', isClient: true}}));
	});
});

describe('Player#isInFrontOfPlayer', function() {
	it('returns false if player1 x position is equal to ball x position', function() {
		// let game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// assert.isFalse(game.isBallInFrontOfPlayer(
		// 	{
		// 		body: {
		// 			x: 200,
		// 			y: 400
		// 		}
		// 	},
		// 	{
		// 		data: {key: 'player1', isHost: true},
		// 		body: {
		// 			x: 200,
		// 			y: 400
		// 		}
		// 	}
		// ));
	});

	it('returns false if player1 x position is greater than to ball x position', function() {
		// let game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// assert.isFalse(game.isBallInFrontOfPlayer(
		// 	{
		// 		body: {
		// 			x: 198,
		// 			y: 400
		// 		}
		// 	},
		// 	{
		// 		data: {key: 'player1', isHost: true},
		// 		body: {
		// 			x: 200,
		// 			y: 400
		// 		}
		// 	}
		// ));
	});

	it('returns true if player1 x position is lower than to ball x position', function() {
		// let game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// assert.isTrue(game.isBallInFrontOfPlayer(
		// 	{
		// 		body: {
		// 			x: 202,
		// 			y: 400
		// 		}
		// 	},
		// 	{
		// 		data: {key: 'player1', isHost: true},
		// 		body: {
		// 			x: 200,
		// 			y: 400
		// 		}
		// 	}
		// ));
	});

	it('returns false if player2 x position is equal to ball x position', function() {
		// let game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// assert.isFalse(game.isBallInFrontOfPlayer(
		// 	{
		// 		body: {
		// 			x: 200,
		// 			y: 400
		// 		}
		// 	},
		// 	{
		// 		data: {key: 'player1', isHost: true},
		// 		body: {
		// 			x: 200,
		// 			y: 400
		// 		}
		// 	}
		// ));
	});

	it('returns false if player2 x position is lower than to ball x position', function() {
		// let game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// assert.isFalse(game.isBallInFrontOfPlayer(
		// 	{
		// 		body: {
		// 			x: 202,
		// 			y: 400
		// 		}
		// 	},
		// 	{
		// 		data: {key: 'player2', isClient: true},
		// 		body: {
		// 			x: 200,
		// 			y: 400
		// 		}
		// 	}
		// ));
	});

	it('returns true if player2 x position is greater than to ball x position', function() {
		// let game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// assert.isTrue(game.isBallInFrontOfPlayer(
		// 	{
		// 		body: {
		// 			x: 198,
		// 			y: 400
		// 		}
		// 	},
		// 	{
		// 		data: {key: 'player2', isClient: true},
		// 		body: {
		// 			x: 200,
		// 			y: 400
		// 		}
		// 	}
		// ));
	});
});

describe('Player#isBallBelow', function() {
	it('returns false if ball y position is lower than player y position + half its height', function() {
		// let game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// assert.isFalse(game.isBallBelowPlayer(
		// 	{
		// 		body: {
		// 			x: 200,
		// 			y: 400
		// 		}
		// 	},
		// 	{
		// 		body: {
		// 			x: 200,
		// 			y: 400
		// 		}
		// 	}
		// ));
	});

	it('returns false if ball y position is equal than player y position + half its height', function() {
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		// const playerHeight = 20;
		//
		// assert.isFalse(game.isBallBelowPlayer(
		// 	{
		// 		body: {
		// 			x: 200,
		// 			y: 400 + (playerHeight / 2)
		// 		}
		// 	},
		// 	{
		// 		body: {
		// 			x: 200,
		// 			y: 400
		// 		},
		// 		height: playerHeight
		// 	}
		// ));
	});

	it('returns true if ball y position is greater than player y position + half its height', function() {
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		// const playerHeight = 20;
		//
		// assert.isTrue(game.isBallBelowPlayer(
		// 	{
		// 		body: {
		// 			x: 200,
		// 			y: 400 + (playerHeight / 2) + 0.1
		// 		}
		// 	},
		// 	{
		// 		body: {
		// 			x: 200,
		// 			y: 400
		// 		},
		// 		height: playerHeight
		// 	}
		// ));
	});
});

describe('Player#move', function() {
	it('sets engine Horizontal and Vertical speed to 0 if player is frozen and sends player position', function() {
		// const engine = null;
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		// let horizontalSpeedValue = null;
		// let verticalSpeedValue = null;
		//
		// sinon.stub(game, 'getCurrentPlayer').callsFake(function() {
		// 	return {
		// 		data: {
		// 			isFrozen: true
		// 		}
		// 	};
		// });
		// let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');
		//
		// game.engine.setHorizontalSpeed = function(player, value) {
		// 	horizontalSpeedValue = value;
		// };
		// game.engine.setVerticalSpeed = function(player, value) {
		// 	verticalSpeedValue = value;
		// };
		//
		// assert.isTrue(game.inputs());
		// assert.equal(0, horizontalSpeedValue);
		// assert.equal(0, verticalSpeedValue);
		// assert.isTrue(sendPlayerPositionStub.called);
	});

	it('sets engine Horizontal speed if left is pressed and sends player position', function() {
		// const engine = null;
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		// const horizontalMoveMultiplier = 1;
		// const verticalMoveMultiplier = 1;
		// const velocity = 100;
		// let horizontalSpeedValue = null;
		// let verticalSpeedValue = null;
		//
		// sinon.stub(game, 'getCurrentPlayer').callsFake(function() {
		// 	return {
		// 		data: {
		// 			isFrozen: false,
		// 			horizontalMoveMultiplier: horizontalMoveMultiplier,
		// 			verticalMoveMultiplier: verticalMoveMultiplier,
		// 			velocityXOnMove: velocity,
		// 			velocityYOnJump: velocity
		// 		}
		// 	};
		// });
		// sinon.stub(game, 'isLeftKeyDown').callsFake(function() {return true;});
		// sinon.stub(game, 'isRightKeyDown').callsFake(function() {return false;});
		// sinon.stub(game, 'isUpKeyDown').callsFake(function() {return false;});
		// sinon.stub(game, 'isDropShotKeyDown').callsFake(function() {return false;});
		// sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return true;});
		// const sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');
		//
		// game.engine.setHorizontalSpeed = function(player, value) {
		// 	horizontalSpeedValue = value;
		// };
		// game.engine.setVerticalSpeed = function(player, value) {
		// 	verticalSpeedValue = value;
		// };
		//
		// assert.isTrue(game.inputs());
		// assert.equal(-horizontalMoveMultiplier() * velocity, horizontalSpeedValue);
		// assert.equal(0, verticalSpeedValue);
		// assert.isTrue(sendPlayerPositionStub.called);
	});

	it('sets engine Horizontal speed if right is pressed and sends player position', function() {
		// const engine = null;
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		// const horizontalMoveMultiplier = 1;
		// const verticalMoveMultiplier = 1;
		// const velocity = 100;
		// let horizontalSpeedValue = null;
		// let verticalSpeedValue = null;
		//
		// sinon.stub(game, 'getCurrentPlayer').callsFake(function() {
		// 	return {
		// 		data: {
		// 			isFrozen: false,
		// 			horizontalMoveMultiplier: horizontalMoveMultiplier,
		// 			verticalMoveMultiplier: verticalMoveMultiplier,
		// 			velocityXOnMove: velocity,
		// 			velocityYOnJump: velocity
		// 		}
		// 	};
		// });
		// sinon.stub(game, 'isLeftKeyDown').callsFake(function() {return false;});
		// sinon.stub(game, 'isRightKeyDown').callsFake(function() {return true;});
		// sinon.stub(game, 'isUpKeyDown').callsFake(function() {return false;});
		// sinon.stub(game, 'isDropShotKeyDown').callsFake(function() {return false;});
		// sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return true;});
		// const sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');
		//
		// game.engine.setHorizontalSpeed = function(player, value) {
		// 	horizontalSpeedValue = value;
		// };
		// game.engine.setVerticalSpeed = function(player, value) {
		// 	verticalSpeedValue = value;
		// };
		//
		// assert.isTrue(game.inputs());
		// assert.equal(horizontalMoveMultiplier() * velocity, horizontalSpeedValue);
		// assert.equal(0, verticalSpeedValue);
		// assert.isTrue(sendPlayerPositionStub.called);
	});

	it('sets engine Horizontal speed to 0 if neither left or right is pressed and sends player position', function() {
		// const engine = null;
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		// const horizontalMoveMultiplier = 1;
		// const verticalMoveMultiplier = 1;
		// const velocity = 100;
		// let horizontalSpeedValue = null;
		// let verticalSpeedValue = null;
		//
		// sinon.stub(game, 'getCurrentPlayer').callsFake(function() {
		// 	return {
		// 		data: {
		// 			isFrozen: false,
		// 			horizontalMoveMultiplier: horizontalMoveMultiplier,
		// 			verticalMoveMultiplier: verticalMoveMultiplier,
		// 			velocityXOnMove: velocity,
		// 			velocityYOnJump: velocity
		// 		}
		// 	};
		// });
		// sinon.stub(game, 'isLeftKeyDown').callsFake(function() {return false;});
		// sinon.stub(game, 'isRightKeyDown').callsFake(function() {return false;});
		// sinon.stub(game, 'isUpKeyDown').callsFake(function() {return false;});
		// sinon.stub(game, 'isDropShotKeyDown').callsFake(function() {return false;});
		// sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return true;});
		// const sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');
		//
		// game.engine.setHorizontalSpeed = function(player, value) {
		// 	horizontalSpeedValue = value;
		// };
		// game.engine.setVerticalSpeed = function(player, value) {
		// 	verticalSpeedValue = value;
		// };
		//
		// assert.isTrue(game.inputs());
		// assert.equal(0, horizontalSpeedValue);
		// assert.equal(0, verticalSpeedValue);
		// assert.isTrue(sendPlayerPositionStub.called);
	});

	it('sets engine Vertical speed if up is pressed and sends player position', function() {
		// const engine = null;
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		// const horizontalMoveMultiplier = 1;
		// const verticalMoveMultiplier = 1;
		// const velocity = 100;
		// let horizontalSpeedValue = null;
		// let verticalSpeedValue = null;
		//
		// sinon.stub(game, 'getCurrentPlayer').callsFake(function() {
		// 	return {
		// 		data: {
		// 			isFrozen: false,
		// 			canJump: true,
		// 			horizontalMoveMultiplier: horizontalMoveMultiplier,
		// 			verticalMoveMultiplier: verticalMoveMultiplier,
		// 			velocityXOnMove: velocity,
		// 			velocityYOnJump: velocity
		// 		}
		// 	};
		// });
		// sinon.stub(game, 'isLeftKeyDown').callsFake(function() {return false;});
		// sinon.stub(game, 'isRightKeyDown').callsFake(function() {return false;});
		// sinon.stub(game, 'isUpKeyDown').callsFake(function() {return true;});
		// sinon.stub(game, 'isDropShotKeyDown').callsFake(function() {return false;});
		// sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return true;});
		// const sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');
		//
		// game.engine.setHorizontalSpeed = function(player, value) {
		// 	horizontalSpeedValue = value;
		// };
		// game.engine.setVerticalSpeed = function(player, value) {
		// 	verticalSpeedValue = value;
		// };
		//
		// assert.isTrue(game.inputs());
		// assert.equal(0, horizontalSpeedValue);
		// assert.equal(-velocity, verticalSpeedValue);
		// assert.isTrue(sendPlayerPositionStub.called);
	});

	it('sets engine Vertical speed to 0 if up is not pressed and sends player position', function() {
		// const engine = null;
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		// const horizontalMoveMultiplier = 1;
		// const verticalMoveMultiplier = 1;
		// const velocity = 100;
		// let horizontalSpeedValue = null;
		// let verticalSpeedValue = null;
		//
		// sinon.stub(game, 'getCurrentPlayer').callsFake(function() {
		// 	return {
		// 		data: {
		// 			isFrozen: false,
		// 			horizontalMoveMultiplier: horizontalMoveMultiplier,
		// 			verticalMoveMultiplier: verticalMoveMultiplier,
		// 			velocityXOnMove: velocity,
		// 			velocityYOnJump: velocity
		// 		}
		// 	};
		// });
		// sinon.stub(game, 'isLeftKeyDown').callsFake(function() {return false;});
		// sinon.stub(game, 'isRightKeyDown').callsFake(function() {return false;});
		// sinon.stub(game, 'isUpKeyDown').callsFake(function() {return false;});
		// sinon.stub(game, 'isDropShotKeyDown').callsFake(function() {return false;});
		// sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return true;});
		// const sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');
		//
		// game.engine.setHorizontalSpeed = function(player, value) {
		// 	horizontalSpeedValue = value;
		// };
		// game.engine.setVerticalSpeed = function(player, value) {
		// 	verticalSpeedValue = value;
		// };
		//
		// assert.isTrue(game.inputs());
		// assert.equal(0, horizontalSpeedValue);
		// assert.equal(0, verticalSpeedValue);
		// assert.isTrue(sendPlayerPositionStub.called);
	});

	it('does not increase engine Vertical speed if player is not at ground level and sends player position', function() {
		// const engine = null;
		// const game = new Player(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		// const horizontalMoveMultiplier = 1;
		// const verticalMoveMultiplier = 1;
		// const velocity = 100;
		// let horizontalSpeedValue = null;
		//
		// sinon.stub(game, 'getCurrentPlayer').callsFake(function() {
		// 	return {
		// 		data: {
		// 			isFrozen: false,
		// 			horizontalMoveMultiplier: horizontalMoveMultiplier,
		// 			verticalMoveMultiplier: verticalMoveMultiplier,
		// 			velocityXOnMove: velocity,
		// 			velocityYOnJump: velocity
		// 		}
		// 	};
		// });
		// sinon.stub(game, 'isLeftKeyDown').callsFake(function() {return false;});
		// sinon.stub(game, 'isRightKeyDown').callsFake(function() {return false;});
		// sinon.stub(game, 'isUpKeyDown').callsFake(function() {return false;});
		// sinon.stub(game, 'isDropShotKeyDown').callsFake(function() {return false;});
		// sinon.stub(engine, 'hasSurfaceTouchingPlayerBottom').callsFake(function() {return false;});
		// const sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');
		//
		// game.engine.setHorizontalSpeed = function(player, value) {
		// 	horizontalSpeedValue = value;
		// };
		// game.engine.setVerticalSpeed = function(player, value) {
		// };
		// let setVerticalSpeedStub = sinon.stub(game.engine, 'setVerticalSpeed');
		//
		// assert.isTrue(game.inputs());
		// assert.equal(0, horizontalSpeedValue);
		// assert.isFalse(setVerticalSpeedStub.called);
		// assert.isTrue(sendPlayerPositionStub.called);
	});
});
