import {assert} from 'chai';
import {Random} from 'meteor/random';

describe('Ball#smash', function() {
	it('normal smash calculations', function() {
		// let game = new Ball(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// let horizontalSpeed = 300;
		// let verticalSpeed = 200;
		// let ball = {
		// 	body: {
		// 		velocity: {
		// 			x: horizontalSpeed,
		// 			y: verticalSpeed
		// 		}
		// 	}
		// };
		//
		// game.smashBallOnPlayerHit(
		// 	ball,
		// 	{data: {key: 'player1', isHost: true}}
		// );
		//
		// assert.equal(horizontalSpeed * 2, ball.body.velocity.x);
		// assert.equal(verticalSpeed / 4, ball.body.velocity.y);
	});

	it('ball is smashed towards ground if its vertical speed was negative', function() {
		// let game = new Ball(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// let horizontalSpeed = 300;
		// let verticalSpeed = -200;
		// let ball = {
		// 	body: {
		// 		velocity: {
		// 			x: horizontalSpeed,
		// 			y: verticalSpeed
		// 		}
		// 	}
		// };
		//
		// game.smashBallOnPlayerHit(
		// 	ball,
		// 	{data: {key: 'player1', isHost: true}}
		// );
		//
		// assert.equal(horizontalSpeed * 2, ball.body.velocity.x);
		// assert.equal(-verticalSpeed / 4, ball.body.velocity.y);
	});

	it('for player1, ball direction is reversed if it is smashed', function() {
		// let game = new Ball(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// let horizontalSpeed = -300;
		// let verticalSpeed = -200;
		// let ball = {
		// 	body: {
		// 		velocity: {
		// 			x: horizontalSpeed,
		// 			y: verticalSpeed
		// 		}
		// 	}
		// };
		//
		// game.smashBallOnPlayerHit(
		// 	ball,
		// 	{data: {key: 'player1', isHost: true}}
		// );
		//
		// assert.equal(-horizontalSpeed * 2, ball.body.velocity.x);
		// assert.equal(-verticalSpeed / 4, ball.body.velocity.y);
	});

	it('for player2, ball direction is reversed if it is smashed', function() {
		// let game = new Ball(Random.id(5), deviceController, engine, gameData, gameConfiguration, null, streamBundler, serverNormalizedTime);
		//
		// let horizontalSpeed = 300;
		// let verticalSpeed = -200;
		// let ball = {
		// 	body: {
		// 		velocity: {
		// 			x: horizontalSpeed,
		// 			y: verticalSpeed
		// 		}
		// 	}
		// };
		//
		// game.smashBallOnPlayerHit(
		// 	ball,
		// 	{data: {key: 'player2', isClient: true}}
		// );
		//
		// assert.equal(-horizontalSpeed * 2, ball.body.velocity.x);
		// assert.equal(-verticalSpeed / 4, ball.body.velocity.y);
	});
});
