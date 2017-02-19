import { chai } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import ClientGame from '/client/lib/game/ClientGame.js';

describe('Game#inputs', function() {
	it('returns false if there is no currentPlayer', function() {
		let game = new ClientGame(Random.id(5));

		sinon.stub(game, 'getCurrentPlayer', function() {
			return null;
		});
		let sendPlayerPositionStub = sinon.stub(game, 'sendPlayerPosition');

		chai.assert.isFalse(game.inputs());
		chai.assert.isFalse(sendPlayerPositionStub.called);
	});

	it('sets engine Horizontal and Vertical speed to 0 if player is frozen and sends player position', function() {
		var game = new ClientGame(Random.id(5)),
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
		var game = new ClientGame(Random.id(5)),
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
		var game = new ClientGame(Random.id(5)),
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
		var game = new ClientGame(Random.id(5)),
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
		var game = new ClientGame(Random.id(5)),
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
		var game = new ClientGame(Random.id(5)),
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
		var game = new ClientGame(Random.id(5)),
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
