import StubCollections from 'meteor/hwillson:stub-collections';
import { chai } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import Game from '/client/lib/Game.js';
import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Constants } from '/lib/constants.js';

describe('Game', function() {
	it('getPlayerShapeFromKey returns default shape when games does not exist', function() {
		StubCollections.stub(Games);

		let game = new Game(Random.id(5));
		chai.assert.strictEqual(Constants.PLAYER_DEFAULT_SHAPE, game.getPlayerShapeFromKey('player1'));

		StubCollections.restore();
	});

	it('getPlayerShapeFromKey returns default shape when player 1 does not exist', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		let gameId = Random.id(5);
		Games.insert({_id: gameId});

		let game = new Game(gameId);
		chai.assert.strictEqual(Constants.PLAYER_DEFAULT_SHAPE, game.getPlayerShapeFromKey('player1'));

		StubCollections.restore();
	});

	it('getPlayerShapeFromKey returns default shape when player 2 does not exist', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		let gameId = Random.id(5);
		Games.insert({_id: gameId});

		let game = new Game(gameId);
		chai.assert.strictEqual(Constants.PLAYER_DEFAULT_SHAPE, game.getPlayerShapeFromKey('player2'));

		StubCollections.restore();
	});

	it('getPlayerShapeFromKey returns player1 shape', function() {
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

	it('getPlayerShapeFromKey returns player2 shape', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		let gameId = Random.id(5);
		Games.insert({_id: gameId, createdBy: 1});
		Players.insert({_id: Random.id(5), gameId: gameId, userId: 2, shape: Constants.PLAYER_SHAPE_RECTANGLE});

		let game = new Game(gameId);
		chai.assert.strictEqual(Constants.PLAYER_SHAPE_RECTANGLE, game.getPlayerShapeFromKey('player2'));

		StubCollections.restore();
	});

	it('isMatchPoint returns false if game does not exist', function() {
		StubCollections.stub(Games);

		let game = new Game(Random.id(5));
		chai.assert.isFalse(game.isMatchPoint());

		StubCollections.restore();
	});

	it('isMatchPoint returns false if no players are at one point from maximum', function() {
		StubCollections.stub(Games);

		let gameId = Random.id(5);
		Games.insert({_id: gameId, hostPoints: 0, clientPoints: 0});

		let game = new Game(gameId);
		chai.assert.isFalse(game.isMatchPoint());

		StubCollections.restore();
	});

	it('isMatchPoint returns true if hostPoints is at one point from maximum', function() {
		StubCollections.stub(Games);

		let gameId = Random.id(5);
		Games.insert({_id: gameId, hostPoints: Constants.MAXIMUM_POINTS - 1, clientPoints: 0});

		let game = new Game(gameId);
		chai.assert.isTrue(game.isMatchPoint());

		StubCollections.restore();
	});

	it('isMatchPoint returns true if clientPoints is at one point from maximum', function() {
		StubCollections.stub(Games);

		let gameId = Random.id(5);
		Games.insert({_id: gameId, hostPoints: 0, clientPoints: Constants.MAXIMUM_POINTS - 1});

		let game = new Game(gameId);
		chai.assert.isTrue(game.isMatchPoint());

		StubCollections.restore();
	});

	it('isMatchPoint returns true if both players are at one point from maximum', function() {
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

	it('isDeuce returns false if game does not exist', function() {
		StubCollections.stub(Games);

		let game = new Game(Random.id(5));
		chai.assert.isFalse(game.isDeucePoint());

		StubCollections.restore();
	});

	it('isDeuce returns false if not both players are at one point from maximum', function() {
		StubCollections.stub(Games);

		let gameId = Random.id(5);
		Games.insert({_id: gameId, hostPoints: 0, clientPoints: 0});

		let game = new Game(gameId);
		chai.assert.isFalse(game.isDeucePoint());

		StubCollections.restore();
	});

	it('isDeuce returns true if both players are at one point from maximum', function() {
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

	it('getWinnerName returns Nobody if game does not exist', function() {
		StubCollections.stub(Games);

		let game = new Game(Random.id(5));
		chai.assert.equal('Nobody', game.getWinnerName());

		StubCollections.restore();
	});

	it('getWinnerName returns Nobody if game is not finished', function() {
		StubCollections.stub(Games);

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: Constants.GAME_STATUS_STARTED,
			hostPoints: Constants.MAXIMUM_POINTS,
			clientPoints: Constants.MAXIMUM_POINTS
		});

		let game = new Game(gameId);
		chai.assert.equal('Nobody', game.getWinnerName());

		StubCollections.restore();
	});

	it('getWinnerName returns Nobody if none of the players are at maximum points', function() {
		StubCollections.stub(Games);

		let gameId = Random.id(5);
		Games.insert({_id: gameId, status: Constants.GAME_STATUS_FINISHED, hostPoints: 0, clientPoints: 0});

		let game = new Game(gameId);
		chai.assert.equal('Nobody', game.getWinnerName());

		StubCollections.restore();
	});

	it('getWinnerName returns Player 1 if hostPoints is at maximum points but there is no players anymore set for the host', function() {
		StubCollections.stub(Games);

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: Constants.GAME_STATUS_FINISHED,
			hostPoints: Constants.MAXIMUM_POINTS,
			clientPoints: 0
		});

		let game = new Game(gameId);
		chai.assert.equal('Player 1', game.getWinnerName());

		StubCollections.restore();
	});

	it('getWinnerName returns host player name if hostPoints is at maximum points', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		let gameId = Random.id(5);
		let createdByUserId = 1;
		Games.insert({
			_id: gameId,
			createdBy: createdByUserId,
			status: Constants.GAME_STATUS_FINISHED,
			hostPoints: Constants.MAXIMUM_POINTS,
			clientPoints: 0
		});
		let hostPlayerName = 'Host player name';
		Players.insert({_id: Random.id(5), gameId: gameId, userId: createdByUserId, name: hostPlayerName});

		let game = new Game(gameId);
		chai.assert.equal(hostPlayerName, game.getWinnerName());

		StubCollections.restore();
	});

	it('getWinnerName returns Player 2 if clientPoints is at maximum points but there is no players anymore set for the client', function() {
		StubCollections.stub(Games);

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			status: Constants.GAME_STATUS_FINISHED,
			hostPoints: 0,
			clientPoints: Constants.MAXIMUM_POINTS
		});

		let game = new Game(gameId);
		chai.assert.equal('Player 2', game.getWinnerName());

		StubCollections.restore();
	});

	it('getWinnerName returns client player name if clientPoints is at maximum points', function() {
		StubCollections.add([Games, Players]);
		StubCollections.stub();

		let gameId = Random.id(5);
		Games.insert({
			_id: gameId,
			createdBy: 1,
			status: Constants.GAME_STATUS_FINISHED,
			hostPoints: 0,
			clientPoints: Constants.MAXIMUM_POINTS
		});
		let clientPlayerName = 'Client player name';
		Players.insert({_id: Random.id(5), gameId: gameId, userId: 2, name: clientPlayerName});

		let game = new Game(gameId);
		chai.assert.equal(clientPlayerName, game.getWinnerName());

		StubCollections.restore();
	});

	it('inputs returns false if there is no currentPlayer', function() {
		let game = new Game(Random.id(5));

		sinon.stub(game, 'getCurrentPlayer', function() {
			return null;
		});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		chai.assert.isFalse(game.inputs());
		chai.assert.isFalse(sendPlayerPositionStub.called);
	});

	it('inputs sets engine Horizontal and Vertical speed to 0 if player cannot move and sends player position', function() {
		var game = new Game(Random.id(5)),
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {canMove: false, canJump: false};
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

	it('inputs sets engine Horizontal speed if left is pressed and sends player position', function() {
		var game = new Game(Random.id(5)),
			moveModifier = 100,
			velocity = 100,
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				canMove: true,
				canJump: true,
				leftMoveModifier: -moveModifier,
				rightMoveModifier: moveModifier,
				velocityXOnMove: velocity,
				velocityYOnJump: velocity
			};
		});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {
			return true;
		});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine = {
			isKeyLeftDown: function() {
				return true;
			},
			isKeyRightDown: function() {
				return false;
			},
			isKeyUpDown: function() {
				return false;
			},
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

	it('inputs sets engine Horizontal speed if right is pressed and sends player position', function() {
		var game = new Game(Random.id(5)),
			moveModifier = 100,
			velocity = 100,
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				canMove: true,
				canJump: true,
				leftMoveModifier: -moveModifier,
				rightMoveModifier: moveModifier,
				velocityXOnMove: velocity,
				velocityYOnJump: velocity
			};
		});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {
			return true;
		});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine = {
			isKeyLeftDown: function() {
				return false;
			},
			isKeyRightDown: function() {
				return true;
			},
			isKeyUpDown: function() {
				return false;
			},
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

	it('inputs sets engine Horizontal speed to 0 if neither left or right is pressed and sends player position', function() {
		var game = new Game(Random.id(5)),
			moveModifier = 100,
			velocity = 100,
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				canMove: true,
				canJump: true,
				leftMoveModifier: -moveModifier,
				rightMoveModifier: moveModifier,
				velocityXOnMove: velocity,
				velocityYOnJump: velocity
			};
		});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {
			return true;
		});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine = {
			isKeyLeftDown: function() {
				return false;
			},
			isKeyRightDown: function() {
				return false;
			},
			isKeyUpDown: function() {
				return false;
			},
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

	it('inputs sets engine Vertical speed if up is pressed and sends player position', function() {
		var game = new Game(Random.id(5)),
			moveModifier = 100,
			velocity = 100,
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				canMove: true,
				canJump: true,
				leftMoveModifier: -moveModifier,
				rightMoveModifier: moveModifier,
				velocityXOnMove: velocity,
				velocityYOnJump: velocity
			};
		});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {
			return true;
		});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine = {
			isKeyLeftDown: function() {
				return false;
			},
			isKeyRightDown: function() {
				return false;
			},
			isKeyUpDown: function() {
				return true;
			},
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

	it('inputs sets engine Vertical speed to 0 if up is pressed and the player cannot jump and sends player position', function() {
		var game = new Game(Random.id(5)),
			moveModifier = 100,
			velocity = 100,
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				canMove: true,
				canJump: false,
				leftMoveModifier: -moveModifier,
				rightMoveModifier: moveModifier,
				velocityXOnMove: velocity,
				velocityYOnJump: velocity
			};
		});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {
			return true;
		});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine = {
			isKeyLeftDown: function() {
				return false;
			},
			isKeyRightDown: function() {
				return false;
			},
			isKeyUpDown: function() {
				return true;
			},
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

	it('inputs sets engine Vertical speed to 0 if up is not pressed and sends player position', function() {
		var game = new Game(Random.id(5)),
			moveModifier = 100,
			velocity = 100,
			horizontalSpeedValue = null,
			verticalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				canMove: true,
				canJump: true,
				leftMoveModifier: -moveModifier,
				rightMoveModifier: moveModifier,
				velocityXOnMove: velocity,
				velocityYOnJump: velocity
			};
		});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {
			return true;
		});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine = {
			isKeyLeftDown: function() {
				return false;
			},
			isKeyRightDown: function() {
				return false;
			},
			isKeyUpDown: function() {
				return false;
			},
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

	it('inputs does not increase engine Vertical speed if player is not at ground level and sends player position', function() {
		var game = new Game(Random.id(5)),
			moveModifier = 100,
			velocity = 100,
			horizontalSpeedValue = null;

		sinon.stub(game, 'getCurrentPlayer', function() {
			return {
				canMove: true,
				canJump: true,
				leftMoveModifier: -moveModifier,
				rightMoveModifier: moveModifier,
				velocityXOnMove: velocity,
				velocityYOnJump: velocity
			};
		});
		sinon.stub(game, 'isPlayerAtGroundLevel', function() {
			return false;
		});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		game.engine = {
			isKeyLeftDown: function() {
				return false;
			},
			isKeyRightDown: function() {
				return false;
			},
			isKeyUpDown: function() {
				return false;
			},
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
